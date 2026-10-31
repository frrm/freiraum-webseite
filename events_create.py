#!/usr/bin/env python3
"""
Create event-yaml-files for Hugo from the iCalendar feed (default: https://ccc.ulm.de/kalender).

Recurring events (RRULE, EXDATE, modified single occurrences) are expanded, so
there is one yaml file per appointment, e.g.

    2026_kw45_ccc.yaml
    2026_kw45_frrm.yaml

in the output directory (default: the current directory). These files are the
data source of the server-side (no JavaScript) lists in the Hugo theme.

Existing files are left untouched unless --force is given, so manual changes
survive a re-run. Please check the resulting files and modify/delete them as
necessary.

Requires:  pip install icalendar recurring-ical-events

:Author:  Roland Freikamp (original version, 2024-04-04)
:Version: 2026-10-31 (reads the appointments from the ICS feed)
"""

import argparse
import json
import re
import sys
import urllib.request
from datetime import date, datetime, time, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

DEFAULT_SOURCE = "https://ulm.ccc.de/kalender"
LOCAL_TZ = ZoneInfo("Europe/Berlin")

# Keeps the file names of the former script (…_ccc.yaml, …_frrm.yaml).
# Key: event title in lower case. All other titles are slugified.
SLUG_OVERRIDES = {
    "ccc ulm": "ccc",
    "offenes treffen": "frrm",
}

_YAML_WORDS = {"true", "false", "yes", "no", "on", "off", "y", "n", "null", "~"}


#----------------------
# reading the calendar
#----------------------
def load_ics(source):
    """Return the raw ICS data from a URL or a local file."""
    if source.startswith(("http://", "https://")):
        request = urllib.request.Request(source, headers={"User-Agent": "events_create.py"})
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.read()
    with open(source, "rb") as f:
        return f.read()


def read_occurrences(ics_data, first_day, last_day_exclusive):
    """All event occurrences in the time span, recurring events expanded."""
    try:
        import icalendar
        import recurring_ical_events
    except ImportError:
        sys.exit("Missing dependencies. Install them with:\n"
                 "    pip install icalendar recurring-ical-events")

    calendar = icalendar.Calendar.from_ical(ics_data)
    return recurring_ical_events.of(calendar).between(first_day, last_day_exclusive)


#----------------------
# converting one occurrence
#----------------------
def to_local(value):
    """(naive local datetime, is_all_day) for an ICS date or datetime."""
    if isinstance(value, datetime):
        if value.tzinfo is not None:
            value = value.astimezone(LOCAL_TZ).replace(tzinfo=None)
        return value, False
    return datetime.combine(value, time.min), True          # DATE value = all-day


def get_end(ev, start_raw):
    """DTEND, or DTSTART + DURATION, or a sensible default."""
    dtend = ev.get("DTEND")
    if dtend is not None:
        return dtend.dt
    duration = ev.get("DURATION")
    if duration is not None:
        return start_raw + duration.dt
    return start_raw if isinstance(start_raw, datetime) else start_raw + timedelta(days=1)


def get_categories(ev):
    """All CATEGORIES values (one line with commas or several lines)."""
    cats = ev.get("CATEGORIES")
    if cats is None:
        return []
    if not isinstance(cats, list):
        cats = [cats]
    return [str(c).strip() for vcat in cats for c in vcat.cats if str(c).strip()]


def build_event(ev):
    """Plain dict for one occurrence, or None if it should be skipped."""
    if str(ev.get("STATUS", "")).upper() == "CANCELLED":
        return None
    dtstart = ev.get("DTSTART")
    if dtstart is None:
        return None

    start_raw = dtstart.dt
    start, all_day = to_local(start_raw)
    end, _ = to_local(get_end(ev, start_raw))
    if all_day:
        end -= timedelta(seconds=1)          # DTEND of all-day events is exclusive

    return {
        "name": str(ev.get("SUMMARY", "")).strip() or "Ohne Titel",
        "start": start,
        "end": max(start, end),
        "location": str(ev.get("LOCATION", "")).strip(),
        "description": str(ev.get("DESCRIPTION", "")).strip(),
        "category": ", ".join(get_categories(ev)),
    }


