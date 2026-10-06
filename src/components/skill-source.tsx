"use client";

import { useEffect, useRef, useState } from "react";
import { sourceOf } from "@/catalog";
import { SkillMarkdownView } from "@/components/skill-markdown-view";
import { loadSkillText } from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";

type Load = {
  id: string;
  status: "loading" | "ready" | "error";
  text: string;
  href: string;
  truncated: boolean;
  error: string | null;
};

export function SkillSource({ id }: { id: string }) {
  const source = sourceOf(id);
  const request = useRef(0);
  const [load, setLoad] = useState<Load>({
    id,
    status: "loading",
    text: "",
    href: "",
    truncated: false,
    error: null,
  });

  if (load.id !== id) {
    setLoad({ id, status: "loading", text: "", href: "", truncated: false, error: null });
  }

  useEffect(() => {
    if (!sourceOf(id)) return;
    const ticket = ++request.current;
    void loadSkillText(id)
      .then((result) => {
        if (ticket !== request.current) return;
        setLoad({
          id,
          status: result.ok ? "ready" : "error",
          text: result.text,
          href: result.href,
          truncated: result.truncated,
          error: result.error,
        });
      })
      .catch(() => {
        if (ticket !== request.current) return;
        setLoad({
          id,
          status: "error",
          text: "",
          href: "",
          truncated: false,
          error: "Could not load the file.",
        });
      });
    return () => {
      request.current += 1;
    };
  }, [id]);

  if (!source) return null;

  const href = load.href || source.href;

  return (
    <div className="flex flex-col gap-3">
      <a href={`/skills/${id}`} className="w-fit text-sm text-primary">
        Open the skill page
      </a>
      <a href={href} target="_blank" rel="noreferrer" className="w-fit text-sm text-primary">
        Open <span className="font-mono text-xs break-all">{source.path}</span>
      </a>
      <div className="flex flex-col gap-3 rounded-xl bg-background p-3 ring-1 ring-foreground/10">
        {load.status === "loading" ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Loading the file from GitHub.</p>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : null}
        {load.status === "error" ? <p className="text-sm text-muted-foreground">{load.error}</p> : null}
        {load.status === "ready" ? (
          <>
            <SkillMarkdownView text={load.text} />
            {load.truncated ? (
              <p className="text-sm text-muted-foreground">Truncated. The rest is on GitHub.</p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
