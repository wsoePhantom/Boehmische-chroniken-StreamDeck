import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { ServerListing } from "./master-list.js";

export type Sample = { timestamp: string; players: number };
export type StoredStats = { record: number; history: Sample[]; latest: ServerListing | null };
const defaultState = (): StoredStats => ({ record: 0, history: [], latest: null });

export class StatsStore {
  private state: StoredStats = defaultState();
  constructor(private readonly path: string) {}

  async load(): Promise<void> {
    try {
      const parsed: unknown = JSON.parse(await readFile(this.path, "utf8"));
      if (!parsed || typeof parsed !== "object") throw new Error("Invalid store");
      const obj = parsed as Partial<StoredStats>;
      if (!Number.isSafeInteger(obj.record) || (obj.record ?? -1) < 0 || !Array.isArray(obj.history)) throw new Error("Invalid store");
      this.state = { record: obj.record!, history: obj.history.filter((v): v is Sample =>
        typeof v?.timestamp === "string" && Number.isSafeInteger(v.players) && v.players >= 0
      ), latest: obj.latest ?? null };
      this.trim();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  private trim(now = Date.now()) {
    this.state.history = this.state.history.filter(s => {
      const time = Date.parse(s.timestamp);
      return Number.isFinite(time) && time <= now && time >= now - 86_400_000;
    });
  }

  async record(snapshot: ServerListing): Promise<void> {
    this.state.record = Math.max(this.state.record, snapshot.players);
    this.state.latest = snapshot;
    this.state.history.push({ timestamp: snapshot.checkedAt, players: snapshot.players });
    this.trim();
    await mkdir(dirname(this.path), { recursive: true });
    const temp = this.path + ".tmp";
    await writeFile(temp, JSON.stringify(this.state), { mode: 0o600 });
    await rename(temp, this.path);
  }

  snapshot(): StoredStats {
    this.trim();
    return { record: this.state.record, latest: this.state.latest, history: [...this.state.history] };
  }
}
