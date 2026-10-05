#!/usr/bin/env bash
# Repository-wide quality gates. Runs every gate, prints a summary, and exits
# non-zero if any mandatory gate fails.
#
#   ./scripts/verify.sh               full verification (installs from the lockfile first)
#   ./scripts/verify.sh --no-install  reuse the current node_modules
set -Euo pipefail

# shellcheck source=scripts/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "${ECHO_ROOT}"

INSTALL=true
for argument in "$@"; do
  case "${argument}" in
    --no-install) INSTALL=false ;;
    -h | --help)
      sed -n '2,7p' "$0"
      exit 0
      ;;
    *) fail "Unknown argument '${argument}'." "Run './scripts/verify.sh --help'." ;;
  esac
done

mkdir -p "${ECHO_LOG_DIR}"
declare -a RESULTS=()
FAILED=0

# gate <mandatory|optional> <name> <command...>
gate() {
  local kind="$1" name="$2"
  shift 2
  phase "${name}"
  local log
  log="${ECHO_LOG_DIR}/verify-$(tr ' /' '--' <<<"${name}" | tr -cd '[:alnum:]-').log"
  if "$@" >"${log}" 2>&1; then
    ok "passed"
    RESULTS+=("PASS  ${name}")
  else
    tail -n 40 "${log}" | sed 's/^/    | /'
    if [[ "${kind}" == "mandatory" ]]; then
      printf '    %s✗ failed%s (full log: %s)\n' "${C_RED}" "${C_RESET}" "${log#"${ECHO_ROOT}"/}"
      RESULTS+=("FAIL  ${name}")
      FAILED=1
    else
      warn "optional gate failed (full log: ${log#"${ECHO_ROOT}"/})"
      RESULTS+=("WARN  ${name}")
    fi
  fi
}

skip() {
  phase "$1"
  warn "skipped: $2"
  RESULTS+=("SKIP  $1 ($2)")
}

phase "Prerequisites"
require_node_and_pnpm

if [[ "${INSTALL}" == "true" ]]; then
  gate mandatory "Install locked dependencies" pnpm install --frozen-lockfile
else
  skip "Install locked dependencies" "--no-install"
fi
gate mandatory "Formatting check" pnpm run format:check
gate mandatory "Generated contract types are current" \
  bash -c 'pnpm --filter @difinity-echo/contracts run generate:check && pnpm --filter @difinity-echo/observability-contracts run generate:check'
gate mandatory "Lint" pnpm run lint
gate mandatory "Build shared packages" pnpm run build:packages
gate mandatory "Type check" pnpm run typecheck
gate mandatory "Architecture tests" pnpm run test:architecture
gate mandatory "Unit tests" pnpm run test
gate mandatory "Contract tests" pnpm run test:contracts
gate mandatory "Build all applications" pnpm run build
if docker_available; then
  gate mandatory "Local infrastructure definition" bash -c '
    env_file=$(mktemp)
    sed "s/__GENERATED__/verify-placeholder/" infra/local/.env.example > "${env_file}"
    docker compose -f infra/local/compose.yaml --env-file "${env_file}" config --quiet
    status=$?; rm -f "${env_file}"; exit ${status}'
else
  skip "Local infrastructure definition" "Docker / Docker Compose not available"
fi

printf '\n%sVerification summary%s\n' "${C_BOLD}" "${C_RESET}"
printf '  %s\n' "${RESULTS[@]}"
printf '\n  Not part of verify.sh: end-to-end tests (run ./scripts/demo.sh against a bootstrapped stack).\n'

if ((FAILED != 0)); then
  printf '\n%s✗ Verification failed.%s Fix the failing gates above; logs are in .local/logs/.\n' "${C_RED}" "${C_RESET}"
  exit 1
fi
printf '\n%s✓ All mandatory gates passed.%s\n' "${C_GREEN}" "${C_RESET}"
