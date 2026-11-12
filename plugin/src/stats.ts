export type Stats = {
  online: boolean | null;
  stale: boolean;
  players: { current: number | null; maximum: number | null; record: number };
  adminsOnline: number | null;
  latencyMs: number | null;
  lastUpdated: string | null;
  source: string;
};
export type Sample = { timestamp: string; players: number };
export type History = { period: "24h"; samples: Sample[] };

export async function fetchStats(apiBase: string, apiKey: string): Promise<Stats> {
  const url = new URL("api/v1/status", apiBase.endsWith("/") ? apiBase : apiBase + "/");
  const response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Statistics API HTTP ${response.status}`);
  return await response.json() as Stats;
}
export async function fetchHistory(apiBase: string, apiKey: string): Promise<History> {
  const url = new URL("api/v1/history?period=24h", apiBase.endsWith("/") ? apiBase : apiBase + "/");
  const response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`History API HTTP ${response.status}`);
  return await response.json() as History;
}
export const REFRESH_INTERVAL_MS = 60_000;
export const HISTORY_PERIOD = "24h";
