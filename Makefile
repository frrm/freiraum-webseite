export LOCAL_UID := $(shell id -u)
export LOCAL_GID := $(shell id -g)

.PHONY: bootstrap dev build check clean events

bootstrap:
	docker compose build

dev:
	docker compose up

build:
	docker compose run --rm site hugo --cleanDestinationDir --minify --panicOnWarning

check: build
	docker compose run --rm site ./tests/site-smoke.sh

events:
	docker compose run --rm site ./fetch_events.sh

clean:
	rm -rf public resources/_gen
