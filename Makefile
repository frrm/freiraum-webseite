export LOCAL_UID := $(shell id -u)
export LOCAL_GID := $(shell id -g)
export DATE TITLE

.PHONY: help bootstrap dev build check clean events new-post new-seminar translations

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
	docker compose run --rm site python3 -m unittest discover -s tests -p 'test_author_content.py'
	docker compose run --rm site python3 tests/check-multilingual.py
	docker compose run --rm site sh -c 'hugo --contentDir tests/fixtures/content --destination /tmp/render-check --cleanDestinationDir --minify --panicOnWarning && python3 tests/check-render.py'

events:
	docker compose run --rm site ./fetch_events.sh

clean:
	rm -rf public resources/_gen

.PHONY: fixtures
fixtures:
	docker compose run --rm site python3 -c "from pathlib import Path; Path('data').mkdir(exist_ok=True); Path('data/events.json').write_text('[]\n')"
new-post:
	docker compose run --rm site sh -c 'python3 tools/author_content.py post "$$DATE" "$$TITLE"'

new-seminar:
	docker compose run --rm site sh -c 'python3 tools/author_content.py seminar "$$DATE" "$$TITLE"'

translations:
	docker compose run --rm site python3 tools/author_content.py translations
