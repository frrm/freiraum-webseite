import json
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest.mock import patch

import icalendar
import events_create


class CalendarSnapshotTest(unittest.TestCase):
    def test_occurrences_and_atomic_failure(self):
        source = Path(__file__).parent / 'fixtures/calendar.ics'
        with tempfile.TemporaryDirectory() as temp:
            events_create.create_snapshot(str(source), temp, date(2026, 10, 1))
            output = Path(temp)
            data = (output / 'snapshot.json').read_bytes()
            snapshot = json.loads(data)
            self.assertTrue(snapshot['fetchedAt'])
            events = snapshot['events']
            self.assertEqual([e['name'] for e in events], ['Ongoing', 'Weekly', 'Cross month', 'Overnight', 'Moved', 'All day', 'Weekly'])
            self.assertEqual(events[4]['start'], '2026-11-02T19:00:00')
            self.assertTrue(events[5]['allDay'])
            import base64
            single = icalendar.Calendar.from_ical(base64.b64decode(events[4]['ics']))
            event = single.walk('VEVENT')[0]
            self.assertNotIn('RRULE', event)
            self.assertEqual(event.decoded('DTSTART').hour, 18)
            first = icalendar.Calendar.from_ical(base64.b64decode(events[1]['ics'])).walk('VEVENT')[0]
            last = icalendar.Calendar.from_ical(base64.b64decode(events[6]['ics'])).walk('VEVENT')[0]
            self.assertNotEqual(str(first['UID']), str(last['UID']))
            source_bad = output / 'bad.ics'
            source_bad.write_text('broken')
            with self.assertRaises(ValueError):
                events_create.create_snapshot(str(source_bad), temp)
            self.assertEqual((output / 'snapshot.json').read_bytes(), data)
            with patch('events_create.load_ics', side_effect=OSError('network error')):
                with self.assertRaises(OSError):
                    events_create.create_snapshot(str(source), temp)
            self.assertEqual((output / 'snapshot.json').read_bytes(), data)
            with patch('events_create.os.replace', side_effect=OSError('disk error')):
                with self.assertRaises(OSError):
                    events_create.create_snapshot(str(source), temp, date(2026, 10, 1))
            self.assertEqual((output / 'snapshot.json').read_bytes(), data)
            events_create.create_snapshot(str(source), temp, date(2026, 10, 1), dry_run=True)
            self.assertEqual((output / 'snapshot.json').read_bytes(), data)

    def test_empty_calendar_is_valid(self):
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / 'empty.ics'
            source.write_text('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n')
            events_create.create_snapshot(str(source), temp)
            self.assertEqual(json.loads((Path(temp) / 'snapshot.json').read_text())['events'], [])


if __name__ == '__main__':
    unittest.main()
