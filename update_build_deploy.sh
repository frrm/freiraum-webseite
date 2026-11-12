#!/usr/bin/env bash
#
# Update website.
#
# - pull website-contents (via git)
# - if anything has changed or when forced:
#   - build pages
#   - if successful: update website on webserver (via rsync)
#   - on failure: leave the published site unchanged during preparation
#   - TODO: if not successful: alert admin
#
# Requires:
#   git, docker compose, make, rsync, flock
#
# Notes:
#   - directory-/filenames are defined at the top of this file
#   - WEBDIR: must exist and needs write-access
#   - OUTDIR: parent directory must exist and be writable
#   - Logs to stdout and stderr; the cron job redirects these to a private file.
#   - locking: a lockfile with flock is used to handle concurrent calls
#     to this script. Note that since flock is used, the lockfile may also
#     exist without being locked.
#   - See source for details.
#
# Intended to be run as cronjob, e.g.:
#
#     */5 * * * * /home/user/freiraum-webseite/update_build_deploy.sh >> /home/user/update.log 2>&1
#     0   4 * * * /home/user/freiraum-webseite/update_build_deploy.sh force >> /home/user/update.log 2>&1
#
# Author:  Roland Freikamp
# Version: 2024-08-17

#----------------------
# configuration
WEBDIR="/var/www/html"
OUTDIR="../output"
EXCLUDEOUT="radio/"	    # exclude from overwriting/deleting by rsync
FLOCKFILE="../.lock_hugo"

#----------------------
cd "$(dirname "$0")" || exit

# setup environment, especially for cron
. /etc/profile

# locking
#if [ -f ../noupdate ] || [ -f ../nobuild ]; then
#    # echo to stderr
#    echo "Update forbidden by noupdate/nobuild-lock file."
#    exit 2
#fi
# flock
# (automatically unlocked at exit)
exec {lock_fd}>"$FLOCKFILE"
flock "$lock_fd" || exit 1

# date -> logfile
echo "-----------------------"
date "+%Y-%m-%d %H:%M:%S"

# Update the checkout before deciding whether a build is needed.
git pull --ff-only || exit 1
after=$(git rev-parse HEAD) || exit 1
STATEFILE="${OUTDIR}.revision"
previous=$(cat "$STATEFILE" 2>/dev/null || :)
if [ "$previous" = "$after" ] && [ "${1:-}" != "force" ]; then
    echo "- Nothing changed."
    exit 0
fi

# Never publish a partial feed or build.
make events || exit 1
stage=$(mktemp -d "${OUTDIR}.XXXXXX") || exit 1
trap 'rm -rf "$stage"' EXIT
stage=$(cd "$stage" && pwd) || exit 1
echo "- Build site."
make build || exit 1
cp -a public/. "$stage/" || exit 1
chmod -R a+rX "$stage/" || exit 1
echo "- rsync to webserver..."
if ! rsync -as --exclude="$EXCLUDEOUT" --delete-after "$stage/" "$WEBDIR"; then
    trap - EXIT
    echo "- rsync failed; staged build retained at $stage" >&2
    exit 1
fi
printf '%s\n' "$after" > "${STATEFILE}.tmp" || exit 1
mv "${STATEFILE}.tmp" "$STATEFILE" || exit 1
echo "DONE"
