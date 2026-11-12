/** Public KCD:MP server list polling (no game-server TCP port required).
 * The public list is an HTML page, not a documented JSON API.
 * We deliberately fail closed if its markup changes.
 */
export const MASTER_LIST_URL = "https://kcd-mp.com/server-list";
export const TARGET_SERVER = "45.132.88.78:7777";
export const POLL_INTERVAL_MS = 60_000;
export const HISTORY_WINDOW_MS = 24 * 60 * 60_000;

export type ServerListing = {
  address: string;
  players: number;
  maxPlayers: number;
  checkedAt: string;
  source: "public-master-list";
};

export function parseServerListing(html: string, address = TARGET_SERVER): ServerListing | null {
  // Do not infer online state from a failed request or missing listing.
  // This extraction is provisional until the live page structure is verified.
  const escaped = address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`(\\d+)\\s*\\/\\s*(\\d+)[\\s\\S]{0,500}?${escaped}`, "i"));
  if (!match) return null;
  const players = Number(match[1]);
  const maxPlayers = Number(match[2]);
  if (!Number.isSafeInteger(players) || !Number.isSafeInteger(maxPlayers) || maxPlayers <= 0 || players > maxPlayers) return null;
  return { address, players, maxPlayers, checkedAt: new Date().toISOString(), source: "public-master-list" };
}

export async function fetchPublicListing(): Promise<ServerListing | null> {
  const response = await fetch(MASTER_LIST_URL, { signal: AbortSignal.timeout(8000), headers: { Accept: "text/html" } });
  if (!response.ok) throw new Error(`Master list returned HTTP ${response.status}`);
  return parseServerListing(await response.text());
}
