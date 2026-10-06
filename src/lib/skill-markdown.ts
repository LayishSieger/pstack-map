export type MetaField = { key: string; value: string };

export type Inline =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "link"; href: string; children: Inline[] };

export type ListItem = { children: Inline[]; nested: Block[] };

export type Block =
  | { type: "heading"; level: number; children: Inline[] }
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; ordered: boolean; items: ListItem[] }
  | { type: "code"; text: string }
  | { type: "table"; header: Inline[][]; rows: Inline[][][] }
  | { type: "quote"; children: Inline[] }
  | { type: "rule" };

export type SkillDocument = { fields: MetaField[]; blocks: Block[] };

export function parseSkillMarkdown(source: string): SkillDocument {
  const text = source.replace(/^\uFEFF/, "").replaceAll("\r\n", "\n");
  const split = splitFrontmatter(text);
  return { fields: split.fields, blocks: parseBlocks(split.body) };
}

function splitFrontmatter(text: string): { fields: MetaField[]; body: string } {
  if (!text.startsWith("---\n")) return { fields: [], body: text };
  const close = text.indexOf("\n---", 4);
  if (close === -1) return { fields: [], body: text };
  const after = text.slice(close + 4);
  if (after !== "" && !after.startsWith("\n")) return { fields: [], body: text };
  return { fields: parseFields(text.slice(4, close)), body: after.replace(/^\n/, "") };
}

function parseFields(raw: string): MetaField[] {
  const lines = raw.split("\n");
  const fields: MetaField[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim() || line.trimStart().startsWith("#")) {
      index += 1;
      continue;
    }
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) {
      index += 1;
      continue;
    }
    const key = match[1] ?? "";
    const rest = match[2] ?? "";
    if (rest === "|" || rest === ">" || rest === "|-" || rest === ">-") {
      const folded = rest.startsWith(">");
      const parts: string[] = [];
      index += 1;
      while (index < lines.length && (/^\s+\S/.test(lines[index] ?? "") || (lines[index] ?? "").trim() === "")) {
        if ((lines[index] ?? "").trim() !== "") parts.push((lines[index] ?? "").trim());
        index += 1;
      }
      fields.push({ key, value: folded ? parts.join(" ") : parts.join("\n") });
      continue;
    }
    fields.push({ key, value: unquote(rest) });
    index += 1;
  }
  return fields;
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 2) return trimmed;
  const quote = trimmed[0];
  if ((quote !== '"' && quote !== "'") || !trimmed.endsWith(quote)) return trimmed;
  const inner = trimmed.slice(1, -1);
  if (quote === '"') return inner.replaceAll('\\"', '"').replaceAll("\\n", "\n").replaceAll("\\\\", "\\");
  return inner.replaceAll("\\'", "'");
}

function parseBlocks(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "") {
      index += 1;
      continue;
    }
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
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1]?.length ?? 1,
        children: parseInlines(heading[2] ?? ""),
      });
      index += 1;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index] ?? "")) {
        quote.push((lines[index] ?? "").replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", children: parseInlines(quote.join(" ")) });
      continue;
    }
    if (line.includes("|") && isSeparator(lines[index + 1] ?? "")) {
      const header = splitRow(line).map(parseInlines);
      index += 2;
      const rows: Inline[][][] = [];
      while (index < lines.length && (lines[index] ?? "").includes("|") && (lines[index] ?? "").trim() !== "") {
        rows.push(splitRow(lines[index] ?? "").map(parseInlines));
        index += 1;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }
    if (listKind(line)) {
      const parsed = parseList(lines, index);
      blocks.push(parsed.block);
      index = parsed.next;
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && (lines[index] ?? "").trim() !== "" && !isBlockStart(lines, index)) {
      paragraph.push((lines[index] ?? "").trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", children: parseInlines(paragraph.join(" ")) });
  }
  return blocks;
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index] ?? "";
  if (line.startsWith("```")) return true;
  if (/^#{1,6}\s+/.test(line)) return true;
  if (listKind(line)) return true;
  if (/^(-{3,}|\*{3,})$/.test(line.trim())) return true;
  if (/^>\s?/.test(line)) return true;
  return line.includes("|") && isSeparator(lines[index + 1] ?? "");
}

function listKind(line: string): "ol" | "ul" | null {
  if (/^\s*\d+\.\s+\S/.test(line)) return "ol";
  if (/^\s*[-*]\s+\S/.test(line)) return "ul";
  return null;
}

function indentOf(line: string): number {
  return /^\s*/.exec(line)?.[0].length ?? 0;
}

function parseList(lines: string[], start: number): { block: Block; next: number } {
  const kind = listKind(lines[start] ?? "");
  const indent = indentOf(lines[start] ?? "");
  const items: ListItem[] = [];
  let index = start;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "") {
      let look = index + 1;
      while (look < lines.length && (lines[look] ?? "").trim() === "") look += 1;
      const next = lines[look] ?? "";
      if (listKind(next) === kind && indentOf(next) === indent) {
        index = look;
        continue;
      }
      break;
    }
    if (listKind(line) !== kind || indentOf(line) !== indent) break;
    const marker = /^\s*(?:[-*]|\d+\.)\s+/.exec(line);
    const content = [line.slice(marker?.[0].length ?? 0)];
    index += 1;
    const nested: string[] = [];
    while (index < lines.length) {
      const next = lines[index] ?? "";
      if (next.trim() === "") break;
      const nextIndent = indentOf(next);
      if (listKind(next) === kind && nextIndent === indent) break;
      if (nextIndent <= indent && isBlockStart(lines, index) && !listKind(next)) break;
      if (listKind(next) && nextIndent > indent) {
        while (index < lines.length && (lines[index] ?? "").trim() !== "" && indentOf(lines[index] ?? "") > indent) {
          nested.push(lines[index] ?? "");
          index += 1;
        }
        continue;
      }
      if (nextIndent > indent) {
        content.push(next.trim());
        index += 1;
        continue;
      }
      break;
    }
    items.push({
      children: parseInlines(content.join(" ")),
      nested: nested.length > 0 ? parseBlocks(nested.join("\n")) : [],
    });
  }
  return { block: { type: "list", ordered: kind === "ol", items }, next: index };
}

