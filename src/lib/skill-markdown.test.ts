import assert from "node:assert/strict";
import test from "node:test";
import { parseSkillMarkdown, type Inline } from "./skill-markdown.ts";

const sample = `---
name: ask-matt
description: "Ask which skill: a router."
disable-model-invocation: true
mode: true
icon: crown
color: yellow
reminder: Apply the router when the next skill is unclear.
---

# Ask Matt

You don't remember every skill, so ask.

1. **\`/grill-with-docs\`** sharpens the idea.
   - nested check
2. Second step

- **Issue tracker**: where issues live
- plain item

| name | role |
| --- | --- |
| ask-matt | router |

Read [the map](https://example.com/map) and keep \`name\` visible.

> A phase boundary.

\`\`\`
leave **this** raw
\`\`\`
`;

function textOf(inlines: Inline[]): string {
  return inlines
    .map((inline) => {
      if (inline.type === "text" || inline.type === "code") return inline.text;
      if (inline.type === "link") return textOf(inline.children);
      return textOf(inline.children);
    })
    .join("");
}

test("front matter keeps name, disable-model-invocation, and the other fields", () => {
  const doc = parseSkillMarkdown(sample);
  assert.deepEqual(
    doc.fields.map((field) => field.key),
    ["name", "description", "disable-model-invocation", "mode", "icon", "color", "reminder"],
  );
  assert.equal(doc.fields[0]?.value, "ask-matt");
  assert.equal(doc.fields[1]?.value, "Ask which skill: a router.");
  assert.equal(doc.fields[2]?.value, "true");
  assert.equal(doc.blocks.some((block) => block.type === "paragraph" && textOf(block.children).includes("disable-model-invocation")), false);
});

test("renders headings, lists, tables, links, quotes, and fenced code", () => {
  const doc = parseSkillMarkdown(sample);
  const heading = doc.blocks.find((block) => block.type === "heading");
  assert.equal(heading?.type === "heading" && textOf(heading.children), "Ask Matt");

  const ordered = doc.blocks.find((block) => block.type === "list" && block.ordered);
  assert.equal(ordered?.type === "list" && ordered.items.length, 2);
  assert.equal(ordered?.type === "list" && ordered.items[0]?.nested[0]?.type, "list");

  const table = doc.blocks.find((block) => block.type === "table");
  assert.equal(table?.type === "table" && textOf(table.header[0] ?? []), "name");
  assert.equal(table?.type === "table" && textOf(table.rows[0]?.[1] ?? []), "router");

  const linked = doc.blocks.find(
    (block) => block.type === "paragraph" && block.children.some((inline) => inline.type === "link"),
  );
  const link = linked?.type === "paragraph" ? linked.children.find((inline) => inline.type === "link") : undefined;
  assert.equal(link?.type === "link" && link.href, "https://example.com/map");

  const code = doc.blocks.find((block) => block.type === "code");
  assert.equal(code?.type === "code" && code.text.includes("**this**"), true);
  assert.equal(doc.blocks.some((block) => block.type === "quote"), true);
});

test("a file without front matter still renders its body", () => {
  const doc = parseSkillMarkdown("# Plain\n\nJust text.");
  assert.deepEqual(doc.fields, []);
  assert.equal(doc.blocks[0]?.type, "heading");
  assert.equal(doc.blocks[1]?.type, "paragraph");
});
