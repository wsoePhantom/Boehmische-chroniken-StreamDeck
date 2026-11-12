# Stream Deck plugin – Stable 1.0.1

Vier Aktionen: Serverstatus, Spieler online, Spielerrekord und 5-Stunden-Verlauf.

Der Node.js-Prozess des Stream-Deck-Plugins fragt die öffentliche KCD:MP-Serverliste direkt ab und schreibt die Historie in den lokalen Windows-AppData-Ordner. Kein Backend, keine Konfiguration, kein API-Schlüssel.

## Build und Tests
```sh
npm install
npm test
npm run build
```
Der GitHub-Actions-Workflow bündelt `src/plugin.ts` für Node.js 20, erzeugt die Icons und validiert das installierbare `.streamDeckPlugin`-Paket.

Die Verlaufsanzeige kann nur Messwerte zeigen, die während laufender Stream-Deck-Software erfasst wurden.
