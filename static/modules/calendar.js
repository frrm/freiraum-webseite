


  const app = document.getElementById('cal-app');
  const en = app.lang === 'en';
  const locale = en ? 'en-GB' : 'de-DE';
  const text = en ? {
    fallback: 'The calendar could not be loaded. Showing the saved events.',
    select: 'Select an event to see its details.', noDescription: 'No description.',
    download: 'Download event', noCategory: 'Uncategorised', all: 'All',
    noEvents: 'There are no events planned in the next 3 months.', noSelection: 'No events in this selection.',
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], time: 'Time:', place: 'Place:'
  } : {
    fallback: 'Der Kalender konnte nicht geladen werden. Angezeigt werden die gespeicherten Termine.',
    select: 'Termin anklicken, um Details anzuzeigen.', noDescription: 'Keine Beschreibung.',
    download: 'Termin herunterladen', noCategory: 'Ohne Kategorie', all: 'Alle',
    noEvents: 'In den nächsten 3 Monaten sind keine Termine geplant.', noSelection: 'Keine Termine in dieser Auswahl.',
    weekdays: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], time: 'Zeit:', place: 'Ort:'
  };
  const berlinToday = () => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const part = type => Number(parts.find(p => p.type === type).value);
    return new Date(Date.UTC(part('year'), part('month') - 1, part('day')));
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const COLORS = { blue: '#007bff', green: '#28a745', red: '#dc3545', orange: '#fd7e14' };

  // CATEGORIES value (lower-case) -> color. Anything else is orange.
  const CATEGORY_COLORS = {
    '/dev/urandom': 'green',
    'chaosseminar': 'red',
    'montagstreff': 'blue'
  };

  // Events in this category link to the Chaosseminar overview
  const CHAOSSEMINAR_URL = '/ccc/chaosseminar/';
  const isChaosseminar = categories => categories.some(c => c.toLowerCase() === 'chaosseminar');

  class CalendarManager {
    constructor() {
      this.masters = [];
      this.upcoming = [];                // occurrences of the next 3 months (list tab)
      this.selectedCategories = new Set(); // active category filter (empty = all)
      this.monthEvents = [];             // occurrences of the visible month (index used by click handler)
      this.currentMonth = berlinToday();
      this.currentMonth.setUTCDate(1);
    }

    async init() {
      await new Promise(resolve => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', resolve);
        } else {
          resolve();
        }
      });

      const ui = document.getElementById('cal-interactive');
      const fallback = document.getElementById('events-fallback');   // server-rendered list (events_by_month)


      if (!(await this.loadCalendar())) {
        this.showFallback(ui, fallback);
        return;
      }

      try {
        this.setupTabEvents();
        this.setupMonthNavigation();
        this.setupEventClicks();
        this.setupCategoryFilter();
        this.renderCalendar();
        this.renderList();
        if (ui) ui.hidden = false;
        if (fallback) fallback.hidden = true;
      } catch (error) {
        console.error('Calendar render error:', error);
        this.showFallback(ui, fallback);
      }
    }

    /** Live calendar not available: show the server-rendered list instead. */
    showFallback(ui, fallback) {
      if (fallback) {
        if (ui) ui.hidden = true;
        fallback.hidden = false;
        if (!fallback.querySelector('.events-fallback-note')) {
          fallback.insertAdjacentHTML('afterbegin',
            `<p class="events-fallback-note"><em>${text.fallback}</em></p>`);
        }
      } else if (ui) {
        ui.hidden = false;   // no static list on this page: show the error message
      }
    }

    async loadCalendar() {
      try {
        const response = await fetch(app.dataset.calendarUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.masters = (await response.json()).events.map(e => ({
          title: e.name, categories: e.category ? e.category.split(', ') : [],
          start: new Date(Date.UTC(...e.start.slice(0, 19).split(/[-T:]/).map((n, i) => Number(n) - (i === 1 ? 1 : 0)))),
          end: new Date(Date.UTC(...e.end.slice(0, 19).split(/[-T:]/).map((n, i) => Number(n) - (i === 1 ? 1 : 0)))),
          dateString: e.start, allDay: e.allDay, description: e.description,
          location: e.location, ics: e.ics
        }));
        return true;
      } catch (error) {
        console.error('Calendar load error:', error);
        return false;
      }
    }

    getOccurrences(from, to) {
      return this.masters.filter(e => e.end >= from && e.start <= to);
    }

    formatWhen(e) {
      const date = e.start.toLocaleDateString(locale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
      });
      if (e.allDay) return date;
      const time = e.start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
      return `${date}, ${time}${en ? '' : ' Uhr'}`;
    }

    /** .date-marker symbol (img) followed by a semantic <time> element. */
    whenHtml(e) {
      const iso = e.allDay
        ? `${e.start.getUTCFullYear()}-${String(e.start.getUTCMonth() + 1).padStart(2, '0')}-${String(e.start.getUTCDate()).padStart(2, '0')}`
        : e.dateString;
      return `<img class="date-marker" alt="${text.time}" src="/images/marker-time.svg"><time datetime="${iso}">${esc(this.formatWhen(e))}</time>`;
    }

    /** .location-marker symbol (img) followed by the location in .event-location. */
    locationHtml(e) {
      return `<img class="location-marker" alt="${text.place}" src="/images/marker-location.svg"><span class="event-location">${esc(e.location)}</span>`;
    }

    setupTabEvents() {
      const tabCal = document.getElementById('tab-calendar');
      const tabList = document.getElementById('tab-list');
      const viewCal = document.getElementById('calendar-view');
      const viewList = document.getElementById('list-view');

      if (!tabCal || !tabList || !viewCal || !viewList) {
        console.error('Tab elements not found in DOM');
        return;
      }

      const show = (activeTab, activeView) => {
        [tabCal, tabList].forEach(t => t.classList.toggle('active', t === activeTab));
        [viewCal, viewList].forEach(v => v.classList.toggle('active', v === activeView));
      };

      tabCal.addEventListener('click', () => show(tabCal, viewCal));
      tabList.addEventListener('click', () => show(tabList, viewList));
    }

    setupMonthNavigation() {
      const prevBtn = document.getElementById('prev-month');
      const nextBtn = document.getElementById('next-month');
      if (!prevBtn || !nextBtn) {
        console.error('Navigation buttons not found');
        return;
      }

      const change = delta => {
        this.currentMonth.setUTCMonth(this.currentMonth.getUTCMonth() + delta);
        this.renderCalendar();
        this.updateMonthYear();
      };

      prevBtn.addEventListener('click', () => change(-1));
      nextBtn.addEventListener('click', () => change(1));
      this.updateMonthYear();
    }

    updateMonthYear() {
      const el = document.getElementById('month-year');
      if (el) {
        el.textContent = this.currentMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
      }
    }

    /** One delegated listener handles clicks on any event tag in the calendar. */
    setupEventClicks() {
      const calendarEl = document.getElementById('calendar');
      if (!calendarEl) return;

      const select = tag => {
        const idx = Number(tag.dataset.idx);
        calendarEl.querySelectorAll('.event-tag.selected').forEach(t => t.classList.remove('selected'));
        tag.classList.add('selected');
        this.showDetails(this.monthEvents[idx]);
      };

      calendarEl.addEventListener('click', e => {
        const tag = e.target.closest('.event-tag');
        if (tag) select(tag);
      });
      calendarEl.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const tag = e.target.closest('.event-tag');
        if (tag) { e.preventDefault(); select(tag); }
      });
    }

    showDetails(event) {
      const el = document.getElementById('event-details');
      if (!el) return;

      if (!event) {
        el.innerHTML = `<span class="placeholder">${text.select}</span>`;
        return;
      }

      const colorClass = this.getEventColor(event).replace('event-', '');
      el.style.borderLeftColor = COLORS[colorClass];
      el.innerHTML = `
        <div class="event-title">${this.titleHtml(event)}</div>
        <ul class="events-side">
          <li>${this.whenHtml(event)}</li>
          ${event.location ? `<li>${this.locationHtml(event)}</li>` : ''}
        </ul>
        <a href="data:text/calendar;base64,${event.ics}" download="event.ics">${text.download}</a>
        ${event.description
          ? `<div class="detail-description">${this.linkify(event.description)}</div>`
          : `<div class="detail-description placeholder">${text.noDescription}</div>`}
      `;
    }

    /** Escaped text in which http(s) URLs are clickable links. */
    linkify(text) {
      const pattern = /https?:\/\/[^\s<>"']+/g;
      let out = '', last = 0, m;
      while ((m = pattern.exec(text)) !== null) {
        let url = m[0];
        const trailing = url.match(/[.,;:!?)]+$/);           // punctuation after the URL is not part of it
        if (trailing) url = url.slice(0, -trailing[0].length);
        out += esc(text.slice(last, m.index));
        out += `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>`;
        last = m.index + url.length;
        pattern.lastIndex = last;
      }
      return out + esc(text.slice(last));
    }

    /** Link to a single seminar page (/ccc/chaosseminar/<name>/) found in the description, if any. */
    seminarPageUrl(description) {
      const match = String(description || '').match(/https?:\/\/[^\s<>"']*\/ccc\/chaosseminar\/[^\s<>"'\/]+\/?/);
      return match ? match[0].replace(/[.,;:!?)]+$/, '') : null;
    }

    /** Event title; Chaosseminar events link to their seminar page, or to /ccc/chaosseminar/. */
    titleHtml(event) {
      const title = esc(event.title);
      if (!isChaosseminar(event.categories)) return title;
      const href = this.seminarPageUrl(event.description) || CHAOSSEMINAR_URL;
      return `<a href="${esc(href)}">${title}</a>`;
    }

    /** Color class by CATEGORIES; the first known category wins, everything else is orange. */
    getEventColor(event) {
      for (const cat of event.categories) {
        const color = CATEGORY_COLORS[cat.toLowerCase()];
        if (color) return `event-${color}`;
      }
      return 'event-orange';
    }

    renderCalendar() {
      const year = this.currentMonth.getUTCFullYear();
      const month = this.currentMonth.getUTCMonth();

      const firstDay = new Date(Date.UTC(year, month, 1));
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

      let firstDayOfWeek = firstDay.getUTCDay() - 1;
      if (firstDayOfWeek < 0) firstDayOfWeek = 6;

      this.monthEvents = this.getOccurrences(firstDay, new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)));

      let html = '<table>';
      html += `<tr>${text.weekdays.map(day => `<th>${day}</th>`).join('')}</tr><tr>`;

      for (let i = 0; i < firstDayOfWeek; i++) html += '<td class="other-month"></td>';

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(Date.UTC(year, month, day));
        const cellClass = this.isToday(currentDate) ? 'today-cell' : '';
        html += `<td class="${cellClass}"><span class="day-number">${day}</span>`;

        this.monthEvents.forEach((e, idx) => {
          const nextDate = new Date(Date.UTC(year, month, day + 1));
          if (e.start >= nextDate || (e.end <= currentDate && e.start < currentDate)) return;
          html += `<span class="event-tag ${this.getEventColor(e)}" data-idx="${idx}"
                         tabindex="0" role="button" title="${esc(e.title)}">${esc(e.title)}</span>`;
        });

        html += '</td>';
        if ((firstDayOfWeek + day) % 7 === 0 && day < daysInMonth) html += '</tr><tr>';
      }

      const remaining = 7 - ((firstDayOfWeek + daysInMonth) % 7);
      if (remaining < 7) {
        for (let i = 0; i < remaining; i++) html += '<td class="other-month"></td>';
      }
      html += '</tr></table>';

      const calendarEl = document.getElementById('calendar');
      if (calendarEl) calendarEl.innerHTML = html;

      this.showDetails(null);   // reset the details panel when the month changes
    }

    renderList() {
      const from = berlinToday();
      from.setUTCHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setUTCMonth(to.getUTCMonth() + 3);

      this.upcoming = this.getOccurrences(from, to);
      this.selectedCategories.clear();
      this.renderCategoryFilter();
      this.renderListItems();
    }

    /** Lower-case category keys of an occurrence; events without category use '__none'. */
    categoryKeys(event) {
      const keys = event.categories.map(c => c.toLowerCase());
      return keys.length ? [...new Set(keys)] : ['__none'];
    }

    categoryColor(key) {
      return COLORS[CATEGORY_COLORS[key]] || COLORS.orange;
    }

    /** Builds the filter chips from the categories that actually occur in the list. */
    renderCategoryFilter() {
      const el = document.getElementById('category-filter');
      if (!el) return;

      const cats = new Map();   // key -> { label, count }
      this.upcoming.forEach(ev => {
        this.categoryKeys(ev).forEach(key => {
          const label = key === '__none'
            ? text.noCategory
            : ev.categories.find(c => c.toLowerCase() === key);
          const entry = cats.get(key) || { label, count: 0 };
          entry.count++;
          cats.set(key, entry);
        });
      });

      if (cats.size < 2) {      // nothing to filter
        el.innerHTML = '';
        return;
      }

      const sorted = [...cats.entries()].sort(([ka, a], [kb, b]) =>
        (ka === '__none') - (kb === '__none') || a.label.localeCompare(b.label, locale));

      el.innerHTML =
        `<button type="button" class="filter-chip" data-key="" aria-pressed="true">${text.all} <span class="count">(${this.upcoming.length})</span></button>` +
        sorted.map(([key, { label, count }]) => `
          <button type="button" class="filter-chip" data-key="${esc(key)}" aria-pressed="false">
            <span class="color-indicator" style="background-color:${this.categoryColor(key)};"></span>${esc(label)}
            <span class="count">(${count})</span>
          </button>`).join('');
    }

    setupCategoryFilter() {
      const el = document.getElementById('category-filter');
      if (!el) return;

      el.addEventListener('click', e => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;

        const key = chip.dataset.key;
        if (key === '') this.selectedCategories.clear();                       // "Alle"
        else if (this.selectedCategories.has(key)) this.selectedCategories.delete(key);
        else this.selectedCategories.add(key);

        el.querySelectorAll('.filter-chip').forEach(c => {
          const k = c.dataset.key;
          const pressed = k === '' ? this.selectedCategories.size === 0 : this.selectedCategories.has(k);
          c.setAttribute('aria-pressed', String(pressed));
        });
        this.renderListItems();
      });
    }

    renderListItems() {
      const sel = this.selectedCategories;
      const items = sel.size
        ? this.upcoming.filter(ev => this.categoryKeys(ev).some(k => sel.has(k)))
        : this.upcoming;

      let html;
      if (this.upcoming.length === 0) {
        html = `<p>${text.noEvents}</p>`;
      } else if (items.length === 0) {
        html = `<p>${text.noSelection}</p>`;
      } else {
        html = `<ul class="events-by-month">${items.map(event => {
          const color = COLORS[this.getEventColor(event).replace('event-', '')];
          return `
            <li class="event-item">
              <div class="event-title">
                <span class="color-indicator" style="background-color:${color};"></span>
                ${this.titleHtml(event)}
              </div>
              <div class="event-date">${this.whenHtml(event)}</div>
              ${event.location ? `<div class="event-description">${this.locationHtml(event)}</div>` : ''}
              ${event.description ? `<div class="event-description">${esc(event.description)}</div>` : ''}
              <a href="data:text/calendar;base64,${event.ics}" download="event.ics">${text.download}</a>
            </li>`;
        }).join('')}</ul>`;
      }

      const listEl = document.getElementById('events-list');
      if (listEl) listEl.innerHTML = html;
    }

    isToday(date) {
      return date.toUTCString() === berlinToday().toUTCString();
    }
  }

  const manager = new CalendarManager();
  manager.init().catch(err => console.error('Failed to initialize calendar:', err));
