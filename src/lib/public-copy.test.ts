import assert from "node:assert/strict";
import { test } from "node:test";
import { aboutMarkdown, contactMarkdown, homeMarkdown, notFoundMarkdown, privacyMarkdown } from "./public-copy.ts";

test("the public pages answer the flow question and name a way onward", () => {
  const home = homeMarkdown();
  assert.match(home, /Which flow/);
  assert.match(home, /Two builders on the same ticket fight/);
  assert.match(home, /\/skills\/investigation/);
  assert.match(home, /llms\.txt/);
  assert.match(notFoundMarkdown(), /llms\.txt/);
  for (const page of [aboutMarkdown(), contactMarkdown(), privacyMarkdown()]) {
    assert.ok(page.length >= 500, page.slice(0, 40));
  }
});
