# ADR 001 – Frontend-Framework & UI-Basis

## Status
Akzeptiert – 2025-11-17

## Kontext
Wir bauen einen **Poster-Designer für die TH Köln**, der komplett im Browser läuft. Zielgruppe sind vor allem Studierende und Mitarbeitende ohne Design-Hintergrund.  
Damit der Editor gut nutzbar ist, müssen wir früh festlegen, **welches Frontend-Framework** und **welche UI-Basis** wir verwenden.

- Das UI soll den **Styleguide der TH Köln** (Farben, Typografie, Logos) abbilden.
- Die App soll im normalen **Desktop-Browser** laufen, ohne Installation.
- Wir setzen im Projekt sowieso auf das **ce/polotno SDK** für den Editor, daher sollte das UI-Framework dazu passen.
- Wir haben bereits Erfahrung mit **Vue 3 (JavaScript)**, React wäre für uns neu.
- Im Exposé waren die folgenden Optionen genannt:
  - **Frontend:** Vue oder React  
  - **Bibliotheken:** Vuetify oder Tailwind  
- Aus dem Feedback: Möglichst **einfach halten**, wenige Abhängigkeiten und eine **klare Struktur**, damit das Projekt im Rahmen des Studiums machbar bleibt.

Damit sind wir genau bei der Frage dieses ADRs:
> Welches Frontend-Framework + welche UI-Basis nutzen wir für den Poster-Designer?

## Optionen

1. **Vue 3 + Vuetify 3**  
   - Viele fertige Komponenten (Navigation, Dialoge, Formulare), damit könnten wir schnell ein Grund-UI bauen.  
   - Gleichzeitig wären wir ziemlich im Material-Design-Look gefangen und hätten Extra-Overhead, den wir für unseren Poster-Designer nicht unbedingt brauchen.

2. **Vue 3 + Tailwind CSS**  
   - Vue kennen wir schon gut und Tailwind gibt uns viel Freiheit beim Layout. Wir können Farben und Typografie direkt an den TH-Styleguide anpassen.  
   - Dafür müssen wir mehr selbst bauen (Buttons, Dialoge, Formulare) und darauf achten, dass das HTML mit den Utility-Klassen übersichtlich bleibt.

3. **Vue 3 + eigene Komponenten ohne Tailwind/Vuetify**  
   - Komplette Freiheit im Design und keine großen UI-Abhängigkeiten.  
   - Sehr viel Aufwand, weil wir alles selbst stylen, warten und auch Accessibility komplett eigenständig umsetzen müssten.

4. **React + Tailwind**  
   - Technisch eine starke Kombination mit großer Community und vielen Beispielen.  
   - React ist für uns aber neu und würde viel Einarbeitungszeit kosten, die wir im Projekt an anderer Stelle brauchen.

## Entscheidung
Wir setzen auf **Vue 3 (JavaScript) + Tailwind CSS** mit einfachen, selbstgebauten Komponenten.

## Begründung
- Wir **kennen Vue 3 bereits**, dadurch müssen wir weniger Zeit in das Framework an sich investieren und können uns auf den Editor konzentrieren.
- Tailwind gibt uns **volle Kontrolle über Layout und Design**, sodass wir den TH-Styleguide sehr genau umsetzen können.
- Das Bundle bleibt **relativ schlank**, weil Tailwind hauptsächlich aus Utility-Klassen besteht und wenig eigenes JavaScript mitbringt.
- Vuetify wäre zwar schnell für Standard-Formulare, bringt aber **Material-Design-Meinung und Overhead** mit. Für unseren speziellen Poster-Look wäre das eher ein Hindernis.
- React + Tailwind haben wir verworfen, weil der **Lernaufwand** für React im Rahmen dieses Projekts zu hoch wäre.
- Mit Vue + Tailwind behalten wir die Komplexität im Griff (wenige, bekannte Abhängigkeiten) und erfüllen trotzdem die Anforderungen aus dem Exposé.

## Konsequenzen & To-dos
- Tailwind einrichten und **Farben/Fonts des TH-Styleguides** in `tailwind.config` hinterlegen.
- Basis-Komponenten bauen (z. B. Poster-Karten, Buttons, Formularfelder) und **wiederverwendbar** aufbauen.
- Darauf achten, dass Buttons, Links usw. **gut fokusierbar** sind (Keyboard/Screenreader).
- Beim SDK-Test prüfen, ob **Canvas-Editor + Tailwind-Layout** gut zusammenspielen (keine Resize-Bugs).
- Projektstruktur möglichst simpel halten (z. B. klare Trennung von Views, Komponenten und Editor-Logik).

## Plattform und Endgeräte
Für das Frontend-Design ist wichtig, auf welchen Geräten die App hauptsächlich genutzt werden soll.

- **Primär-Zielplattform:**  
  - Desktop- und Laptop-Browser (z. B. Chrome, Firefox, Edge)  
  - Nutzung mit Maus und Tastatur  
- **Optional:**  
  - Größere Tablets im Querformat können perspektivisch unterstützt werden, sind aber aktuell nicht im Fokus.  
- **Explizit nicht Ziel dieses Projekts:**  
  - Smartphones bzw. sehr kleine Touch-Displays.  

Begründung:
- Der Poster-Designer arbeitet mit einem **Canvas-Editor** (z. B. ce/polotno), vielen Panels und Einstellungen.  
- Auf sehr kleinen Displays wäre das UI schnell überladen und schlecht bedienbar.  
- Für das aktuelle Projekt konzentrieren wir uns deshalb auf eine **gute Desktop-Erfahrung**. Wenn Mobile später wichtig wird, braucht es ein eigenes ADR (z. B. für ein angepasstes Mobile-UI oder eine separate App).