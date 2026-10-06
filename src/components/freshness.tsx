import { useEffect, useState } from "react";
import { getUpstreamStatus, type UpstreamStatus } from "@/lib/upstream-status";

export function Freshness({ initial }: { initial: UpstreamStatus | null }) {
  const [status, setStatus] = useState(initial);

  useEffect(() => {
    if (status) return;
    let cancelled = false;
    const timers = [1200, 4000].map((delay) =>
      window.setTimeout(() => {
        void getUpstreamStatus().then((next) => {
          if (!cancelled && next) setStatus(next);
        });
      }, delay),
    );
    return () => {
      cancelled = true;
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [status]);

  if (!status) return null;
  if (status.error) return <p className="max-w-sm text-sm text-muted">{status.error}</p>;

  const stale = status.items.filter((item) => item.behind);
  if (stale.length === 0) {
    return (
      <p className="text-sm text-muted">
        <span className="text-fg">Up to date</span>
        {" · "}
        checked {formatChecked(status.checkedAt)}
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
      <p className="mt-2 text-sm text-muted">Checked {formatChecked(status.checkedAt)}</p>
    </div>
  );
}

function formatChecked(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
