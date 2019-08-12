+++
title = "Programmieren in der Automatisierungstechnik"
date = "2011-12-12"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = "FUP, KOP, Ladder Diagram - Programmieren in der Automatisierungstechnik"
Termin = ""
Ort = "Uni Ulm, Hörsaal H20"
Vortragende = "Markus Schaber"
Archiv = [
	["", "https://archiv.ulm.ccc.de/chaosseminar/201112-automatisierung/cs-201112-automatisierung_audio.mp3", "61202286"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201112-automatisierung/cs-201112-automatisierung_audio.ogg", "45961234"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201112-automatisierung/cs-201112-automatisierung_audio.opus", "42883548"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201112-automatisierung/cs-201112-automatisierung_video.m4v", "70357453"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201112-automatisierung/cs-201112-automatisierung_video.mp4", "125538301"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201112-automatisierung/cs-201112-automatisierung_video.ogv", "483880889"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201112-automatisierung/cs-201112-automatisierung_video_high.mp4", "619491072"]
	]
+++

{{< chaosseminar >}}

Hinweis: *Aufgrund technischer Probleme endet die Aufzeichnung leider vorzeitig*

Auch in der Automatisierungsindustrie werden immer mehr Computer eingesetzt. Von der Kaffeemaschine übers Automobil bis zur kompletten Fertigungsstraße wird heutzutage alles über sogenannte Speicherprogrammierbare Steuerungen (SPS) kontrolliert und am laufen gehalten.

Allerdings finden sich dort - mit Ausnahme von C und Assembler -
üblicherweise keine der Programmiersprachen, die man als "normaler"
Informatiker kennenlernt. Java und C# sind dort Fremdwörter. Stattdessen
haben sich in einem weiten Bereich die Programmiersprachen aus dem
Umfeld des IEC-61131 Standards durchgesetzt. Der Vortrag beleuchtet
kurz die Grundlagen der Programmierung (Programmiermodell, Zyklische
Tasks, Ein/Ausgabe über Memory Mapping, Funktionsbausteine), und stellt
dann die Sprachen der Sprachfamilie vor:

- ST/Strukturierter Text: eine Pascal ähnliche Hochsprache (engl: Structured Text, auch SCL)
- AWL/Anweisungsliste: eine Art abstrakter Assembler(engl: IL, Instruction List)
- KOP/Kontaktplan: Eine grafische Sprache, die einen elektrischen Schaltplan nachbildet. (engl: LD, Ladder Diagram)
- FBS/Funktionsbaustein-Sprache: eine grafische Sprache ähnlich Logik-Schaltplänen. (engl: FBD, Function Block Diagram, auch FUP, Funktionsplan)
- AS/Ablaufsteuerung: eine grafische Sprache, die ein Zustandsdiagramm abbildet. (Englisch SFC, Sequential Function Chart, auch GRAPH)
- CFC/Continous Function Chart: Eine grafische Sprache, die FBS erweitert und dem Programmierer mehr Möglichkeiten einräumt. (Nicht Teil des eigentlichen Standards, aber weit verbreitet).
