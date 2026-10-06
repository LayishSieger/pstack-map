import type { Edge, FlowStep, SkillDraft } from "@/catalog/types";

export const pocockFlow: readonly FlowStep[] = [
  { skillId: "mp-setup", label: "Setup" },
  { skillId: "mp-ask-matt", label: "Router" },
  { skillId: "mp-grill-with-docs", label: "Grill" },
  { skillId: "mp-to-spec", label: "Spec" },
  { skillId: "mp-to-tickets", label: "Tickets" },
  { skillId: "mp-implement-spec", label: "Build" },
  { skillId: "mp-code-review", label: "Review" },
];

export const pocockNodes: SkillDraft[] = [
  {
    id: "mp-ask-matt",
    path: "skills/engineering/ask-matt/SKILL.md",
    title: "/ask-matt",
    kind: "skill",
    group: "Router",
    blurb:
      "You ask which skill or flow fits. It routes over the user-invoked skills. It is not sticky, and it does not run the work for you.",
  },
  {
    id: "mp-setup",
    path: "skills/engineering/setup-matt-pocock-skills/SKILL.md",
    title: "/setup-matt-pocock-skills",
    kind: "skill",
    group: "Router",
    blurb:
      "Once per repo. Records where issues live, the triage label strings, and where GLOSSARY.md and ADRs sit, under docs/agents. The other engineering skills read that instead of hard-coding GitHub.",
  },
  {
    id: "mp-grill-with-docs",
    path: "skills/engineering/grill-with-docs/SKILL.md",
    title: "/grill-with-docs",
    kind: "skill",
    group: "Shape",
    blurb:
      "Interviews you until every branch of the design is resolved, and writes the terms into GLOSSARY.md and ADRs as you go. Start here when a repo is open.",
  },
  {
    id: "mp-grill-me",
    path: "skills/productivity/grill-me/SKILL.md",
    title: "/grill-me",
    kind: "skill",
    group: "Shape",
    blurb:
      "The same interview with nothing saved. Use it when there is no working directory. In a repo, grill-with-docs is the stricter choice.",
  },
  {
    id: "mp-grilling",
    path: "skills/productivity/grilling/SKILL.md",
    title: "grilling",
    kind: "skill",
    group: "Shape",
    blurb:
      "Model-invoked interview primitive. grill-me, grill-with-docs, triage, wayfinder, and improve-codebase-architecture all run this. You can also invoke it yourself.",
  },
  {
    id: "mp-domain-modeling",
    path: "skills/engineering/domain-modeling/SKILL.md",
    title: "domain-modeling",
    kind: "skill",
    group: "Shape",
    blurb:
      "Challenges terms against the glossary, stress-tests them with edge cases, and updates GLOSSARY.md and ADRs. grill-with-docs invokes it.",
  },
  {
    id: "mp-wayfinder",
    path: "skills/engineering/wayfinder/SKILL.md",
    title: "/wayfinder",
    kind: "skill",
    group: "Shape",
    blurb:
      "For a chunk of work bigger than one session. A shared map of decision tickets on the tracker, resolved one at a time until the way is clear. Use this instead of grill-with-docs when the plan will not fit.",
  },
  {
    id: "mp-to-spec",
    path: "skills/engineering/to-spec/SKILL.md",
    title: "/to-spec",
    kind: "skill",
    group: "Plan",
    blurb:
      "Turns the conversation you already had into a spec on the issue tracker. No second interview. Reach for it when the build will span sessions.",
  },
  {
    id: "mp-to-tickets",
    path: "skills/engineering/to-tickets/SKILL.md",
    title: "/to-tickets",
    kind: "skill",
    group: "Plan",
    blurb:
      "Splits a spec into tracer-bullet tickets. Local files name their blockers. On a real tracker those are native links, and when the source is an issue each ticket is a sub-issue of it.",
  },
  {
    id: "mp-implement",
    path: "skills/engineering/implement/SKILL.md",
    title: "/implement",
    kind: "skill",
    group: "Build",
    blurb:
      "Builds one spec or one ticket in this context window. Drives tdd at the seams you agreed, then code-review before commit. Clear context between tickets.",
  },
  {
    id: "mp-implement-spec",
    path: "skills/engineering/implement-spec/SKILL.md",
    title: "/implement-spec",
    kind: "skill",
    group: "Build",
    blurb:
      "Lands a whole spec on one integration branch. Tickets are a graph. Implementer subagents take the ready frontier in parallel, each with tdd, then one code-review over the branch.",
  },
  {
    id: "mp-tdd",
    path: "skills/engineering/tdd/SKILL.md",
    title: "tdd",
    kind: "skill",
    group: "Build",
    blurb:
      "Red, green, refactor, one vertical slice at a time. Model-invoked. implement and each implement-spec worker call it. Invoke it alone when you just want one behaviour test-first.",
  },
  {
    id: "mp-prototype",
    path: "skills/engineering/prototype/SKILL.md",
    title: "prototype",
    kind: "skill",
    group: "Build",
    blurb:
      "A throwaway to answer a design question. One shareable HTML file for state and logic, or several UI variants on one route. Model-invoked from a grill when you are still guessing.",
  },
  {
    id: "mp-codebase-design",
    path: "skills/engineering/codebase-design/SKILL.md",
    title: "codebase-design",
    kind: "skill",
    group: "Design",
    blurb:
      "Vocabulary for deep modules: a lot of behaviour behind a small interface, at a clean seam, tested through that interface.",
  },
  {
    id: "mp-improve-architecture",
    path: "skills/engineering/improve-codebase-architecture/SKILL.md",
    title: "/improve-codebase-architecture",
    kind: "skill",
    group: "Design",
    blurb:
      "Scans for deepening opportunities, writes a visual HTML report, then grills the one you pick. A session you start, not a step in every feature.",
  },
  {
    id: "mp-diagnosing-bugs",
    path: "skills/engineering/diagnosing-bugs/SKILL.md",
    title: "diagnosing-bugs",
    kind: "skill",
    group: "Fix",
    blurb:
      "Hard bugs and perf regressions. Feedback loop that goes red on this bug, then minimise, hypothesise, instrument, fix, regression-test.",
  },
  {
    id: "mp-research",
    path: "skills/engineering/research/SKILL.md",
    title: "research",
    kind: "skill",
    group: "Understand",
    blurb:
      "A question against high-trust primary sources, captured as a cited Markdown file. Meant to run as a background agent.",
  },
  {
    id: "mp-code-review",
    path: "skills/engineering/code-review/SKILL.md",
    title: "code-review",
    kind: "skill",
    group: "Review",
    blurb:
      "Two axes, two subagents, so they do not pollute each other. Standards: repo rules plus a Fowler smell baseline. Spec: does the diff match the originating issue?",
  },
  {
    id: "mp-pr",
    path: "skills/engineering/pr/SKILL.md",
    title: "pr",
    kind: "skill",
    group: "Review",
    blurb:
      "The shape of a PR body. A summary that makes the change obvious, before/after evidence that it works, and a merge-danger call: one-way or two-way door, plus blast radius.",
  },
  {
    id: "mp-triage",
    path: "skills/engineering/triage/SKILL.md",
    title: "/triage",
    kind: "skill",
    group: "Tracker",
    blurb:
      "Walks issues through a state machine of triage roles, using the label strings setup wrote. It does not invent labels.",
  },
  {
    id: "mp-wizard",
    path: "skills/engineering/wizard/SKILL.md",
    title: "wizard",
    kind: "skill",
    group: "Tracker",
    blurb:
      "An interactive bash wizard for steps only a human can do: credentials, CI secrets, an unfamiliar dashboard, a one-off cutover.",
  },
  {
    id: "mp-retro",
    path: "skills/engineering/retro/SKILL.md",
    title: "/retro",
    kind: "skill",
    group: "After",
    blurb:
      "After a session, suggests fixes to the agent's environment: navigation, automated checks, coding standards, steering files, tooling. Most severe first.",
  },
  {
    id: "mp-handoff",
    path: "skills/productivity/handoff/SKILL.md",
    title: "/handoff",
    kind: "skill",
    group: "After",
    blurb: "Compacts this conversation into a handoff document so a fresh agent can continue. Nothing is left only in the chat.",
  },
  {
    id: "mp-teach",
    path: "skills/productivity/teach/SKILL.md",
    title: "/teach",
    kind: "skill",
    group: "People",
    blurb:
      "Teaches you a skill or concept over multiple sessions. The current directory is the teaching workspace. This is for a person, not a code walkthrough.",
  },
  {
    id: "mp-to-questionnaire",
    path: "skills/productivity/to-questionnaire/SKILL.md",
    title: "/to-questionnaire",
    kind: "skill",
    group: "People",
    blurb:
      "A decision you cannot answer alone becomes a Markdown questionnaire for the one person who can. It grills you about the send, not the subject.",
  },
  {
    id: "mp-wait-what",
    path: "skills/productivity/wait-what/SKILL.md",
    title: "/wait-what",
    kind: "skill",
    group: "People",
    blurb:
      "The last message did not land. The agent re-pitches it in plain English, using your glossary, including the context you were missing.",
  },
  {
    id: "mp-writing-for-agents",
    path: "skills/productivity/writing-for-agents/SKILL.md",
    title: "writing-for-agents",
    kind: "skill",
    group: "People",
    blurb: "How to write docs an agent will actually follow: skills, AGENTS.md, CLAUDE.md, and anything reached by a pointer.",
  },
];

