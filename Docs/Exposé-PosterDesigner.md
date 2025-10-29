# Poster Desinger für die TH-Köln 

## Kurz Beschreibung: 
Eine Web-App die es ermöglicht mit den Bekannten Vorlagen und dem Style Guide der TH-Köln einfach Poster für am Campus zu erstellen.

## Problemstellung
Studierende und Dozenten etc. an der TH Köln benötigen regelmäßig **visuelle Materialien** – etwa Poster für Projekte, Forschungspräsentationen oder Eventflyer. Professionelle Tools (Adobe, Figma) sind teuer, komplex und ressourcenintensiv.  
Freemium-Angebote wie **Canva** sind zwar populär, aber:
- teilweise unvereinbar mit Datenschutzrichtlinien im Hochschulkontext,
- und oft überladen mit Features, die gar nicht benötigt werden.
- keine Spezifischen vorlagen für den Hochschulkontext.

## Lösungsansatz
Eine Web-App in der Vorlagen für Plackate und Poster usw. verfügbar sind und einfach im Web editiert und Exportiert werden können. 

<br/>

## Main Features 
- Einfaches und schnelles Erstellen von Placketen für den Campus
- Drag and Drop Funktionalität
- Custom Asset Library
- Export als PDF

<br/>

## Optional Features
- Projekte Speichern (savefiles/Cloudbased)
- User Managment
- Rollensystem bei projekt anschau (editor, viewer)
- Erweitere Export-Optionen
- Collap Optionen
- KI Integration als Hilfe zum Texte schreiben
- KI um Grafische Elemente zu erzeugen (Bilder etc.) 

<br/>

## Technische Umsetzung 
- Basis Gerüst - ce sdk / polotno sdk 
- Frontend - VUE / React
- Bibliotheken Vuetify / Tailwind
- Backend - Spring Boot und Node.js
- Database - PostgreSQL

<br/>

## User Stories
- Als Studierende*r will ich Poster für Meine Projekte mit dem Style Guide der Hochschule erstellen.
- Als Studierende*r möchte ich über eine einfache Web-Oberfläche Poster erstellen.
- Als Dozentin oder Mitarbeiterin möchte ich sicherstellen, dass alle erstellten Poster automatisch den Designrichtlinien der TH Köln entsprechen, damit ein einheitliches Erscheinungsbild auf dem Campus gewahrt bleibt.
- Als Nutzer möchte ich mein fertiges Poster mit einem Klick als druckfertige Datei exportieren können, damit ich es direkt drucken oder digital einreichen kann.
- Als Studierende*r möchte ich eigene Bilder, Grafiken oder QR-Codes hochladen können, damit ich Inhalte individuell gestalten und Projekte anpassen kann.
- Als Nutzer möchte ich meine Poster speichern und später erneut öffnen oder bearbeiten können, damit ich mehrere Versionen erstellen und Änderungen nachträglich durchführen kann.
- Als Nutzer möchte ich bei der Textgestaltung oder Bildsuche KI-Unterstützung nutzen können, damit ich schneller passende Inhalte generieren oder Vorschläge erhalten kann.
- Als Nutzer möchte ich alte Poster schnell und einfach Aktualisieren und auf ein Neues Event bzw. das neue Jahr anpassen. 

<br/>

## Mögliche Risiken / Probleme
- Lizenz Probleme
- Urheberrechts Probleme
- Performance Probleme auf älteren Geräten
- Datenschutz
- Serverprobleme falls cloudstorage oder bei live collaboration
- Token probleme bei KI nutzen
- abhöngigkeit von SDKs und Bibliotheken

<br/>

## Marktanalyse – Vergleich Canva / Figma

| Kriterium | **Canva** | **Figma** | **Relevanz für Hochschul-App** |
|------------|------------|------------|--------------------------------|
| **Zielgruppe** | Laien, Studierende, Marketing | Designer:innen, Teams, UX | Beide relevant, Canva leichter für Einsteiger |
| **Vorlagen & Assets** | Große Bibliothek, viele Poster/Flyer-Vorlagen | Wenige Vorlagen, Fokus auf Komponenten | Vorteil Canva, aber nicht Hochschul-spezifisch |
| **Kollaboration** | Echtzeit, Kommentar- & Freigabe-Workflows | Echtzeit, Versionierung, Design-Systeme | Beide stark, Figma technisch weiter |
| **Bedienbarkeit** | Sehr einfach, Drag & Drop | Steilere Lernkurve | Vorteil Canva |
| **Preis / Bildungslizenzen** | Kostenlos (Education Plan) | Kostenlos (Education Plan) | Beide günstig für Bildung |
| **Datenschutz / DSGVO** | Teilweise problematisch (Cloud, USA) | GDPR-konform laut Richtlinien | Potenzial für Hochschul-Hosting als USP |

### Marktchancen und Lücken

1. **Daten & Hosting:**  
   Hochschulen wünschen interne Kontrolle über Daten, Accounts und Hosting.  
   → Chance: Hochschul-Hosting 

2. **Spezifische Hochschulvorlagen:**  
   Canva bietet keine Styleguide-konformen Uni-Vorlagen.  
   → Chance: Auswahl an verschiednen Hochschulvorlagen an einem Ort die auch von Laien einfach zu bearbeiten sind.  

3. **Fokus & Einfachheit:**  
   Canva überladen, Figma zu komplex.  
   → Chance: Schlanke App nur für Poster und Print-Materialien.  

### Risiken

- **Marktdurchdringung:** Canva/Figma ist stark verbreitet – Umstieg braucht Überzeugungsarbeit.  
- **Funktionstiefe:** Designer:innen könnten erweiterte Tools aus z.B. Figma vermissen. 


