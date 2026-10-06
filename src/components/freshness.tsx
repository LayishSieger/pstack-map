import { useEffect, useState } from "react";
import { watches, type Watch } from "@/data/upstream";

const CACHE_KEY = "pstack-map.upstream";
const TTL_MS = 60 * 60 * 1000;

type Item = {
  id: Watch["id"];
  label: string;
  behind: boolean;
  subject: string | null;
  compareUrl: string;
};

type Ready = { state: "ready"; items: Item[]; checkedAt: number };

type Status = { state: "idle" } | { state: "checking"; previous: Ready | null } | { state: "error"; message: string; previous: Ready | null } | Ready;

type Cache = {
  at: number;
  pins: { id: Watch["id"]; sha: string; release: string | null }[];
  items: Item[];
};

export function Freshness() {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  useEffect(() => {
    const cached = readCache();
    if (cached && Date.now() - cached.at < TTL_MS) {
      setStatus({ state: "ready", items: cached.items, checkedAt: cached.at });
      return;
    }
    let cancelled = false;
    const previous: Ready | null = cached ? { state: "ready", items: cached.items, checkedAt: cached.at } : null;
    setStatus({ state: "checking", previous });
    void loadOnce()
      .then((next) => {
        if (cancelled) return;
        if (next.state === "ready") writeCache(next);
        setStatus(next.state === "error" ? { ...next, previous } : next);
      })
      .catch(() => {
        if (!cancelled) setStatus({ state: "error", message: "Could not check for updates.", previous });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const previous = status.state === "checking" || status.state === "error" ? status.previous : null;
  const ready = status.state === "ready" ? status : previous;
  const stale = ready?.items.filter((item) => item.behind) ?? [];
  const checking = status.state === "checking";

  if (status.state === "idle" || (checking && !ready)) {
    return <p className="text-sm text-muted">{checking ? "Checking upstream" : ""}</p>;
  }

  if (!ready) {
    return (
      <p className="max-w-sm text-sm text-muted">{status.state === "error" ? status.message : "Could not check for updates."}</p>
    );
  }

  if (stale.length === 0) {
    return (
      <p className="text-sm text-muted">
        <span className="text-fg">Up to date</span>
        {" · "}
        checked {formatChecked(ready.checkedAt)}
        {checking ? " · checking again" : ""}
        {status.state === "error" ? ` · ${status.message}` : ""}
      </p>
    );
  }

  return (
    <div className="basis-full rounded-card border border-mark bg-surface px-3 py-3">
      <p className="text-sm font-medium">This map is out of date.</p>
      <ul className="mt-2 space-y-2">
        {stale.map((item) => (
          <li key={item.id} className="text-sm leading-relaxed text-muted">
            <span className="text-fg">{item.label}</span> moved{item.subject ? `: ${item.subject}` : ""}.{" "}
            <a href={item.compareUrl} target="_blank" rel="noreferrer" className="text-accent">
              See the commits
            </a>
            . Ask to update the site and the pins will move with it.
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-muted">
        Checked {formatChecked(ready.checkedAt)}
        {checking ? " · checking again" : ""}
      </p>
    </div>
  );
}

function formatChecked(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function currentPins(): Cache["pins"] {
  return watches.map((watch) => ({ id: watch.id, sha: watch.pinnedSha, release: watch.pinnedRelease }));
}

function readCache(): Cache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cache;
    if (typeof parsed.at !== "number" || !Array.isArray(parsed.items) || !Array.isArray(parsed.pins)) return null;
    const pins = currentPins();
    const same = pins.every((pin) => parsed.pins.some((saved) => saved.id === pin.id && saved.sha === pin.sha && saved.release === pin.release));
    if (!same || parsed.pins.length !== pins.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(status: Ready) {
  const cache: Cache = { at: status.checkedAt, pins: currentPins(), items: status.items };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Private mode or a full disk. The page still shows this result.
  }
}

async function loadOnce() {
  if (!pending) pending = loadStatus();
  return pending;
}

let pending: Promise<Ready | { state: "error"; message: string }> | null = null;

async function loadStatus(): Promise<Ready | { state: "error"; message: string }> {
  try {
    const items = await Promise.all(watches.map(readWatch));
    return { state: "ready", items, checkedAt: Date.now() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not check for updates.";
    return { state: "error", message };
  }
}

async function readWatch(watch: Watch): Promise<Item> {
  const commitsUrl = new URL(`https://api.github.com/repos/${watch.repo}/commits`);
  commitsUrl.searchParams.set("sha", "main");
  commitsUrl.searchParams.set("per_page", "1");
  if (watch.path) commitsUrl.searchParams.set("path", watch.path);
  const commitsResponse = await fetch(commitsUrl, { headers: { Accept: "application/vnd.github+json" } });
  if (commitsResponse.status === 403 || commitsResponse.status === 429) {
    throw new Error(limitMessage(commitsResponse));
  }
  if (!commitsResponse.ok) throw new Error("Could not check for updates.");
  const commits = (await commitsResponse.json()) as { sha?: string; commit?: { message?: string } }[];
  const latest = commits[0];
  let releaseMoved = false;
  if (watch.pinnedRelease) {
    const releaseResponse = await fetch(`https://api.github.com/repos/${watch.repo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (releaseResponse.status === 403 || releaseResponse.status === 429) throw new Error(limitMessage(releaseResponse));
    if (!releaseResponse.ok) throw new Error("Could not check for updates.");
    const release = (await releaseResponse.json()) as { tag_name?: string };
    releaseMoved = release.tag_name !== watch.pinnedRelease;
  }
  const compareUrl = watch.path
    ? `https://github.com/${watch.repo}/commits/main/${watch.path}`
    : `https://github.com/${watch.repo}/compare/${watch.pinnedSha}...main`;
  return {
    id: watch.id,
    label: watch.label,
    behind: (latest?.sha !== undefined && latest.sha !== watch.pinnedSha) || releaseMoved,
    subject: latest?.commit?.message?.split("\n")[0] ?? null,
    compareUrl,
  };
}

function limitMessage(response: Response) {
  const reset = Number(response.headers.get("x-ratelimit-reset"));
  if (!Number.isFinite(reset) || reset <= 0) return "GitHub is limiting update checks. Try again shortly.";
  const when = new Date(reset * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `GitHub is limiting update checks until ${when}. The map itself is unchanged.`;
}
