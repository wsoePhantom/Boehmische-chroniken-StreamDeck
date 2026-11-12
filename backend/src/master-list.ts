/** Public KCD:MP master-list reader. The HTML structure is not a stable API contract. */
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

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
}

export function parseServerListing(html: string, address = TARGET_SERVER): ServerListing | null {
  // Match only the HTML table row containing this exact server address.
  // Do not accidentally read the player count of the previous server.
  const rows = html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
  const row = rows.find(r => stripTags(r).includes(address));
  if (!row) return null;
  const text = stripTags(row);
  const escaped = address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [...text.matchAll(/\b(\d+)\s*\/\s*(\d+)\b/g)];
  if (matches.length !== 1 || !new RegExp(escaped).test(text)) return null;
  const players = Number(matches[0][1]);
  const maxPlayers = Number(matches[0][2]);
  if (!Number.isSafeInteger(players) || !Number.isSafeInteger(maxPlayers) || maxPlayers < 1 || players > maxPlayers) return null;
  return { address, players, maxPlayers, checkedAt: new Date().toISOString(), source: "public-master-list" };
}

export async function fetchPublicListing(): Promise<ServerListing | null> {
  const response = await fetch(MASTER_LIST_URL, { signal: AbortSignal.timeout(8000), headers: { Accept: "text/html" } });
  if (!response.ok) throw new Error(`Master list returned HTTP ${response.status}`);
  return parseServerListing(await response.text());
}
