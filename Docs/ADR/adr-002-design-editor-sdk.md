# ADR 002 – Auswahl des Poster-Editor-SDKs

## Status
Vorgemerkt / in Evaluation – 2025-11-17

## Kontext
- Herzstück des Projekts ist der Poster-Editor im Browser.
- Aktuelle Kandidaten: **Creator-Editor (CE)** und **Polotno**.
- Anforderungen aus Feedback und eigenen Interviews:
  - Poster sollen streng nach TH-Layoutregeln funktionieren.
  - Hosting muss hochschul-freundlich sein (keine US-Cloud-Zwang).
  - Ergebnisse sollen sich wiederverwenden lassen (Duplikate, Versionen).
- Wir wollen nicht nach Gefühl entscheiden, sondern beide SDKs kurz testen.

## Optionen
1. **CE SDK** – viele fertige Bausteine, aber Lizenzkosten und evtl. Bindung an deren Cloud.
2. **Polotno SDK** – leichter zu hosten, Open-Source, aber weniger Regeln eingebaut.
3. **Eigenbau (Fabric/Konva)** – volle Kontrolle, aber unrealistischer Aufwand fürs Semester.

## Entscheidung
Wir machen eine kurze **Vergleichs-Phase (max. 2 Wochen)**. Beide SDKs werden in einer Mini-Vue-App ausprobiert. Danach fällen wir die finale Wahl (neues ADR).

## Evaluationskriterien
- Halten Templates automatisch die Styleguide-Regeln ein?
- Lassen sich Asset-Bibliotheken sperren (Logos nur lesen, Bilder uploaden)?
- Export: Gute PDF-Qualität, skalierbar bis A1.
- Kollaboration: Kommentare oder zumindest Statuswechsel möglich?
- Hosting: Läuft auf unseren Servern ohne extra Cloud?
- Kosten: Education-tauglich, keine Überraschungen.
- Vue-Integration: Beispielcode vorhanden? Läuft ein Wrapper stabil?

## Experiment-Setup
1. Branch `feature/sdk-eval` anlegen.
2. Pro SDK: einfacher Flow (Poster erstellen, Logo platzieren, QR-Code, Export).
3. Ergebnisse in einer Tabelle festhalten (Was klappt, was fehlt, Bugs).
4. Kurzes Feedback von mindestens einer Studentin und einem Mitarbeitenden holen.

## Konsequenzen & Follow-ups
- Nach dem Test neues ADR mit finaler Entscheidung schreiben.
- Lizenz + Datenschutz früh klären (Rechtsstelle TH).
- Bei CE: Budget + Hosting klären.  
  Bei Polotno: mehr Zeit für eigene Regeln einplanen.
- Eigenbau nur, wenn beide SDKs komplett scheitern.

