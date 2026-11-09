#!/bin/sh
set -eu
for file in index.html about/index.html events/index.html gallery/index.html contact/index.html ccc/index.html post/index.html images/profile.jpg modules/ical-2.2.1.min.js; do
    test -s "public/$file" || { echo "Missing or empty: $file" >&2; exit 1; }
done
