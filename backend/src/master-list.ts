/** Public KCD:MP server-list reader. No undocumented JSON endpoint assumed. */
export const MASTER_LIST_URL = "https://kcd-mp.com/server-list";
export const TARGET_SERVER = "45.132.88.78:7777";
export const POLL_INTERVAL_MS = 60_000;
export const HISTORY_WINDOW_MS = 86_400_000;

export type ServerListing = {
  address: string;
  players: number;
  maxPlayers: number;
  checkedAt: string;
  source: "public-master-list";
};

function textOf(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ").trim();
}

export function parseServerListing(html: string, address = TARGET_SERVER): ServerListing | null {
  // Prefer a single table row; never pair another server's player count with our address.
  const rows = html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
  const row = rows.find(candidate => textOf(candidate).includes(address));
  if (!row) return null;
  const cells = row.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi) ?? [];
  const counts = cells.flatMap(cell => [...textOf(cell).matchAll(/\b(\d+)\s*\/\s*(\d+)\b/g)]);
  if (counts.length !== 1) return null;
  const players = Number(counts[0][1]), maxPlayers = Number(counts[0][2]);
  if (!Number.isSafeInteger(players) || !Number.isSafeInteger(maxPlayers) || players < 0 || maxPlayers < 1 || players > maxPlayers) return null;
  return { address, players, maxPlayers, checkedAt: new Date().toISOString(), source: "public-master-list" };
}

export async function fetchPublicListing(): Promise<ServerListing | null> {
  const response = await fetch(MASTER_LIST_URL, { signal: AbortSignal.timeout(8000), headers: { Accept: "text/html" } });
  if (!response.ok) throw new Error(`Master list returned HTTP ${response.status}`);
  return parseServerListing(await response.text());
}
