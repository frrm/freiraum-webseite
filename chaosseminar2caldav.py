#!/usr/bin/env python3
"""
Create calendar entries (Radicale / CalDAV) for upcoming Chaosseminar pages.

Looks at the Hugo content files in content/ccc/chaosseminar/ and, for every page
whose [ChaosSeminar] Termin lies in the future:

  1. creates an event in the CalDAV calendar (if it does not exist yet). The event
     contains a link to the page: SITE_URL/ccc/chaosseminar/<file name without .md>/
  2. removes the other appointments that have the same time or overlap with the
     seminar (e.g. the regular Montagstreff). A single appointment is deleted; for a
     recurring appointment only the occurrence on that day is cancelled (EXDATE),
     the rest of the series stays. Never touched: all-day entries, cancelled entries
     and other Chaosseminar events.

Pages in the past, drafts and pages without a date are ignored.

Options:
    -m, --manual           ask for confirmation before every change in the calendar
    -k, --keep-conflicts   do not remove overlapping appointments
    -u, --update           overwrite seminar events that already exist
    -n, --dry-run          only show what would happen (reads the calendar, writes nothing)
    -c, --config           config file with all settings (default: chaosseminar_caldav.toml)
    -d, --content-dir      folder with the pages (overrides content_dir in the config)

The event gets a fixed UID derived from the file name and is only created if it does
not exist yet, so the script can run as often as you like (e.g. daily from cron).

Needs Python 3.9+ (3.11+ for the built-in TOML parser, otherwise: pip install tomli)
and python-dateutil (pip install python-dateutil) for recurring appointments.
All settings are read from chaosseminar_caldav.toml (chmod 600: it contains the password).
"""

import argparse
import base64
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
import xml.etree.ElementTree as ET
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

try:
    import tomllib                                  # Python 3.11+
except ModuleNotFoundError:
    try:
        import tomli as tomllib                     # pip install tomli
    except ModuleNotFoundError:
        sys.exit("Python 3.11+ or the package 'tomli' is required (pip install tomli).")

# ---------------------------------------------------------------------------
# Settings: every setting is loaded from the config file (see apply_config)
# ---------------------------------------------------------------------------
CONFIG_FILE = Path(__file__).resolve().parent / "caldav.toml"
UTC = timezone.utc                          # fixed standard, not a setting

# filled in by apply_config(): the former CAPITAL variables
CALDAV_URL = CALDAV_USER = CALDAV_PASSWORD = None
SITE_URL = PAGE_PATH = SUMMARY_PREFIX = PROTECTED_CATEGORY = None
CONTENT_DIR = LOCAL_TZ = DEFAULT_DURATION = None
DEFAULT_CATEGORIES = TERMIN_FORMATS = None


def apply_config(path):
    """Load all settings from the TOML config file into the module variables."""
    global CALDAV_URL, CALDAV_USER, CALDAV_PASSWORD, SITE_URL, PAGE_PATH
    global CONTENT_DIR, LOCAL_TZ, DEFAULT_DURATION, SUMMARY_PREFIX
    global DEFAULT_CATEGORIES, PROTECTED_CATEGORY, TERMIN_FORMATS

    path = Path(path).resolve()
    try:
        with path.open("rb") as f:
            cfg = tomllib.load(f)
    except FileNotFoundError:
        sys.exit(f"Config file not found: {path}")
    except tomllib.TOMLDecodeError as err:
        sys.exit(f"Config file {path} is not valid TOML: {err}")

    def get(section, key, kind=str):
        try:
            value = cfg[section][key]
        except (KeyError, TypeError):
            sys.exit(f"Missing setting [{section}] {key} in {path}")
        if not isinstance(value, kind):
            sys.exit(f"Setting [{section}] {key} in {path} must be of type {kind.__name__}")
        return value

    CALDAV_URL = get("caldav", "url")
    CALDAV_USER = get("caldav", "user")
    CALDAV_PASSWORD = get("caldav", "password")
    SITE_URL = get("site", "url")
    PAGE_PATH = get("site", "page_path").strip("/")
    CONTENT_DIR = (path.parent / get("paths", "content_dir")).resolve()   # relative to the config file
    try:
        LOCAL_TZ = ZoneInfo(get("seminar", "timezone"))
    except ZoneInfoNotFoundError:
        sys.exit(f"Unknown time zone in [seminar] timezone of {path}")
    DEFAULT_DURATION = timedelta(minutes=get("seminar", "default_duration_minutes", int))
    SUMMARY_PREFIX = get("seminar", "summary_prefix")
    DEFAULT_CATEGORIES = [str(c) for c in get("seminar", "default_categories", list)]
    PROTECTED_CATEGORY = get("seminar", "protected_category").lower()
    TERMIN_FORMATS = tuple(str(f) for f in get("seminar", "termin_formats", list))


