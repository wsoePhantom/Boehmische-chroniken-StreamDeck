# Böhmische Chroniken – Stream Deck (development preview)

Six Stream Deck actions are registered in `src/plugin.ts`: status, player count, peak, ping, admins, and 24-hour history.

## Build
On pushes to `dev`, GitHub Actions attempts to compile the backend, run backend tests, bundle the Stream Deck entrypoint and assemble an **unpacked** `.sdPlugin` directory. The build artifact is not a signed or officially packaged `.streamDeckPlugin` installer. Inspect the workflow run before using it.

The Property Inspector at `property-inspector/index.html` configures API base URL and bearer key per button. The key is stored in action settings; do not reuse a privileged server credential.

## Current limitations
- The master-list HTML parser has not been validated against live markup; no successful live data ingestion is established.
- The 24-hour button shows the sample count, not a graph.
- Ping and admin counts have no data source and display N/V.
- The backend must remain running for history and record collection.
- The plugin has not been tested on a physical Stream Deck.
