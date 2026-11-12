import express from "express";
import helmet from "helmet";
import { timingSafeEqual } from "node:crypto";
import { fetchPublicListing, POLL_INTERVAL_MS } from "./master-list.js";
import { StatsStore } from "./store.js";

const app = express();
app.use(helmet());
app.disable("x-powered-by");
const port = Number(process.env.PORT || 3100);
const apiKey = process.env.STATS_API_KEY;
const store = new StatsStore(process.env.STATS_DATA_FILE || "./data/stats.json");
let lastError: string | null = null;
let lastAttempt: string | null = null;

function authorized(value: string | undefined) {
  if (!apiKey || !value?.startsWith("Bearer ")) return false;
  const given = Buffer.from(value.slice(7));
  const expected = Buffer.from(apiKey);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
app.use("/api/v1", (req, res, next) => {
  if (!authorized(req.header("authorization"))) { res.status(401).json({ error: "Unauthorized" }); return; }
  next();
});
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/api/v1/status", (_req, res) => {
  const state = store.snapshot();
  const age = state.latest ? Date.now() - Date.parse(state.latest.checkedAt) : Infinity;
  res.json({
    online: age <= POLL_INTERVAL_MS * 2 ? true : null,
    players: { current: age <= POLL_INTERVAL_MS * 2 ? state.latest?.players : null, maximum: state.latest?.maxPlayers ?? null, record: state.record },
    adminsOnline: null,
    latencyMs: null,
    lastUpdated: state.latest?.checkedAt ?? null,
    lastAttempt, lastError,
    source: "public-master-list",
    stale: age > POLL_INTERVAL_MS * 2
  });
});
app.get("/api/v1/history", (req, res) => {
  if (req.query.period !== "24h") { res.status(400).json({ error: "Supported period: 24h" }); return; }
  res.json({ period: "24h", samples: store.snapshot().history, source: "public-master-list" });
});

async function poll() {
  lastAttempt = new Date().toISOString();
  try {
    const result = await fetchPublicListing();
    if (!result) throw new Error("Target server not found or master-list schema unsupported");
    await store.record(result);
    lastError = null;
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    console.error("Master-list polling failed:", lastError);
  }
}
await store.load();
await poll();
setInterval(() => { void poll(); }, POLL_INTERVAL_MS);
app.listen(port, () => console.log(`Stats API listening on :${port}`));
