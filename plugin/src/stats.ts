export type Stats = {
  online: boolean;
  players: { current: number; maximum: number; record: number };
  adminsOnline: number;
  lastUpdated: string;
  source?: string;
};

export async function fetchStats(apiBase: string, apiKey: string): Promise<Stats> {
  const url = new URL("api/v1/status", apiBase.endsWith("/") ? apiBase : apiBase + "/");
  const response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Statistics API HTTP ${response.status}`);
  return await response.json() as Stats;
}

export const REFRESH_INTERVAL_MS = 60_000;
export const HISTORY_PERIOD = "24h";
