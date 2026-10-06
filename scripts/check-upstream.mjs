import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const repo = process.env.GITHUB_REPOSITORY ?? "LayishSieger/pstack-map";
const token = process.env.GH_TOKEN;
if (!token) {
  console.error("GH_TOKEN is required");
  process.exit(1);
}

const src = readFileSync(new URL("../src/data/upstream.ts", import.meta.url), "utf8");
const blocks = [
  ...src.matchAll(
    /id: "(pstack|pocock)"[\s\S]*?pinnedSha: "([a-f0-9]+)"[\s\S]*?pinnedRelease: (null|"[^"]+")/g,
  ),
];
if (blocks.length !== 2) {
  console.error("Could not read both pins from src/data/upstream.ts");
  process.exit(1);
}

const pins = Object.fromEntries(
  blocks.map((match) => [
    match[1],
    {
      sha: match[2],
      release: match[3] === "null" ? null : match[3].slice(1, -1),
    },
  ]),
);

async function ghJson(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "pstack-map-upstream-check",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${path} returned ${response.status}: ${body.slice(0, 180)}`);
  }
  return response.json();
}

function gh(args, input) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    input,
    env: process.env,
  });
}

const pstackCommit = (await ghJson("/repos/cursor/plugins/commits?sha=main&per_page=1&path=pstack"))[0];
const pocockCommit = (await ghJson("/repos/mattpocock/skills/commits?sha=main&per_page=1"))[0];
const pocockRelease = await ghJson("/repos/mattpocock/skills/releases/latest");

const latest = {
  pstack: { sha: pstackCommit.sha, subject: pstackCommit.commit.message.split("\n")[0] },
  pocock: { sha: pocockCommit.sha, subject: pocockCommit.commit.message.split("\n")[0] },
  release: pocockRelease.tag_name,
};

const moved = [];
if (latest.pstack.sha !== pins.pstack.sha) {
  moved.push(
    `- **pstack** moved on \`cursor/plugins\` (\`pstack/\`): ${latest.pstack.subject}\n  ${latest.pstack.sha}\n  https://github.com/cursor/plugins/commits/main/pstack`,
  );
}
if (latest.pocock.sha !== pins.pocock.sha) {
  moved.push(
    `- **Matt Pocock skills** \`main\` moved: ${latest.pocock.subject}\n  https://github.com/mattpocock/skills/compare/${pins.pocock.sha}...main`,
  );
}
if (pins.pocock.release && latest.release !== pins.pocock.release) {
  moved.push(
    `- **Matt Pocock skills** release is \`${latest.release}\` (pin is \`${pins.pocock.release}\`).\n  https://github.com/mattpocock/skills/releases/tag/${latest.release}`,
  );
}

const marker = `<!-- drift pstack=${latest.pstack.sha} pocock=${latest.pocock.sha} release=${latest.release} -->`;
const open = JSON.parse(
  gh([
    "issue",
    "list",
    "--repo",
    repo,
    "--label",
    "upstream-drift",
    "--state",
    "open",
    "--json",
    "number,body",
  ]),
);

if (moved.length === 0) {
  for (const issue of open) {
    gh([
      "issue",
      "comment",
      String(issue.number),
      "--repo",
      repo,
      "--body",
      "Pins in `src/data/upstream.ts` match upstream again. Closing.",
    ]);
    gh(["issue", "close", String(issue.number), "--repo", repo, "--reason", "completed"]);
  }
  console.log("Upstream matches the pins.");
  process.exit(0);
}

if (open.some((issue) => issue.body?.includes(marker))) {
  console.log("An open issue already covers this upstream state.");
  process.exit(0);
}

const body = `@LayishSieger

The skill map is out of date. Upstream moved past the pins in \`src/data/upstream.ts\`.

${moved.join("\n\n")}

Update the map and move the pins in the same change. Ask in the Grok chat if you want that done there.

${marker}
`;

gh(["label", "create", "upstream-drift", "--repo", repo, "--color", "E2A44A", "--description", "Pinned upstream skill repos moved", "--force"]);
const created = gh([
  "issue",
  "create",
  "--repo",
  repo,
  "--assignee",
  "LayishSieger",
  "--label",
  "upstream-drift",
  "--title",
  "Upstream skill repos moved",
  "--body",
  body,
]);
console.log(created.trim());
