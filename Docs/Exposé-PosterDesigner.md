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


## Main Features 
- Einfaches und schnelles Erstellen von Placketen für den Campus
- Drag and Drop Funktionalität
- Custom Asset Library
- Export als PDF

## Optional Features
- Projekte Speichern (savefiles/Cloudbased)
- User Managment
- Rollensystem bei projekt anschau (editor, viewer)
- Erweitere Export-Optionen
- Collap Optionen
- KI Integration als Hilfe zum Texte schreiben
- KI um Grafische Elemente zu erzeugen (Bilder etc.) 

## Technische Umsetzung 
- Basis Gerüst - ce sdk / polotno sdk 
- Frontend - VUE / React
- Bibliotheken Vuetify / Tailwind
- Backend - Spring Boot und Node.js
- Database - PostgreSQL

## User Stories
- Als Studierende*r will ich Poster für Meine Projekte mit dem Style Guide der Hochschule erstellen.
- Als Studierende*r möchte ich über eine einfache Web-Oberfläche Poster erstellen.
- Als Dozentin oder Mitarbeiterin möchte ich sicherstellen, dass alle erstellten Poster automatisch den Designrichtlinien der TH Köln entsprechen, damit ein einheitliches Erscheinungsbild auf dem Campus gewahrt bleibt.
- Als Nutzer möchte ich mein fertiges Poster mit einem Klick als druckfertige Datei exportieren können, damit ich es direkt drucken oder digital einreichen kann.
- Als Studierende*r möchte ich eigene Bilder, Grafiken oder QR-Codes hochladen können, damit ich Inhalte individuell gestalten und Projekte anpassen kann.
- Als Nutzer möchte ich meine Poster speichern und später erneut öffnen oder bearbeiten können, damit ich mehrere Versionen erstellen und Änderungen nachträglich durchführen kann.
- Als Nutzer möchte ich bei der Textgestaltung oder Bildsuche KI-Unterstützung nutzen können, damit ich schneller passende Inhalte generieren oder Vorschläge erhalten kann.
- Als Nutzer möchte ich alte Poster schnell und einfach Aktualisieren und auf ein Neues Event bzw. das neue Jahr anpassen. 

## Mögliche Risiken / Probleme
- Lizenz Probleme
- Urheberrechts Probleme
- Performance Probleme auf älteren Geräten
- Datenschutz
- Serverprobleme falls cloudstorage oder bei live collaboration
- Token probleme bei KI nutzen
- abhöngigkeit von SDKs und Bibliotheken




