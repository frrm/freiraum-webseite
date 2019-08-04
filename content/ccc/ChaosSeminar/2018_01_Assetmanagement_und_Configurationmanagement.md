+++
title = "Asset Management und Configuration Management"
date = "2018-01-08"
categories = ["ChaosSeminar"]

[ChaosSeminar]
Thema = ""
Termin = ""
Ort = "Uni Ulm, Hörsaal H20"
Vortragende = "Marcus"
Archiv = "Dieser Vortrag wird nicht aufgezeichnet."
+++

{{< chaosseminar >}}

Wenn man mehr als ein paar hundert Rechner zu verwalten hat, braucht das Strategien und eine Softwareimplementierung. Wir erarbeiten die Stolpersteine mithilfe von Anwendungsfällen (engl.: use cases), reden über die Strategie in Form von Prozessen und über die Software in Form von Beispielen.

Ausschnitte aus der Vorbereitungsliste zum Appetit machen:

### Anwendungsfälle

- neue VM anlegen
- für einen Dienst neuen Softwarecache anlegen
- Feuerzellkonzept und Updates

### Kosten

- Was kostet eine VM?
- Was kosten die Softwarelizenzen?

### Assetmanagement

- Wo steht das Rack?
- Netzwerk Linux em1, eno1, enp0s2, eth0, bond0

### Wartung

- Updates im laufenden Betrieb, Rollbacks
- Betriebssystempatches (RHEL7, SuSE11)

### Configuration Management

- CF-Engine2
- CF-Engine3
- Puppet
- Chef
- Ansible

### Demo

- Softwareupdatedokumentation

### Dateitypen

- ini
- xml (xsd)
- json (UTF-8 BOM oder nicht BOM)
- yaml
- Datenbankconfig
- sdp
- smil

