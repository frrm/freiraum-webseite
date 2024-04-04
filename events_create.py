#!/usr/bin/env python3
"""
Create event-yaml-files for Hugo for 1 year.

Creates:
    - YYYY_kwWEEK_ccc.yaml
    - YYYY_kwWEEK_frrm.yaml
    in the current directory.

Please check the resulting files and modify/delete them as necessary.

:Author:  Roland Freikamp
:Version: 2024-04-04
"""

from datetime import datetime
import sys

TEMPLATE_CCC = """\
name          : CCC Ulm
startDatetime : {date}T20:00:00
endDatetime   : {date}T23:00:00
location      : Freiraum
description   : CCC Montagstreffen
"""
TEMPLATE_FRRM = """\
name          : Offenes Treffen
startDatetime : {date}T20:00:00
endDatetime   : {date}T23:00:00
location      : Freiraum
description   : /dev/urandom (Fragt am besten vorher im Matrix-Channel nach, ob jemand da sein wird.)
"""

#----------------------
def events_create(year):
    """Create event-yaml-files for each week of the year.

    - YYYY_kwWEEK_ccc.yaml
    - YYYY_kwWEEK_frrm.yaml
    """
    for week in range(1,54):
        print(f"{year}-{week:02}")

        try:
            # ccc
            date = datetime.fromisocalendar(year, week, 1).strftime("%Y-%m-%d")
            with open(f"{year}_kw{week:02}_ccc.yaml", 'a', encoding="utf-8") as f:
                f.write(TEMPLATE_CCC.format(date=date))
            # frrm
            date = datetime.fromisocalendar(year, week, 4).strftime("%Y-%m-%d")
            with open(f"{year}_kw{week:02}_frrm.yaml", 'a', encoding="utf-8") as f:
                f.write(TEMPLATE_FRRM.format(date=date))
        # ignore "Invalid week" (for only-sometimes-existing-week 53)
        except ValueError as err:
            print("Ignored: ", str(err))

#----------------------

if __name__ == '__main__':
    print("Create event-yaml-files for Hugo for 1 year.\nSee source for details.")
    if len(sys.argv) != 2:
        print("USAGE: events_create.py YEAR")
        sys.exit(1)

    year = int(sys.argv[1])
    events_create(year)

#=========================================
