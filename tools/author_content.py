#!/usr/bin/env python3
"""Create contributor drafts and report missing English Markdown translations."""
import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def slugify(value):
    slug = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    if not slug:
        raise ValueError("title must contain at least one ASCII letter or digit")
    return slug


def create(kind, date, title, root=ROOT):
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
        raise ValueError("date must be YYYY-MM-DD")
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError as error:
        raise ValueError("date must be a real calendar date in YYYY-MM-DD format") from error
    year, month, day = date.split("-")
    slug = slugify(title)
    title = json.dumps(title, ensure_ascii=False)
    if kind == "post":
        target = root / "content/post" / f"post_{date}" / "index.md"
        metadata = f'''author = ""
title = {title}
date = "{date}"
draft = true
categories = ["Log"]'''
        body = ""
    else:
        target = root / "content/ccc/chaosseminar" / f"{year}_{month}_{slug}.md"
        metadata = f'''title = {title}
date = "{date}"
draft = true
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Ort = "Uni Ulm, Hörsaal H20"
Vortragende = ""
Archiv = []'''
        body = "{{< chaosseminar >}}\n\n"
    if target.exists():
        raise FileExistsError(f"refusing to overwrite {target}")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(f"+++\n{metadata}\n+++\n\n{body}", encoding="utf-8")
    return target


def missing_translations(root=ROOT):
    content = root / "content"
    return [p for p in sorted(content.rglob("*.md"))
            if not p.name.endswith(".en.md") and not p.with_name(p.stem + ".en.md").exists()]


def seminar_pages(content_dir):
    return (path for path in sorted(content_dir.rglob("*.md"))
            if path.name != "_index.md" and not path.name.endswith(".en.md"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("post", "seminar"):
        sub = commands.add_parser(name)
        sub.add_argument("date", help="YYYY-MM-DD")
        sub.add_argument("title")
    commands.add_parser("translations", help="list source Markdown without .en.md counterpart")
    args = parser.parse_args()
    try:
        if args.command == "translations":
            missing = missing_translations()
            for path in missing:
                print(path.relative_to(ROOT))
            print(f"{len(missing)} Markdown files need English counterparts", file=sys.stderr)
            return bool(missing)
        print(create(args.command, args.date, args.title).relative_to(ROOT))
        return 0
    except (ValueError, FileExistsError) as error:
        parser.error(str(error))


if __name__ == "__main__":
    sys.exit(main())
