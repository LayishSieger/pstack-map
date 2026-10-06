"use client";

import { useEffect, useState } from "react";
import { loadUpstreamStatus } from "@/lib/actions";
import type { UpstreamStatus } from "@/lib/upstream-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Freshness({ initial }: { initial: UpstreamStatus | null }) {
  const [status, setStatus] = useState(initial);

  useEffect(() => {
    if (status) return;
    let cancelled = false;
    const timers = [1200, 4000].map((delay) =>
      window.setTimeout(() => {
        void loadUpstreamStatus()
          .then((next) => {
            if (!cancelled && next) setStatus(next);
          })
          .catch(() => null);
      }, delay),
    );
    return () => {
      cancelled = true;
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [status]);

  if (!status) return null;
  if (status.error) {
    return <p className="text-sm text-muted-foreground sm:ms-auto">{status.error}</p>;
  }

  const stale = status.items.filter((item) => item.behind);
  if (stale.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground sm:ms-auto">
        <Badge variant="outline">Up to date</Badge>
        checked {formatChecked(status.checkedAt)}
      </p>
    );
  }

  return (
    <Card className="basis-full ring-mark sm:basis-full">
      <CardHeader>
        <CardTitle>This map is out of date.</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <ul className="flex flex-col gap-2">
          {stale.map((item) => (
            <li key={item.id} className="text-sm leading-relaxed text-muted-foreground">
              <span className="text-foreground">{item.label}</span> moved{item.subject ? `: ${item.subject}` : ""}.{" "}
              <a href={item.compareUrl} target="_blank" rel="noreferrer" className="text-primary">
                See the commits
              </a>
              . Ask to update the site and the pins will move with it.
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">Checked {formatChecked(status.checkedAt)}</p>
      </CardContent>
    </Card>
  );
}

function formatChecked(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
