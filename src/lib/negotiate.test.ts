import assert from "node:assert/strict";
import { test } from "node:test";
import { prefersMarkdown } from "./negotiate.ts";

test("markdown-only requests prefer markdown", () => {
  assert.equal(prefersMarkdown("text/markdown"), true);
  assert.equal(prefersMarkdown("text/html,application/xhtml+xml"), false);
  assert.equal(prefersMarkdown("text/html, text/markdown;q=0.8"), false);
  assert.equal(prefersMarkdown("text/markdown, text/html;q=0.5"), true);
  assert.equal(prefersMarkdown(""), false);
});
