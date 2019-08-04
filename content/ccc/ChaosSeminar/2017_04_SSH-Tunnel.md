+++
title = "SSH-Tunnel"
date = "2017-04-10"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Ort = "Uni Ulm, Hörsaal H20"
Vortragende = "Marcus"
Archiv = [
	["", "http://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_audio.mp3", "65888437"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_audio.ogg", "14442107"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_audio.opus", "48957490"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_video.m4v", "76258792"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_video.mp4", "117175991"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_video.ogv", "469156640"],
	["", "http://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_video_high.mp4", "559657812"]
	]
+++

{{< chaosseminar >}}

Die Secure SHell kennen Administratoren als Fernwartungswerkzeug für Linux, Solaris und BSD. Die meisten Leute loggen sich interaktiv auf einem Computer ein, aber das Werkzeug ist sehr viel mächtiger. Dieser Vortrag soll die Grundlagen anreißen, um darauf aufbauend vielfältige Netzwerkschweinereien^WNetzwerkverbindungen mit SSH zu erklären. Das ganze wird noch getoppt durch ineinander geschachtelte Verbindungen.

Konkret werden diese drei SSH-Parameter erklärt:

- ssh -L
- ssh -R
- ssh -D

Auf dem Weg dahin nehmen wir noch

- ssh-keys, ssh-keygen
- ssh -A
- ssh-agent
- ssh-copy-id
- ssh -o$COMMAND (proxy-command, StrictHostKeyChecking)
- ssh-config
- Browser SOCKS-Proxy

mit.

### Grundlagen

- TCP connect, accept
- TCP ports
- Firewalls

### Einzelportweiterleitung

- ssh -L

### SSH-Agent

- ssh-keys
- ssh-copy-id
- ssh-agent; ssh-add
- ssh -A

### SSH-config

- host * !hosta
- Sitzungsmultiplexing: ControlMaster auto, ControlPath /tmp/ssh-%r@%h:%p
- ProxyCommand nc -X 5 - x localhost:4444 %h %p
- DynamicForward
- LocalForward
- ForwardAgent
- RequestTTY


### SOCKS Proxy

### Proxy Weiterleitung

- Browser SOCKS5 Demo
- ssh -D
- ProxyCommand

### SSH in SSH

### Escape Sequenz

- ~?ENTER

### Beispiele

- ssh remote commands
- ssh stdin-stdout-Umleitung
- Einzelportweiterleitung
- VPN-Proxy
- DNS-Tunnel Proxy
- ssh-login in Rechner hinter NAT (ssh -R)
- von 22 nach 80
- von $LOCAL nach remote 80
- von $LOCAL nach remote 80 via Sprung
- Recher aus Testnetz via Laptop und Proxy nach Internet
- zwischendrin Benutzer wechseln
