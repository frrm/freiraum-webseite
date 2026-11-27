#!/usr/bin/env python3
"""Extract a flat visual report only after validating archive boundaries."""
import re
import shutil
import stat
import sys
import zipfile
from pathlib import Path

MAX_ARCHIVE = 256 * 1024 * 1024
MAX_FILE = 10 * 1024 * 1024
MAX_ENTRIES = 6000


def extract(archive, destination):
    archive, destination = Path(archive), Path(destination)
    if archive.stat().st_size > MAX_ARCHIVE:
        raise ValueError('Visual archive exceeds the compressed size limit')
    with zipfile.ZipFile(archive) as data:
        entries = data.infolist()
        if len(entries) > MAX_ENTRIES or sum(item.file_size for item in entries) > MAX_ARCHIVE:
            raise ValueError('Visual archive exceeds extraction limits')
        names = set()
        for item in entries:
            mode = (item.external_attr >> 16) & 0xffff
            if (not re.fullmatch(r'(?:index\.html|[a-z0-9-]+\.png)', item.filename)
                    or item.filename in names or item.is_dir()
                    or stat.S_IFMT(mode) not in (0, stat.S_IFREG)
                    or item.file_size > MAX_FILE or item.flag_bits & 1):
                raise ValueError('Invalid visual archive entry')
            names.add(item.filename)
        destination.mkdir(parents=True, exist_ok=True)
        for item in entries:
            with data.open(item) as source, (destination / item.filename).open('xb') as target:
                shutil.copyfileobj(source, target, length=1024 * 1024)


if __name__ == '__main__':
    try:
        extract(sys.argv[1], sys.argv[2])
    except (OSError, ValueError, zipfile.BadZipFile) as error:
        sys.exit(str(error))
