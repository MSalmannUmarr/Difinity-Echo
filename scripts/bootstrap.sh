#!/usr/bin/env bash
# One-command local bootstrap for a clean checkout (Milestone 0).
#
#   ./scripts/bootstrap.sh              validate tools, configure, install, build,
#                                       start local infrastructure and all four applications
#   ./scripts/bootstrap.sh --restart    restart applications even if they are healthy
#   ./scripts/bootstrap.sh --skip-infra start applications without Docker infrastructure
#                                       (reported explicitly; infrastructure stays "not ready")
#
# Safe to run repeatedly: existing configuration is never overwritten, installs use
# the lockfile, and healthy applications are left running unless --restart is given.
set -Eeuo pipefail

# shellcheck source=scripts/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "${ECHO_ROOT}"

RESTART=false
SKIP_INFRA=false
for argument in "$@"; do
  case "${argument}" in
    --restart) RESTART=true ;;
    --skip-infra) SKIP_INFRA=true ;;
    -h | --help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *) fail "Unknown argument '${argument}'." "Run './scripts/bootstrap.sh --help'." ;;
  esac
done

trap 'fail "Unexpected error at line ${LINENO}." "Inspect the output above and the logs in .local/logs, then re-run ./scripts/bootstrap.sh."' ERR

# ---------------------------------------------------------------------------
phase "1/7 Validate prerequisites"
require_node_and_pnpm
have curl || fail "curl is not installed." "Install curl with your system package manager."
if [[ "${SKIP_INFRA}" == "true" ]]; then
  warn "Docker checks skipped (--skip-infra). Local infrastructure will NOT be started."
else
  have docker || fail "Docker is not installed." "Install Docker Desktop or Docker Engine, or re-run with --skip-infra."
  docker info >/dev/null 2>&1 || fail "The Docker daemon is not running." "Start Docker Desktop / the Docker service, or re-run with --skip-infra."
  docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is not available." "Install the Docker Compose plugin ('docker compose')."
  ok "$(docker --version)"
  ok "Docker Compose $(docker compose version --short)"
fi

# ---------------------------------------------------------------------------
phase "2/7 Create local configuration from safe examples"
mkdir -p "${ECHO_RUN_DIR}" "${ECHO_LOG_DIR}"
if [[ -f "${ECHO_INFRA_ENV}" ]]; then
  ok "infra/local/.env exists (kept unchanged)"
else
  # Every __GENERATED__ placeholder becomes an independent random local-only secret.
  node -e '
    const fs = require("node:fs"), crypto = require("node:crypto")
    const [source, target] = process.argv.slice(1)
    const text = fs.readFileSync(source, "utf8")
      .replace(/__GENERATED__/g, () => crypto.randomBytes(24).toString("base64url"))
    fs.writeFileSync(target, text, { mode: 0o600 })
  ' "infra/local/.env.example" "${ECHO_INFRA_ENV}"
  ok "created infra/local/.env with generated development-only credentials"
fi
for app_dir in apps/edge-agent apps/data-platform apps/app-middleware; do
  if [[ -f "${app_dir}/.env" ]]; then
    ok "${app_dir}/.env exists (kept unchanged)"
  else
    cp "${app_dir}/.env.example" "${app_dir}/.env"
    ok "created ${app_dir}/.env"
  fi
done

# ---------------------------------------------------------------------------
phase "3/7 Install locked dependencies"
pnpm install --frozen-lockfile ||
  fail "Dependency installation failed." "Check network access to the npm registry; never edit pnpm-lock.yaml by hand."
ok "dependencies installed from pnpm-lock.yaml"

# ---------------------------------------------------------------------------
phase "4/7 Build packages and applications"
pnpm -r run build > "${ECHO_LOG_DIR}/build.log" 2>&1 ||
  fail "Build failed (see .local/logs/build.log)." "Run 'pnpm -r run build' to reproduce, fix the error, then re-run bootstrap."
ok "all workspaces built (log: .local/logs/build.log)"

# ---------------------------------------------------------------------------
phase "5/7 Start local infrastructure"
INFRA_STATE="not started (--skip-infra)"
if [[ "${SKIP_INFRA}" == "true" ]]; then
  warn "Skipped. Kafka, ClickHouse, PostgreSQL and object storage are not running."
else
  info "docker compose up --wait (Kafka, ClickHouse, PostgreSQL, object storage); first run pulls images"
  compose up --detach --wait --wait-timeout 240 ||
    fail "Local infrastructure did not become healthy." "Run 'docker compose -f infra/local/compose.yaml --env-file infra/local/.env ps' and 'logs <service>'; check free ports 59092/58123/55432/59000 and Docker memory (>= 4 GB)."
  ok "infrastructure healthy (Docker health checks passed)"
  INFRA_STATE="running"
fi

# ---------------------------------------------------------------------------
phase "6/7 Start applications"
for entry in "${ECHO_APPS[@]}"; do
  IFS='|' read -r name directory command health <<<"${entry}"
  if app_running "${name}" && [[ "${RESTART}" == "true" ]]; then
    kill "$(cat "$(pid_file "${name}")")" 2>/dev/null || true
    for _ in $(seq 1 20); do app_running "${name}" || break; sleep 0.5; done
    rm -f "$(pid_file "${name}")"
    info "stopped ${name} for restart"
  fi
  if app_running "${name}" && http_ok "${health}"; then
    ok "${name} already running and healthy (pid $(cat "$(pid_file "${name}")"))"
    continue
  fi
  port="$(port_of "${health}")"
  if port_in_use "${port}"; then
    fail "Port ${port} needed by ${name} is used by another process." "Stop that process (e.g. 'lsof -i :${port}') or run ./scripts/teardown.sh, then re-run bootstrap."
  fi
  (
    cd "${directory}"
    # shellcheck disable=SC2086 # command is a trusted, space-separated registry entry
    nohup ${command} > "${ECHO_LOG_DIR}/${name}.log" 2>&1 &
    echo $! > "$(pid_file "${name}")"
  )
  info "started ${name} (pid $(cat "$(pid_file "${name}")"), log: .local/logs/${name}.log)"
done

# ---------------------------------------------------------------------------
phase "7/7 Wait for application health"
for entry in "${ECHO_APPS[@]}"; do
  IFS='|' read -r name _directory _command health <<<"${entry}"
  wait_for_http "${name}" "${health}" 60 ||
    fail "${name} did not report liveness at ${health} within 60s." "Inspect .local/logs/${name}.log, then re-run ./scripts/bootstrap.sh --restart."
done

cat <<EOF

${C_BOLD}Difinity Echo Milestone 0 stack is running.${C_RESET}

  Web application          http://127.0.0.1:3000
  Application Middleware   http://127.0.0.1:4000/health/ready
  Core Data Platform       http://127.0.0.1:4100/health/ready
  Echo Edge (local agent)  http://127.0.0.1:4200/health/ready
  Local infrastructure     ${INFRA_STATE}

Applications expose health and readiness only. No connector, ingestion,
analytics or customer data exists yet; the web pages show the existing
illustrative prototype data, not customer results.

Next steps:
  ./scripts/demo.sh       demonstrate Milestone 0 (health of every component)
  ./scripts/verify.sh     run all repository quality gates
  ./scripts/teardown.sh   stop applications and infrastructure (keeps data)
EOF
