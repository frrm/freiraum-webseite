#!/usr/bin/env bash
set -euo pipefail
archive=$1
destination=$2
mkdir -p "$destination/layout"
tar -xf "$archive" -C "$destination/layout"
for arch in amd64 arm64; do
    skopeo copy --override-os linux --override-arch "$arch" \
        "oci:$destination/layout" "oci:$destination/$arch:site"
done
