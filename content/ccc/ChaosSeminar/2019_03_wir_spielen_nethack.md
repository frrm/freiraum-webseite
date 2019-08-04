+++
title = "Wir spielen Nethack"
date = 2019-03-11
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Ort = "Uni Ulm, Hörsaal H20"
Vortragende = "Marcus"
Archiv = []
+++

{{< chaosseminar >}}

Nethack ist ein Klassiker der Computerspielegeschichte. Es ist eine rundenbasierte Dungeons-and-Dragons-Implementierung für Einzelspieler mit einer sehr komplexen Spielmechanik und ungleich primitiven Oberfläche. Manche Leute meinen, der Sinn des Nethack bestünde darin durch regelmäßiges Scheitern die Computerspielmechanik zu erfahren. Wir kürzen diese Interpretation ab:

- Dungeons and Dragons Crashkurs
- das Inventarsystem
- nethack.alt.org

und anschließend die Anwendung im Spiel.

Als Vorbereitung kannst du dir zuführen:

-  [Chaos Radio Express zum Thema Nethack](https://cre.fm/cre199-nethack)

Ergänzende Notizen:

- Usenet rec.games.roguelike.nethack: yet another first ascension post (yafap)


### Nachträge zum Vortrag

- https://nethackwiki.com
- https://nethack.alt.org
- Das Würfelsystem enthielt einen Fehler im Vortrag: Der Angreifer würfelt alleinig, es gibt einen Schwellwert für einen Treffer (nach Verrechnung der Boni/Mali des Verteidigers und des Angreifers), manche Implementierungen kennen einen *critical hit* und einen *grace*.
    Beispiel *d20*:
    - 1 bis 14: *miss*
    - 15: *grace* (50% Schaden)
    - 16 bis 19: *hit*
    - 20: *crit* (Schaden +50%)

    Das Original Dungeons und Dragons Regelwerk könnte möglicherweise nur einen *critical hit* gekannt haben.

