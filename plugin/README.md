# Böhmische Chroniken Stream Deck

Six SDK actions are registered in `src/plugin.ts`: server status, player count, record, ping, admins and 24-hour history.

The Property Inspector at `property-inspector/index.html` allows configuring the API base URL and bearer key per button.

**Not installable yet.** A validated `manifest.json`, required icon assets, SDK build and packaged `.streamDeckPlugin` are still outstanding. The 24h action currently shows the sample count, not a sparkline. The master-list adapter has not been validated against live HTML.

Backend: run `npm install` and `npm run dev -w backend` from the repo root, set `STATS_API_KEY` first. The backend must remain running for the history and record to accumulate.
