# SDK-Vergleich – kurzer Plan

## Ziel
Wir wollen testen, welches Editor-SDK (CE oder Polotno) besser zu unserem Vue-Frontend passt und unsere Anforderungen (Styleguide, Export, Hosting) erfüllt.

## Setup
- Branch `feature/sdk-eval` anlegen.
- Kleine Vue-3-App mit Tailwind erstellen (nur Basislayout).
- Editor-SDK jeweils in eine eigene View einbauen (`/ce-test`, `/polotno-test`).

## Aufgaben pro SDK
1. Einfaches Poster erstellen (A3, Pflichtlogo, Titel, Untertitel).
2. Bild hinzufügen (z. B. Projektfoto) und skalieren.
3. QR-Code oder Platzhalter einfügen.
4. Poster als PDF exportieren.

## Bewertung
- Hält das SDK unsere Layout-Regeln halbwegs ein?
- Fühlt sich die Bedienung für Studierende „einfach genug“ an?
- Läuft das Ganze flüssig auf einem normalen Hochschul-Notebook?
- Ist klar, wie wir es ohne extra Cloud-Dienste nutzen können?

## Ergebnis
- Kurze Tabelle erstellen: CE vs. Polotno (Plus/Minus).
- Entscheidung im neuen ADR festhalten und hier verlinken.

