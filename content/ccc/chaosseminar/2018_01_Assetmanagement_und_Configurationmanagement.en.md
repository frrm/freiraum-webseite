+++
title = "Asset Management and Configuration Management"
date = "2018-01-08"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Ort = "University of Ulm, Lecture Hall H20"
Vortragende = "Marcus"
Archiv = "This talk will not be recorded."
+++

{{< chaosseminar >}}

If you have more than a few hundred computers to manage, you need strategies and a software implementation. We will work through the pitfalls using use cases, discuss strategy in the form of processes, and look at software through examples.

A few excerpts from the preparation list to whet your appetite:

### Use cases

- create a new VM
- create a new software cache for a service
- fire-cell concept and updates

### Costs

- What does a VM cost?
- What do software licences cost?

### Asset management

- Where is the rack?
- Network: Linux em1, eno1, enp0s2, eth0, bond0

### Maintenance

- Updates during operation, rollbacks
- Operating system patches (RHEL7, SuSE11)

### Configuration management

- CF-Engine2
- CF-Engine3
- Puppet
- Chef
- Ansible

### Demo

- Software update documentation

### File types

- ini
- xml (xsd)
- json (with or without UTF-8 BOM)
- yaml
- database config
- sdp
- smil
