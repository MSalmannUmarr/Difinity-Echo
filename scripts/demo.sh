#!/usr/bin/env bash
# Milestone 0 demonstration. Reports, honestly, what is running and healthy.
# It fabricates nothing: every line below comes from a live health endpoint,
# Docker health status, or a test run against the running stack.
#
#   ./scripts/demo.sh   (run ./scripts/bootstrap.sh first)
set -Euo pipefail

# shellcheck source=scripts/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "${ECHO_ROOT}"

PROBLEMS=0
problem() {
  printf '    %s✗%s %s\n' "${C_RED}" "${C_RESET}" "$*"
  PROBLEMS=$((PROBLEMS + 1))
}

phase "Local infrastructure (Docker health checks)"
if [[ ! -f "${ECHO_INFRA_ENV}" ]]; then
  problem "infra/local/.env missing: run ./scripts/bootstrap.sh"
elif ! docker_available; then
  problem "Docker is not available: local infrastructure cannot be running."
else
  for service in kafka clickhouse postgres object-storage; do
    container="$(compose ps --quiet "${service}" 2>/dev/null || true)"
    if [[ -z "${container}" ]]; then
      problem "${service}: not running (run ./scripts/bootstrap.sh without --skip-infra)"
      continue
    fi
    health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${container}")"
    if [[ "${health}" == "healthy" ]]; then ok "${service}: ${health}"; else problem "${service}: ${health}"; fi
  done
fi

# Pretty-prints a ServiceReadiness document from stdin.
render_readiness() {
  node -e '
    let input = ""
    process.stdin.on("data", (chunk) => (input += chunk))
    process.stdin.on("end", () => {
      const report = JSON.parse(input)
      console.log(`    status: ${report.status}  (${report.service.component} ${report.service.version})`)
      for (const d of report.dependencies) {
        const note = d.failure ? ` [${d.failure}]` : ""
        console.log(`      - ${d.name.padEnd(22)} ${d.kind.padEnd(15)} ${(d.required ? "required" : "optional").padEnd(9)} ${d.status}${note}`)
      }
    })'
}

for entry in "${ECHO_APPS[@]}"; do
  IFS='|' read -r name _directory _command live <<<"${entry}"
  phase "${name}"
  if ! http_ok "${live}"; then
    problem "liveness check failed at ${live} (is the stack bootstrapped?)"
    continue
  fi
  ok "alive: ${live}"
  if [[ "${name}" == "web" ]]; then
    if http_ok "http://127.0.0.1:3000/"; then
      ok "web application reachable: http://127.0.0.1:3000 (existing Echo pages, illustrative prototype data)"
    else
      problem "web application root page is not reachable"
    fi
    continue
  fi
  ready_url="${live%/live}/ready"
  body="$(curl -sS --max-time 5 "${ready_url}" || true)"
  if [[ -z "${body}" ]]; then
    problem "readiness endpoint did not answer: ${ready_url}"
    continue
  fi
  render_readiness <<<"${body}"
  if [[ "$(node -e 'console.log(JSON.parse(process.argv[1]).status)' "${body}")" != "ready" ]]; then
    problem "${name} is not ready"
  fi
done

phase "End-to-end contract checks against the running stack"
if ECHO_E2E=1 pnpm --silent run test:e2e >"${ECHO_LOG_DIR:-.local/logs}/demo-e2e.log" 2>&1; then
  ok "end-to-end health tests passed (log: .local/logs/demo-e2e.log)"
else
  tail -n 30 "${ECHO_LOG_DIR}/demo-e2e.log" | sed 's/^/    | /'
  problem "end-to-end health tests failed (log: .local/logs/demo-e2e.log)"
fi

cat <<'EOF'

What this demonstration shows (Milestone 0):
  - every application process is alive and reports health/readiness using the
    shared, versioned observability contract;
  - the middleware's readiness is derived from the Core Data Platform's Query
    API endpoint over HTTP, never from a database;
  - architectural boundaries without implementations are reported as
    "not-implemented" and infrastructure probes as "reachable"/"ready" only when
    actually observed.

What it does NOT show (not implemented yet):
  - connectors, collection, privacy filtering, admission or ingestion;
  - Kafka topics, ClickHouse/PostgreSQL schemas or archive objects;
  - evidence, cohorts, metrics or any customer or product result.
  The web pages still use the existing illustrative prototype data.
EOF

if ((PROBLEMS != 0)); then
  printf '\n%s✗ Demonstration found %d problem(s).%s Run ./scripts/bootstrap.sh and check .local/logs/.\n' "${C_RED}" "${PROBLEMS}" "${C_RESET}"
  exit 1
fi
printf '\n%s✓ Milestone 0 demonstration complete.%s\n' "${C_GREEN}" "${C_RESET}"
