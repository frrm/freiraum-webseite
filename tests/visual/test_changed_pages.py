import csv
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).with_name('changed-pages.py')


class ChangedPagesTest(unittest.TestCase):
    def test_paths_from_hugo_csv_when_run_in_visual_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            def git(*args):
                return subprocess.check_output(['git', *args], cwd=root, text=True).strip()
            git('init', '-q')
            git('config', 'user.name', 'Visual Test')
            git('config', 'user.email', 'visual@example.invalid')
            content = root / 'content/post/post_2011-06-20'
            content.mkdir(parents=True)
            (content / 'index.md').write_text('German')
            git('add', '.')
            git('commit', '-qm', 'base')
            base = git('rev-parse', 'HEAD')
            (content / 'index.en.md').write_text('English')
            git('add', '.')
            git('commit', '-qm', 'translation')
            head = git('rev-parse', 'HEAD')
            csv_path = root / 'head.csv'
            with csv_path.open('w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['path', 'slug', 'title', 'date', 'expiryDate', 'publishDate', 'draft', 'permalink', 'kind', 'section'])
                writer.writerow(['content/post/post_2011-06-20/index.en.md', '', 'Picking locks without a key – Puzzles for hackers', '2011-06-20T00:00:00Z', '0001-01-01T00:00:00Z', '2011-06-20T00:00:00Z', 'false', 'https://example.org/en/post/post_2011-06-20/', 'page', 'post'])
            visual = root / 'tests/visual'
            visual.mkdir(parents=True)
            result = subprocess.check_output(
                [sys.executable, str(SCRIPT), str(csv_path)], cwd=visual,
                env={**os.environ, 'VISUAL_BASE': base, 'VISUAL_HEAD': head}, text=True,
            )
            self.assertEqual(json.loads(result), [
                '/en/post/post_2011-06-20/', '/post/post_2011-06-20/',
            ])


if __name__ == '__main__':
    unittest.main()