class CalDavError(Exception):
    """Problem with the server (login, URL, unexpected answer): the run is aborted."""


class Quit(Exception):
    """The user answered 'q' in manual mode."""


def load_seminar_events(content_dir):
    events = []
    for path in sorted(content_dir.rglob("*.md")):
        if path.name == "_index.md" or path.name.endswith(".en.md"):
            continue
        try:
            front_matter = read_front_matter(path)
            event = build_event(path, front_matter) if front_matter is not None else None
        except (ValueError, tomllib.TOMLDecodeError) as err:
            print(f"  {path.name}: {err}, skipped", file=sys.stderr)
            continue
        if event:
            events.append(event)
    return events


# ---------------------------------------------------------------------------
# Reading the Hugo pages
# ---------------------------------------------------------------------------
def read_front_matter(path):
    """TOML front matter (+++ ... +++) of a content file as dict, or None."""
    text = path.read_text(encoding="utf-8-sig")
    match = re.match(r"\+\+\+[ \t]*\r?\n(.*?)\r?\n\+\+\+[ \t]*(?:\r?\n|\Z)", text, re.S)
    if not match:
        return None
    return tomllib.loads(match.group(1))


def get_ci(mapping, key, default=None):
    """Case-insensitive dict lookup (Thema / thema)."""
    for k, v in mapping.items():
        if k.lower() == key.lower():
            return v
    return default


def parse_termin(value):
    """(start, all_day): aware datetime in LOCAL_TZ, or a date for all-day events."""
    if isinstance(value, datetime):                         # unquoted TOML datetime
        return (value if value.tzinfo else value.replace(tzinfo=LOCAL_TZ)), False
    if isinstance(value, date):
        return value, True
    text = str(value).strip()
    for fmt in TERMIN_FORMATS:
        try:
            return datetime.strptime(text, fmt).replace(tzinfo=LOCAL_TZ), False
        except ValueError:
            pass
    try:
        return datetime.strptime(text, "%Y-%m-%d").date(), True
    except ValueError:
        raise ValueError(f"unknown date format: {text!r}")


def is_future(start, all_day, now):
    if all_day:
        return start >= now.astimezone(LOCAL_TZ).date()
    return start > now


def page_url(rel):
    """Link to the page: SITE_URL/ccc/chaosseminar/<file name without .md>/"""
    slug = rel[:-3] if rel.endswith(".md") else rel
    if slug.endswith("/index"):                             # page bundle: folder/index.md
        slug = slug[:-len("/index")]
    return f"{SITE_URL.rstrip('/')}/{PAGE_PATH}/{slug}/"


