+++
title = "verbesserte prozedurale Programmiersprachen"
date = "2007-12-10"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Ort = "Uni Ulm, Hörsaal H20"
Vortragende = "Christian Heinlein"
Archiv = [
	["", "http://archiv.ulm.ccc.de/chaosseminar/200712-prozprog/cs-200712-prozprog_audio.mp3", "85408914"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/200712-prozprog/cs-200712-prozprog_audio.ogg", "62629023"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/200712-prozprog/cs-200712-prozprog_video.m4v", "173477861"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/200712-prozprog/cs-200712-prozprog_video.mp4", "410023308"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/200712-prozprog/cs-200712-prozprog_video.ogv", "403279024"]
	]
+++

{{< chaosseminar >}}

Trotz ihrer weiten Verbreitung und allgemein hohen Akzeptanz, leiden objektorientierte Programmiersprachen (und damit auch ihre Benutzer) an einigen unangenehmen Problemen, für die es trotz intensiver Forschungsarbeit über viele Jahre noch keine rundum zufriedenstellenden Lösungen gibt. Unter
anderem sind dies das Expression problem, das Binary method problem, das Diamond inheritance
problem und Probleme mit sog. Crosscutting concerns. Da viele dieser Probleme in klassischen prozeduralen Programmiersprachen überhaupt nicht existieren, weil sie mit Vererbung und dynamischem
Binden zusammenhängen, stellt sich die berechtigte Frage, ob sie nicht einfach durch eine Rückkehr
zu diesen Sprachen überwunden werden können, sofern die genannten Konzepte anderweitig zur Verfügung gestellt werden können. Und tatsächlich erhält man durch relativ einfache Verallgemeinerungen der beiden Kernkonzepte prozeduraler Sprachen - Datenstrukturen und Prozeduren - verbesserte
prozedurale Programmiersprachen, die objektorientierten Sprachen bzgl. Ausdrucksmächtigkeit und
Flexibilität nicht nur ebenbürtig, sondern sogar überlegen sind. Unter anderem lassen sich für bestehende Typen nachträglich Obertypen definieren, virtuelle und nicht-virtuelle Vererbung können problemlos miteinander kombiniert werden, und Objekte können ihren Typ zur Laufzeit ändern, um beispielsweise eine Entwicklung von einer Person zu einem Studenten und wieder zurück zu ,,durchleben". Trotz dieser Flexibilität, die ansonsten bestenfalls von dynamisch getypten Sprachen angeboten
wird, sind verbesserte prozedurale Sprachen statisch typsicher.

Die angesprochene Verallgemeinerung von Prozeduren deckt neben single, multiple und predicate-based method dispatch auch before, after und around advice aspektorientierter Sprachen ab, ohne
hierfür zusätzliche spezialisierte Sprachmittel einführen zu müssen. Damit sind verbesserte prozedurale Sprachen insbesondere geeignet, bestehende Software-Systeme nachträglich nicht-invasiv (d. h. ohne bestehenden Code zu modifizieren oder neu übersetzen zu müssen) in ihrer Funktionalität zu erweitern oder zu modifizieren und damit dem Problem der unanticipated software evolution zu begegnen.
