#!/bin/sh

log_info() {
  echo "[INFO] $*"
}

log_warn() {
  echo "[WARN] $*" >&2
}

log_error() {
  echo "[ERROR] $*" >&2
}

show_help() {
  cat <<EOF
Usage: $(basename "$0") <true|false>

Updates SERVER_AVAILABLE in vite.config.mjs.

Example:
  ./$(basename "$0") true
EOF
  exit 0
}

validate_boolean() {
  value="$1"
  if [ "$value" != "true" ] && [ "$value" != "false" ]; then
    log_error "Invalid value: $value. Expected true or false."
    exit 1
  fi
}

if [ $# -eq 0 ]; then
  show_help
fi

case "${1:-}" in
--help | -h)
  show_help
  ;;
*)
  SERVER_AVAILABLE="$1"
  validate_boolean "$SERVER_AVAILABLE"
  ;;
esac

if [ ! -f "vite.config.mjs" ]; then
  log_warn "vite.config.mjs not found. Skipping SERVER_AVAILABLE update."
  exit 0
fi

echo "Setting SERVER_AVAILABLE to: $SERVER_AVAILABLE"

tmp_file="${TMPDIR:-/tmp}/vite.config.mjs.$$"
if ! sed -E "s/(SERVER_AVAILABLE:[[:space:]]*)(true|false)/\\1$SERVER_AVAILABLE/g" vite.config.mjs >"$tmp_file"; then
  rm -f "$tmp_file"
  log_error "Failed to update vite.config.mjs"
  exit 1
fi

if ! mv "$tmp_file" vite.config.mjs; then
  rm -f "$tmp_file"
  log_error "Failed to replace vite.config.mjs"
  exit 1
fi

echo "=== vite.config.mjs after SERVER_AVAILABLE update ==="
cat vite.config.mjs
