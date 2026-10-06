export type ChoiceId = "pstack" | "pocock" | "hybrid";

export type Choice = {
  id: ChoiceId;
  title: string;
  when: string;
  steps: string[];
  drop: string[];
};

export const choices: Choice[] = [
  {
    id: "pstack",
    title: "Pstack only",
    when: "You already know the change, and you want one sticky router to pick the playbook, prove it on the real artifact, and keep going. Overnight stacks, model panels, and principle citations matter more than a glossary.",
    steps: [
      "Run /setup-pstack once for models.",
      "Start /poteto-mode with a goal and a check.",
      "Let it match one playbook. Do not also name a Pocock skill in that turn.",
      "how and why before edits. architect before a change crosses a function.",
      "tdd where there is a cheap local test. prove-it-works on the real artifact.",
      "opening-a-pr, then babysit, then shipping.",
      "reflect or correct only when the agent repeated a mistake.",
    ],
    drop: [
      "ask-matt, grill-with-docs, to-spec, to-tickets",
      "implement and implement-spec",
      "Pocock tdd, prototype, and code-review",
    ],
  },
  {
    id: "pocock",
    title: "Pocock only",
    when: "You want to stay the pilot. Each step is a command you type. The issue tracker and the glossary are the record. You do not want a mode that keeps running after you look away.",
    steps: [
      "Run /setup-matt-pocock-skills once per repo.",
      "/ask-matt only when you are unsure which command is next.",
      "In a repo, /grill-with-docs. No repo, /grill-me. Bigger than one session, /wayfinder.",
      "One sitting: /implement. Several sittings: /to-spec, then /to-tickets.",
      "Per ticket, /implement and clear the chat. Or /implement-spec for the whole graph.",
      "tdd inside the build. code-review before you commit. pr for the body.",
      "/retro at the end. /triage when you are clearing a backlog, not building.",
    ],
    drop: [
      "/poteto-mode and every playbook",
      "arena, swarm, interrogate, autopilot, orchestrate",
      "pstack tdd, prototype, and teach",
    ],
  },
  {
    id: "hybrid",
    title: "Hybrid",
    when: "The words and the ticket graph are the hard part, and the build is the part you want verified without babysitting. Pocock owns the language and the plan. Pstack owns one ticket at a time. Never two routers, two builders, or two test loops on the same change.",
    steps: [
      "Once: /setup-matt-pocock-skills and /setup-pstack. They configure different things.",
      "Shape with Pocock. /grill-with-docs in a repo, /wayfinder if it will not fit in one session.",
      "If a design question is still a guess, one prototype. Pocock's throwaway HTML, or pstack's prototype playbook. Not both.",
      "Multi-session: /to-spec, then /to-tickets. Single sitting with a clear check: skip this and use pstack only.",
      "Build each ticket with /poteto-mode. Paste the ticket and the check. Do not also run /implement or /implement-spec.",
      "One review. code-review when a spec exists. interrogate only if that review did not settle it.",
      "PR body follows Pocock's pr shape, written by pstack opening-a-pr. no-comments only if the diff is noisy.",
      "/retro for the repo. /reflect only if pstack itself mis-routed.",
    ],
    drop: [
      "Pocock implement, implement-spec, and tdd, because poteto-mode is the builder",
      "pstack multi-phase-plan and orchestrate, because the tickets already are the plan",
      "Running ask-matt and poteto-mode as competing routers in one turn",
    ],
  },
];

export const jobs: { job: string; pstack: readonly string[]; pocock: readonly string[]; keep: string }[] = [
  {
    job: "Sharpen the idea",
    pstack: ["investigation"],
    pocock: ["mp-grill-with-docs"],
    keep: "Pocock. It leaves a glossary.",
  },
  {
    job: "Understand this code",
    pstack: ["how", "why", "teach"],
    pocock: ["mp-research"],
    keep: "Pstack for the repo. Pocock research for outside sources.",
  },
  {
    job: "Design a seam",
    pstack: ["architect", "arena"],
    pocock: ["mp-codebase-design", "mp-prototype"],
    keep: "Pocock prototype to decide. Pstack architect before code crosses a boundary.",
  },
  {
    job: "Plan across sessions",
    pstack: ["multi-phase-plan"],
    pocock: ["mp-to-spec", "mp-to-tickets", "mp-wayfinder"],
    keep: "Pocock. The tracker holds the graph.",
  },
  {
    job: "Build one change",
    pstack: ["feature", "bug-fix", "refactoring"],
    pocock: ["mp-implement"],
    keep: "One. Hybrid uses the pstack playbook.",
  },
  {
    job: "Build a whole graph",
    pstack: ["orchestrate", "autopilot-stack"],
    pocock: ["mp-implement-spec"],
    keep: "One orchestrator. Do not run both.",
  },
  {
    job: "Tests",
    pstack: ["tdd", "prove-it-works"],
    pocock: ["mp-tdd"],
    keep: "Whoever is building. Add prove-it-works if pstack is building.",
  },
  {
    job: "Review",
    pstack: ["interrogate", "no-comments"],
    pocock: ["mp-code-review"],
    keep: "code-review when a spec exists. interrogate if it does not.",
  },
  {
    job: "Pull request",
    pstack: ["opening-a-pr", "babysit"],
    pocock: ["mp-pr"],
    keep: "Pocock's shape, pstack's playbook. Babysit only if you want CI driven.",
  },
  {
    job: "After the session",
    pstack: ["reflect", "correct"],
    pocock: ["mp-retro", "mp-handoff"],
    keep: "retro and handoff for the repo. reflect only for the agent setup.",
  },
  {
    job: "Hard bug",
    pstack: ["bug-fix", "runtime-forensics"],
    pocock: ["mp-diagnosing-bugs"],
    keep: "Pstack if you want the fix playbook end to end. diagnosing-bugs if you only want the loop.",
  },
];
