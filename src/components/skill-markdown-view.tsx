import { parseSkillMarkdown, type Block, type Inline } from "@/lib/skill-markdown";

export function SkillMarkdownView({ text, headingLevel = 3 }: { text: string; headingLevel?: 1 | 3 }) {
  const parsed = parseSkillMarkdown(text);
  return (
    <div className="flex flex-col gap-3">
      {parsed.fields.length > 0 ? <FieldTable fields={parsed.fields} /> : null}
      <Markdown blocks={parsed.blocks} headingLevel={headingLevel} />
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
            <th
              scope="row"
              className="w-2/5 py-1.5 pe-3 text-left align-top font-mono text-xs font-medium text-muted-foreground"
            >
              {field.key}
            </th>
            <td className="py-1.5 align-top break-words text-foreground">{field.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Markdown({ blocks, headingLevel }: { blocks: Block[]; headingLevel: 1 | 3 }) {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} headingLevel={headingLevel} />
      ))}
    </div>
  );
}

function BlockView({ block, headingLevel }: { block: Block; headingLevel: 1 | 3 }) {
  if (block.type === "code") {
    return (
      <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">
        <code>{block.text}</code>
      </pre>
    );
  }
  if (block.type === "heading") {
    const Tag = headingTag(block.level, headingLevel);
    return (
      <Tag className={headingLevel === 1 && block.level === 1 ? "text-3xl font-semibold tracking-tight text-foreground" : "font-medium text-foreground"}>
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
            {item.nested.length > 0 ? <Markdown blocks={item.nested} headingLevel={headingLevel} /> : null}
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

function headingTag(level: number, base: 1 | 3): "h1" | "h2" | "h3" | "h4" | "h5" | "h6" {
  const mapped = Math.min(6, Math.max(1, base + level - 1));
  if (mapped === 1) return "h1";
  if (mapped === 2) return "h2";
  if (mapped === 3) return "h3";
  if (mapped === 4) return "h4";
  if (mapped === 5) return "h5";
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
