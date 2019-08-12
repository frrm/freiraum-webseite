+++
title = "Editoren Battle"
date = "2015-04-13"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = "2015-04-13 20:15"
Ort = "Uni Ulm, Hörsaal H20"
Vortragende = "Heiko, Marco, Marcus, Matou, Meillo, Phil"
Archiv = [
	["", "http://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_audio.mp3", "65133237"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_audio.ogg", "47249921"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_audio.opus", "43770967"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_video.m4v", "76310707"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_video.mp4", "110383690"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_video.ogv", "492144525"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_video_high.mp4", "645864418"]
	]
+++

{{< chaosseminar >}}

In diesem Chaosseminar treten Tastatur-Athleten mit ihren perfekt
getunten Editoren in verschiedensten Disziplinen des Editierens
gegeneinander an.

Jeder Teilnehmer hat einen Zeitslot um seinen Editor vorzustellen.
Es muss eine Reihe vorgegebener Editieraufgaben bewaeltigt werden
um ein Grundverstaendnis des Editors zu vermitteln. Daneben sollen
auch coole Features und Besonderheiten des jeweilgen Editors gezeigt
werden.

Am Ende wird Gelegenheit zur offenen Diskussion sein ... und notfalls
zum handfesten Battle, falls wir uns nicht einigen koennen welches
denn nun der beste Editor ist.

Ernsthaft: Es geht keineswegs um ein Beschimpfen der anderen Editoren
sondern darum sie kennenzulernen. (Wir wissen doch alle, dass es
keinen besten Editor gibt, sondern nur unterschiedliche die deshalb
unterschiedliche Vorzuege haben. Dieser Gedanke soll vorherrschen.)

### Die Athleten und ihre Editoren

- Heiko: Notepad++ (0:03:00)
- Marcus: emacs (0:16:00)
- Matou: vim (0:28:30)
- Phil: nvi (0:43:30)
- Meillo: ed (0:46:00)
- Phil: ped (1:05:40)
- Marco: gredit (1:15:15)

### Links

- Ein kleiner vi (verwendet Meillo): http://ex-vi.sf.net
- Standalone-Version des Heirloom-ed: http://hg.marmaro.de/heirloom-ed/
- Erwaehnte Mails von Doug McIlroy bzgl. ed (und Unix-Style): http://minnie.tuhs.org/pipermail/tuhs/2014-August/003326.html http://minnie.tuhs.org/pipermail/tuhs/2014-August/003329.html
- Emacs: Features in kurzen Videoschnipseln vorgestellt: http://emacsrocks.com/ ; Die Ersteinichtung ist nicht selbsterklärend. Weil Emacs immer ein persönlich angepasster *Editor* sein sollte, empfiehlt Marcus in 'Alt+x customize' zu stöbern.
- vim: [vimawesome.com](http://vimawesome.com/) Vim plugins Sammlung
- vim: [Vi/Vim graphical cheat sheet tutorial](http://www.viemu.com/a_vi_vim_graphical_cheat_sheet_tutorial.html)

### Emacs Nachtrag

Die verwendeten Kommandos waren:

- (+ 1 2 5)
- C-x C-e (eval-last-sexp) ;führt eine beliebige LISP-Funktion vor dem Cursor aus.
- (backward-char) ;(Bewegt den Cursor nach Links), (falls am Anfang der Zeile auf die letzte Stelle der letzten Zeile), (falls am Anfang des Textes mache nichts)
- M-x (execute-extended-command)
- C-h C-h ; die Hilfe zur Hilfe
- C-h C-h c ; die Verknüpfung zwischen Taste und LISP-Funktion
- nicht gezeigt wurden die rectangle funktions http://emacsrocks.com/e01.html https://www.gnu.org/software/emacs/manual/html_node/emacs/Rectangles.html
- (package-list-packages)

(Die Inspiration fuer dieses Chaosseminar ist das [Distro-Battle im November 2012](../2012_11_battle).)