def build_event(path, front_matter):
    """Event dict for a page, or None if the page should be ignored."""
    if front_matter.get("draft") is True:
        return None
    section = get_ci(front_matter, "ChaosSeminar", {})
    if not isinstance(section, dict):
        section = {}

    termin = get_ci(section, "Termin") or front_matter.get("date")
    if not termin:
        print(f"  {path.name}: no Termin or date, skipped")
        return None
    start, all_day = parse_termin(termin)
    if not is_future(start, all_day, datetime.now(UTC)):
        return None

    end = start + timedelta(days=1) if all_day else start + DEFAULT_DURATION

    title = str(front_matter.get("title") or path.stem).strip()
    thema = str(get_ci(section, "Thema", "") or "").strip()
    vortragende = str(get_ci(section, "Vortragende", "") or "").strip()
    rel = path.relative_to(CONTENT_DIR).as_posix()
    url = page_url(rel)
    description = "\n".join(filter(None, [
        f"Thema: {thema}" if thema else "",
        f"Vortragende: {vortragende}" if vortragende else "",
        f"Mehr Infos: {url}",
    ]))

    categories = front_matter.get("categories") or DEFAULT_CATEGORIES
    if isinstance(categories, str):
        categories = [categories]

    return {
        "uid": str(uuid.uuid5(uuid.NAMESPACE_URL, f"chaosseminar:{rel}")),
        "start": start, "end": end, "all_day": all_day,
        "summary": f"{SUMMARY_PREFIX}{title}",
        "location": str(get_ci(section, "Ort", "") or "").strip(),
        "description": description,
        "categories": [str(c) for c in categories],
        "url": url,
    }


# ---------------------------------------------------------------------------
# iCalendar: writing the seminar event
# ---------------------------------------------------------------------------
def ical_escape(text):
    return (str(text).replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,")
            .replace("\r\n", "\n").replace("\n", "\\n"))


def ical_unescape(text):
    out, i = [], 0
    while i < len(text):
        if text[i] == "\\" and i + 1 < len(text):
            nxt = text[i + 1]
            out.append("\n" if nxt in "nN" else nxt)
            i += 2
        else:
            out.append(text[i])
            i += 1
    return "".join(out)


def fold(line):
    """Fold lines longer than 75 octets (RFC 5545), without splitting a UTF-8 character."""
    if len(line.encode("utf-8")) <= 75:
        return line
    parts, current, size = [], "", 0
    for ch in line:
        n = len(ch.encode("utf-8"))
        if size + n > 75:
            parts.append(current)
            current, size = " " + ch, 1 + n
        else:
            current, size = current + ch, size + n
    parts.append(current)
    return "\r\n".join(parts)


def render_lines(lines):
    return "\r\n".join(fold(line) for line in lines) + "\r\n"


def render_ics(e):
    def utc(dt):
        return dt.astimezone(UTC).strftime("%Y%m%dT%H%M%SZ")

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//CCC Ulm//chaosseminar_to_caldav//DE",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        f"UID:{e['uid']}",
        f"DTSTAMP:{utc(datetime.now(UTC))}",
    ]
    if e["all_day"]:
        lines += [f"DTSTART;VALUE=DATE:{e['start']:%Y%m%d}", f"DTEND;VALUE=DATE:{e['end']:%Y%m%d}"]
    else:
        lines += [f"DTSTART:{utc(e['start'])}", f"DTEND:{utc(e['end'])}"]
    lines.append(f"SUMMARY:{ical_escape(e['summary'])}")
    if e["location"]:
        lines.append(f"LOCATION:{ical_escape(e['location'])}")
    if e["description"]:
        lines.append(f"DESCRIPTION:{ical_escape(e['description'])}")
    if e["categories"]:
        lines.append("CATEGORIES:" + ",".join(ical_escape(c) for c in e["categories"]))
    if e["url"]:
        lines.append(f"URL:{e['url']}")
    lines += ["END:VEVENT", "END:VCALENDAR"]
    return render_lines(lines)


# ---------------------------------------------------------------------------
# iCalendar: reading other appointments (to find overlaps)
# ---------------------------------------------------------------------------
def unfold(text):
    """Logical lines of an ICS text (folded lines joined)."""
    lines = []
    for raw in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        if raw[:1] in (" ", "\t") and lines:
            lines[-1] += raw[1:]
        elif raw:
            lines.append(raw)
    return lines


