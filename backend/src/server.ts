import express from "express";
import helmet from "helmet";
import { timingSafeEqual } from "node:crypto";

const app = express();
app.use(helmet());
app.disable("x-powered-by");
const port = Number(process.env.PORT || 3100);
const apiKey = process.env.STATS_API_KEY;
const demo = process.env.DEMO_MODE === "true";

type Snapshot = { online: boolean; players: { current: number; maximum: number; record: number }; adminsOnline: number; lastUpdated: string };
const demoSnapshot: Snapshot = { online: true, players: { current: 12, maximum: 100, record: 28 }, adminsOnline: 2, lastUpdated: new Date().toISOString() };
const history: { timestamp: string; players: number }[] = [];

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
  if (!demo) { res.status(503).json({ error: "Game server adapter not configured" }); return; }
  res.json({ ...demoSnapshot, lastUpdated: new Date().toISOString(), source: "demo" });
});
app.get("/api/v1/history", (req, res) => {
  if (!demo) { res.status(503).json({ error: "Game server adapter not configured" }); return; }
  const period = req.query.period === "24h" ? "24h" : null;
  if (!period) { res.status(400).json({ error: "Supported period: 24h" }); return; }
  res.json({ period, samples: history, source: "demo" });
});
// Historical samples and the record require a persistent database in the next milestone.
app.listen(port, () => console.log(`Stats API listening on :${port}; demo=${demo}`));
