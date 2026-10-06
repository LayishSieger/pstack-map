import assert from "node:assert/strict";
import { test } from "node:test";
import { compare, openPack, sourceOf } from "./index.ts";

test("the playbook step opens investigation", () => {
  const closed = openPack("pstack");
  const step = closed.flow.find((item) => item.label === "Playbook");
  assert.equal(step?.skillId, "investigation");
  assert.equal(step?.active, false);

  const opened = openPack("pstack", { selectedId: "investigation" });
  assert.equal(opened.selected.id, "investigation");
  assert.equal(opened.flow.find((item) => item.label === "Playbook")?.active, true);
});

test("every group on a skill is in the menu", () => {
  const view = openPack("pstack");
  assert.equal(view.groups[0], "All");
  assert.ok(view.groups.indexOf("Plan") < view.groups.indexOf("Skills"));
  assert.ok(view.groups.indexOf("Skills") < view.groups.indexOf("Ship"));
  assert.ok(view.groups.indexOf("Session") < view.groups.indexOf("Housekeeping"));
  assert.ok(view.groups.indexOf("Housekeeping") < view.groups.indexOf("Meta"));

  const skills = openPack("pstack", { group: "Skills" });
  assert.deepEqual(
    skills.visible.map((skill) => skill.id),
    ["authoring-a-skill", "eval"],
  );
  assert.equal(skills.selected.id, "poteto-mode");

  const housekeeping = openPack("pstack", { group: "Housekeeping" });
  assert.deepEqual(
    housekeeping.visible.map((skill) => skill.id),
    ["worktree-cleanup"],
  );
});

test("an unknown selection or group falls back", () => {
  const view = openPack("pstack", { selectedId: "missing", group: "Missing" });
  assert.equal(view.selected.id, "poteto-mode");
  assert.equal(view.shown, view.total);
  assert.equal(openPack("pocock").selected.id, "mp-ask-matt");
});

test("search matches the title, blurb, and group", () => {
  const view = openPack("pocock", { query: "glossary" });
  assert.ok(view.visible.some((skill) => skill.id === "mp-grill-with-docs"));
  assert.ok(view.shown < view.total);
});

test("poteto-mode calls playbooks, then router skills, then principles", () => {
  const view = openPack("pstack", { selectedId: "poteto-mode" });
  assert.equal(view.calls[0]?.skill.id, "investigation");
  assert.ok(view.calls.length > 8);
  const ids = view.calls.map((call) => call.skill.id);
  assert.ok(ids.indexOf("how") > ids.indexOf("worktree-cleanup"));
  assert.ok(ids.indexOf("laziness-protocol") > ids.indexOf("how"));
  assert.equal(view.calls.at(-1)?.skill.id, "poteto-agent");
  assert.equal(view.calls[0]?.why, "Matched from the goal and the check. Steps are copied into the todo list.");
});

test("called-by follows the edge back", () => {
  const view = openPack("pstack", { selectedId: "how" });
  assert.ok(view.calledBy.some((call) => call.skill.id === "teach" && call.why === "Runtime mechanics."));
});

test("source paths follow the kind", () => {
  assert.equal(sourceOf("how")?.path, "pstack/skills/how/SKILL.md");
  assert.equal(sourceOf("investigation")?.path, "pstack/skills/poteto-mode/playbooks/investigation.md");
  assert.equal(sourceOf("laziness-protocol")?.path, "pstack/skills/principle-laziness-protocol/SKILL.md");
  assert.equal(sourceOf("poteto-agent")?.path, "pstack/agents/poteto-agent.md");
  assert.equal(sourceOf("comment-sicko")?.path, "pstack/agents/comment-sicko.md");
  assert.equal(sourceOf("mp-ask-matt")?.path, "skills/engineering/ask-matt/SKILL.md");
  assert.equal(sourceOf("mp-grill-me")?.path, "skills/productivity/grill-me/SKILL.md");
  assert.equal(sourceOf("missing"), null);

  const how = sourceOf("how");
  assert.equal(how?.repo, "cursor/plugins");
  assert.equal(how?.href, "https://github.com/cursor/plugins/blob/main/pstack/skills/how/SKILL.md");
  assert.equal(how?.rawUrl, "https://raw.githubusercontent.com/cursor/plugins/main/pstack/skills/how/SKILL.md");
});

test("every skill has one source and compare names real skills", () => {
  const seen = new Set<string>();
  for (const pack of ["pstack", "pocock"] as const) {
    const view = openPack(pack);
    assert.equal(view.shown, view.total);
    for (const skill of view.visible) {
      const source = sourceOf(skill.id);
      assert.ok(source);
      assert.equal(seen.has(`${source.repo}/${source.path}`), false);
      seen.add(`${source.repo}/${source.path}`);
    }
  }

  const sharpen = compare().jobs.find((job) => job.job === "Sharpen the idea");
  assert.equal(sharpen?.pstack[0]?.id, "investigation");
  assert.equal(sharpen?.pocock[0]?.title, "/grill-with-docs");
  assert.equal(compare().choices.length, 3);
});
