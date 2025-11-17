# ADR 003 – Backend mit Spring Boot & Kotlin

## Status
Akzeptiert – 2025-11-17

## Kontext
- Wir brauchen ein Backend für Campus-Login, Rollen, Poster-Speicher und Asset-Bibliotheken.
- Feedback: lieber stabil und nachvollziehbar, nicht zwei Stacks gleichzeitig.
- Wir kennen **Spring Boot** gut und können damit auch Kotlin nutzen.
- Alles soll später auf TH-Servern laufen und datenschutzfreundlich bleiben.

## Optionen
1. **Spring Boot + Kotlin**  
   + Bekanntes Toolset, gute Sicherheit, läuft on-prem.  
   + Kotlin gibt uns moderne Sprache, trotzdem volle Spring-Unterstützung.
2. **Node.js (JavaScript)**  
   + Gleiche Sprache wie Frontend.  
   + Aber weniger Erfahrung im Team, Security müsste neu gedacht werden.
3. **Serverless (Supabase/Firebase)**  
   + Schneller Start.  
   + Daten würden außerhalb der Hochschule liegen → fällt raus.

## Entscheidung
Wir bauen das Backend mit **Spring Boot + Kotlin**.

## Begründung
- Wir wissen, wie man Spring-Projekte in der TH-Infrastruktur betreibt.
- Spring Security + Kotlin decken Campus-Login, Rollenmodelle und einfache Freigabe-Prozesse ab.
- Der Layer-Ansatz (Controller, Service, Repo) passt zu den ADR-Anforderungen.
- Wenige Überraschungen bei Updates, große Community, viele Beispiele.

## Konsequenzen & To-dos
- Auth-ADR vorbereiten (z. B. Campus-SSO vs. lokaler Account).
- Domainmodell skizzieren: Poster, Versionen, Kommentare, Assets.
- Automatisierte Tests + Pipeline einrichten (Build, Tests, Lint).
- Deployment-Setup vorbereiten (Docker-Image, Deployment-Anleitung).
- Kein zweites Backend anfangen, damit der Fokus klar bleibt.

