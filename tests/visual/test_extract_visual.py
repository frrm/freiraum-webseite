import importlib.util
import stat
import tempfile
import unittest
import zipfile
from pathlib import Path

spec = importlib.util.spec_from_file_location('extract_visual', Path(__file__).parents[2] / '.github/scripts/extract-visual.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class TestExtract(unittest.TestCase):
    def test_flat_valid_report(self):
        with tempfile.TemporaryDirectory() as root:
            archive, dest = Path(root) / 'report.zip', Path(root) / 'out'
            with zipfile.ZipFile(archive, 'w') as data:
                data.writestr('index.html', 'report')
                data.writestr('home-desktop-light-after.png', b'png')
            mod.extract(archive, dest)
            self.assertEqual((dest / 'index.html').read_text(), 'report')

    def test_rejects_traversal_and_symlink(self):
        for name, mode in [('../escape.png', stat.S_IFREG | 0o644), ('link.png', stat.S_IFLNK | 0o777)]:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as root:
                archive = Path(root) / 'bad.zip'
                with zipfile.ZipFile(archive, 'w') as data:
                    item = zipfile.ZipInfo(name)
                    item.create_system = 3
                    item.external_attr = mode << 16
                    data.writestr(item, '../../outside')
                with self.assertRaises(ValueError):
                    mod.extract(archive, Path(root) / 'out')
                self.assertFalse((Path(root) / 'out').exists())

    def test_rejects_expanded_file_limit_before_extraction(self):
        with tempfile.TemporaryDirectory() as root:
            archive = Path(root) / 'big.zip'
            with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as data:
                data.writestr('big.png', b'0' * (mod.MAX_FILE + 1))
            with self.assertRaises(ValueError):
                mod.extract(archive, Path(root) / 'out')
            self.assertFalse((Path(root) / 'out').exists())


if __name__ == '__main__':
    unittest.main()
