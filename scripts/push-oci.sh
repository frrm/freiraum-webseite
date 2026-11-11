#!/usr/bin/env bash
set -euo pipefail
: "${REGISTRY_USER:?Set REGISTRY_USER and provide a registry token on stdin}"
image=${1:?image reference required}
registry=${image%%/*}
docker run --rm -i -v "$(pwd)/dist:/archive:ro" --entrypoint sh \
    quay.io/skopeo/stable@sha256:ed369b58b75b773ebe6cb8b6edd1c9b4323701c703777c8567e3c1fc7df9527c \
    -ec 'skopeo login --authfile /tmp/auth.json -u "$1" --password-stdin "$2"; skopeo copy --authfile /tmp/auth.json --all oci-archive:/archive/freiraum.oci.tar "docker://$3"' \
    sh "$REGISTRY_USER" "$registry" "$image"
