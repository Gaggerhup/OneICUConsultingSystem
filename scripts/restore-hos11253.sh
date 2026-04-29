#!/usr/bin/env bash

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

ENV_FILE="${ENV_FILE:-${PROJECT_ROOT}/.env.local}"
SOURCE_MODE="${SOURCE_MODE:-docker}"
SOURCE_CONTAINER="${SOURCE_CONTAINER:-hos11253-unzip}"
SOURCE_DIR="${SOURCE_DIR:-/data/hos11253}"
LOCAL_SOURCE_DIR="${LOCAL_SOURCE_DIR:-${PROJECT_ROOT}/hos11253}"
ZIP_SOURCE_FILE="${ZIP_SOURCE_FILE:-${PROJECT_ROOT}/../hos11253.zip}"
ZIP_SOURCE_PREFIX="${ZIP_SOURCE_PREFIX:-hos11253/}"
TARGET_DB="${TARGET_DB:-}"
SQL_SPLITTER="${SQL_SPLITTER:-${SCRIPT_DIR}/mysql-import-file.mjs}"
LOG_ROOT="${LOG_ROOT:-${PROJECT_ROOT}/logs}"
RESUME_FROM_LOG_DIR="${RESUME_FROM_LOG_DIR:-}"
if [[ -n "${RESUME_FROM_LOG_DIR}" ]]; then
  LOG_DIR="${RESUME_FROM_LOG_DIR}"
else
  TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
  LOG_DIR="${LOG_ROOT}/restore-hos11253-${TIMESTAMP}"
fi
RUN_LOG="${LOG_DIR}/run.log"
SUCCESS_LOG="${LOG_DIR}/success.log"
FAILED_LOG="${LOG_DIR}/failed.log"

mkdir -p "${LOG_DIR}"
touch "${RUN_LOG}" "${SUCCESS_LOG}" "${FAILED_LOG}"

log() {
  local message="$1"
  printf '[%s] %s\n' "$(date +"%Y-%m-%d %H:%M:%S")" "${message}" | tee -a "${RUN_LOG}"
}

fail() {
  log "ERROR: $1"
  exit 1
}

require_command() {
  local command_name="$1"
  command -v "${command_name}" >/dev/null 2>&1 || fail "Missing required command: ${command_name}"
}

load_database_url() {
  [[ -f "${ENV_FILE}" ]] || fail "ENV file not found: ${ENV_FILE}"

  local database_url
  database_url="$(
    ENV_PATH="${ENV_FILE}" node <<'EOF'
const fs = require('fs');

const envPath = process.env.ENV_PATH;
const content = fs.readFileSync(envPath, 'utf8');
for (const line of content.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  if (key !== 'DATABASE_URL') continue;
  let value = trimmed.slice(eqIndex + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  process.stdout.write(value);
  process.exit(0);
}
process.exit(1);
EOF
  )" || fail "DATABASE_URL not found in ${ENV_FILE}"

  [[ "${database_url}" == mysql://* ]] || fail "Unsupported DATABASE_URL scheme in ${ENV_FILE}"

  local without_scheme auth_and_host auth host_and_db host_port
  without_scheme="${database_url#mysql://}"
  auth_and_host="${without_scheme}"

  [[ "${auth_and_host}" == *@* ]] || fail "DATABASE_URL is missing credentials or host"
  auth="${auth_and_host%%@*}"
  host_and_db="${auth_and_host#*@}"

  [[ "${host_and_db}" == */* ]] || fail "DATABASE_URL is missing database name"
  host_port="${host_and_db%%/*}"
  DB_NAME="${host_and_db#*/}"

  [[ "${auth}" == *:* ]] || fail "DATABASE_URL is missing password"
  DB_USER="${auth%%:*}"
  DB_PASSWORD="${auth#*:}"

  if [[ "${host_port}" == *:* ]]; then
    DB_HOST="${host_port%%:*}"
    DB_PORT="${host_port##*:}"
  else
    DB_HOST="${host_port}"
    DB_PORT="3306"
  fi

  [[ -n "${DB_NAME}" ]] || fail "DATABASE_URL database name is empty"

  if [[ -n "${TARGET_DB}" ]]; then
    DB_NAME="${TARGET_DB}"
  fi
}

collect_sql_files() {
  local list_file="$1"

  case "${SOURCE_MODE}" in
    docker)
      require_command docker
      docker inspect "${SOURCE_CONTAINER}" >/dev/null 2>&1 || fail "Source container not found: ${SOURCE_CONTAINER}"
      docker exec "${SOURCE_CONTAINER}" sh -lc "find \"${SOURCE_DIR}\" -type f -name '*.sql' | sort" > "${list_file}" \
        || fail "Unable to list SQL files from ${SOURCE_CONTAINER}:${SOURCE_DIR}"
      ;;
    local)
      [[ -d "${LOCAL_SOURCE_DIR}" ]] || fail "Local source directory not found: ${LOCAL_SOURCE_DIR}"
      find "${LOCAL_SOURCE_DIR}" -type f -name '*.sql' | sort > "${list_file}" \
        || fail "Unable to list SQL files from ${LOCAL_SOURCE_DIR}"
      ;;
    zip)
      require_command unzip
      [[ -f "${ZIP_SOURCE_FILE}" ]] || fail "Zip source file not found: ${ZIP_SOURCE_FILE}"
      unzip -Z1 "${ZIP_SOURCE_FILE}" | grep -E '\.sql$' | sort > "${list_file}" \
        || fail "Unable to list SQL files from ${ZIP_SOURCE_FILE}"
      ;;
    *)
      fail "Unsupported SOURCE_MODE: ${SOURCE_MODE}. Use docker, local, or zip."
      ;;
  esac
}

