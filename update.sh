#!/usr/bin/env bash
#
# Update website.
#
# - pull website-contents
# - if anything has changed or each night:
#   - build pages
#   - if successful: update website on webserver
#   - if not successful: copy log to webserver
#   - TODO: if not successful: alert admin
#
# Notes:
# - hugo, git, rsync and flock have to be installed before
# - write-access to WEBDIR has to be set
# - OUTDIR has to be created
# - A lockfile (../.lock_hugo) with flock is used to handle concurrent calls
#   to this script. Note that since flock is used, the lockfile may also exist
#   without being locked.
#   
# Intended to be run as cronjob, e.g.:
#
#     */5 * * * * /home/user/freiraum-webseite/update.sh
#     0   4 * * * /home/user/freiraum-webseite/update.sh force

WEBDIR="/var/www/html"
OUTDIR="../output"
LOGFILE="../update.log"
FLOCKFILE="../.lock_hugo"

cd "$(dirname "$0")" || exit

# setup environment, especially for cron
. /etc/profile

# date -> logfile
echo "-----------------------" >> "$LOGFILE"
date "+%Y-%m-%d %H:%M:%S" >> "$LOGFILE"

# locking
if [ -f ../noupdate ] || [ -f ../nobuild ]; then
    # echo to stderr
    echo "Update forbidden by noupdate/nobuild-lock file." 1>&2 >> "$LOGFILE"
    exit 2
fi
# flock
# (automatically unlocked at exit)
exec {lock_fd}>"$FLOCKFILE"
flock "$lock_fd"

# build necessary?
BUILD=0
if [ "$1" == "force" ]; then
    echo "Rebuilding (forced)..." >> "$LOGFILE"
    BUILD=1
else
    # pull website-contents
    git pull 2>&1 | grep -q "^Already up[- ]to[- ]date.$"
    ret=$?
    # anything changed?
    if [ "$ret" == 0 ]; then
	echo "Nothing changed." >> "$LOGFILE"
    else
        echo "Rebuilding after change..." >> "$LOGFILE"
	BUILD=1
    fi
fi
if [ "$BUILD" == "0" ]; then
    exit 1
fi

# build
echo "- build via hugo" >> "$LOGFILE"
hugo -d "$OUTDIR" --cleanDestinationDir >> "$LOGFILE"
ret=$?

if [ "$ret" == 0 ]; then
    # update webserver
    chmod -R a+rX "$OUTDIR/"
    echo "- rsync to webserver..." >> "$LOGFILE"
    rsync -as --delete-after "$OUTDIR/" "$WEBDIR"
else
    echo "FAILED ($ret)" >&2
    # copy logfile to webserver
    chmod a+r "$LOGFILE"
    cp -p "$LOGFILE" "$WEBDIR/"
fi

