# ADR 001 – Vue-Frontend & UI-Bibliothek

## Status
Akzeptiert – 2025-11-17

## Kontext
- Unser UI soll schnell nutzbar sein und den TH-Styleguide abdecken.
- Wir fühlen uns mit **Vue 3 (JavaScript)** wohl und Kennen uns Damit aus.
- Die Frage hier: Welche UI-Bibliothek hilft uns am besten beim Aufbau des Editors?
- Feedback: Einfach halten, wenige Abhängigkeiten, klare Struktur.

## Optionen
1. **Vue 3 + Vuetify 3**  
   + Viele fertige Komponenten (Navigation, Dialoge, Formulare)  
   + Theming lässt sich auf TH-Farben anpassen
2. **Vue 3 + Tailwind + Headless-UI**  
   + Sehr flexibel  
   + Mehr Aufwand je Komponente
3. **Vue 3 + komplett eigene Komponenten**  
   + Maximale Freiheit  
   + Hoher Pflegeaufwand, Risiko bei Barrierefreiheit

## Entscheidung
Wir setzen auf **Vue 3 (JavaScript) + Tailwind CSS** mit einfachen eigenen Komponenten.

## Begründung
- Tailwind gibt uns volle Kontrolle über Layout und Design. So können wir den TH-Styleguide sehr genau abbilden.
- Das Bundle bleibt schlank, weil Tailwind hauptsächlich Utility-Klassen ist und wenig eigenes JavaScript mitbringt.
- Vuetify wäre schneller für Standard-Formulare, bringt aber Material-Design und viel Overhead mit. Für unseren eigenen Poster-Look wäre das später eher ein Hindernis.
- Wir nehmen in Kauf, etwas mehr Arbeit pro Komponente zu haben, bekommen dafür aber mehr Freiheit und bessere Performance auf schwächeren Geräten.

## Konsequenzen & To-dos
- Tailwind einrichten und Farben/Fonts nach TH-Styleguide in `tailwind.config` hinterlegen.
- Basis-Komponenten bauen (z. B. Poster-Karte, Buttons, Formularfelder) und wiederverwendbar machen.
- Darauf achten, dass Buttons, Links usw. gut fokusierbar sind (Keyboard/Screenreader).
- Beim SDK-Test prüfen, ob Canvas-Editor + Tailwind-Layout gut zusammenspielen (keine Resize-Bugs).

