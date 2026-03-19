#!/bin/sh

show_help() {
  cat <<EOF
Usage: $(basename "$0") <url> <destination>

Run this command with a  repository URL to fetch required files from the catalog repository.

Flags:
  -h|--help   Show this help message
  
Example:
  ./$(basename "$0") https://gitlab.com/catalog-example.git
  ./$(basename "$0") https://github.com/wot-oss/example-catalog.git public	
EOF
  exit 0
}

log_info() {
  echo "[INFO] $*"
}

log_warn() {
  echo "[WARN] $*" >&2
}

log_error() {
  echo "[ERROR] $*" >&2
  exit 1
}

check_dependencies() {
  command -v git >/dev/null 2>&1 || log_error "Missing dependency: git."
}

download_catalog() {
  clone_url="$1"
  target_dir="$2"

  log_info "Start downloading from: $clone_url"

  [ -n "$target_dir" ] || log_error "Destination folder cannot be empty."
  [ "$target_dir" != "/" ] || log_error "Destination folder '/' is not allowed."
  [ "$target_dir" != "." ] || log_error "Destination folder '.' is not allowed."
  [ "$target_dir" != ".." ] || log_error "Destination folder '..' is not allowed."

  if [ -e "$target_dir" ]; then
    rm -rf "$target_dir"
  fi

  if ! git clone --depth 1 "$clone_url" "$target_dir"; then
    log_error "Failed to clone repository: $clone_url"
  fi

  rm -rf "${target_dir}/.git"
  rm -rf "${target_dir}/.gitignore"
  rm -rf "${target_dir}/.github"
  rm -rf "${target_dir}/README.md"

  log_info "Catalog downloaded to: $target_dir"

}

validate_inputs() {
  input_url="$1"
  destination="$2"

  if [ -z "$input_url" ]; then
    log_error "Missing repository URL argument."
  fi

  if [ -z "$destination" ]; then
    log_error "Missing destination folder argument."
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
  if [ $# -ne 2 ]; then
    show_help

  fi

  CATALOG_CLONE_URL="$1"
  DESTINATION_DIR="$2"

  check_dependencies
  validate_inputs "$CATALOG_CLONE_URL" "$DESTINATION_DIR"
  download_catalog "$CATALOG_CLONE_URL" "$DESTINATION_DIR"
  ;;
esac
