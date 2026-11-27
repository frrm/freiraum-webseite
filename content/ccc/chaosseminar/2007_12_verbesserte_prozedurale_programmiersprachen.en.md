+++
title = "Improved Procedural Programming Languages"
date = "2007-12-10"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Ort = "Uni Ulm, Hörsaal H20"
Vortragende = "Christian Heinlein"
Archiv = [
	["", "https://archiv.ulm.ccc.de/chaosseminar/200712-prozprog/cs-200712-prozprog_audio.mp3", "85408914"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/200712-prozprog/cs-200712-prozprog_audio.ogg", "62629023"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/200712-prozprog/cs-200712-prozprog_video.m4v", "173477861"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/200712-prozprog/cs-200712-prozprog_video.mp4", "410023308"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/200712-prozprog/cs-200712-prozprog_video.ogv", "403279024"]
	]
+++

{{< chaosseminar >}}

Despite their widespread use and general acceptance, object-oriented programming languages (and therefore their users) suffer from several troublesome problems for which years of intensive research have yet to find entirely satisfactory solutions. These include the expression problem, the binary method problem, the diamond inheritance problem, and problems with so-called crosscutting concerns. Since many of these problems do not exist at all in traditional procedural languages — because they are tied to inheritance and dynamic binding — it is reasonable to ask whether they can simply be overcome by returning to those languages, provided the aforementioned concepts can be made available by other means. In fact, relatively simple generalizations of the two core concepts of procedural languages — data structures and procedures — yield improved procedural languages that are not merely equal to object-oriented languages in expressiveness and flexibility, but can even surpass them. For example, super-types can be defined after the fact for existing types; virtual and non-virtual inheritance can be combined without difficulty; and objects can change their type at runtime, for example "living through" a transformation from a person to a student and back again. Despite this flexibility, otherwise offered at best by dynamically typed languages, improved procedural languages are statically type-safe.

The generalization of procedures mentioned here covers single, multiple, and predicate-based method dispatch as well as before, after, and around advice from aspect-oriented languages, without requiring any additional specialized language constructs. Improved procedural languages are therefore particularly suitable for extending or modifying existing software systems after the fact in a non-invasive way (that is, without modifying or recompiling existing code), and thus for addressing the problem of unanticipated software evolution.
