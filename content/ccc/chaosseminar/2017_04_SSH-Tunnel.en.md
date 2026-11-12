+++
title = "SSH Tunnels"
date = "2017-04-10"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Ort = "University of Ulm, Lecture Hall H20"
Vortragende = "Marcus"
Archiv = [
	["", "https://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_audio.mp3", "65888437"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_audio.ogg", "14442107"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_audio.opus", "48957490"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_video.m4v", "76258792"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_video.mp4", "117175991"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_video.ogv", "469156640"],
	["", "https://archiv.ulm.ccc.de/chaosseminar/201704-ssh-tunnel/cs-201704-ssh-tunnel_video_high.mp4", "559657812"]
	]
+++

{{< chaosseminar >}}

Administrators know Secure Shell as a remote maintenance tool for Linux, Solaris, and BSD. Most people log in to a computer interactively, but the tool is much more powerful. This talk introduces the basics and then explains various network shenanigans^Wconnections using SSH. We will top it off with nested connections.

Specifically, these three SSH options will be explained:

- ssh -L
- ssh -R
- ssh -D

Along the way, we will also cover:

- ssh-keys, ssh-keygen
- ssh -A
- ssh-agent
- ssh-copy-id
- ssh -o$COMMAND (proxy-command, StrictHostKeyChecking)
- ssh-config
- Browser SOCKS proxy

### Basics

- TCP connect, accept
- TCP ports
- Firewalls

### Single-port forwarding

- ssh -L

### SSH Agent

- ssh-keys
- ssh-copy-id
- ssh-agent; ssh-add
- ssh -A

### SSH config

- host * !hosta
- Session multiplexing: ControlMaster auto, ControlPath /tmp/ssh-%r@%h:%p
- ProxyCommand nc -X 5 - x localhost:4444 %h %p
- DynamicForward
- LocalForward
- ForwardAgent
- RequestTTY

### SOCKS proxy

### Proxy forwarding

- Browser SOCKS5 demo
- ssh -D
- ProxyCommand

### SSH within SSH

### Escape sequence

- ~?ENTER

### Examples

- ssh remote commands
- ssh stdin/stdout redirection
- Single-port forwarding
- VPN proxy
- DNS tunnel proxy
- SSH login to a computer behind NAT (ssh -R)
- From port 22 to 80
- From $LOCAL to remote port 80
- From $LOCAL to remote port 80 via a jump host
- Computer from a test network reaching the internet via a laptop and proxy
- Switching users along the way
