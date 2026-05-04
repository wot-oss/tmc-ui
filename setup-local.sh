#!/bin/sh

set -eu

MIN_NODE_MAJOR=22
MIN_NODE_MINOR=20
MIN_NODE_PATCH=0
YARN_VERSION=1.22.22

log_info() {
	echo "[INFO] $*"
}

log_warn() {
	echo "[WARN] $*" >&2
}

log_error() {
	echo "[ERROR] $*" >&2
}

run_or_exit() {
	"$@" || {
		log_error "Command failed: $*"
		exit 1
	}
}

version_to_number() {
	major=$1
	minor=$2
	patch=$3
	printf '%03d%03d%03d\n' "$major" "$minor" "$patch"
}

valide_node_installation() {
	if ! command -v node >/dev/null 2>&1; then
		log_error "Node.js is not installed. Install Node.js >= ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}.${MIN_NODE_PATCH} and run this script again."
		exit 1
	fi

	node_version=$(node -v | sed 's/^v//')
	node_major=$(printf '%s' "$node_version" | cut -d. -f1)
	node_minor=$(printf '%s' "$node_version" | cut -d. -f2)
	node_patch=$(printf '%s' "$node_version" | cut -d. -f3)

	current_version=$(version_to_number "$node_major" "$node_minor" "$node_patch")
	required_version=$(version_to_number "$MIN_NODE_MAJOR" "$MIN_NODE_MINOR" "$MIN_NODE_PATCH")

	if [ "$current_version" -lt "$required_version" ]; then
		log_error "Node.js ${node_version} detected. This project requires >= ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}.${MIN_NODE_PATCH}."
		exit 1
	fi

	log_info "Using Node.js ${node_version}"
}

valide_yarn_installation() {
	if command -v yarn >/dev/null 2>&1; then
		log_info "Yarn is already installed ($(yarn -v))"
		return
	fi
	log_error "Could not find Yarn installation. Please install Yarn ${YARN_VERSION} or use Corepack to manage it, and run this script again."
	exit 1
}

main() {
	valide_node_installation
	valide_yarn_installation
	run_or_exit sh deploy.sh

	log_info "Installing dependencies"
	run_or_exit yarn setup:local

	log_info "Starting development server"
}

main "$@"
