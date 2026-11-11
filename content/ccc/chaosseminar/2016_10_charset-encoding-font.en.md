+++
date = "2016-10-10"
title = "Charsets, encodings, and fonts"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = "2016-10-10 20:15"
Ort = "Uni Ulm, Hörsaal H22"
Vortragende = "meillo"
Archiv = [
    ["", "https://archiv.ulm.ccc.de/chaosseminar/201610-encoding/cs-201610-encoding_audio.mp3",  "83045400"],
    ["", "https://archiv.ulm.ccc.de/chaosseminar/201610-encoding/cs-201610-encoding_audio.ogg",  "34502650"],
    ["", "https://archiv.ulm.ccc.de/chaosseminar/201610-encoding/cs-201610-encoding_audio.opus", "68612874"],
    ["", "https://archiv.ulm.ccc.de/chaosseminar/201610-encoding/cs-201610-encoding_video.mp4",  "137619180"],
    ["", "https://archiv.ulm.ccc.de/chaosseminar/201610-encoding/cs-201610-encoding_video.ogv",  "618118723"],
    ["", "https://archiv.ulm.ccc.de/chaosseminar/201610-encoding/cs-201610-encoding_video.m4v",  "94700080"],
    ["", "https://archiv.ulm.ccc.de/chaosseminar/201610-encoding/cs-201610-encoding_video_high.mp4", "505050604"],
    ]
+++

{{< chaosseminar >}}

This talk sheds light on the confusion and gaps in understanding around character sets (charsets), character encodings, and fonts.

### Links

Fonts:

- https://en.wikipedia.org/wiki/Computer_font
- http://www.linuxlibertine.org/
- http://www.linuxlibertine.org/uploads/pics/HT-Word2003-454x66px.png (hinting)
- http://heirloom.sourceforge.net/doctools/otfdump.1.html

Character sets:

- https://de.wikipedia.org/wiki/Zeichensatz
- https://en.wikipedia.org/wiki/Code_point
- https://de.wikipedia.org/wiki/ASCII
- https://tools.ietf.org/html/rfc20
- http://man7.org/linux/man-pages/man7/ascii.7.html
- http://worldpowersystems.com/archives/codes/X3.4-1963/index.html
- https://en.wikipedia.org/wiki/EBCDIC
- https://en.wikipedia.org/wiki/File:Blue-punch-card-front-horiz_top-char-contrast-stretched.png (makes the EBCDIC layout easier to understand)
- https://en.wikipedia.org/wiki/Unicode
- ISO 10646 defines both a charset and several encodings
- http://man7.org/linux/man-pages/man7/unicode.7.html
- https://en.wikipedia.org/wiki/Plane_(Unicode)#Basic_Multilingual_Plane
- https://de.wikipedia.org/w/index.php?title=Datei:Roadmap_to_Unicode_BMP_multilingual.svg&lang=de

Encodings:

- https://en.wikipedia.org/wiki/Character_encoding
- https://en.wikipedia.org/wiki/UTF-8
- https://tools.ietf.org/html/rfc3629
- http://man7.org/linux/man-pages/man7/utf-8.7.html
- http://doc.cat-v.org/bell_labs/utf-8_history
- https://en.wikipedia.org/wiki/UTF-16 (available in LE and BE)
- https://tools.ietf.org/html/rfc2781
- https://en.wikipedia.org/wiki/UTF-32
- https://en.wikipedia.org/wiki/UTF-7
- https://tools.ietf.org/html/rfc2152
- https://en.wikipedia.org/wiki/UTF-9
- https://tools.ietf.org/html/rfc4042 (from April 1, 2005)

Things that should be eradicated:

- https://en.wikipedia.org/wiki/Byte_order_mark

Unicode characters and their representation in different encodings:

- http://www.fileformat.info/
- http://www.fileformat.info/info/unicode/char/0041/index.htm
- http://www.fileformat.info/info/unicode/char/1f582/index.htm

How to do it right:

- http://doc.cat-v.org/plan_9/4th_edition/papers/utf

A good overview article. Its main focus is Windows (because that is where the need is greatest), but it conveys a lot of general knowledge:

- http://utf8everywhere.org/

A classic blog post, even if it is not necessarily the most technically precise:

- http://www.joelonsoftware.com/articles/Unicode.html

An explanation of the situation with writing systems in East Asia (the title does not quite match the content):

- http://www.hastingsresearch.com/net/04-unicode-limitations.shtml

Google also conflates charsets and encodings:

- https://googleblog.blogspot.de/2010/01/unicode-nearing-50-of-web.html

As a result, this derived graphic was found on Wikipedia for years — labelled Unicode but actually showing UTF-8:

- https://commons.wikimedia.org/wiki/File:UnicodeGrow2b.png

In PHP, the charset method requires an encoding. It simply inherited MySQL's mistake of lumping charsets and encodings together:

- http://php.net/manual/en/mysqli.set-charset.php
- http://dev.mysql.com/doc/refman/5.7/en/charset-charsets.html

We should make every effort to keep charsets and encodings separate and regard them as orthogonal. (Orthogonality is a valuable property; it should be appreciated and pursued.) Ninety percent of the confusion around charsets and encodings comes from failing to separate them as clearly as their nature demands. We need to start explicitly distinguishing these two things so that future generations of computing can see this subject clearly.
