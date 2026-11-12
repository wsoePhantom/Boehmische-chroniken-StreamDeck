import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import type { Stats, History, Sample } from "./stats.js";

const URL = "https://kcd-mp.com/server-list";
const ADDRESS = "45.132.88.78:7777";
const PERIOD = 86_400_000;
const REFRESH = 60_000;
const file = join(process.env.APPDATA || join(homedir(), "AppData", "Roaming"), "BoehmischeChroniken", "streamdeck-stats.json");
type State = { record: number; samples: Sample[]; latest: { players: number; maximum: number; at: string } | null };
let state: State = { record: 0, samples: [], latest: null };
let initialized: Promise<void> | undefined;
let inflight: Promise<void> | undefined;
let lastAttempt = 0;
function textOf(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/\s+/g, " ").trim();
}
export function parseListing(html: string): { players: number; maximum: number } | null {
  const rows = html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
  const row = rows.find(r => textOf(r).includes(ADDRESS));
  if (!row) return null;
  const cells = row.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi) || [];
  const matches = cells.flatMap(c => [...textOf(c).matchAll(/\b(\d+)\s*\/\s*(\d+)\b/g)]);
  if (matches.length !== 1) return null;
  const players = Number(matches[0][1]), maximum = Number(matches[0][2]);
  if (!Number.isSafeInteger(players) || !Number.isSafeInteger(maximum) || players < 0 || maximum < 1 || players > maximum) return null;
  return { players, maximum };
}
function trim() {
  const now = Date.now();
  state.samples = state.samples.filter(s => Number.isSafeInteger(s.players) && s.players >= 0 && Number.isFinite(Date.parse(s.timestamp)) && Date.parse(s.timestamp) >= now - PERIOD && Date.parse(s.timestamp) <= now);
}
async function initialize() {
  try {
    const raw: unknown = JSON.parse(await readFile(file, "utf8"));
    if (raw && typeof raw === "object") {
      const value = raw as Partial<State>;
      if (Number.isSafeInteger(value.record) && (value.record ?? -1) >= 0 && Array.isArray(value.samples)) {
        state = { record: value.record!, samples: value.samples, latest: value.latest ?? null };
        trim();
      }
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") console.warn("Cannot load local statistics:", e);
  }
}
async function poll() {
  const response = await fetch(URL, { headers: { Accept: "text/html" }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Master list HTTP " + response.status);
  const listing = parseListing(await response.text());
  if (!listing) throw new Error("Server not found in public listing");
  const at = new Date().toISOString();
  state.latest = { ...listing, at };
  state.record = Math.max(state.record, listing.players);
  state.samples.push({ timestamp: at, players: listing.players });
  trim();
  await mkdir(dirname(file), { recursive: true });
  const temp = file + ".tmp";
  await writeFile(temp, JSON.stringify(state), { mode: 0o600 });
  await rename(temp, file);
}
export async function refresh(): Promise<void> {
  initialized ??= initialize();
  await initialized;
  if (inflight) return inflight;
  if (Date.now() - lastAttempt < REFRESH) return;
  lastAttempt = Date.now();
  inflight = poll().catch(e => { console.warn("Local stats poll failed:", e); }).finally(() => { inflight = undefined; });
  return inflight;
}
export function getStats(): Stats {
  trim();
  const fresh = state.latest !== null && Date.now() - Date.parse(state.latest.at) <= REFRESH * 2;
  return {
    online: fresh ? true : null, stale: !fresh,
    players: { current: fresh ? state.latest!.players : null, maximum: state.latest?.maximum ?? null, record: state.record },
    adminsOnline: null, latencyMs: null, lastUpdated: state.latest?.at ?? null, source: "public-master-list-local"
  };
}
export function getHistory(): History {
  trim();
  return { period: "24h", samples: [...state.samples] };
}