export const pocockEdges: Edge[] = [
  {
    from: "mp-setup",
    to: "mp-ask-matt",
    why: "Setup writes the tracker and doc layout the router and the engineering skills read.",
  },
  {
    from: "mp-ask-matt",
    to: "mp-grill-with-docs",
    why: "Default start when a repo is open and the idea is not sharp yet.",
  },
  {
    from: "mp-ask-matt",
    to: "mp-grill-me",
    why: "Same interview when there is no working directory.",
  },
  {
    from: "mp-ask-matt",
    to: "mp-wayfinder",
    why: "The plan is bigger than one session. Decision tickets instead of a grill.",
  },
  {
    from: "mp-ask-matt",
    to: "mp-to-spec",
    why: "The conversation is already sharp and the build will span sessions.",
  },
  {
    from: "mp-ask-matt",
    to: "mp-implement",
    why: "One sitting, no real ticket graph. Build here.",
  },
  {
    from: "mp-grill-with-docs",
    to: "mp-grilling",
    why: "The interview itself is the shared grilling primitive.",
  },
  {
    from: "mp-grill-with-docs",
    to: "mp-domain-modeling",
    why: "Terms get challenged and written into the glossary and ADRs during the grill.",
  },
  {
    from: "mp-grill-me",
    to: "mp-grilling",
    why: "Same primitive, nothing written to disk.",
  },
  {
    from: "mp-triage",
    to: "mp-grilling",
    why: "Triage interviews each issue through the role state machine.",
  },
  {
    from: "mp-wayfinder",
    to: "mp-grilling",
    why: "Each decision ticket is grilled, not bulk-planned.",
  },
  {
    from: "mp-improve-architecture",
    to: "mp-grilling",
    why: "After you pick a seam from the report, the grill resolves it.",
  },
  {
    from: "mp-improve-architecture",
    to: "mp-codebase-design",
    why: "The report uses the deep-module vocabulary.",
  },
  {
    from: "mp-grill-with-docs",
    to: "mp-prototype",
    why: "A branch of the grill: answer a design question with throwaway code, then come back.",
  },
  {
    from: "mp-prototype",
    to: "mp-handoff",
    why: "What the prototype taught you is written down so the original thread can cite it.",
  },
  {
    from: "mp-grill-with-docs",
    to: "mp-to-spec",
    why: "Multi-session builds leave the chat and become a spec. A single sitting skips this.",
  },
  {
    from: "mp-wayfinder",
    to: "mp-to-spec",
    why: "Once the decision map is clear, compress it into a spec.",
  },
  {
    from: "mp-to-spec",
    to: "mp-to-tickets",
    why: "The spec is sliced into tracer bullets. On a tracker each ticket is a sub-issue of that spec, with native blocking edges.",
  },
  {
    from: "mp-to-tickets",
    to: "mp-implement",
    why: "Work one ticket per session and clear context between them.",
  },
  {
    from: "mp-to-tickets",
    to: "mp-implement-spec",
    why: "Or land the whole graph in one run. The blocking edges are the frontier.",
  },
  {
    from: "mp-implement",
    to: "mp-tdd",
    why: "Each agreed seam is red-green-refactor.",
  },
  {
    from: "mp-implement",
    to: "mp-code-review",
    why: "Close the ticket with a standards review and a spec-fidelity review.",
  },
  {
    from: "mp-implement-spec",
    to: "mp-tdd",
    why: "Every implementer subagent builds its ticket with tdd.",
  },
  {
    from: "mp-implement-spec",
    to: "mp-code-review",
    why: "One review over the integration branch after every ticket has landed.",
  },
  {
    from: "mp-code-review",
    to: "mp-pr",
    why: "The PR body is a summary, evidence, and a one-way or two-way door call.",
  },
  {
    from: "mp-implement",
    to: "mp-retro",
    why: "After the session, fix the environment that made the work harder.",
  },
  {
    from: "mp-setup",
    to: "mp-triage",
    why: "Triage applies the label vocabulary setup confirmed. It will not invent labels.",
  },
  {
    from: "mp-setup",
    to: "mp-to-tickets",
    why: "Tickets are published where setup said issues live.",
  },
];

export const pocockGroups = [
  "Router",
  "Shape",
  "Plan",
  "Build",
  "Design",
  "Fix",
  "Understand",
  "Review",
  "Tracker",
  "After",
  "People",
] as const;
