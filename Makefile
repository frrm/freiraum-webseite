export LOCAL_UID := $(shell id -u)
export LOCAL_GID := $(shell id -g)

.PHONY: help bootstrap dev build check clean events

help:
	@printf "%s\n" "bootstrap  Build development image" "dev        Start local server" "build      Build public/ (BASE_URL overrides URL)" "check      Build and check routes/assets" "events     Refresh calendar data" "clean      Remove generated output"

bootstrap:
	docker compose build

dev:
	docker compose up

build:
	docker compose run --rm site hugo --cleanDestinationDir --minify --panicOnWarning $(if $(BASE_URL),--baseURL $(BASE_URL))

check: build
	docker compose run --rm site ./tests/site-smoke.sh

events:
	docker compose run --rm site ./fetch_events.sh

clean:
	rm -rf public resources/_gen

.PHONY: fixtures
fixtures:
	docker compose run --rm site python3 -c "from pathlib import Path; Path('data').mkdir(exist_ok=True); Path('data/events.json').write_text('[]\n')"
IMAGE ?= ghcr.io/frrm/freiraum-webseite
REVISION ?= $(shell git rev-parse HEAD)
PLATFORMS ?= linux/amd64,linux/arm64
TAG ?= $(REVISION)
BUILDER ?= freiraum-website-oci

.PHONY: image oci oci-builder push
image: build
	docker build -f Dockerfile.runtime --build-arg REVISION=$(REVISION) -t $(IMAGE):$(TAG) .

oci-builder:
	@docker buildx inspect $(BUILDER) >/dev/null 2>&1 || docker buildx create --name $(BUILDER) --driver docker-container
	@docker buildx inspect $(BUILDER) | grep -Eq '^Driver:[[:space:]]*docker-container$$' || { echo 'OCI builder must use the docker-container driver' >&2; exit 1; }

oci: build oci-builder
	mkdir -p dist
	docker buildx build --builder $(BUILDER) -f Dockerfile.runtime --platform $(PLATFORMS) --build-arg REVISION=$(REVISION) --provenance=mode=max --sbom=true --output type=oci,dest=dist/freiraum.oci.tar .

push:
	$(MAKE) oci </dev/null
	./scripts/scan-oci.sh dist/freiraum.oci.tar </dev/null
	./scripts/push-oci.sh $(IMAGE):$(TAG)
