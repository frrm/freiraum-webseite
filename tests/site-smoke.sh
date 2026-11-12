#!/bin/sh
set -eu
for file in index.html about/index.html events/index.html gallery/index.html contact/index.html ccc/index.html post/index.html images/profile.jpg modules/ical-2.2.1.min.js; do
    test -s "public/$file" || { echo "Missing or empty: $file" >&2; exit 1; }
done
while IFS= read -r route; do
    test -s "public/$route" || { echo "Missing German route: $route" >&2; exit 1; }
done < tests/german-routes.txt
find static -type f | while IFS= read -r asset; do
    cmp -s "$asset" "public/${asset#static/}" || { echo "Missing or changed static asset: $asset" >&2; exit 1; }
done
