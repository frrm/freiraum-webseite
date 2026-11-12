#!/bin/sh
set -eu
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cat > "$tmp/index.html" <<'HTML'
<html lang="de"><body><main><article id="post-article">needlearticle <div data-pagefind-ignore>needleevents</div></article></main><aside>needlesidebar</aside></body></html>
HTML
cat > "$tmp/list.html" <<'HTML'
<html lang="de"><body><main><article>needlelisting</article></main></body></html>
HTML
/opt/search/node_modules/.bin/pagefind --site "$tmp" --root-selector 'main article#post-article' >/dev/null
python3 - "$tmp" <<'PY'
import gzip, pathlib, sys
fragments = [gzip.decompress(p.read_bytes()).decode() for p in pathlib.Path(sys.argv[1], 'pagefind', 'fragment').glob('*')]
assert len(fragments) == 1, fragments
assert 'needlearticle' in fragments[0]
assert all(word not in fragments[0] for word in ('needleevents', 'needlesidebar', 'needlelisting'))
PY
