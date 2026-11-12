#!/usr/bin/env bash
set -euo pipefail
image=${1:?image name required}
container=$(docker run -d --read-only --tmpfs /tmp "$image")
trap 'docker rm -f "$container" >/dev/null' EXIT
# Check from inside the container so the test needs no exposed host port.
docker exec "$container" sh -ec '
    test "$(id -u)" = 101
    attempts=0
    until wget -q -O /dev/null http://127.0.0.1:8080/healthz 2>/dev/null; do
        [ "$attempts" -lt 10 ] || exit 1
        attempts=$((attempts + 1))
        sleep 1
    done
    wget -q -O /dev/null http://127.0.0.1:8080/
    if wget -q -O /dev/null http://127.0.0.1:8080/does-not-exist; then exit 1; fi
    wget -S -O /dev/null http://127.0.0.1:8080/ 2>&1 | grep -qi "X-Content-Type-Options: nosniff"
'
