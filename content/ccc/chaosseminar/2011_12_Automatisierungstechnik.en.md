+++
title = "Automation Engineering"
date = "2011-12-12"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = "FUP, KOP, Ladder Diagram - Programmieren in der Automatisierungstechnik"
Termin = ""
Ort = "University of Ulm, Lecture Hall H20"
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

Note: *The recording ends prematurely due to technical problems.*

Computers are increasingly used in industrial automation too. From coffee machines and cars to entire production lines, everything is now controlled and kept running by so-called programmable logic controllers (PLCs).

However, with the exception of C and assembly, the programming languages used there are generally not among those a “normal” computer scientist learns. Java and C# are foreign concepts in this field. Instead, languages based on the IEC 61131 standard have become established across a broad range of applications. This talk briefly covers the basics of programming (programming model, cyclic tasks, input/output through memory mapping, function blocks), and then introduces the languages in the family:

- ST/Structured Text: a high-level language similar to Pascal (also SCL)
- AWL/Instruction List: a kind of abstract assembly language (IL, Instruction List)
- KOP/Ladder Diagram: a graphical language that represents an electrical circuit diagram (LD, Ladder Diagram)
- FBS/Function Block Language: a graphical language similar to logic diagrams (FBD, Function Block Diagram, also FUP)
- AS/Sequential Function Chart: a graphical language representing a state diagram (SFC, Sequential Function Chart, also GRAPH)
- CFC/Continuous Function Chart: a graphical language that extends FBS and gives programmers more options (not part of the formal standard, but widely used).
