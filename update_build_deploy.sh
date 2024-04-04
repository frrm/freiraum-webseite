#!/usr/bin/env bash
#
# Update website.
#
# - pull website-contents (via git)
# - if anything has changed or when forced:
#   - build pages
#   - if successful: update website on webserver (via rsync)
#   - if not successful: copy log to webserver
#   - TODO: if not successful: alert admin
#
# Requires:
#   git, hugo, rsync, flock
#
# Notes:
#   - directory-/filenames are defined at the top of this file
#   - WEBDIR: must exist and needs write-access
#   - OUTDIR: must exist and needs write-access
#   - Logs to LOGFILE.
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
# Version: 2024-04-04

#----------------------
# configuration
WEBDIR="/var/www/html"
OUTDIR="../output"
FLOCKFILE="../.lock_hugo"
LOGFILE="../update.log"	    # should be the same as in the cronjob

#----------------------
cd "$(dirname "$0")" || exit

# setup environment, especially for cron
. /etc/profile

# date -> logfile
echo "-----------------------"
date "+%Y-%m-%d %H:%M:%S"

# locking
#if [ -f ../noupdate ] || [ -f ../nobuild ]; then
#    # echo to stderr
#    echo "Update forbidden by noupdate/nobuild-lock file."
#    exit 2
#fi
# flock
# (automatically unlocked at exit)
exec {lock_fd}>"$FLOCKFILE"
flock "$lock_fd"

# update website-contents
BUILD=0
git pull 2>&1 | grep -q "^Already up[- ]to[- ]date.$"
ret=$?
# anything changed?
if [ "$ret" == 0 ]; then
    echo "- Nothing changed."
else
    echo "- Rebuild after change."
    BUILD=1
fi

# build necessary?
if [ "$BUILD" == 0 ] && [ "$1" == "force" ]; then
    echo "- Rebuild forced."
    BUILD=1
fi
if [ "$BUILD" == "0" ]; then
    exit 1
fi

# build
echo "- Build via hugo."
hugo -d "$OUTDIR" --cleanDestinationDir
ret=$?
if [ "$ret" == 0 ]; then
    # update webserver
    chmod -R a+rX "$OUTDIR/"
    echo "- rsync to webserver..."
    rsync -as --delete-after "$OUTDIR/" "$WEBDIR"
    echo "DONE"
else
    echo "FAILED ($ret)"
    # copy logfile to webserver
    chmod a+r "$LOGFILE"
    cp -p "$LOGFILE" "$WEBDIR/"
fi

