# ADR 003 – Editor-Technologie & Finaler Tech-Stack

## Status
Akzeptiert – 2026-01-19

## Kontext
Nach der initialen Recherche (ADR 002) und ersten Versuchen mit kommerziellen SDKs (CreativeEditor, Polotno) haben sich Probleme ergeben:
- Viele SDKs benötigen **API-Keys** oder haben **strenge Free-Trial-Limits** (Wasserzeichen, Zeitbeschränkung).
- Für ein Hochschulprojekt, das langfristig und kostenfrei laufen soll, sind monatliche Lizenzkosten oder Cloud-Abhängigkeiten ein Hindernis.
- Wir benötigen volle Kontrolle über das Layout, um den **TH Köln Styleguide** (Schriften, Sperrzonen, Farben) exakt durchzusetzen.

Die ursprüngliche Idee, ein fertiges SDK zu nutzen, wurde daher verworfen. Stattdessen setzen wir auf eine **Eigenentwicklung** mit bewährten Open-Source-Bibliotheken.

## Entscheidung
Wir entwickeln den Poster-Editor als **Custom-Lösung** basierend auf **Vue 3** und **Konva**.

Der finale Tech-Stack setzt sich wie folgt zusammen:

### 1. Frontend-Basis
- **Framework:** **Vue 3** (Composition API) mit **TypeScript**.
- **Build-Tool:** **Vite** (schnelles HMR, optimierter Build).
- **Begründung:** Vue bietet eine reaktive Datenbindung, die perfekt für einen Editor ist (State ändert sich -> Canvas rendert neu). TypeScript sorgt für Typsicherheit bei den komplexen Poster-Datenmodellen.

### 2. Editor & Canvas
- **Bibliothek:** **Konva.js** (via `vue-konva`).
- **Funktion:** Rendert das Poster auf ein HTML5 Canvas. Erlaubt Drag & Drop, Resizing, Rotation und Layer-Management.
- **Begründung:** Konva ist der Industriestandard für 2D-Canvas-Interaktionen im Web. Es ist Open Source (MIT), performant und lässt sich gut in Vue integrieren. Wir haben damit volle Freiheit, wie sich Elemente verhalten (z.B. Snapping an Hilfslinien).

### 3. State Management
- **Library:** **Pinia**.
- **Funktion:** Hält den kompletten Zustand des aktuellen Posters (Seiten, Elemente, Selektion, Zoom-Level).
- **Begründung:** Der Editor-Zustand ist komplex. Pinia erlaubt uns, Aktionen wie `updateElement`, `addPage` oder `undo` sauber zu kapseln und von überall in der App darauf zuzugreifen.

### 4. UI & Styling
- **CSS-Framework:** **Tailwind CSS**.
- **Icons:** **Lucide Vue**.
- **Begründung:** Tailwind ermöglicht schnelles Styling der UI-Panels (Sidebar, Inspector) direkt im HTML. Es ist leicht anpassbar (TH-Farben in der Config).

### 5. Export
- **Libraries:** **html2canvas** + **jsPDF**.
- **Funktion:** Erzeugt client-seitig ein PDF aus der aktuellen Ansicht.
- **Begründung:** Für den MVP reicht ein client-seitiger Export. `html2canvas` macht einen "Screenshot" vom DOM/Canvas, `jsPDF` verpackt diesen in ein PDF. Später könnte dies durch einen serverseitigen Export (Spring Boot) ergänzt werden.

## Konsequenzen
- **Höherer Initialaufwand:** Features wie "Element auswählen", "Größe ändern" oder "Rückgängig machen" mussten selbst programmiert werden, statt sie "gratis" vom SDK zu bekommen.
- **Keine Lizenzsorgen:** Das Projekt gehört zu 100% uns und kann ohne API-Keys auf jedem Server gehostet werden.
- **Lerneffekt:** Durch den Eigenbau haben wir tiefes Verständnis für Grafik-Programmierung im Browser und State-Management gewonnen.
- **Wartbarkeit:** Der Code ist auf unsere Bedürfnisse zugeschnitten und enthält keinen unnötigen Ballast eines riesigen SDKs.

