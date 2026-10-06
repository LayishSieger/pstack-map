import { useEffect, useState } from "react";
import { watches, type Watch } from "@/data/upstream";

type Item = {
  id: Watch["id"];
  label: string;
  behind: boolean;
  subject: string | null;
  compareUrl: string;
};

type Status =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; items: Item[] };

export function Freshness() {
  const [status, setStatus] = useState<Status>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    void loadOnce().then((next) => {
      if (!cancelled) setStatus(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.state === "loading") return <p className="mb-4 text-sm text-muted">Checking the skill repos.</p>;

  if (status.state === "error") {
    return (
      <p className="mb-4 rounded-card border border-line bg-surface px-3 py-2 text-sm text-muted">{status.message}</p>
    );
  }

  const stale = status.items.filter((item) => item.behind);
  if (stale.length === 0) {
    return <p className="mb-4 text-sm text-muted">Current with pstack and Matt Pocock skills on main.</p>;
  }

  return (
    <div className="mb-4 rounded-card border border-mark bg-surface px-3 py-3">
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
    </div>
  );
}

let pending: Promise<Status> | null = null;

async function loadOnce() {
  if (!pending) pending = loadStatus();
  return pending;
}

async function loadStatus(): Promise<Status> {
  try {
    const items = await Promise.all(watches.map(readWatch));
    return { state: "ready", items };
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
