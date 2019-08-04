+++
title = "Der Paketmanager Nix und sein Ökosystem"
date = "2018-11-12"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Ort = "Uni Ulm, Hörsaal H20"
Vortragende = "Roland"
Archiv = []
+++

{{< chaosseminar >}}

Nix ist etwas anderer, universeller Software-Paket-Manager für
Linux und einige andere POSIX-Systeme; Nix kann dabei parallel zum
vorhandenen Linux-Paketmanager (z.B. apt/dpkg) verwendet werden.
NixOS ist eine darauf aufbauende Linux-Distribution.

Da Nix einige Dinge anders macht, sind damit Dinge möglich, wie z.B.:

- gleichzeitige, kollisionsfreie Nutzung verschiedener Versionen
  einer Software oder Bibliothek
- Installation ohne Root-Rechte
- einheitliches Paketmanagement für Linux-Pakete,
  Software-Module (z.B. für Python, Perl, Haskell, node.js),
  Plugins usw.
- atomare Installationen, Upgrades, Downgrades und Rollbacks
- reproduzierbare Installation und Konfiguration
- einfache Erstellung von Entwicklungsumgebungen mit klar
  definierten Abhängigkeiten
- einfaches, reproduzierbares Deployment

Nix hat dabei das Potential, in Zukunft viele Paketmanager,
Software wie Docker, FAI/Puppet/Ansible/Chef, diverse
Make-System usw. zu ersetzen.
