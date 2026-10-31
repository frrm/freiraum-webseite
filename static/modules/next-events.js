import ICAL from '/modules/ical-2.2.1.min.js';

const DEFAULT_URL = '/kalender.ics';
const DEFAULT_COUNT = 10;

const COLORS = { blue: '#007bff', green: '#28a745', red: '#dc3545', orange: '#fd7e14' };

// CATEGORIES value (lower-case) -> color. Anything else is orange.
const CATEGORY_COLORS = {
  '/dev/urandom': 'green',
  'chaosseminar': 'red',
  'montagstreff': 'blue'
};

const esc = s => String(s).replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const pad = n => String(n).padStart(2, '0');

const getCategories = ev => ev.component.getAllProperties('categories')
  .flatMap(prop => prop.getValues())
  .map(v => String(v).trim());

const getColor = categories => {
  for (const cat of categories) {
    const color = CATEGORY_COLORS[cat.toLowerCase()];
    if (color) return COLORS[color];
  }
  return COLORS.orange;
};

const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** "2026-11-02 20:00" (date only for all-day events), like dateFormat "2006-01-02 15:04" */
const formatWhen = (d, allDay) => allDay ? ymd(d) : `${ymd(d)} ${hm(d)}`;

/** "2026-11-02T20:00:00", like dateFormat "2006-01-02T15:04:05" */
const isoLocal = (d, allDay) => allDay ? ymd(d) : `${ymd(d)}T${hm(d)}:${pad(d.getSeconds())}`;

/** Parses the ICS text and returns the next `count` occurrences (recurring events expanded). */
function getUpcoming(icsText, count) {
  const comp = new ICAL.Component(ICAL.parse(icsText));

  comp.getAllSubcomponents('vtimezone').forEach(tz => {
    try { ICAL.TimezoneService.register(tz); } catch (e) { /* ignore */ }
  });

  const all = comp.getAllSubcomponents('vevent')
    .map(c => new ICAL.Event(c))
    .filter(ev => ev.startDate);

  const masters = all.filter(ev => !ev.isRecurrenceException());
  all.filter(ev => ev.isRecurrenceException()).forEach(ex => {
    const master = masters.find(m => m.uid === ex.uid);
    if (master) master.relateException(ex);
  });

  // Same rule as the Hugo version: everything from the start of today onwards
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isUpcoming = occ => occ.start >= todayStart || occ.end > todayStart;

  const toOccurrence = (item, startTime, endTime) => ({
    name: item.summary || 'Ohne Titel',
    description: item.description || '',
    location: item.location || '',
    categories: getCategories(item),
    start: startTime.toJSDate(),
    end: endTime.toJSDate(),
    allDay: startTime.isDate
  });

  const result = [];

  masters.forEach(ev => {
    if (!ev.isRecurring()) {
      const occ = toOccurrence(ev, ev.startDate, ev.endDate);
      if (isUpcoming(occ)) result.push(occ);
      return;
    }

    const it = ev.iterator();
    let next, guard = 0, found = 0;
    while ((next = it.next()) && guard++ < 5000 && found < count) {
      const d = ev.getOccurrenceDetails(next);
      const occ = toOccurrence(d.item || ev, d.startDate, d.endDate);
      if (!isUpcoming(occ)) continue;
      result.push(occ);
      found++;
    }
  });

  return result.sort((a, b) => a.start - b.start).slice(0, count);
}

/** Same markup as the former Hugo template, plus a color indicator in front of the name.
 *  The description is folded by default (<details> with the summary "Beschreibung:"). */
function renderItem(e) {
  const iso = isoLocal(e.start, e.allDay);
  const color = getColor(e.categories);
  const categoryNames = e.categories.join(', ');
  const description = e.description.trim().replace(/\n{3,}/g, '\n\n');

  return `
    <li itemscope itemtype="http://schema.org/Event">
      <span class="color-indicator" style="display:inline-block;width:.75em;height:.75em;border-radius:50%;margin-right:.4em;background-color:${color};"${categoryNames ? ` title="${esc(categoryNames)}"` : ''}></span><b itemprop="name">${esc(e.name)}</b><br>
      <span style="white-space: nowrap">
        <img class="date-marker" alt="Zeit:" src="/images/marker-time.svg">
        <time datetime="${iso}" content="${iso}" itemprop="startDate">${esc(formatWhen(e.start, e.allDay))}</time>
      </span>&nbsp;
      ${e.location ? `<span style="white-space: nowrap">
        <img class="location-marker" alt="Ort:" src="/images/marker-location.svg">
        <span class="event-location" itemprop="location">${esc(e.location)}</span>
      </span>` : ''}
      ${description ? `<details class="event-description">
        <summary style="cursor:pointer">Beschreibung:</summary>
        <span itemprop="about" style="white-space: pre-line">${esc(description)}</span>
      </details>` : ''}
    </li>`;
}

async function renderNextEvents(container) {
  const url = container.dataset.icsUrl || DEFAULT_URL;
  const count = Number(container.dataset.count) || DEFAULT_COUNT;

  try {
    const response = await fetch(url, { method: 'GET', mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const upcoming = getUpcoming(await response.text(), count);
    container.innerHTML = upcoming.length
      ? upcoming.map(renderItem).join('')
      : '<li>Keine anstehenden Termine.</li>';
  } catch (error) {
    console.error('Next events load error:', error);
    container.innerHTML = '<li>Termine konnten nicht geladen werden.</li>';
  }
}

function init() {
  document.querySelectorAll('ul[data-ics-url]').forEach(renderNextEvents);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
