import assert from "node:assert/strict";
import { test } from "node:test";
import { allow } from "./rate-limit.ts";

test("a window allows the limit, then refuses until it expires", () => {
  const key = `test-${Date.now()}`;
  assert.equal(allow(key, 2, 1_000, 0), true);
  assert.equal(allow(key, 2, 1_000, 10), true);
  assert.equal(allow(key, 2, 1_000, 20), false);
  assert.equal(allow(key, 2, 1_000, 1_000), true);
});
