+++
title = "Spaß mit IPv6 Implementierungen"
date = "2016-05-09"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = "Spaß mit IPv6, widersprechenden Standards und Herstellerimplementierungen"
Termin = ""
Ort = "Uni Ulm, Hörsaal H20"
Vortragende = "Marcus"
Archiv = [
	["", "http://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_audio.mp3", "40103751"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_audio.ogg", "18063835"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_audio.opus", "30988675"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_video.m4v", "46588280"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_video.mp4", "70564624"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_video.ogv", "288270309"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_video_high.mp4", "260202940"]
	]
+++

{{< chaosseminar >}}

### Vortragszusammenfassung

Alias Resolution beschäftigt sich mit der Frage: Sind diese beiden Adressen 2001::1 und 2004::f der gleiche Router?
Es werden Verfahren zur IPv6 Alias Resolution erklärt und partiell demonstriert.

### weitere Inhalte

Wir verschaffen uns einen Überblick über den IPv6 Standard, das Spannungsfeld zwischen Standardautor und Implementierer und lästern über Widersprüche und freie Lesarten.
Zur Demonstration kommt eine Software Namens scapy -- eine interaktive Python-Shell zur Paketgenerierung.

Alle standardrelevanten Vortragsinhalte sind persönliche Meinung des Vortragenden (a.k.a lästern).

Zum Referenten: Marcus befasst sich für seine Masterarbeit mit IPv6 und sucht Lücken im Standard, um Router wiederzuerkennen.

### zitierte RFCs

https://dontpanic.ulm.ccc.de/~marcus/chaosseminar/ipv6/ipv6.rfclist.png

Es folgt eine Einzelaufschlüsselung.

#### Internet Control Message Protocol, Ping

- rfc1885, ICMPv6, Jahr 1995
- rfc2463, ICMPv6, Jahr 1998
- rfc4443, ICMPv6, Jahr 2006
- rfc4884, Extended ICMP tu Support Multi-Part Messages, Jahr 2007

#### Inter Router Link Configuration

- rfc3627, Use of /127 Prefix Length Between Routers Considered Harmful, Jahr 2003
- rfc6164, 127-Bit IPv6 Prefixes on Inter-Router Links, Jahr 2011
- rfc6547, rfc3627 to Historic Status, Jahr 2012

#### Path Maximum Transfer Unit Discovery

- rfc1981, PMTU Discovery, Jahr 1996

Der Client findet die MTU durch wiederholtes ausprobieren heraus. Ob die MTU abhängig von Adresse, Interface, ... gespeichert wird, ist Aufgabe des Implementierers zu entscheiden:


```
5.2. Storing PMTU information

   Ideally, a PMTU value should be associated with a specific path
   traversed by packets exchanged between the source and destination
   nodes.  However, in most cases a node will not have enough
   information to completely and accurately identify such a path.
   Rather, a node must associate a PMTU value with some local
   representation of a path.  It is left to the implementation to select
   the local representation of a path.
```

#### Internet Protocol Version 6 inklusive Flow Label, Traffic Class und Routing Type 0

- rfc1883, IPv6, Jahr 1995
- rfc2460, IPv6, Jahr 1998
- Ergänzungen (5095,9722,5871,6437,6564,6935,6946,7045,7112)

```
6.  Flow Labels

   The 24-bit Flow Label field in the IPv6 header may be used by a
   source to label those packets for which it requests special handling
   by the IPv6 routers, such as non-default quality of service or
   "real-time" service.  This aspect of IPv6 is, at the time of writing,
   still experimental and subject to change as the requirements for flow
   support in the Internet become clearer.  Hosts or routers that do not
   support the functions of the Flow Label field are required to set the
   field to zero when originating a packet, pass the field on unchanged
   when forwarding a packet, and ignore the field when receiving a
   packet.
```

### Links

- [Scapy Homepage](http://www.secdev.org/projects/scapy/)
- [initialer IPv6 RFC 1995](https://tools.ietf.org/html/rfc1883)
