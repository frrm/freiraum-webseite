#!/usr/bin/env bash
# Fetch and validate the calendar before replacing the snapshot used by Hugo.
set -eu
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
"${PYTHON:-python3}" "$BASE_DIR/events_create.py" --snapshot --outdir "$BASE_DIR/data/calendar" "$@"
