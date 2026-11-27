+++
title = "Short Talks: DNS Tunnel, Traffic Maps, CMU Sphinx"
date = "2015-07-13"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Ort = "University of Ulm, Lecture Hall H20"
Vortragende = "Marcus"
Archiv = [
	["", "https://archiv.ulm.ccc.de/chaosseminar/201507-lightningtalks/cs-201507-lightningtalks_audio.mp3", "67468323"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201507-lightningtalks/cs-201507-lightningtalks_audio.ogg", "50768479"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201507-lightningtalks/cs-201507-lightningtalks_audio.opus", "48335420"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201507-lightningtalks/cs-201507-lightningtalks_video.m4v", "88668796"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201507-lightningtalks/cs-201507-lightningtalks_video.mp4", "150227919"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201507-lightningtalks/cs-201507-lightningtalks_video.ogv", "479835418"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201507-lightningtalks/cs-201507-lightningtalks_video_high.mp4", "734530755"]
	]
+++

{{< chaosseminar >}}

Three short talks about completed projects:

- DNS tunnel — stealing service at a Telekom hotspot
- Google Traffic Map Archive Project
- CMU-Sphinx "hello world" for speech recognition

### Traffic Maps

```
cnt=1; for f in *png; do h=$(printf '%04d\n' $cnt); cnt=$(($cnt+1)); mv $f $h.png; done
ffmpeg  -framerate 10 -i %04d.png donnerstag.streik.ulm.mp4
ls ??????????.png >zeitstempel.list #die langen lueckenhaften Zeitstempel
bash erzeuge_untertitel.bash zeitstempel.list 0.25 > donnerstag.streik.ulm.srt
```

- http://dontpanic.ulm.ccc.de/~marcus/google_traffic_maps_project/donnerstag.streik.ulm.mp4
- http://dontpanic.ulm.ccc.de/~marcus/google_traffic_maps_project/donnerstag.streik.ulm.srt

### DNS Tunnel

- iodine v6 (Debian Wheezy) and iodine v7 (Debian Jessie) are not compatible
- [Test image](http://dontpanic.ulm.ccc.de/~marcus/dns_tunnel_project/netzwerkdiagramm.dnstunnel.png)
