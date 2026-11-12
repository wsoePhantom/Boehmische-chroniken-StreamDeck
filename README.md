# Böhmische Chroniken – Stream Deck

Read-only KCD:MP statistics integration (in development).

## Planned metrics
- Server online/offline
- Current players / slots
- Concurrent player record
- Ping from Stream Deck host to game server
- Online admins
- Player history for 24 hours

Refresh every **60 seconds**.

## Structure
- `backend/`: Node.js TypeScript HTTP API scaffold
- `plugin/`: TypeScript API client foundation

## Run the API locally
Install Node.js 22+, then run `npm install`.
Set `STATS_API_KEY` to a strong random secret and `DEMO_MODE=true` in your shell, then run `npm run dev:api`.
Test `GET http://localhost:3100/api/v1/status` with header `Authorization: Bearer <your-secret>`.

Demo values are fictional and explicitly labeled. Without demo mode, endpoints return HTTP 503 until the KCD:MP adapter is connected. **This is not yet an installable Stream Deck plugin.**

## Next milestones
1. Connect a real read-only KCD:MP adapter.
2. Store player samples and records in PostgreSQL.
3. Add Elgato action registration, manifest, icons and property inspector.
4. Render six keys and a 24-hour chart.
5. Package and test the plugin.

Never commit credentials. Work on `dev`; merge stable releases to `main`.
