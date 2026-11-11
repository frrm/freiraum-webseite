+++
title = "The Nix package manager and its ecosystem"
date = "2018-11-12"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Ort = "University of Ulm, Lecture Hall H20"
Vortragende = "Roland"
Archiv = []
+++

{{< chaosseminar >}}

Nix is a somewhat different, universal software package manager for Linux and some other POSIX systems. It can be used alongside the existing Linux package manager (for example, apt/dpkg). NixOS is a Linux distribution built on top of it.

Because Nix does some things differently, it enables things such as:

- using different versions of software or libraries side by side without conflicts
- installation without root privileges
- unified package management for Linux packages, software modules (for example, for Python, Perl, Haskell, and node.js), plugins, and more
- atomic installs, upgrades, downgrades, and rollbacks
- reproducible installation and configuration
- easy creation of development environments with clearly defined dependencies
- simple, reproducible deployment

Nix has the potential to replace many package managers, as well as software such as Docker, FAI/Puppet/Ansible/Chef, and various make systems.
