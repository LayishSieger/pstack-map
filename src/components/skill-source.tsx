"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sourceOf } from "@/catalog";
import { loadSkillText } from "@/lib/actions";
import { parseSkillMarkdown, type Block, type Inline } from "@/lib/skill-markdown";
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

  const parsed = useMemo(
    () => (load.status === "ready" ? parseSkillMarkdown(load.text) : null),
    [load.status, load.text],
  );

  if (!source) return null;

  const href = load.href || source.href;

  return (
    <div className="flex flex-col gap-3">
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
        {parsed ? (
          <>
            {parsed.fields.length > 0 ? <FieldTable fields={parsed.fields} /> : null}
            <Markdown blocks={parsed.blocks} />
            {load.truncated ? (
              <p className="text-sm text-muted-foreground">Truncated. The rest is on GitHub.</p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function FieldTable({ fields }: { fields: { key: string; value: string }[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">Skill fields</caption>
      <tbody>
        {fields.map((field) => (
          <tr key={field.key} className="border-b border-border last:border-0">
            <th scope="row" className="w-2/5 py-1.5 pe-3 text-left align-top font-mono text-xs font-medium text-muted-foreground">
              {field.key}
            </th>
            <td className="py-1.5 align-top break-words text-foreground">{field.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Markdown({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.type === "code") {
    return (
      <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">
        <code>{block.text}</code>
      </pre>
    );
  }
  if (block.type === "heading") {
    const Tag = headingTag(block.level);
    return (
      <Tag className="font-medium text-foreground">
        <Inlines items={block.children} />
      </Tag>
    );
  }
  if (block.type === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag
        className={
          block.ordered
            ? "flex list-decimal flex-col gap-1 pl-5 text-muted-foreground"
            : "flex list-disc flex-col gap-1 pl-5 text-muted-foreground"
        }
      >
        {block.items.map((item, index) => (
          <li key={index}>
            <Inlines items={item.children} />
            {item.nested.length > 0 ? <Markdown blocks={item.nested} /> : null}
          </li>
        ))}
      </Tag>
    );
  }
  if (block.type === "table") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              {block.header.map((cell, index) => (
                <th key={index} className="border-b border-border px-2 py-1.5 font-medium text-foreground">
                  <Inlines items={cell} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border-b border-border px-2 py-1.5 align-top text-muted-foreground">
                    <Inlines items={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">
        <Inlines items={block.children} />
      </blockquote>
    );
  }
  if (block.type === "rule") return <hr className="border-border" />;
  return (
    <p className="text-muted-foreground">
      <Inlines items={block.children} />
    </p>
  );
}

function headingTag(level: number): "h3" | "h4" | "h5" | "h6" {
  if (level <= 1) return "h3";
  if (level === 2) return "h4";
  if (level === 3) return "h5";
  return "h6";
}

function Inlines({ items }: { items: Inline[] }) {
  return items.map((item, index) => {
    if (item.type === "text") return <span key={index}>{item.text}</span>;
    if (item.type === "code") {
      return (
        <code key={index} className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
          {item.text}
        </code>
      );
    }
    if (item.type === "strong") {
      return (
        <strong key={index} className="font-medium text-foreground">
          <Inlines items={item.children} />
        </strong>
      );
    }
    if (item.type === "em") {
      return (
        <em key={index}>
          <Inlines items={item.children} />
        </em>
      );
    }
    const external = /^https?:\/\//i.test(item.href);
    return (
      <a
        key={index}
        href={item.href}
        className="text-primary underline-offset-4 hover:underline"
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        <Inlines items={item.children} />
      </a>
    );
  });
}
