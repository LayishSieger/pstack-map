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
    /id: "([^"]+)"[\s\S]*?label: "([^"]+)"[\s\S]*?repo: "([^"]+)"[\s\S]*?path: "([^"]*)"[\s\S]*?pinnedSha: "([a-f0-9]+)"[\s\S]*?pinnedRelease: (null|"[^"]+")/g,
  ),
];
if (blocks.length < 2) {
  console.error("Could not read the pins from src/data/upstream.ts");
  process.exit(1);
}

const pins = blocks.map((match) => ({
  id: match[1],
  label: match[2],
  repo: match[3],
  path: match[4],
  sha: match[5],
  release: match[6] === "null" ? null : match[6].slice(1, -1),
}));

async function ghJson(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "skill-atlas-upstream-check",
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

const latest = [];
for (const pin of pins) {
  const commitsPath = `/repos/${pin.repo}/commits?sha=main&per_page=1${pin.path ? `&path=${encodeURIComponent(pin.path)}` : ""}`;
  const commit = (await ghJson(commitsPath))[0];
  latest.push({
    ...pin,
    head: commit.sha,
    subject: commit.commit.message.split("\n")[0],
    releaseTag: pin.release ? (await ghJson(`/repos/${pin.repo}/releases/latest`)).tag_name : null,
  });
}

const moved = [];
for (const item of latest) {
  if (item.head !== item.sha) {
    const where = item.path ? ` (\`${item.path}/\` on \`${item.repo}\`)` : ` (\`${item.repo}\`)`;
    const link = item.path
      ? `https://github.com/${item.repo}/commits/main/${item.path}`
      : `https://github.com/${item.repo}/compare/${item.sha}...main`;
    moved.push(`- **${item.label}** moved${where}: ${item.subject}\n  ${item.head}\n  ${link}`);
  }
  if (item.release && item.releaseTag !== item.release) {
    moved.push(
      `- **${item.label}** release is \`${item.releaseTag}\` (pin is \`${item.release}\`).\n  https://github.com/${item.repo}/releases/tag/${item.releaseTag}`,
    );
  }
}

const marker = `<!-- drift ${latest.map((item) => `${item.id}=${item.head}${item.releaseTag ? ` release=${item.releaseTag}` : ""}`).join(" ")} -->`;
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
