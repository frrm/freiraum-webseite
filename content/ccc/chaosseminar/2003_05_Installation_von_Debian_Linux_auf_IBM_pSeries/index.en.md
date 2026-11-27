+++
title= "Installing Debian Linux on IBM pSeries"
date = "2003-05-12"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Vortragende = "Markus Schaber, Uli Dangel, Volker Birk"
Archiv = [
	["", "https://archiv.ulm.ccc.de/chaosseminar/200305-pseries/cs-200305-pseries_56k_audio.ogg", "26158376"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/200305-pseries/cs-200305-pseries_96k_audio.mp3", "43179377"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/200305-pseries/cs-200305-pseries_slides.pdf", "260925"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/200305-pseries/cs-200305-pseries_video.mp4", "123177107"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/200305-pseries/cs-200305-pseries_video.ogv", "90079680"]
	]
+++

{{< chaosseminar >}}

Slides:

- Markus Schaber: http://dontpanic.ulm.ccc.de/~schabi/pseries/schabi.html
- Ulrich Dangel: [debian-pseries_schula.pdf](debian-pseries_schula.pdf)
- Volker Birk: [HP materials for comparison with Itanium 2](itanium2.pdf), [IBM materials for the p630](p630.pdf)

IBM advertises Linux heavily, but implementation on the somewhat *larger iron* is rather less impressive than the marketing suggests. Officially, only SUSE Linux Enterprise Server 7 supports IBM PSeries computers, and it costs nearly 3000 EUR. The main problem is the 64-bit Power4 processors, on which a *normal* LinuxPPC kernel will not start.

*No problem*, thought Uli, Volker, and Markus, and simply kneaded Debian Linux long enough until it ran on the machine after all. In this talk they will tell you about all the amusing things that happened along the way.
