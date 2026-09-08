#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
export CPAMP_VERIFY_RUN_ID="${CPAMP_VERIFY_RUN_ID:-$(date +%Y%m%d-%H%M%S)-$$}"
exec node "$ROOT/control-cpamp.mjs" launch "$@"
