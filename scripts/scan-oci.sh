#!/usr/bin/env bash
set -euo pipefail
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
mkdir "$tmp/layout"
tar -xf "$1" -C "$tmp/layout"
skopeo=quay.io/skopeo/stable@sha256:ed369b58b75b773ebe6cb8b6edd1c9b4323701c703777c8567e3c1fc7df9527c
trivy=aquasec/trivy@sha256:8f6bb947dbc528902e11f2f5be52f7b519f6a39d5d148f41166f2040499768fb
for arch in amd64 arm64; do
    docker run --rm -v "$tmp:/scan" "$skopeo" copy --override-os linux --override-arch "$arch" \
        oci:/scan/layout "oci:/scan/$arch:site"
    docker run --rm -v "$tmp:/scan" "$trivy" image --cache-dir /scan/cache --input "/scan/$arch" \
        --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1
done
