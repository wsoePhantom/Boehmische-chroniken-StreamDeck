export type Stats = {
  online: boolean | null;
  stale: boolean;
  players: { current: number | null; maximum: number | null; record: number };
  lastUpdated: string | null;
  source: "public-master-list-local";
};
export type Sample = { timestamp: string; players: number };
export type History = { period: "5h"; samples: Sample[] };
export const REFRESH_INTERVAL_MS = 60_000;
