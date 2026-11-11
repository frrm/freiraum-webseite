#!/usr/bin/env bash
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/site" "$tmp/bin" "$tmp/www" "$tmp/site/public"
# Substitute paths and profile so this test never touches a real checkout or webroot.
sed -e "s|WEBDIR=\"/var/www/html\"|WEBDIR=\"$tmp/www\"|" \
    -e "s|OUTDIR=\"../output\"|OUTDIR=\"$tmp/output\"|" \
    -e "s|FLOCKFILE=\"../.lock_hugo\"|FLOCKFILE=\"$tmp/lock\"|" \
    -e 's|^\. /etc/profile$|:|' "$root/update_build_deploy.sh" > "$tmp/site/deploy.sh"
cat > "$tmp/bin/git" <<'STUB'
#!/bin/sh
case "$1" in rev-parse) echo revision;; pull) exit "${FAIL_GIT:-0}";; esac
STUB
cat > "$tmp/bin/make" <<'STUB'
#!/bin/sh
if [ "$1" = events ]; then exit "${FAIL_FEED:-0}"; fi
exit "${FAIL_BUILD:-0}"
STUB
cat > "$tmp/bin/rsync" <<'STUB'
#!/bin/sh
printf '%s\n' "$*" > "$TEST_TMP/rsync"
exit "${FAIL_RSYNC:-0}"
STUB
cat > "$tmp/bin/flock" <<'STUB'
#!/bin/sh
exit 0
STUB
chmod +x "$tmp/bin/"*
export PATH="$tmp/bin:$PATH" TEST_TMP="$tmp"
for fail in FAIL_GIT FAIL_FEED FAIL_BUILD; do
    rm -f "$tmp/rsync"
    if env "$fail=1" bash "$tmp/site/deploy.sh" force; then exit 1; fi
    test ! -e "$tmp/rsync"
done
if FAIL_RSYNC=1 bash "$tmp/site/deploy.sh" force; then exit 1; fi
bash "$tmp/site/deploy.sh"
grep -q -- '--exclude=radio/ --delete-after' "$tmp/rsync"
test -n "$(find "$tmp" -maxdepth 1 -type d -name 'output.*' -print -quit)"
rm -f "$tmp/rsync"
bash "$tmp/site/deploy.sh"
test ! -e "$tmp/rsync"
