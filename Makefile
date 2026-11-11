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
