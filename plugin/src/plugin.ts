import streamDeck, { action, SingletonAction, type WillAppearEvent, type WillDisappearEvent, type DidReceiveSettingsEvent, } from "@elgato/streamdeck";
import { fetchStats, fetchHistory, REFRESH_INTERVAL_MS, type Stats } from "./stats.js";

type Settings = { apiBase?: string; apiKey?: string; [key: string]: string | undefined };
type Metric = "status" | "players" | "record" | "ping" | "admins" | "history";

function svg(label: string, value: string, color = "#e5e7eb"): string {
  const safe = (s: string) => s.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&apos;" }[c]!));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144"><rect width="144" height="144" rx="15" fill="#1e2b24"/><text x="72" y="48" fill="#aab8ac" font-size="15" font-family="Arial" text-anchor="middle">${safe(label)}</text><text x="72" y="93" fill="${color}" font-size="25" font-weight="bold" font-family="Arial" text-anchor="middle">${safe(value)}</text></svg>`;
}
function imageData(svgString: string): string {
  return "data:image/svg+xml," + encodeURIComponent(svgString);
}
function display(metric: Metric, stats: Stats): [string, string, string] {
  switch (metric) {
    case "status": return ["SERVER", stats.online === null ? "UNBEKANNT" : stats.online ? "ONLINE" : "OFFLINE", stats.online === true ? "#70d69b" : "#efb56b"];
    case "players": return ["SPIELER", stats.players.current === null ? "–" : `${stats.players.current}/${stats.players.maximum ?? "?"}`, "#ffffff"];
    case "record": return ["REKORD", String(stats.players.record), "#edca80"];
    case "ping": return ["PING", stats.latencyMs === null ? "N/V" : `${stats.latencyMs} ms`, "#ffffff"];
    case "admins": return ["ADMINS", stats.adminsOnline === null ? "N/V" : String(stats.adminsOnline), "#ffffff"];
    case "history": return ["24H", "VERLAUF", "#ffffff"];
  }
}
class StatusAction extends SingletonAction<Settings> {
  private readonly timers = new Map<string, ReturnType<typeof setInterval>>();
  private readonly settings = new Map<string, Settings>();
  constructor(private readonly metric: Metric) { super(); }
  override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    const key = ev.action.id;
    this.settings.set(key, ev.payload.settings);
    await this.render(ev.action, ev.payload.settings);
    this.timers.set(key, setInterval(() => { void this.render(ev.action, this.settings.get(key) ?? {}); }, REFRESH_INTERVAL_MS));
  }
  override onWillDisappear(ev: WillDisappearEvent<Settings>): void {
    const timer = this.timers.get(ev.action.id);
    if (timer) clearInterval(timer);
    this.timers.delete(ev.action.id);
    this.settings.delete(ev.action.id);
  }
  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
    this.settings.set(ev.action.id, ev.payload.settings);
    await this.render(ev.action, ev.payload.settings);
  }
  private async render(target: { setImage(image: string): Promise<void> }, settings: Settings): Promise<void> {
    if (!settings.apiBase || !settings.apiKey) {
      await target.setImage(imageData(svg("SETUP", "API FEHLT", "#efb56b")));
      return;
    }
    try {
      const stats = await fetchStats(settings.apiBase, settings.apiKey);
      const [label, value, color] = display(this.metric, stats);
      if (this.metric === "history") {
        const history = await fetchHistory(settings.apiBase, settings.apiKey);
        await target.setImage(imageData(svg("24H", history.samples.length ? `${history.samples.length} PUNKTE` : "KEINE DATEN")));
      } else {
        await target.setImage(imageData(svg(label, value, color)));
      }
    } catch {
      await target.setImage(imageData(svg("VERBINDUNG", "FEHLER", "#ef8585")));
    }
  }
}

@action({ UUID: "de.boehmischechroniken.stats.status" })
class StatusAction extends StatusAction { constructor() { super("status"); } }

@action({ UUID: "de.boehmischechroniken.stats.players" })
class PlayersAction extends StatusAction { constructor() { super("players"); } }

@action({ UUID: "de.boehmischechroniken.stats.record" })
class RecordAction extends StatusAction { constructor() { super("record"); } }

@action({ UUID: "de.boehmischechroniken.stats.ping" })
class PingAction extends StatusAction { constructor() { super("ping"); } }

@action({ UUID: "de.boehmischechroniken.stats.admins" })
class AdminsAction extends StatusAction { constructor() { super("admins"); } }

@action({ UUID: "de.boehmischechroniken.stats.history" })
class HistoryAction extends StatusAction { constructor() { super("history"); } }
streamDeck.actions.registerAction(new StatusAction());
streamDeck.actions.registerAction(new PlayersAction());
streamDeck.actions.registerAction(new RecordAction());
streamDeck.actions.registerAction(new PingAction());
streamDeck.actions.registerAction(new AdminsAction());
streamDeck.actions.registerAction(new HistoryAction());
void streamDeck.connect();