function isSeparator(line: string): boolean {
  if (!line.includes("|") && !line.includes("-")) return false;
  const cells = splitRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function splitRow(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
  return trimmed.split("|").map((cell) => cell.trim());
}

function parseInlines(input: string): Inline[] {
  const out: Inline[] = [];
  let text = "";
  let index = 0;
  const flush = () => {
    if (text === "") return;
    out.push({ type: "text", text });
    text = "";
  };
  while (index < input.length) {
    const ch = input[index] ?? "";
    if (ch === "\\") {
      text += input[index + 1] ?? "\\";
      index += input[index + 1] ? 2 : 1;
      continue;
    }
    if (ch === "`") {
      const end = input.indexOf("`", index + 1);
      if (end !== -1) {
        flush();
        out.push({ type: "code", text: input.slice(index + 1, end) });
        index = end + 1;
        continue;
      }
    }
    if (input.startsWith("**", index) || input.startsWith("__", index)) {
      const marker = input.slice(index, index + 2);
      const end = input.indexOf(marker, index + 2);
      if (end !== -1) {
        flush();
        out.push({ type: "strong", children: parseInlines(input.slice(index + 2, end)) });
        index = end + 2;
        continue;
      }
    }
    if ((ch === "*" || ch === "_") && input[index + 1] !== ch && emphasisEnd(input, index, ch) !== -1) {
      const end = emphasisEnd(input, index, ch);
      flush();
      out.push({ type: "em", children: parseInlines(input.slice(index + 1, end)) });
      index = end + 1;
      continue;
    }
    if (ch === "[") {
      const link = matchLink(input, index);
      if (link) {
        flush();
        out.push({ type: "link", href: link.href, children: parseInlines(link.text) });
        index = link.end;
        continue;
      }
    }
    text += ch;
    index += 1;
  }
  flush();
  return out;
}

function emphasisEnd(input: string, start: number, marker: string): number {
  if (marker === "_" && start > 0 && /\w/.test(input[start - 1] ?? "")) return -1;
  for (let index = start + 1; index < input.length; index += 1) {
    if (input[index] !== marker) continue;
    if (input[index + 1] === marker) {
      index += 1;
      continue;
    }
    if (index === start + 1) return -1;
    if (marker === "_" && /\w/.test(input[index + 1] ?? "")) continue;
    return index;
  }
  return -1;
}

function matchLink(input: string, start: number): { text: string; href: string; end: number } | null {
  const close = input.indexOf("]", start + 1);
  if (close === -1 || input[close + 1] !== "(") return null;
  const endParen = input.indexOf(")", close + 2);
  if (endParen === -1) return null;
  const href = input.slice(close + 2, endParen).trim();
  if (!isSafeHref(href)) return null;
  return { text: input.slice(start + 1, close), href, end: endParen + 1 };
}

function isSafeHref(href: string): boolean {
  return !/^\s*(?:javascript|data):/i.test(href);
}
