+++
title = "Fun with IPv6"
date = "2016-05-09"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = "Spaß mit IPv6, widersprechenden Standards und Herstellerimplementierungen"
Termin = ""
Ort = "University of Ulm, Lecture Hall H20"
Vortragende = "Marcus"
Archiv = [
	["", "https://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_audio.mp3", "40103751"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_audio.ogg", "18063835"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_audio.opus", "30988675"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_video.m4v", "46588280"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_video.mp4", "70564624"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_video.ogv", "288270309"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201605-ipv6/cs-201605-ipv6_video_high.mp4", "260202940"]
	]
+++

{{< chaosseminar >}}

### Talk summary

Alias resolution asks: are these two addresses, 2001::1 and 2004::f, on the same router?
Several IPv6 alias resolution methods are explained and partially demonstrated.

### More topics

We take an overview of the IPv6 standard, the tension between standards authors and implementers, and poke fun at contradictions and creative interpretations. The demonstration uses software called scapy, an interactive Python shell for packet generation.

All standard-related opinions in the talk are the speaker's personal views (a.k.a. ranting).

About the speaker: Marcus is working on IPv6 for his master's thesis and looking for gaps in the standard that can be used to recognize routers.

### RFCs cited

https://dontpanic.ulm.ccc.de/~marcus/chaosseminar/ipv6/ipv6.rfclist.png

Here is a breakdown.

#### Internet Control Message Protocol, Ping

- rfc1885, ICMPv6, year 1995
- rfc2463, ICMPv6, year 1998
- rfc4443, ICMPv6, year 2006
- rfc4884, Extended ICMP to Support Multi-Part Messages, year 2007

#### Inter-Router Link Configuration

- rfc3627, Use of /127 Prefix Length Between Routers Considered Harmful, year 2003
- rfc6164, 127-Bit IPv6 Prefixes on Inter-Router Links, year 2011
- rfc6547, rfc3627 to Historic Status, year 2012

#### Path Maximum Transfer Unit Discovery

- rfc1981, PMTU Discovery, year 1996

The client determines the MTU by repeated attempts. Whether the MTU is stored by address, interface, ... is left to the implementer:

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

#### Internet Protocol Version 6 including Flow Label, Traffic Class, and Routing Type 0

- rfc1883, IPv6, year 1995
- rfc2460, IPv6, year 1998
- Amendments (5095,9722,5871,6437,6564,6935,6946,7045,7112)

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
- [Initial IPv6 RFC, 1995](https://tools.ietf.org/html/rfc1883)
