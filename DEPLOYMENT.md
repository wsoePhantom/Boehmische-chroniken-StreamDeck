# Betrieb und Installation

## Voraussetzungen
- Windows mit Elgato Stream Deck Software 6.5 oder neuer
- Ein laufender Statistik-API-Dienst, den der Stream-Deck-PC erreichen kann
- Ein selbst gewählter, langer API-Schlüssel

## Statistik-API starten
Im Repository:
```sh
export STATS_API_KEY='EIN-LANGER-ZUFAELLIGER-SCHLUESSEL'
docker compose up -d --build
```
Die Compose-Datei bindet Port 3100 ausschließlich an 127.0.0.1. Läuft die API auf einem anderen Rechner, **nicht** ungeschützt Port 3100 ins Internet öffnen. Stattdessen HTTPS-Reverse-Proxy mit Zugriffskontrolle oder ein privates VPN verwenden.

Prüfen:
```sh
curl http://127.0.0.1:3100/health
curl -H "Authorization: Bearer $STATS_API_KEY" http://127.0.0.1:3100/api/v1/status
```
Die Daten werden im Docker-Volume `stats-data` gespeichert. Der 24-Stunden-Verlauf füllt sich erst mit laufender Datenerfassung.

## Stream Deck
1. Die `.streamDeckPlugin`-Datei aus einem erfolgreichen Build oder Release beziehen.
2. Unter Windows mit der Stream-Deck-Software öffnen und installieren.
3. Eine der sechs Aktionen auf eine Taste ziehen.
4. In den Aktionseinstellungen die erreichbare API-Basis-URL (z. B. `http://127.0.0.1:3100/` für lokale Installation) und denselben API-Schlüssel eintragen.
5. Für jede verwendete Taste die Einstellungen hinterlegen.

## Einschränkungen
- Die öffentliche Serverliste liefert Spielerzahlen, aber keine verlässliche Admin-Anzahl und keinen echten Game-Server-Ping. Diese beiden Tasten zeigen `N/V` an.
- Ohne laufende API gibt es keine aktuellen Werte und keinen historischen Verlauf.
- Ein erfolgreiches CI-Build ersetzt keinen manuellen Windows- und Stream-Deck-Hardwaretest.
- API-Schlüssel werden in den Stream-Deck-Aktionseinstellungen gespeichert. Dafür nur einen dedizierten, eingeschränkten Schlüssel verwenden.