#----------------------
# writing the yaml files
#----------------------
def yaml_scalar(value):
    """Plain YAML where that is safe, otherwise a double-quoted string."""
    s = str(value).strip()
    needs_quotes = (
        not s
        or not (s[0].isalnum() or s[0] in "/(")
        or ": " in s or " #" in s or s.endswith(":")
        or "\n" in s or "\t" in s
        or s.lower() in _YAML_WORDS
        or re.fullmatch(r"[-+]?[0-9][0-9_.,:eE+\-]*", s)      # looks like a number or date
    )
    return json.dumps(s, ensure_ascii=False) if needs_quotes else s


def render_yaml(e):
    """Same layout as the former templates, plus an optional category."""
    lines = [
        f"name          : {yaml_scalar(e['name'])}",
        f"startDatetime : {e['start']:%Y-%m-%dT%H:%M:%S}",
        f"endDatetime   : {e['end']:%Y-%m-%dT%H:%M:%S}",
    ]
    if e["location"]:
        lines.append(f"location      : {yaml_scalar(e['location'])}")
    if e["description"]:
        lines.append(f"description   : {yaml_scalar(e['description'])}")
    if e["category"]:
        lines.append(f"category      : {yaml_scalar(e['category'])}")
    return "\n".join(lines) + "\n"


def slugify(text):
    text = text.lower().translate(str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"}))
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-") or "event"


def make_filename(e, used):
    """YYYY_kwWEEK_slug.yaml (ISO week, like before); unique within one run."""
    iso_year, iso_week, _ = e["start"].isocalendar()
    slug = SLUG_OVERRIDES.get(e["name"].lower(), slugify(e["name"]))
    base = f"{iso_year}_kw{iso_week:02}_{slug}"
    name, n = base, 1
    while name in used:
        n += 1
        name = f"{base}_{n}"
    used.add(name)
    return name + ".yaml"


#----------------------
def events_create(year=None, source=DEFAULT_SOURCE, outdir=".", force=False, dry_run=False):
    """Create the event-yaml-files for one calendar year (default: the next 365 days)."""
    if year:
        first_day, last_day = date(year, 1, 1), date(year + 1, 1, 1)
    else:
        first_day = date.today()
        last_day = first_day + timedelta(days=365)

    print(f"Reading {source}")
    occurrences = read_occurrences(load_ics(source), first_day, last_day)

    events = [e for e in map(build_event, occurrences) if e]
    events = sorted((e for e in events if first_day <= e["start"].date() < last_day),
                    key=lambda e: e["start"])
    if not events:
        print(f"No events found between {first_day} and {last_day}.")
        return 0

    outdir = Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    used, created, skipped = set(), 0, 0
    for e in events:
        path = outdir / make_filename(e, used)
        if path.exists() and not force:
            print(f"Skipped (exists): {path.name}")
            skipped += 1
            continue
        print(f"{'Would create' if dry_run else 'Create'}: {path.name}  ({e['start']:%Y-%m-%d %H:%M}  {e['name']})")
        if not dry_run:
            path.write_text(render_yaml(e), encoding="utf-8")
        created += 1

    print(f"Done: {created} {'would be ' if dry_run else ''}written, {skipped} skipped.")
    return 0


#----------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create event-yaml-files for Hugo from the ICS calendar feed.")
    parser.add_argument("year", nargs="?", type=int,
                        help="calendar year to create (default: the next 365 days)")
    parser.add_argument("-s", "--source", default=DEFAULT_SOURCE,
                        help=f"URL or path of the .ics file (default: {DEFAULT_SOURCE})")
    parser.add_argument("-o", "--outdir", default=".",
                        help="directory for the yaml files (default: current directory)")
    parser.add_argument("-f", "--force", action="store_true",
                        help="overwrite existing files")
    parser.add_argument("-n", "--dry-run", action="store_true",
                        help="only show what would be written")
    args = parser.parse_args()

    try:
        sys.exit(events_create(args.year, args.source, args.outdir, args.force, args.dry_run))
    except OSError as err:                       # network and file errors
        sys.exit(f"Error: {err}")

#=========================================
