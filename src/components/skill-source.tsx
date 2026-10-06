import { useEffect, useState } from "react";
import { docFor } from "@/data/docs";
import { getSkillText } from "@/lib/upstream.functions";

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

  useEffect(() => {
    setOpen(false);
    setLoad({ status: "idle", text: "", href: "", truncated: false, error: null });
  }, [id]);

  if (!doc) return null;

  async function read() {
    setOpen(true);
    setLoad((current) => ({ ...current, status: "loading", error: null }));
    const result = await getSkillText({ data: { id } });
    setLoad({
      status: result.ok ? "ready" : "error",
      text: result.text,
      href: result.href,
      truncated: result.truncated,
      error: result.error,
    });
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => (open && load.status === "ready" ? setOpen(false) : void read())}
        className="min-h-11 rounded-card border border-line px-3 text-sm"
      >
        {open && load.status === "ready" ? "Hide source" : "Read full skill"}
      </button>
      {open ? (
        <div className="mt-3 max-h-96 overflow-auto rounded-card border border-line bg-bg p-3 sm:max-h-screen">
          {load.status === "loading" ? <p className="text-sm text-muted">Loading the file from GitHub.</p> : null}
          {load.status === "error" ? <p className="text-sm text-muted">{load.error}</p> : null}
          {load.status === "ready" ? (
            <>
              <a href={load.href} target="_blank" rel="noreferrer" className="font-mono text-xs text-accent">
                {doc.path}
              </a>
              <Markdown text={load.text} />
              {load.truncated ? (
                <p className="mt-3 text-sm text-muted">Truncated. The rest is on GitHub.</p>
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
    <div className="mt-3 space-y-3 text-sm leading-relaxed">
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <pre key={index} className="overflow-x-auto rounded-card bg-surface p-3 font-mono text-xs">
              {block.text}
            </pre>
          );
        }
        if (block.type === "heading") {
          return (
            <p key={index} className="font-medium text-fg">
              {block.text}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5 text-muted">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="text-muted">
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