def split_prop(line):
    """'NAME;PARAM=x:value' -> {'name', 'params', 'value'} (or None)."""
    in_quotes, colon = False, -1
    for i, ch in enumerate(line):
        if ch == '"':
            in_quotes = not in_quotes
        elif ch == ":" and not in_quotes:
            colon = i
            break
    if colon < 0:
        return None
    head, value = line[:colon], line[colon + 1:]
    parts, current, in_quotes = [], "", False
    for ch in head:
        if ch == '"':
            in_quotes = not in_quotes
        if ch == ";" and not in_quotes:
            parts.append(current)
            current = ""
        else:
            current += ch
    parts.append(current)
    params = {}
    for part in parts[1:]:
        key, _, val = part.partition("=")
        params[key.upper()] = val.strip('"')
    return {"name": parts[0].upper(), "params": params, "value": value}


def parse_vevents(lines):
    """VEVENT blocks: {'start', 'end' (line indexes), 'props'}; VALARM etc. are ignored."""
    blocks, current, depth = [], None, 0
    for idx, line in enumerate(lines):
        up = line.upper()
        if up == "BEGIN:VEVENT":
            current, depth = {"start": idx, "props": []}, 0
            continue
        if current is None:
            continue
        if up.startswith("BEGIN:"):
            depth += 1
        elif up.startswith("END:"):
            if up == "END:VEVENT" and depth == 0:
                current["end"] = idx
                blocks.append(current)
                current = None
            else:
                depth -= 1
        elif depth == 0:
            prop_ = split_prop(line)
            if prop_:
                current["props"].append(prop_)
    return blocks


def prop(block, name):
    return next((p for p in block["props"] if p["name"] == name), None)


def props(block, name):
    return [p for p in block["props"] if p["name"] == name]


def parse_dt_value(value, params):
    """(value, all_day, tzid, is_utc); value is an aware datetime, or a date for all-day."""
    value = value.strip()
    if params.get("VALUE") == "DATE" or re.fullmatch(r"\d{8}", value):
        return datetime.strptime(value, "%Y%m%d").date(), True, None, False
    fmt = "%Y%m%dT%H%M%S" if len(value.rstrip("Z")) == 15 else "%Y%m%dT%H%M"
    if value.endswith("Z"):
        return datetime.strptime(value[:-1], fmt).replace(tzinfo=UTC), False, None, True
    tzid, tz = params.get("TZID"), LOCAL_TZ
    if tzid:
        try:
            tz = ZoneInfo(tzid)
        except Exception:                                   # unknown name (e.g. Windows names)
            tz = LOCAL_TZ
    return datetime.strptime(value, fmt).replace(tzinfo=tz), False, tzid, False


def parse_dt(p):
    return parse_dt_value(p["value"], p["params"])


def parse_duration(value):
    m = re.fullmatch(r"([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?", value.strip())
    if not m:
        raise ValueError(f"unknown duration: {value!r}")
    sign, w, d, h, mi, s = m.groups()
    delta = timedelta(weeks=int(w or 0), days=int(d or 0), hours=int(h or 0),
                      minutes=int(mi or 0), seconds=int(s or 0))
    return -delta if sign == "-" else delta


def event_span(block):
    """(start, end) of a timed VEVENT, None for all-day events or events without DTSTART."""
    dtstart = prop(block, "DTSTART")
    if dtstart is None:
        return None
    start, all_day, _, _ = parse_dt(dtstart)
    if all_day:
        return None
    dtend = prop(block, "DTEND")
    if dtend is not None:
        end, end_all_day, _, _ = parse_dt(dtend)
        return None if end_all_day else (start, end)
    duration = prop(block, "DURATION")
    if duration is not None:
        return start, start + parse_duration(duration["value"])
    return start, start                                     # no end: a point in time


