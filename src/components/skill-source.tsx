"use client";

import { useEffect, useRef, useState } from "react";
import { docFor } from "@/data/docs";
import { loadSkillText } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Load = {
  status: "idle" | "loading" | "ready" | "error";
  text: string;
  href: string;
  truncated: boolean;
  error: string | null;
};

export function SkillSource({ id }: { id: string }) {
  const doc = docFor(id);
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState<Load>({
    status: "idle",
    text: "",
    href: "",
    truncated: false,
    error: null,
  });
  const request = useRef(0);

  useEffect(() => {
    request.current += 1;
    setOpen(false);
    setLoad({ status: "idle", text: "", href: "", truncated: false, error: null });
  }, [id]);

  if (!doc) return null;

  async function read() {
    const ticket = ++request.current;
    setOpen(true);
    setLoad((current) => ({ ...current, status: "loading", error: null }));
    try {
      const result = await loadSkillText(id);
      if (ticket !== request.current) return;
      setLoad({
        status: result.ok ? "ready" : "error",
        text: result.text,
        href: result.href,
        truncated: result.truncated,
        error: result.error,
      });
    } catch {
      if (ticket !== request.current) return;
      setLoad({
        status: "error",
        text: "",
        href: "",
        truncated: false,
        error: "Could not load the file.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-fit px-3"
        onClick={() => (open && load.status === "ready" ? setOpen(false) : void read())}
      >
        {open && load.status === "ready" ? "Hide source" : "Read full skill"}
      </Button>
      {open ? (
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
              <a href={load.href} target="_blank" rel="noreferrer" className="font-mono text-xs text-primary">
                {doc.path}
              </a>
              <Markdown text={load.text} />
              {load.truncated ? (
                <p className="text-sm text-muted-foreground">Truncated. The rest is on GitHub.</p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  const blocks = parseMarkdown(text);
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed">
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <pre key={index} className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">
              {block.text}
            </pre>
          );
        }
        if (block.type === "heading") {
          return (
            <p key={index} className="font-medium text-foreground">
              {block.text}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index} className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="text-muted-foreground">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; text: string };

function parseMarkdown(source: string): Block[] {
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.startsWith("```")) {
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
        body.push(lines[index] ?? "");
        index += 1;
      }
      index += 1;
      blocks.push({ type: "code", text: body.join("\n") });
      continue;
    }
    if (line.trim() === "") {
      index += 1;
      continue;
    }
    if (/^#{1,6}\s+/.test(line)) {
      blocks.push({ type: "heading", text: line.replace(/^#{1,6}\s+/, "") });
      index += 1;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }
    const paragraph: string[] = [];
    while (
      index < lines.length &&
      (lines[index] ?? "").trim() !== "" &&
      !((lines[index] ?? "").startsWith("```")) &&
      !/^#{1,6}\s+/.test(lines[index] ?? "") &&
      !/^\s*[-*]\s+/.test(lines[index] ?? "")
    ) {
      paragraph.push(lines[index] ?? "");
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }
  return blocks;
}
