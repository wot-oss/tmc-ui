#!/bin/sh

if [ -f ".env" ]; then
	set -a
	. ./.env
	set +a
fi

: "${APP_REPO_URL:=https://github.com/TejInaco/test-tmc-ui.git}"
: "${CATALOG_REPO_URL:=https://github.com/TejInaco/example-catalog.git}"
: "${SERVER_AVAILABLE:=false}"

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

# Verification step: check if package.json and src directory exist
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
	log_info "Missing package.json or src directory. Running fetchRepository script..."
	log_info "Fetching repository from GitHub..."
	TEMP_APP_DIR="temp_app_repo"
	run_or_exit sh ci-cd/fetchRepository.sh "$APP_REPO_URL" "$TEMP_APP_DIR"
	log_info "Copying application files into working directory..."
	cp -R "$TEMP_APP_DIR"/. ./
	log_info "Cleaning up temporary application folder..."
	rm -rf "$TEMP_APP_DIR"
else
	log_info "package.json and src directory found. Skipping repository fetch."
fi

# Check if public folder exists
if [ ! -d "public" ]; then
	log_error "Public folder not found. Cannot proceed with catalog download."
	exit 1
fi

log_info "Current value: SERVER_AVAILABLE=[$SERVER_AVAILABLE]"
# Check if .tmc folder already exists inside public
if [ "$SERVER_AVAILABLE" = "false" ] && [ -d "public/.tmc" ]; then
	log_info "Catalog already exists (public/.tmc found). Skipping catalog download."
	run_or_exit sh ci-cd/validateRequiredFiles.sh "public"
else
	log_info "Public folder found. Downloading repository catalog to temporary location..."
	TEMP_APP_DIR_CATALOG="temp_catalog"
	log_info "$CATALOG_REPO_URL"
	log_info "$TEMP_APP_DIR_CATALOG"

	run_or_exit sh ci-cd/fetchRepository.sh "$CATALOG_REPO_URL" "$TEMP_APP_DIR_CATALOG"

	log_info "Copying catalog contents to public directory..."
	cp -r "$TEMP_APP_DIR_CATALOG"/. public/

	log_info "Cleaning up temporary catalog folder..."
	rm -rf "$TEMP_APP_DIR_CATALOG"
fi

if [ "$SERVER_AVAILABLE" = "false" ]; then
	log_info "Validating required catalog files..."
	run_or_exit sh ci-cd/validateRequiredFiles.sh "public"
fi

log_info "Editing configuration file:  vite.config.mjs"
run_or_exit sh ci-cd/editConfig.sh "$SERVER_AVAILABLE"
