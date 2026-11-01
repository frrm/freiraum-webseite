#!/usr/bin/env bash
#
# update_events.sh - regenerate data/events with events_crate.py (run once a day from cron).
#
# What it does:
#   1. backs up ./data/events if it is not empty
#   2. clears ./data/events
#   3. runs events_crate.py (located next to this script) with ./data/events as working directory
#   4. if the script failed or ./data/events contains no .yaml file afterwards:
#      logs an error and restores the backup
#
# Place it next to events_crate.py (the project root) and make it executable:
#   chmod +x update_events.sh
#
# Example crontab entry (every day at 03:15):
#   15 3 * * * /path/to/project/update_events.sh
#
# Settings (environment variables, all optional):
#   PYTHON    Python interpreter, e.g. a virtualenv:  PYTHON=/path/to/venv/bin/python
#   LOG_FILE  log file (default: update_events.log next to this script)
#
# Exit codes: 0 = ok, 1 = failed (old events restored if there were any), 2 = setup problem

set -u

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EVENTS_DIR="$BASE_DIR/data/events"
BACKUP_DIR="$BASE_DIR/.events-backup"      # outside data/, so Hugo does not read it
PARSE_SCRIPT="$BASE_DIR/events_create.py"
PYTHON="${PYTHON:-python3}"
LOG_FILE="${LOG_FILE:-$BASE_DIR/update_events.log}"
LOCK_FILE="$BASE_DIR/.update_events.lock"

HAVE_BACKUP=0
NEED_RESTORE=0

#----------------------
log() {                                     # log LEVEL MESSAGE
    printf '%s [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" "$2" >> "$LOG_FILE"
}

error() {                                   # log to file and to stderr (cron mails stderr)
    log ERROR "$1"
    printf 'update_events.sh: %s\n' "$1" >&2
}

has_files() {                               # has_files DIR -> true if DIR contains anything
    [ -n "$(find "$1" -mindepth 1 -print -quit 2>/dev/null)" ]
}

has_yaml() {                                # true if EVENTS_DIR contains at least one .yaml file
    [ -n "$(find "$EVENTS_DIR" -maxdepth 1 -type f -name '*.yaml' -print -quit 2>/dev/null)" ]
}

clear_events() {
    # EVENTS_DIR is always "$BASE_DIR/data/events"; the check guards against an empty path
    [ -n "$EVENTS_DIR" ] && [ -d "$EVENTS_DIR" ] && find "$EVENTS_DIR" -mindepth 1 -delete
}

restore_backup() {
    if [ "$HAVE_BACKUP" -ne 1 ]; then
        log WARN "No backup available (events folder was empty before), nothing to restore"
        return 1
    fi
    if clear_events && cp -a "$BACKUP_DIR/." "$EVENTS_DIR/"; then
        log INFO "Restored the previous events from $BACKUP_DIR"
    else
        error "Restoring the backup FAILED - the previous events are still in $BACKUP_DIR"
        return 1
    fi
}

# Safety net: if the script is interrupted (kill, shutdown) after the folder was cleared,
# the old events are put back.
cleanup() {
    if [ "$NEED_RESTORE" -eq 1 ]; then
        error "Interrupted before the new events were verified"
        restore_backup
    fi
}
trap cleanup EXIT
trap 'exit 1' INT TERM HUP

#----------------------
# checks
#----------------------
if [ ! -f "$PARSE_SCRIPT" ]; then
    error "events_crate.py not found: $PARSE_SCRIPT"
    exit 2
fi
mkdir -p "$EVENTS_DIR" || { error "Cannot create $EVENTS_DIR"; exit 2; }

# only one run at a time
if command -v flock >/dev/null 2>&1; then
    exec 9>"$LOCK_FILE"
    if ! flock -n 9; then
        log WARN "Another run is still in progress, exiting"
        exit 0
    fi
fi

log INFO "Start"

#----------------------
# backup (only if there is something to back up)
#----------------------
rm -rf "$BACKUP_DIR"
if has_files "$EVENTS_DIR"; then
    if mkdir -p "$BACKUP_DIR" && cp -a "$EVENTS_DIR/." "$BACKUP_DIR/"; then
        HAVE_BACKUP=1
        log INFO "Backup created: $BACKUP_DIR ($(find "$BACKUP_DIR" -type f | wc -l) files)"
    else
        error "Backup failed, events folder left untouched"
        exit 2
    fi
else
    log INFO "Events folder is empty, no backup needed"
fi

#----------------------
# clear and regenerate
#----------------------
NEED_RESTORE=$HAVE_BACKUP
if ! clear_events; then
    error "Could not clear $EVENTS_DIR"
    restore_backup
    NEED_RESTORE=0
    exit 1
fi

( cd "$EVENTS_DIR" && "$PYTHON" "$PARSE_SCRIPT" ) >> "$LOG_FILE" 2>&1
RC=$?

#----------------------
# verify
#----------------------
if [ "$RC" -ne 0 ]; then
    error "parseevents.py exited with status $RC"
    restore_backup
    NEED_RESTORE=0
    exit 1
fi

if ! has_yaml; then
    error "parseevents.py created no .yaml files in $EVENTS_DIR"
    restore_backup
    NEED_RESTORE=0
    exit 1
fi

NEED_RESTORE=0
log INFO "Done: $(find "$EVENTS_DIR" -maxdepth 1 -type f -name '*.yaml' | wc -l) event files in $EVENTS_DIR"
exit 0