resume_sql_files() {
  local list_file="$1"
  local resume_dir="$2"
  local resume_success_log="${resume_dir}/success.log"

  [[ -f "${resume_success_log}" ]] || fail "Resume success log not found: ${resume_success_log}"

  local filtered_list
  filtered_list="$(mktemp)"
  local resume_success_sorted
  resume_success_sorted="$(mktemp)"
  local original_total remaining_total skipped_total

  original_total="$(wc -l < "${list_file}" | tr -d ' ')"
  sort -u "${resume_success_log}" > "${resume_success_sorted}"
  comm -23 "${list_file}" "${resume_success_sorted}" > "${filtered_list}"
  remaining_total="$(wc -l < "${filtered_list}" | tr -d ' ')"
  skipped_total=$((original_total - remaining_total))

  mv "${filtered_list}" "${list_file}"
  rm -f "${resume_success_sorted}"

  log "RESUME_FROM_LOG_DIR=${resume_dir}"
  log "RESUME_SKIPPED_SUCCESS_COUNT=${skipped_total}"
  log "RESUME_REMAINING_FILES=${remaining_total}"
}

import_sql_file() {
  local sql_file="$1"
  local statement

  case "${SOURCE_MODE}" in
    docker)
      while IFS= read -r -d '' statement; do
        db-cli -g my -H "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p "${DB_PASSWORD}" -d "${DB_NAME}" -e "${statement}" \
          || return 1
      done < <(
        docker exec "${SOURCE_CONTAINER}" sh -lc "cat \"${sql_file}\"" \
          | iconv -f TIS620 -t UTF-8 \
          | node "${SQL_SPLITTER}" --stdin
      )
      ;;
    local)
      while IFS= read -r -d '' statement; do
        db-cli -g my -H "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p "${DB_PASSWORD}" -d "${DB_NAME}" -e "${statement}" \
          || return 1
      done < <(
        iconv -f TIS620 -t UTF-8 < "${sql_file}" \
          | node "${SQL_SPLITTER}" --stdin
      )
      ;;
    zip)
      while IFS= read -r -d '' statement; do
        db-cli -g my -H "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p "${DB_PASSWORD}" -d "${DB_NAME}" -e "${statement}" \
          || return 1
      done < <(
        unzip -p "${ZIP_SOURCE_FILE}" "${sql_file}" \
          | iconv -f TIS620 -t UTF-8 \
          | node "${SQL_SPLITTER}" --stdin
      )
      ;;
  esac
}

main() {
  require_command node
  require_command db-cli
  require_command iconv
  load_database_url

  local list_file
  list_file="$(mktemp)"
  trap 'rm -f "${list_file}"' EXIT

  collect_sql_files "${list_file}"

  if [[ -n "${RESUME_FROM_LOG_DIR}" ]]; then
    [[ -d "${RESUME_FROM_LOG_DIR}" ]] || fail "Resume log directory not found: ${RESUME_FROM_LOG_DIR}"
    resume_sql_files "${list_file}" "${RESUME_FROM_LOG_DIR}"
  fi

  local total_files
  total_files="$(wc -l < "${list_file}" | tr -d ' ')"
  [[ "${total_files}" -gt 0 ]] || fail "No SQL files found to restore"

  log "Starting restore"
  log "ENV_FILE=${ENV_FILE}"
  log "SOURCE_MODE=${SOURCE_MODE}"
  if [[ "${SOURCE_MODE}" == "docker" ]]; then
    log "SOURCE=${SOURCE_CONTAINER}:${SOURCE_DIR}"
  elif [[ "${SOURCE_MODE}" == "zip" ]]; then
    log "SOURCE=${ZIP_SOURCE_FILE}"
  else
    log "SOURCE=${LOCAL_SOURCE_DIR}"
  fi
  log "TARGET=${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
  log "TOTAL_FILES=${total_files}"
  log "LOG_DIR=${LOG_DIR}"

  local current_index=0
  local success_count=0
  local failed_count=0
  local sql_file

  while IFS= read -r sql_file; do
    [[ -n "${sql_file}" ]] || continue
    current_index=$((current_index + 1))

    log "Importing (${current_index}/${total_files}): ${sql_file}"

    if import_sql_file "${sql_file}" >> "${RUN_LOG}" 2>&1; then
      printf '%s\n' "${sql_file}" >> "${SUCCESS_LOG}"
      success_count=$((success_count + 1))
      log "SUCCESS: ${sql_file}"
    else
      printf '%s\n' "${sql_file}" >> "${FAILED_LOG}"
      failed_count=$((failed_count + 1))
      log "FAILED: ${sql_file}"
    fi
  done < "${list_file}"

  log "Restore finished"
  log "SUCCESS_COUNT=${success_count}"
  log "FAILED_COUNT=${failed_count}"
  log "SUCCESS_LOG=${SUCCESS_LOG}"
  log "FAILED_LOG=${FAILED_LOG}"

  if [[ "${failed_count}" -gt 0 ]]; then
    exit 1
  fi
}

main "$@"
