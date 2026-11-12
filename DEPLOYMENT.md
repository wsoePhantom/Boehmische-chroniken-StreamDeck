# Installation und Betrieb – Stable v1.0.0

Es ist **kein externer Server** erforderlich. Die Stream-Deck-Software auf Windows führt das Plugin aus und fragt die öffentliche KCD:MP-Serverliste direkt ab.

1. `Boehmische-Chroniken.streamDeckPlugin` aus dem Release herunterladen.
2. Per Doppelklick installieren.
3. Serverstatus, Spieler online, Spielerrekord und 24h-Verlauf auf Tasten legen.

Lokaler Speicher: `%APPDATA%\BoehmischeChroniken\streamdeck-stats.json`.

Die Abfrage läuft alle 60 Sekunden, solange das Plugin läuft. Ohne laufende Stream-Deck-Software entstehen keine Messwerte. Bestehende lokale Daten werden beim Update nicht gelöscht.

Fehlerdiagnose: `%APPDATA%\Elgato\StreamDeck\logs\StreamDeck.log`.
