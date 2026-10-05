#!/usr/bin/env bash
# Shared helpers for scripts/bootstrap.sh, verify.sh, demo.sh and teardown.sh.
# Sourced, never executed directly.

ECHO_REQUIRED_NODE="24.19.0"
ECHO_REQUIRED_PNPM="11.19.0"

ECHO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ECHO_STATE_DIR="${ECHO_ROOT}/.local"
ECHO_RUN_DIR="${ECHO_STATE_DIR}/run"
ECHO_LOG_DIR="${ECHO_STATE_DIR}/logs"
ECHO_COMPOSE_FILE="${ECHO_ROOT}/infra/local/compose.yaml"
ECHO_INFRA_ENV="${ECHO_ROOT}/infra/local/.env"

# Application registry: name|directory|start command|health URL
# Ports come from each application's .env.example defaults.
ECHO_APPS=(
  "data-platform|apps/data-platform|node --env-file-if-exists=.env dist/app/main/main.js|http://127.0.0.1:4100/health/live"
  "edge-agent|apps/edge-agent|node --env-file-if-exists=.env dist/app/main/main.js|http://127.0.0.1:4200/health/live"
  "app-middleware|apps/app-middleware|node --env-file-if-exists=.env dist/app/main/main.js|http://127.0.0.1:4000/health/live"
  "web|apps/web|node_modules/.bin/next start --hostname 127.0.0.1 --port 3000|http://127.0.0.1:3000/api/health/live"
)

if [[ -t 1 ]]; then
  C_BOLD=$'\033[1m'; C_RED=$'\033[31m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_RESET=$'\033[0m'
else
  C_BOLD=""; C_RED=""; C_GREEN=""; C_YELLOW=""; C_RESET=""
fi

ECHO_PHASE="startup"

phase() {
  ECHO_PHASE="$1"
  printf '\n%s==> %s%s\n' "${C_BOLD}" "$1" "${C_RESET}"
}
info() { printf '    %s\n' "$*"; }
ok() { printf '    %s✓%s %s\n' "${C_GREEN}" "${C_RESET}" "$*"; }
warn() { printf '    %s!%s %s\n' "${C_YELLOW}" "${C_RESET}" "$*"; }

# fail <cause> <recovery>
fail() {
  printf '\n%s✗ Failed during phase: %s%s\n' "${C_RED}" "${ECHO_PHASE}" "${C_RESET}" >&2
  printf '  Cause:    %s\n' "$1" >&2
  printf '  Recovery: %s\n' "$2" >&2
  exit 1
}

have() { command -v "$1" >/dev/null 2>&1; }

require_node_and_pnpm() {
  have node || fail "Node.js is not installed." "Install Node.js ${ECHO_REQUIRED_NODE} (see .nvmrc), e.g. 'nvm install' or 'fnm use'."
  local node_version
  node_version="$(node --version | sed 's/^v//')"
  [[ "${node_version}" == "${ECHO_REQUIRED_NODE}" ]] ||
    fail "Node.js ${node_version} found; ${ECHO_REQUIRED_NODE} is required." "Run 'nvm install && nvm use' (reads .nvmrc) or install ${ECHO_REQUIRED_NODE}."
  ok "Node.js ${node_version}"
  have pnpm || fail "pnpm is not installed." "Run 'corepack enable && corepack prepare pnpm@${ECHO_REQUIRED_PNPM} --activate' or 'npm install -g pnpm@${ECHO_REQUIRED_PNPM}'."
  local pnpm_version
  pnpm_version="$(pnpm --version)"
  [[ "${pnpm_version}" == "${ECHO_REQUIRED_PNPM}" ]] ||
    fail "pnpm ${pnpm_version} found; ${ECHO_REQUIRED_PNPM} is required." "Run 'corepack prepare pnpm@${ECHO_REQUIRED_PNPM} --activate' or 'npm install -g pnpm@${ECHO_REQUIRED_PNPM}'."
  ok "pnpm ${pnpm_version}"
}

docker_available() {
  have docker && docker info >/dev/null 2>&1 && docker compose version >/dev/null 2>&1
}

compose() {
  docker compose --project-directory "${ECHO_ROOT}/infra/local" -f "${ECHO_COMPOSE_FILE}" --env-file "${ECHO_INFRA_ENV}" "$@"
}

# http_ok <url> -> 0 when the URL answers 2xx within 2 seconds.
http_ok() { curl -fsS --max-time 2 -o /dev/null "$1" 2>/dev/null; }

# wait_for_http <name> <url> <timeout-seconds>: polls a health endpoint until it answers.
wait_for_http() {
  local name="$1" url="$2" timeout="$3" waited=0
  until http_ok "${url}"; do
    if ((waited >= timeout)); then
      return 1
    fi
    sleep 1
    waited=$((waited + 1))
  done
  ok "${name} healthy at ${url} (${waited}s)"
}

pid_file() { printf '%s/%s.pid' "${ECHO_RUN_DIR}" "$1"; }

app_running() {
  local file
  file="$(pid_file "$1")"
  [[ -f "${file}" ]] && kill -0 "$(cat "${file}")" 2>/dev/null
}

port_of() { sed -E 's#^https?://[^:]+:([0-9]+)/.*#\1#' <<<"$1"; }

port_in_use() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null
}
