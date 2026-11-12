export type PublicServerStatus = { online: boolean; players: number; maxPlayers: number; names: string[]; latencyMs: number; checkedAt: string };

/** Read-only KCD:MP status adapter. The TCP status port must be enabled by the host. */
export async function queryKcdmpStatus(baseUrl: string): Promise<PublicServerStatus> {
  const url = new URL(baseUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsupported protocol");
  const start = performance.now();
  const response = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`KCD:MP status HTTP ${response.status}`);
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") throw new Error("Invalid server response");
  const data = payload as Record<string, unknown>;
  // Field mapping is intentionally strict until a real response can be inspected.
  const players = data.players;
  const maxPlayers = data.max_players;
  if (typeof players !== "number" || typeof maxPlayers !== "number") throw new Error("Unknown KCD:MP status schema");
  return { online: true, players, maxPlayers, names: Array.isArray(data.player_names) ? data.player_names.filter((v): v is string => typeof v === "string") : [], latencyMs: Math.round(performance.now() - start), checkedAt: new Date().toISOString() };
}
