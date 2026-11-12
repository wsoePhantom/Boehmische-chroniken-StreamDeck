import streamDeck, { action, SingletonAction, type WillAppearEvent, type WillDisappearEvent, type DidReceiveSettingsEvent, } from "@elgato/streamdeck";
import { REFRESH_INTERVAL_MS, type Stats } from "./stats.js";
import { refresh, getStats, getHistory } from "./local-stats.js";

type Settings = { [key: string]: string | undefined };
type Metric = "status" | "players" | "record" | "ping" | "admins" | "history";

function svg(label: string, value: string, color = "#e5e7eb"): string {
  const safe = (s: string) => s.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&apos;" }[c]!));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144"><rect width="144" height="144" rx="15" fill="#1e2b24"/><text x="72" y="48" fill="#aab8ac" font-size="15" font-family="Arial" text-anchor="middle">${safe(label)}</text><text x="72" y="93" fill="${color}" font-size="25" font-weight="bold" font-family="Arial" text-anchor="middle">${safe(value)}</text></svg>`;
}
function imageData(svgString: string): string {
  return "data:image/svg+xml;base64," + Buffer.from(svgString, "utf8").toString("base64");
}
function historySvg(samples: { timestamp: string; players: number }[]): string {
  const now = Date.now();
  const points = samples.filter(s => Number.isFinite(s.players) && s.players >= 0 && Number.isFinite(Date.parse(s.timestamp)) && Date.parse(s.timestamp) >= now - 86_400_000 && Date.parse(s.timestamp) <= now).sort((a,b) => Date.parse(a.timestamp)-Date.parse(b.timestamp));
  if (!points.length) return svg("24H VERLAUF", "KEINE DATEN");
  const max = Math.max(1, ...points.map(s => s.players));
  const path = points.map((s,i) => {
    const x = 12 + (Date.parse(s.timestamp) - (now - 86_400_000)) / 86_400_000 * 120;
    const y = 119 - s.players / max * 65;
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const current = points[points.length-1].players;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144"><rect width="144" height="144" rx="15" fill="#1e2b24"/><text x="72" y="24" fill="#aab8ac" font-size="15" font-family="Arial" text-anchor="middle">SPIELER 24H</text><text x="72" y="49" fill="#ffffff" font-size="20" font-weight="bold" font-family="Arial" text-anchor="middle">${current}</text><path d="${path}" stroke="#70d69b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" fill="none"/><text x="12" y="136" fill="#aab8ac" font-size="10">-24h</text><text x="132" y="136" fill="#aab8ac" font-size="10" text-anchor="end">jetzt</text></svg>`;
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
class MetricAction extends SingletonAction<Settings> {
  private readonly timers = new Map<string, ReturnType<typeof setInterval>>();
  private readonly settings = new Map<string, Settings>();
  constructor(private readonly metric: Metric) { super(); }
  override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    const key = ev.action.id;
    this.settings.set(key, ev.payload.settings);
    const existing = this.timers.get(key);
    if (existing) clearInterval(existing);
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
    try {
      await refresh();
      const stats = getStats();
      const [label, value, color] = display(this.metric, stats);
      if (this.metric === "history") {
        const history = getHistory();
        await target.setImage(imageData(historySvg(history.samples)));
      } else {
        await target.setImage(imageData(svg(label, value, color)));
      }
    } catch (error) {
      streamDeck.logger.error("Rendering failed:", error);
      try { await target.setImage(imageData(svg("VERBINDUNG", "FEHLER", "#ef8585"))); }
      catch (imageError) { streamDeck.logger.error("Setting error image failed:", imageError); }
    }
  }
}

@action({ UUID: "de.boehmischechroniken.stats.status" })
class StatusAction extends MetricAction { constructor() { super("status"); } }

@action({ UUID: "de.boehmischechroniken.stats.players" })
class PlayersAction extends MetricAction { constructor() { super("players"); } }

@action({ UUID: "de.boehmischechroniken.stats.record" })
class RecordAction extends MetricAction { constructor() { super("record"); } }

@action({ UUID: "de.boehmischechroniken.stats.ping" })
class PingAction extends MetricAction { constructor() { super("ping"); } }

@action({ UUID: "de.boehmischechroniken.stats.admins" })
class AdminsAction extends MetricAction { constructor() { super("admins"); } }

@action({ UUID: "de.boehmischechroniken.stats.history" })
class HistoryAction extends MetricAction { constructor() { super("history"); } }
streamDeck.actions.registerAction(new StatusAction());
streamDeck.actions.registerAction(new PlayersAction());
streamDeck.actions.registerAction(new RecordAction());
streamDeck.actions.registerAction(new PingAction());
streamDeck.actions.registerAction(new AdminsAction());
streamDeck.actions.registerAction(new HistoryAction());
void streamDeck.connect();
void refresh();
setInterval(() => { void refresh(); }, REFRESH_INTERVAL_MS);
