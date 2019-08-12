+++
date = "2016-10-10"
title = "Charset, Encoding & Font"
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

Dieser Vortrag bringt Licht in die Verwirrungen und das Unwissen im Themenfeld um Zeichensaetze (Charsets), Zeichenkodierungen (Encodings) und Schriften (Fonts).

### Links

Fonts:

- https://en.wikipedia.org/wiki/Computer_font
- http://www.linuxlibertine.org/
- http://www.linuxlibertine.org/uploads/pics/HT-Word2003-454x66px.png (Hinting)
- http://heirloom.sourceforge.net/doctools/otfdump.1.html


Zeichensaetze:

- https://de.wikipedia.org/wiki/Zeichensatz
- https://en.wikipedia.org/wiki/Code_point
- https://de.wikipedia.org/wiki/ASCII
- https://tools.ietf.org/html/rfc20
- http://man7.org/linux/man-pages/man7/ascii.7.html
- http://worldpowersystems.com/archives/codes/X3.4-1963/index.html
- https://en.wikipedia.org/wiki/EBCDIC
- https://en.wikipedia.org/wiki/File:Blue-punch-card-front-horiz_top-char-contrast-stretched.png (macht das Layout von EBCDIC verstaendlich)
- https://en.wikipedia.org/wiki/Unicode
- ISO 10646 definiert sowohl ein Charset als auch mehrere Encodings
- http://man7.org/linux/man-pages/man7/unicode.7.html
- https://en.wikipedia.org/wiki/Plane_(Unicode)#Basic_Multilingual_Plane
- https://de.wikipedia.org/w/index.php?title=Datei:Roadmap_to_Unicode_BMP_multilingual.svg&lang=de

Encodings:

- https://en.wikipedia.org/wiki/Character_encoding
- https://en.wikipedia.org/wiki/UTF-8
- https://tools.ietf.org/html/rfc3629
- http://man7.org/linux/man-pages/man7/utf-8.7.html
- http://doc.cat-v.org/bell_labs/utf-8_history
- https://en.wikipedia.org/wiki/UTF-16 (Gibt's in LE und BE)
- https://tools.ietf.org/html/rfc2781
- https://en.wikipedia.org/wiki/UTF-32
- https://en.wikipedia.org/wiki/UTF-7
- https://tools.ietf.org/html/rfc2152
- https://en.wikipedia.org/wiki/UTF-9
- https://tools.ietf.org/html/rfc4042 (Vom 1. April 2005)

Sollte man ausrotten:

- https://en.wikipedia.org/wiki/Byte_order_mark

Unicode-Zeichen und deren Repraesentation in verschiedenen Kodierungen:

- http://www.fileformat.info/
- http://www.fileformat.info/info/unicode/char/0041/index.htm
- http://www.fileformat.info/info/unicode/char/1f582/index.htm

Wie man's richtig macht:

- http://doc.cat-v.org/plan_9/4th_edition/papers/utf

Guter Uebersichtsartikel. Der Hauptfokus ist zwar auf Windows gelegt (weil dort der Bedarf am groessten ist), aber es wird viel allgemeines Wissen vermittelt:

- http://utf8everywhere.org/

Ein Klassiker von Blogpost, wenn auch technisch nicht unbedingt der exakteste:

- http://www.joelonsoftware.com/articles/Unicode.html

Eine Erklaerung der Situation der Schriftsysteme in Ostasien (der Titel passt nicht unbedingt zum Inhalt):

- http://www.hastingsresearch.com/net/04-unicode-limitations.shtml

Auch Google vermischt Charsets und Encodings:

- https://googleblog.blogspot.de/2010/01/unicode-nearing-50-of-web.html

Was zur Folge hatte, dass diese abgeleitete Grafik jahrelang in der Wikipedia zu finden war -- im Namen Unicode, im Inhalt UTF-8:

- https://commons.wikimedia.org/wiki/File:UnicodeGrow2b.png

Bei PHP muss man der Charset-Methode ein Encoding uebergeben. Man hat einfach den Fehler von Mysql uebernommen, Charsets und Encodings in einen Topf zu werfen:

- http://php.net/manual/en/mysqli.set-charset.php
- http://dev.mysql.com/doc/refman/5.7/en/charset-charsets.html


Wir sollten uns mit der groessten Anstrengung bemuehen, Charsets
und Encodings auseinander zu halten und als orthogonal zueinander
anzusehen. (Orthogonalitaet ist eine so wertvolle Eigenschaft; sie
sollte geschaetzt und angestrebt werden.) 90% der Verwirrung im
Gebiet um Charsets und Encodings stammt daher, dass die beiden
nicht so klar getrennt werden wie es ihre Natur ist. Es ist
notwendig, dass wir anfangen, die zwei Dinge explizit auseinander
zu halten, auf dass wir es der zukuenftigen Informatikwelt
ermoeglichen, in diesem Thema klar zu sehen!