def overlaps(start, end, win_start, win_end):
    """Same time or overlapping. Appointments that only touch each other do not overlap."""
    if end <= start:
        end = start + timedelta(minutes=1)                  # a point in time counts as one minute
    return start < win_end and end > win_start


def expand_rrule(rrule_value, dtstart, after, before):
    try:
        from dateutil.rrule import rrulestr
    except ImportError:
        sys.exit("Recurring appointments need python-dateutil:  pip install python-dateutil")
    return rrulestr(rrule_value, dtstart=dtstart).between(after, before, inc=True)


def collect_exdates(block):
    """All EXDATE values of a VEVENT as UTC datetimes."""
    result = set()
    for p in props(block, "EXDATE"):
        for value in p["value"].split(","):
            if value.strip():
                dt, all_day, _, _ = parse_dt_value(value, p["params"])
                if not all_day:
                    result.add(dt.astimezone(UTC))
    return result


def find_instances(blocks, win_start, win_end):
    """The appointments of one calendar resource that overlap [win_start, win_end).

    Returns dicts with: block (holds summary/categories/status), master, override,
    start, end, occ_start (original start of the occurrence), recurring.
    """
    masters = [b for b in blocks if prop(b, "RECURRENCE-ID") is None]
    overrides = [b for b in blocks if prop(b, "RECURRENCE-ID") is not None]
    found = []

    for master in masters:
        span = event_span(master)
        if span is None:
            continue
        start, end = span
        uid = (prop(master, "UID") or {}).get("value")
        rule = prop(master, "RRULE")

        if rule is None:
            if overlaps(start, end, win_start, win_end):
                found.append({"block": master, "master": master, "override": None,
                              "start": start, "end": end, "occ_start": start, "recurring": False})
            continue

        duration = max(end - start, timedelta(0))
        exdates = collect_exdates(master)
        mine = [o for o in overrides if (prop(o, "UID") or {}).get("value") == uid]
        replaced = set()
        for o in mine:
            rid, _, _, _ = parse_dt(prop(o, "RECURRENCE-ID"))
            replaced.add(rid.astimezone(UTC))

        # regular occurrences
        for s in expand_rrule(rule["value"], start, win_start - duration - timedelta(minutes=1), win_end):
            key = s.astimezone(UTC)
            if key in exdates or key in replaced:
                continue
            if overlaps(s, s + duration, win_start, win_end):
                found.append({"block": master, "master": master, "override": None,
                              "start": s, "end": s + duration, "occ_start": s, "recurring": True})

        # single occurrences that were changed (moved, renamed ...)
        for o in mine:
            ospan = event_span(o)
            if ospan is None:
                continue
            if overlaps(ospan[0], ospan[1], win_start, win_end):
                rid, _, _, _ = parse_dt(prop(o, "RECURRENCE-ID"))
                found.append({"block": o, "master": master, "override": o,
                              "start": ospan[0], "end": ospan[1], "occ_start": rid, "recurring": True})
    return found


def block_text(block, name, default=""):
    p = prop(block, name)
    return ical_unescape(p["value"]).strip() if p else default


def block_categories(block):
    result = []
    for p in props(block, "CATEGORIES"):
        result += [ical_unescape(c).strip() for c in p["value"].split(",") if c.strip()]
    return result


def removable(inst, own_uid):
    """Never remove: the seminar itself, other seminars, cancelled entries."""
    block = inst["block"]
    if block_text(block, "UID") == own_uid:
        return False
    if block_text(block, "STATUS").upper() == "CANCELLED":
        return False
    return PROTECTED_CATEGORY not in (c.lower() for c in block_categories(block))


