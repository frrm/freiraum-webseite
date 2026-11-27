+++
title = "Editor Battle"
date = "2015-04-13"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = "2015-04-13 20:15"
Ort = "University of Ulm, Lecture Hall H20"
Vortragende = "Heiko, Marco, Marcus, Matou, Meillo, Phil"
Archiv = [
	["", "https://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_audio.mp3", "65133237"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_audio.ogg", "47249921"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_audio.opus", "43770967"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_video.m4v", "76310707"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_video.mp4", "110383690"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_video.ogv", "492144525"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201504-editorbattle/cs-201504-editorbattle_video_high.mp4", "645864418"]
	]
+++

{{< chaosseminar >}}

In this Chaos Seminar, keyboard athletes compete in a range of editing disciplines with their perfectly tuned editors.

Each participant gets a time slot to introduce their editor. They must complete a set of predefined editing tasks to give the audience a basic understanding of it. They will also show off useful features and special capabilities of their editor.

At the end there will be time for open discussion ... and, if we cannot agree on which editor is best, perhaps a hands-on battle.

Seriously: this is not about insulting the other editors, but about getting to know them. (We all know there is no single best editor, only different ones with different strengths. That idea should prevail.)

### The athletes and their editors

- Heiko: Notepad++ (0:03:00)
- Marcus: emacs (0:16:00)
- Matou: vim (0:28:30)
- Phil: nvi (0:43:30)
- Meillo: ed (0:46:00)
- Phil: ped (1:05:40)
- Marco: gredit (1:15:15)

### Links

- A small vi (used by Meillo): http://ex-vi.sf.net
- Standalone version of Heirloom-ed: http://hg.marmaro.de/heirloom-ed/
- Doug McIlroy's mentioned emails about ed (and the Unix style): http://minnie.tuhs.org/pipermail/tuhs/2014-August/003326.html http://minnie.tuhs.org/pipermail/tuhs/2014-August/003329.html
- Emacs: features shown in short video clips: http://emacsrocks.com/ ; Initial setup is not self-explanatory. Since Emacs should always be a personally customized *editor*, Marcus recommends exploring `Alt+x customize`.
- vim: [vimawesome.com](http://vimawesome.com/) Collection of vim plugins
- vim: [Vi/Vim graphical cheat sheet tutorial](http://www.viemu.com/a_vi_vim_graphical_cheat_sheet_tutorial.html)

### Emacs addendum

The commands used were:

- (+ 1 2 5)
- C-x C-e (eval-last-sexp) ; evaluates any LISP function before the cursor.
- (backward-char) ; (moves the cursor left), (at the beginning of a line, moves to the last position on the previous line), (at the beginning of the text, does nothing)
- M-x (execute-extended-command)
- C-h C-h ; help for the help system
- C-h C-h c ; the binding between a key and a LISP function
- The rectangle functions were not shown: http://emacsrocks.com/e01.html https://www.gnu.org/software/emacs/manual/html_node/emacs/Rectangles.html
- (package-list-packages)

(The inspiration for this Chaos Seminar was the [Distro Battle in November 2012](../2012_11_battle).)
