# Stream Deck – Standalone-Installation

Das Plugin benötigt **keinen eigenen Server**, keine Docker-Installation und keinen API-Schlüssel. Es fragt die öffentliche KCD:MP-Serverliste selbst ab.

1. Die Datei `Boehmische-Chroniken.streamDeckPlugin` aus einem erfolgreich geprüften GitHub-Release beziehen.
2. Unter Windows mit installierter Stream-Deck-Software öffnen.
3. Die gewünschten Aktionen auf Stream-Deck-Tasten ziehen.

Die Spielerzahl wird im Abstand von etwa 60 Sekunden abgefragt. Die lokale Statistik wird unter `%APPDATA%\\BoehmischeChroniken\\streamdeck-stats.json` gespeichert. Der Spielerrekord bleibt über Neustarts hinweg erhalten.

**Wichtig:** Die Stream-Deck-Software muss für die Datenerfassung laufen. Offline-Zeiträume können nicht rückwirkend ergänzt werden. Die öffentliche Serverliste enthält keinen verlässlichen Game-Ping und keine Admin-Anzahl; entsprechende Aktionen zeigen `N/V`. Ohne Internetverbindung können keine neuen Daten geladen werden.

Der alte Backend-/Docker-Code bleibt vorläufig im Repository, ist aber für den Standalone-Betrieb nicht erforderlich. Die neue Standalone-Version muss noch in CI und auf Windows geprüft werden.
