import "server-only";
import { watches, type Watch } from "@/data/upstream";
import { githubHeaders } from "@/lib/github";
import type { UpstreamItem, UpstreamStatus } from "@/lib/upstream-types";

const TTL_MS = 60 * 60 * 1000;
const ERROR_TTL_MS = 10 * 60 * 1000;

type Cache = UpstreamStatus & { pins: string };

let cache: Cache | null = null;
let pending: Promise<void> | null = null;

function pinKey() {
  return watches.map((watch) => `${watch.id}:${watch.pinnedSha}:${watch.pinnedRelease ?? ""}`).join("|");
}

function fresh(): UpstreamStatus | null {
  const pins = pinKey();
  const ttl = cache?.error ? ERROR_TTL_MS : TTL_MS;
  if (cache && cache.pins === pins && Date.now() - cache.checkedAt < ttl) {
    return { checkedAt: cache.checkedAt, items: cache.items, error: cache.error };
  }
  return null;
}

/** Waits for this instance's check. The client poll uses this so a cold cache still resolves. */
export async function waitForUpstreamStatus(): Promise<UpstreamStatus> {
  const hit = fresh();
  if (hit) return hit;
  await refresh(pinKey());
  return (
    fresh() ?? {
      checkedAt: Date.now(),
      items: [],
      error: "Could not check for updates.",
    }
  );
}

function refresh(pins: string): Promise<void> {
  if (!pending) {
    pending = runRefresh(pins).finally(() => {
      pending = null;
    });
  }
  return pending;
}

async function runRefresh(pins: string) {
  try {
    const items = await Promise.all(watches.map(readWatch));
    cache = { pins, checkedAt: Date.now(), items, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not check for updates.";
    cache = { pins, checkedAt: Date.now(), items: [], error: message };
  }
}

async function readWatch(watch: Watch): Promise<UpstreamItem> {
  const commitsUrl = new URL(`https://api.github.com/repos/${watch.repo}/commits`);
  commitsUrl.searchParams.set("sha", "main");
  commitsUrl.searchParams.set("per_page", "1");
  if (watch.path) commitsUrl.searchParams.set("path", watch.path);
  const latest = await githubJson<{ sha?: string; commit?: { message?: string } }[]>(commitsUrl);
  const commit = latest[0];
  let releaseMoved = false;
  if (watch.pinnedRelease) {
    const release = await githubJson<{ tag_name?: string }>(
      `https://api.github.com/repos/${watch.repo}/releases/latest`,
    );
    releaseMoved = release.tag_name !== watch.pinnedRelease;
  }
  const compareUrl = watch.path
    ? `https://github.com/${watch.repo}/commits/main/${watch.path}`
    : `https://github.com/${watch.repo}/compare/${watch.pinnedSha}...main`;
  return {
    id: watch.id,
    label: watch.label,
    behind: (commit?.sha !== undefined && commit.sha !== watch.pinnedSha) || releaseMoved,
    subject: commit?.commit?.message?.split("\n")[0] ?? null,
    compareUrl,
  };
}

async function githubJson<T>(url: string | URL): Promise<T> {
  const response = await fetch(url, {
    headers: githubHeaders({ Accept: "application/vnd.github+json" }),
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });
  if (response.status === 403 || response.status === 429) {
    throw new Error(limitMessage(response));
  }
  if (!response.ok) throw new Error("Could not check for updates.");
  return (await response.json()) as T;
}

function limitMessage(response: Response) {
  const reset = Number(response.headers.get("x-ratelimit-reset"));
  if (!Number.isFinite(reset) || reset <= 0) return "GitHub is limiting update checks. Try again shortly.";
  const when = new Date(reset * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `GitHub is limiting update checks until ${when}. The map itself is unchanged.`;
}
