Webseiten-Inhalt für frrm.de
============================

Autor/Kontakt zu dieser Anleitung: Roland <rk@simple-is-better.org>


# Konzept

Dieses Respository enthält alle Daten (Inhalte, Bilder, Templates etc.) für frrm.de:

- `content/`  
  Inhalt der Webseiten als Markdown, inkl. eingebundener Bilder, PDFs usw.  
  Die Verzeichnisstruktur entspricht nahezu 1:1 der Verzeichnisstruktur der erzeugten Webseite.

- `data/events/`  
  Veranstaltungs-Termine als YAML-Daten

- `layouts/`, `themes/BluestNight/`  
  Theme, Hugo-Templates, Automatisierungs-Funktionen

- `static/`  
  CSS-Anpassungen, webseitenglobale Bilder und teils Bilder der Hauptseiten

Daraus wird per "Github Actions" dann die Webseite erstellt.

Einige Seiten, Listen usw. werden dabei automatisch generiert (siehe [Platzhalter/Funktionen](#platzhalterfunktionen) bzw. Hugo-Templates/Shortcodes),
so dass möglichst wenig manueller Wartungsaufwand notwendig ist.


```
(alte Version:
Nach jeder Änderung sowie einmal nachts (um Termine automatisch aktuell zu halten) werden durch Travis-CI und Hugo daraus die HTML-Seiten erzeugt.

Das Ergebnis wird von Travis-CI dann derzeit auf https://github.com/frrm/frrm.github.io/ / https://frrm.github.io abgelegt.  
Alle ~5 Minuten wird der Inhalt von https://github.com/frrm/frrm.github.io/ dann nach https://www.frrm.de gespiegelt.

Sollte nach einigen Minuten https://www.frrm.de noch nicht aktualisiert sein, helfen evtl.
die Travis-CI-Logs, z.B. für Fehlermeldungen, weiter: https://travis-ci.org/frrm/freiraum-hugo )
```


# Anleitungen

## Markdown

Alle Seiteninhalte werden im Markdown-Format angelegt:

- Kurzreferenz: siehe [Markdown-Cheatsheet](https://www.heise.de/mac-and-i/downloads/65/1/1/6/7/1/0/3/Markdown-CheatSheet-Deutsch.pdf)
- Für Spezialzwecke ist es zudem im Prinzip möglich, HTML-Code einzubinden; dies sollte aber vermieden werden.
- Zudem sollte Hugo-spezifische Markdown-Syntax (außer natürlich dem Metadaten-Block) vermieden werden.

### Metadaten

Jede Markdown-Datei beginnt mit einem Hugo-spezifischen Metadaten-Block (begrenzt von `+++`):

    +++
    author = "..."
    title = "Seitentitel"
    date = "2019-07-31"
    categories = ["Log"]
    +++

    Seiteninhalt...

- `title` und `date` sollten immer angegeben werden; die anderen Daten sind optional.
- `title` wird zudem als oberste Überschrift auf der Seite angezeigt, und darf deshalb nicht nochmal als Markdown-Überschrift angegeben werden.
- `date` wird als Datum angezeigt; die Seite wird auch dann angezeigt, wenn `date` in der Zukunft liegt.  
  Datumsangaben ab 2099-01-01 werden nicht angezeigt, und dienen nur der Sortierung der Seiten.

Für Seiten, die direkt in den Menüs verlinkt werden sollen, gibt es weitere Metadaten, z.B.:

    menu = "main"
    weight = 4

Für Chaosseminar-Seiten gibt es weitere Metadaten, siehe [Chaosseminar anlegen](#chaosseminar-anlegen).

### Links/Bilder

Bei Links auf andere interne Seiten und Überschriften, verlinkten internen PDFs, eingebundenen Bildern usw. sollte der Pfad relativ zur aktuellen Seite angeben werden. Absolute Links sind auch möglich; Hugo-spezifische "relref"-Angaben sollen nicht verwendet werden.

Wichtig ist hierbei: Die Pfade müssen relativ bzgl. der erzeugten HTML-Verzeichnisstruktur angegeben werden (da Hugo selbst leider keine relativen Links kennt). Diese ist zwar nahezu identisch zur Verzeichnisstruktur der Markdown-Dateien, jedoch wird für jede Markdown-Datei (außer `index.md` und `_index.md`) ein Unterverzeichnis angelegt: `.../dateiname.md` -> `.../dateiname/index.html`, so dass immer auf `.../dateiname/` verlinkt werden sollte.

Links auf Überschriften sind ebenfalls möglich; der #-Anchor-Name ist die Überschrift in Kleinbuchstaben, wobei Leerzeichen/Sonderzeichen durch `-` ersetzt werden.

Beispiele:

```
[Chaos Party Ulm 2019](../post_2019-06-17/)
[Chaosseminar anlegen](#chaosseminar-anlegen)
[Link auf Überschrift auf anderer Seite](events/#termine)
[Absoluter Link auf Kontaktseite](/contact/)
[Link auf PDF im gleichen Verzeichnis](file.pdf)
![Bild im gleichen Verzeichnis](image.jpg)
```

(Die in der Hugo-Anleitung angegebenen Hugo-spezifischen Arten, Pfade einzugeben, sollten ignoriert werden;
 die hier verwendeten Hugo-Templates wurden so angepasst, dass dies nicht mehr notwendig ist.)

### Platzhalter/Funktionen

Es können verschiedene Platzhalter verwendet werden, die dann durch automatisch erzeugten Inhalt ersetzt werden. Im Hintergrund werden hierdurch die Metadaten und Inhalte der Seiten ausgewertet und automatisch passend zusammengesetzt.

Das Ziel hiervon ist es, dass Informationen nur an einer Stelle angegeben werden müssen, und dann automatisch formatiert und/oder auf anderen Seiten eingebunden werden können. Listen der kommenden und vergangenen Termine, Chaosseminar-Listen usw. müssen dadurch nicht manuell verwaltet werden, sondern können automatisch erstellt und aktuell gehalten werden.

Derzeit definierte Platzhalter:

- {{< events_by_month >}}  
  Liste aller kommenden Termine, gruppiert nach Monat;
  v.a. für https://www.frrm.de/events/#termine

- {{< chaosseminar >}}  
  Chaosseminar-Infoblock mit Thema, Termin, Ort, Vortragendem und Archiv.

- {{< chaosseminar-list-next >}}  
  Liste der geplanten Chaos-Seminare;
  v.a. für https://www.frrm.de/ccc/chaosseminar/

- {{< chaosseminar-list-past >}}  
  Liste der vergangenen Chaos-Seminare, gruppiert nach Jahr;
  v.a. für https://www.frrm.de/ccc/chaosseminar/

- {{< panorama_main2 >}}
- {{< youtube id="..." autoplay="..." >}}
- {{< osm_frrm >}}

Weitere Platzhalter können bei Bedarf angelegt werden.

## Inhalte anlegen

### Post anlegen

TODO: `post/post_YYYY-MM-DD` oder `post/YYYY-MM-DD`?

- neue Datei `content/post/post_YYYY-MM-DD/index.md` anlegen  
  (`YYYY`, `MM`, `DD` durch 4-stellige Jahreszahl, 2-stellige Monatszahl und Tageszahl ersetzen)

  Falls die Datei/das Verzeichnis schon existiert, sollte eine Nummer `_N` angehängt werden,
  z.B. `content/post/post_2019-07-31_2/index.md`.

- Inhalt der index.md: Seitenheader mit Meta-Informationen, darunter der Seiteninhalt, z.B.:

      +++
      author = "..."
      title = "Seitentitel"
      date = "2019-07-20"
      categories = ["Log"]
      +++
      
      Dies ist eine Testseite.

- einzubindende Bilder, PDFs usw. ins gleiche Verzeichnis (`content/post/post_YYYY-MM-DD/`) ablegen.


### Termin anlegen

TODO: `YYYY_cw_NN_KURZTEXT` oder `YYYY-MM-DD_KURZTEXT.yml`?

- neue Datei `data/events/YYYY_cw_NN_KURZTEXT.yml` anlegen
- Inhalt: Metadaten im YAML-Format, z.B.:

      name          : Offenes Treffen
      startDatetime : 2019-07-04T20:00:00
      endDatetime   : 2019-07-04T23:00:00
      location      : Freiraum
      description   : Hauptsache Cyber!

  oder z.B.:

      name          : Chaos-Seminar
      startDatetime : 2019-07-01T20:00:00
      endDatetime   : 2019-07-01T23:00:00
      location      : Uni Ulm, Hörsaal H20
      description   : Reisebericht China

Der Termin erscheint dann automatisch auf der "Veranstaltungen"-Seite und in der "Nächste Treffen"-Seitenleiste
(und wird dort automatisch wieder entfernt, sobald er vorbei ist).

### Chaosseminar anlegen

- Markdown-Datei anlegen:

  - falls Bilder/PDFs oder weitere Dateien zur Seite abgelegt werden sollen:  
    neue Datei `/content/ccc/ChaosSeminar/YYYY_MM_TITLE/index.md` anlegen
  - andernfalls:  
    neue Datei `/content/ccc/ChaosSeminar/YYYY_MM_TITLE.md` anlegen

  (Dies kann später noch geändert werden, ohne dass sich die Webseiten-URL ändert.)

- Markdown-Inhalts-Template:

      +++
      title = "Titel des Chaosseminars"
      date = "2018-11-12"
      categories = ["ChaosSeminar"]

      [ChaosSeminar]
      Thema = ""
      Termin = ""
      Ort = "Uni Ulm, Hörsaal H20"
      Vortragende = "Roland"
      Archiv = []
      +++

      {{< chaosseminar >}}

      Beschreibungstext...


  `Thema` und `Termin` müssen nur ausgefüllt werden, sofern sie von `title`, `date`, oder der Standard-Startuhrzeit "20:00" abweichen.  
  `Archiv = []` wird später durch ein Skript (halbautomatisch) ausgefüllt; alternativ kann auch `Archiv = "ARCHIVHINWEIS"` gesetzt werden,
  z.B.:

      Archiv = "Dieser Vortrag wird nicht aufgezeichnet."

  Der `{{< chaosseminar >}}`-Platzhalter wird bei der HTML-Erzeugung durch einen Info-Block aus den Metadaten ersetzt.

- ggf. dazugehörige Dateien im Verzeichnis `/content/ccc/ChaosSeminar/YYYY_MM_TITLE/` ablegen

- Termin in `data/events/` anlegen (siehe [Termin anlegen](#termin-anlegen)).

## git/github/Hugo

TODO

## Hugo-Bashing

TODO