def exdate_line(master, occ_start):
    """EXDATE line in the same form as the DTSTART of the series."""
    dtstart, _, tzid, is_utc = parse_dt(prop(master, "DTSTART"))
    if is_utc:
        return f"EXDATE:{occ_start.astimezone(UTC):%Y%m%dT%H%M%SZ}"
    local = occ_start.astimezone(dtstart.tzinfo)
    if tzid:
        return f"EXDATE;TZID={tzid}:{local:%Y%m%dT%H%M%S}"
    return f"EXDATE:{local:%Y%m%dT%H%M%S}"


def cancel_instances(lines, instances):
    """ICS text of the series without the given occurrences (EXDATE added, changed single
    occurrences removed). Everything else in the file stays as it is."""
    inserts, drop = {}, set()
    for inst in instances:
        master = inst["master"]
        inserts.setdefault(master["end"], []).append(exdate_line(master, inst["occ_start"]))
        if inst["override"] is not None:
            drop.update(range(inst["override"]["start"], inst["override"]["end"] + 1))
    new = []
    for i, line in enumerate(lines):
        if i in drop:
            continue
        new.extend(inserts.get(i, []))                      # before END:VEVENT of the series
        new.append(line)
    return render_lines(new)


# ---------------------------------------------------------------------------
# CalDAV (Radicale)
# ---------------------------------------------------------------------------
def dav(method, url, body=None, headers=None):
    """One HTTP request with Basic auth; returns (status, headers, body)."""
    token = base64.b64encode(f"{CALDAV_USER}:{CALDAV_PASSWORD}".encode("utf-8")).decode("ascii")
    all_headers = {"Authorization": f"Basic {token}", "User-Agent": "chaosseminar_to_caldav.py"}
    all_headers.update(headers or {})
    request = urllib.request.Request(url, data=body, method=method, headers=all_headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, response.headers, response.read()
    except urllib.error.HTTPError as err:
        return err.code, err.headers, err.read()


def event_url(uid):
    return CALDAV_URL.rstrip("/") + "/" + uid + ".ics"


def preflight():
    """Check login and calendar URL once before anything is changed."""
    body = b'<?xml version="1.0"?><propfind xmlns="DAV:"><prop><resourcetype/></prop></propfind>'
    status, _, _ = dav("PROPFIND", CALDAV_URL, body,
                       {"Depth": "0", "Content-Type": "application/xml; charset=utf-8"})
    if status in (401, 403):
        raise CalDavError(f"Error {status}: login failed, check CALDAV_USER / CALDAV_PASSWORD.")
    if status == 404:
        raise CalDavError("Error 404: calendar not found, check CALDAV_URL.")
    if status >= 400:
        raise CalDavError(f"Error {status}: the calendar server does not answer as expected.")


def report_events(win_start, win_end):
    """[(url, etag, ics text)] of the resources that have an event in the time range."""
    fmt = "%Y%m%dT%H%M%SZ"
    body = f"""<?xml version="1.0" encoding="utf-8"?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop><D:getetag/><C:calendar-data/></D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="{win_start.astimezone(UTC):{fmt}}" end="{win_end.astimezone(UTC):{fmt}}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>""".encode("utf-8")
    status, _, data = dav("REPORT", CALDAV_URL, body,
                          {"Depth": "1", "Content-Type": "application/xml; charset=utf-8"})
    if status != 207:
        raise CalDavError(f"Error {status}: could not read the appointments of the calendar.")

    ns = {"D": "DAV:", "C": "urn:ietf:params:xml:ns:caldav"}
    result = []
    for response in ET.fromstring(data).findall("D:response", ns):
        href = response.findtext("D:href", default="", namespaces=ns)
        etag = response.findtext(".//D:getetag", default="", namespaces=ns)
        ics = response.findtext(".//C:calendar-data", default="", namespaces=ns)
        if href and ics:
            result.append((urllib.parse.urljoin(CALDAV_URL, href), etag or None, ics))
    return result


# ---------------------------------------------------------------------------
# Working through the seminars
# ---------------------------------------------------------------------------
class Run:
    """Options, confirmation and statistics of one run."""

    def __init__(self, manual, keep_conflicts, update, dry_run):
        self.manual, self.keep_conflicts = manual, keep_conflicts
        self.update, self.dry_run = update, dry_run
        self.yes_to_all = False
        self.warned = set()                                 # unreadable files are reported once
        self.stats = {"created": 0, "updated": 0, "exists": 0, "removed": 0, "skipped": 0, "errors": 0}

    def confirm(self, question):
        """Always True, except in manual mode where the user decides."""
        if not self.manual or self.yes_to_all:
            return True
        while True:
            try:
                answer = input(f"{question}  [y]es / [n]o / [a]ll / [q]uit: ").strip().lower()
            except EOFError:
                raise Quit()
            if answer in ("y", "yes", "j", "ja"):
                return True
            if answer in ("n", "no", "nein", ""):
                return False
            if answer in ("a", "all", "alle"):
                self.yes_to_all = True
                return True
            if answer in ("q", "quit"):
                raise Quit()


def when(start, all_day=False):
    return f"{start:%Y-%m-%d}" if all_day else f"{start.astimezone(LOCAL_TZ):%Y-%m-%d %H:%M}"


def instance_label(inst):
    summary = block_text(inst["block"], "SUMMARY") or "(no title)"
    start, end = inst["start"].astimezone(LOCAL_TZ), inst["end"].astimezone(LOCAL_TZ)
    return f"{summary}  ({start:%Y-%m-%d %H:%M}-{end:%H:%M})"


def write_seminar(e, run):
    """Create (or with --update overwrite) the seminar event. False: do not touch conflicts."""
    label = f"{when(e['start'], e['all_day'])}  {e['summary']}"
    url = event_url(e["uid"])
    status, headers, _ = dav("GET", url)
    if status not in (200, 404):
        print(f"Error {status}: {label}", file=sys.stderr)
        run.stats["errors"] += 1
        return False
    exists = status == 200

    if exists and not run.update:
        print(f"Exists:   {label}")
        run.stats["exists"] += 1
        return True

    verb = "Update" if exists else "Create"
    if run.dry_run:
        print(f"Would {verb.lower()}: {label}")
        return True
    if not run.confirm(f"{verb} event: {label}?"):
        print(f"Skipped:  {label}")
        run.stats["skipped"] += 1
        return False

    request_headers = {"Content-Type": "text/calendar; charset=utf-8"}
    if not exists:
        request_headers["If-None-Match"] = "*"              # never overwrite by accident
    elif headers.get("ETag"):
        request_headers["If-Match"] = headers["ETag"]
    status, _, _ = dav("PUT", url, render_ics(e).encode("utf-8"), request_headers)
    if status == 201:
        print(f"Created:  {label}")
        run.stats["created"] += 1
    elif status in (200, 204):
        print(f"Updated:  {label}")
        run.stats["updated"] += 1
    elif status == 412:
        print(f"Exists:   {label}  (changed meanwhile)")
        run.stats["exists"] += 1
    else:
        print(f"Error {status}: {label}", file=sys.stderr)
        run.stats["errors"] += 1
        return False
    return True


def remove_conflicts(e, run):
    """Delete the appointments at the same time / overlapping with the seminar."""
    win_start, win_end = e["start"].astimezone(UTC), e["end"].astimezone(UTC)

    for url, etag, ics in report_events(win_start, win_end):
        lines = unfold(ics)
        try:
            instances = [i for i in find_instances(parse_vevents(lines), win_start, win_end)
                         if removable(i, e["uid"])]
        except Exception as err:
            if url not in run.warned:
                run.warned.add(url)
                print(f"  Warning: cannot read {url.rsplit('/', 1)[-1]} ({err}), left untouched", file=sys.stderr)
            continue
        if not instances:
            continue

        headers = {"If-Match": etag} if etag else {}

        if not any(i["recurring"] for i in instances):      # single appointment: delete it
            label = instance_label(instances[0])
            if run.dry_run:
                print(f"  Would delete:  {label}")
            elif run.confirm(f"  Delete overlapping appointment: {label}?"):
                status, _, _ = dav("DELETE", url, headers=headers)
                if status in (200, 204):
                    print(f"  Deleted:  {label}")
                    run.stats["removed"] += 1
                else:
                    print(f"  Error {status}: could not delete {label}", file=sys.stderr)
                    run.stats["errors"] += 1
            else:
                print(f"  Kept:     {label}")
            continue

        accepted = []                                       # series: only cancel the occurrence
        for inst in instances:
            label = instance_label(inst)
            if run.dry_run:
                print(f"  Would cancel this occurrence:  {label}")
            elif run.confirm(f"  Cancel only this occurrence of the series: {label}?"):
                accepted.append(inst)
            else:
                print(f"  Kept:     {label}")
        if accepted:
            new_ics = cancel_instances(lines, accepted)
            status, _, _ = dav("PUT", url, new_ics.encode("utf-8"),
                               dict(headers, **{"Content-Type": "text/calendar; charset=utf-8"}))
            for inst in accepted:
                label = instance_label(inst)
                if status in (200, 201, 204):
                    print(f"  Cancelled this occurrence:  {label}")
                    run.stats["removed"] += 1
                else:
                    print(f"  Error {status}: could not change the series ({label})", file=sys.stderr)
                    run.stats["errors"] += 1


def sort_key(e):
    start = e["start"]
    if e["all_day"]:
        start = datetime.combine(start, time.min, tzinfo=LOCAL_TZ)
    return (start, e["uid"])


def main():
    global CONTENT_DIR
    parser = argparse.ArgumentParser(
        description="Create CalDAV events for upcoming Chaosseminar pages and remove overlapping appointments.")
    parser.add_argument("-c", "--config", type=Path, default=CONFIG_FILE,
                        help=f"config file with all settings (default: {CONFIG_FILE})")
    parser.add_argument("-d", "--content-dir", type=Path, default=None,
                        help="folder with the pages (overrides content_dir in the config)")
    parser.add_argument("-m", "--manual", action="store_true",
                        help="ask for confirmation before every change in the calendar")
    parser.add_argument("-k", "--keep-conflicts", action="store_true",
                        help="do not remove appointments that overlap with a seminar")
    parser.add_argument("-u", "--update", action="store_true",
                        help="overwrite seminar events that already exist")
    parser.add_argument("-n", "--dry-run", action="store_true",
                        help="only show what would happen (the calendar is read, nothing is written)")
    args = parser.parse_args()

    apply_config(args.config)
    if args.content_dir:
        CONTENT_DIR = args.content_dir.resolve()
    if not CONTENT_DIR.is_dir():
        sys.exit(f"Content folder not found: {CONTENT_DIR}")

    events = load_seminar_events(CONTENT_DIR)

    if not events:
        print("No upcoming Chaosseminar found.")
        return 0

    run = Run(args.manual, args.keep_conflicts, args.update, args.dry_run)
    try:
        preflight()
        for e in sorted(events, key=sort_key):
            if write_seminar(e, run) and not run.keep_conflicts and not e["all_day"]:
                remove_conflicts(e, run)
    except Quit:
        print("Aborted.")
        return 1
    except CalDavError as err:
        print(err, file=sys.stderr)
        return 1

    s = run.stats
    print(f"Done: {s['created']} created, {s['updated']} updated, {s['exists']} existing, "
          f"{s['removed']} overlapping removed, {s['skipped']} skipped, {s['errors']} errors.")
    return 1 if s["errors"] else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except urllib.error.URLError as err:                 # no connection, DNS, TLS ...
        sys.exit(f"Cannot reach the calendar server: {err.reason}")
