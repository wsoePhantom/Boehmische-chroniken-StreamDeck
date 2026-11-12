# Böhmische Chroniken – Stream Deck

**Stable v1.0.1 – Standalone-Plugin für Windows.** Keine eigene Serverinfrastruktur, kein Docker, keine API-Schlüssel.

## Funktionen
- **Serverstatus** – Online-Anzeige bei aktuellen Daten aus der öffentlichen KCD:MP-Serverliste
- **Spieler online** – aktuelle Spielerzahl und maximale Slots
- **Spielerrekord** – höchster lokal gemessener Spielerstand
- **Spielerverlauf 5h** – lokal aufgezeichnete Spielerentwicklung

Alle 60 Sekunden werden die öffentlich verfügbaren Daten für `45.132.88.78:7777` abgefragt. Das Plugin benötigt nur die laufende Stream-Deck-Software und Internetzugriff. Die Daten werden unter `%APPDATA%\BoehmischeChroniken\streamdeck-stats.json` gespeichert und bleiben bei Updates erhalten.

Die Verlaufsanzeige erfasst ausschließlich Zeiten, in denen Stream Deck läuft. Ist die öffentliche Serverliste nicht erreichbar oder nicht aktuell, werden keine neuen Werte erfasst. „Online“ bezeichnet einen frisch gefundenen Eintrag in der Serverliste und ist kein eigenständiger Game-Server-Healthcheck.

## Installation
1. Die `Boehmische-Chroniken.streamDeckPlugin`-Datei aus dem GitHub-Release herunterladen.
2. Per Doppelklick in der Stream-Deck-Software installieren.
3. Die gewünschten Aktionen auf Tasten ziehen.

## Entwicklung
```sh
npm install
npm test
npm run build
```
Das GitHub-Actions-Build erzeugt ein installierbares Paket. Stable-Releases werden aus `main` veröffentlicht.

## Hinweise
Die Werte stammen aus der öffentlichen KCD:MP-Serverliste und können verzögert sein. Das Plugin steht nicht in Verbindung mit Elgato.
