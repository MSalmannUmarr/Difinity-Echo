#!/usr/bin/env bash
# Stops the applications started by bootstrap.sh and the local infrastructure.
#
#   ./scripts/teardown.sh                      stop everything, keep local data volumes
#   ./scripts/teardown.sh --delete-local-data  also delete this project's named volumes
#
# Only processes recorded in .local/run and containers of the
# "difinity-echo-local" Compose project are touched.
set -Euo pipefail

# shellcheck source=scripts/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "${ECHO_ROOT}"

DELETE_DATA=false
for argument in "$@"; do
  case "${argument}" in
    --delete-local-data) DELETE_DATA=true ;;
    -h | --help)
      sed -n '2,8p' "$0"
      exit 0
      ;;
    *) fail "Unknown argument '${argument}'." "Run './scripts/teardown.sh --help'." ;;
  esac
done

phase "Stop applications"
for entry in "${ECHO_APPS[@]}"; do
  IFS='|' read -r name _rest <<<"${entry}"
  if app_running "${name}"; then
    kill "$(cat "$(pid_file "${name}")")" 2>/dev/null || true
    ok "stopped ${name}"
  else
    info "${name} not running"
  fi
  rm -f "$(pid_file "${name}")"
done

phase "Stop local infrastructure"
if [[ ! -f "${ECHO_INFRA_ENV}" ]]; then
  info "infra/local/.env not found: nothing to stop"
elif ! docker_available; then
  warn "Docker not available: infrastructure state unchanged"
elif [[ "${DELETE_DATA}" == "true" ]]; then
  compose down --volumes && ok "containers and local data volumes removed"
else
  compose down && ok "containers stopped (named volumes kept)"
fi
