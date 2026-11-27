import importlib.util
import tomllib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("author_content", Path(__file__).parents[1] / "tools/author_content.py")
author = importlib.util.module_from_spec(spec)
spec.loader.exec_module(author)
caldav_spec = importlib.util.spec_from_file_location("chaosseminar2caldav", Path(__file__).parents[1] / "chaosseminar2caldav.py")
caldav = importlib.util.module_from_spec(caldav_spec)
caldav_spec.loader.exec_module(caldav)


class AuthorContentTests(unittest.TestCase):
    def front_matter(self, path):
        return tomllib.loads(path.read_text(encoding="utf-8").split("+++", 2)[1])

    def test_creates_post_and_seminar_defaults_without_overwrite(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            title = 'Talk about "Ulm"\\café\nNext line'
            post = author.create("post", "2026-11-09", title, root)
            self.assertEqual(title, self.front_matter(post)["title"])
            self.assertTrue(self.front_matter(post)["draft"])
            seminar = author.create("seminar", "2026-12-10", title, root)
            metadata = self.front_matter(seminar)
            self.assertEqual(title, metadata["title"])
            self.assertEqual([], metadata["ChaosSeminar"]["Archiv"])
            before = seminar.read_bytes()
            with self.assertRaises(FileExistsError):
                author.create("seminar", "2026-12-10", title, root)
            self.assertEqual(before, seminar.read_bytes())

    def test_validates_date_and_title(self):
        with self.assertRaises(ValueError):
            author.create("post", "tomorrow", "A Post", Path(tempfile.mkdtemp()))
        with self.assertRaises(ValueError):
            author.create("post", "2026-02-30", "A Post", Path(tempfile.mkdtemp()))
        with self.assertRaises(ValueError):
            author.create("post", "2026-11-09", "!!!", Path(tempfile.mkdtemp()))

    def test_translation_coverage_pairs_markdown(self):
        with tempfile.TemporaryDirectory() as tmp:
            content = Path(tmp) / "content"
            content.mkdir()
            german = content / "news.md"
            german.write_text("", encoding="utf-8")
            (content / "news.en.md").write_text("", encoding="utf-8")
            (content / "page.md").write_text("", encoding="utf-8")
            self.assertEqual([content / "page.md"], author.missing_translations(Path(tmp)))

    def test_calendar_event_loader_ignores_translations_and_sections(self):
        with tempfile.TemporaryDirectory() as tmp:
            content = Path(tmp)
            german = content / "talk.md"
            german.write_text('+++\ntitle = "Talk"\n+++\n', encoding="utf-8")
            (content / "talk.en.md").write_text('+++\ntitle = "Talk"\n+++\n', encoding="utf-8")
            (content / "_index.md").write_text('+++\ntitle = "Section"\n+++\n', encoding="utf-8")
            with patch.object(caldav, "build_event", side_effect=lambda path, _: str(path)) as build:
                self.assertEqual([str(german)], caldav.load_seminar_events(content))
            build.assert_called_once()


if __name__ == "__main__":
    unittest.main()
