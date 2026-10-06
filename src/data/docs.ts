export type DocRef = {
  repo: "cursor/plugins" | "mattpocock/skills";
  path: string;
};

const pstackSkills = [
  "poteto-mode",
  "setup-pstack",
  "poteto-help",
  "how",
  "why",
  "teach",
  "recall",
  "blast-radius",
  "architect",
  "arena",
  "swarm",
  "interrogate",
  "tdd",
  "typescript-best-practices",
  "unslop",
  "no-comments",
  "technical-writing",
  "bro",
  "benchmark-checklist",
  "create-verification-skill",
  "maintain-verification-skill",
  "show-me-your-work",
  "figure-it-out",
  "reflect",
  "correct",
  "automate-me",
  "make-bot-ui",
] as const;

const playbooks = [
  "investigation",
  "runtime-forensics",
  "trace-forensics",
  "bug-fix",
  "perf-issue",
  "hillclimb",
  "feature",
  "refactoring",
  "prototype",
  "visual-parity",
  "multi-phase-plan",
  "authoring-a-skill",
  "eval",
  "opening-a-pr",
  "babysit",
  "shipping",
  "autonomous-run",
  "orchestrate",
  "autopilot-full",
  "autopilot-stack",
  "session-pickup",
  "pause-safely",
  "worktree-cleanup",
] as const;

const principles = [
  "laziness-protocol",
  "foundational-thinking",
  "redesign-from-first-principles",
  "attack-the-premise",
  "subtract-before-you-add",
  "minimize-reader-load",
  "outcome-oriented-execution",
  "experience-first",
  "exhaust-the-design-space",
  "build-the-lever",
  "model-the-domain",
  "boundary-discipline",
  "type-system-discipline",
  "make-operations-idempotent",
  "migrate-callers-then-delete-legacy-apis",
  "separate-before-serializing-shared-state",
  "prove-it-works",
  "fix-root-causes",
  "sequence-verifiable-units",
  "test-behavior-not-implementation",
  "explain-the-number",
  "guard-the-context-window",
  "never-block-on-the-human",
  "encode-lessons-in-structure",
] as const;

const pocock: Record<string, string> = {
  "mp-ask-matt": "skills/engineering/ask-matt/SKILL.md",
  "mp-setup": "skills/engineering/setup-matt-pocock-skills/SKILL.md",
  "mp-grill-with-docs": "skills/engineering/grill-with-docs/SKILL.md",
  "mp-wayfinder": "skills/engineering/wayfinder/SKILL.md",
  "mp-to-spec": "skills/engineering/to-spec/SKILL.md",
  "mp-to-tickets": "skills/engineering/to-tickets/SKILL.md",
  "mp-implement": "skills/engineering/implement/SKILL.md",
  "mp-implement-spec": "skills/engineering/implement-spec/SKILL.md",
  "mp-tdd": "skills/engineering/tdd/SKILL.md",
  "mp-prototype": "skills/engineering/prototype/SKILL.md",
  "mp-codebase-design": "skills/engineering/codebase-design/SKILL.md",
  "mp-improve-architecture": "skills/engineering/improve-codebase-architecture/SKILL.md",
  "mp-diagnosing-bugs": "skills/engineering/diagnosing-bugs/SKILL.md",
  "mp-research": "skills/engineering/research/SKILL.md",
  "mp-code-review": "skills/engineering/code-review/SKILL.md",
  "mp-pr": "skills/engineering/pr/SKILL.md",
  "mp-triage": "skills/engineering/triage/SKILL.md",
  "mp-wizard": "skills/engineering/wizard/SKILL.md",
  "mp-retro": "skills/engineering/retro/SKILL.md",
  "mp-domain-modeling": "skills/engineering/domain-modeling/SKILL.md",
  "mp-grill-me": "skills/productivity/grill-me/SKILL.md",
  "mp-grilling": "skills/productivity/grilling/SKILL.md",
  "mp-handoff": "skills/productivity/handoff/SKILL.md",
  "mp-teach": "skills/productivity/teach/SKILL.md",
  "mp-to-questionnaire": "skills/productivity/to-questionnaire/SKILL.md",
  "mp-wait-what": "skills/productivity/wait-what/SKILL.md",
  "mp-writing-for-agents": "skills/productivity/writing-for-agents/SKILL.md",
};

const docs = new Map<string, DocRef>();

for (const id of pstackSkills) {
  docs.set(id, { repo: "cursor/plugins", path: `pstack/skills/${id}/SKILL.md` });
}
for (const id of playbooks) {
  docs.set(id, { repo: "cursor/plugins", path: `pstack/skills/poteto-mode/playbooks/${id}.md` });
}
for (const id of principles) {
  docs.set(id, { repo: "cursor/plugins", path: `pstack/skills/principle-${id}/SKILL.md` });
}
docs.set("poteto-agent", { repo: "cursor/plugins", path: "pstack/agents/poteto-agent.md" });
docs.set("comment-sicko", { repo: "cursor/plugins", path: "pstack/agents/comment-sicko.md" });
for (const [id, path] of Object.entries(pocock)) {
  docs.set(id, { repo: "mattpocock/skills", path });
}

export function docFor(id: string): DocRef | null {
  return docs.get(id) ?? null;
}

export function blobUrl(doc: DocRef, sha = "main") {
  return `https://github.com/${doc.repo}/blob/${sha}/${doc.path}`;
}
