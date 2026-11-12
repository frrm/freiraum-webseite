import csv
import json
import os
import subprocess
import sys
from urllib.parse import urlsplit

changed = set(subprocess.check_output([
    'git', 'diff', '--name-only', '-z', os.environ['VISUAL_BASE'], os.environ['VISUAL_HEAD'], '--', ':(top)content'
]).decode().split('\0'))
paths = set()
for filename in sys.argv[1:]:
    with open(filename, newline='') as source:
        for row in csv.DictReader(source):
            if row['path'] in changed:
                path = urlsplit(row['permalink']).path
                paths.add(path)
                if path.startswith('/en/'):
                    paths.add(path[3:])
print(json.dumps(sorted(paths)))
