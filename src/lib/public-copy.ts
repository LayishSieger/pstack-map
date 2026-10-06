import { compare, packViews, skillsFor, sourceOf } from "../catalog/index.ts";
import { watches } from "../data/upstream.ts";
import { absolute, description, siteName } from "./site.ts";

export function homeMarkdown(): string {
  const { choices, columns, jobs } = compare();
  const lines = [
    `# ${siteName}`,
    "",
    `> ${description}`,
    "",
    "Pstack is one sticky router that picks a playbook. Pocock is a set of small commands you invoke, and a user-invoked skill does not call another user-invoked skill. Pick one owner per phase. Two builders on the same ticket fight.",
    "",
    `- [All skills](${absolute("/skills")}): titles, blurbs, and pinned files`,
    `- [About](${absolute("/about")}): whose files these are, and what is not on the map yet`,
    `- [llms.txt](${absolute("/llms.txt")}): when to use this site`,
    "",
    "## Which flow",
    "",
  ];
  for (const choice of choices) {
    lines.push(`### ${choice.title}`, "", choice.when, "");
    choice.steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
    lines.push("", "Leave these out:", "");
    for (const item of choice.drop) lines.push(`- ${item}`);
    lines.push("");
  }
  lines.push("## Same job, both packs", "");
  lines.push(`| Job | ${columns.map((column) => column.label).join(" | ")} | Keep |`);
  lines.push(`| --- | ${columns.map(() => "---").join(" | ")} | --- |`);
  for (const job of jobs) {
    const cells = columns.map((column) =>
      job.packs[column.id].map((skill) => `[${skill.title}](${absolute(`/skills/${skill.id}`)})`).join(", "),
    );
    lines.push(`| ${job.job} | ${cells.join(" | ")} | ${job.keep} |`);
  }
  lines.push("");
  return lines.join("\n");
}

export function skillIndexMarkdown(): string {
  const lines = [
    `# Skills`,
    "",
    `Every skill on ${siteName}, grouped by pack. Each link is the pinned file.`,
    "",
  ];
  for (const pack of packViews) {
    const watch = watches.find((item) => item.id === pack.id);
    lines.push(`## ${pack.label}`, "", pack.lede, "");
    if (watch) {
      lines.push(
        `${watch.license}. ${watch.copyright}. [License](https://github.com/${watch.repo}/blob/${watch.pinnedSha}/${watch.licensePath}).`,
        "",
      );
    }
    for (const skill of skillsFor(pack.id)) {
      lines.push(`- [${skill.title}](${absolute(`/skills/${skill.id}`)}): ${skill.blurb}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function aboutMarkdown(): string {
  return [
    "# About",
    "",
    `${siteName} is a public map of agent skill packs and a guide to running one flow at a time.`,
    "",
    "Today the map has two packs. pstack, by Lauren Tan, lives in cursor/plugins and is a sticky router: you name a goal and a check, and poteto-mode picks one playbook. Matt Pocock's skills are small commands you invoke yourself. The Compare tab says when to use one pack, the other, or a hybrid, and which skills to leave out so two builders do not fight over the same change.",
    "",
    "gstack, by Garry Tan, is the next pack. It is not on the map yet. A pack of my own is planned too, and it does not have a name yet. The product is named for the atlas, not for the first pack inside it.",
    "",
    `Skill files are fetched from the pinned commit and shown here under their own MIT licenses. ${attribution()} The words on the map, the compare guide, and this site are MIT, Copyright (c) 2026 Layish Sieger.`,
    "",
    "This site is not affiliated with Cursor, Matt Pocock, or Garry Tan. There is no account and no analytics.",
    "",
    `- [Repository](https://github.com/LayishSieger/pstack-map)`,
    `- [Which flow](${absolute("/")})`,
    `- [All skills](${absolute("/skills")})`,
  ].join("\n");
}

export function contactMarkdown(): string {
  return [
    "# Contact",
    "",
    `${siteName} is a personal reference site, not a company. There is no support desk, phone number, or mailing address.`,
    "",
    "To report a wrong skill, a broken source link, or a pack that should be on the map, open a GitHub issue on the repository. That is the only contact path. Include the skill id and the page URL.",
    "",
    "- [Open an issue](https://github.com/LayishSieger/pstack-map/issues)",
    `- [About this site](${absolute("/about")})`,
    "",
    "Please do not send credentials or private repository contents. The map only shows public files from the pinned upstream commits.",
  ].join("\n");
}

export function privacyMarkdown(): string {
  return [
    "# Privacy",
    "",
    `${siteName} does not have accounts, and it does not run analytics or advertising cookies. The pages you request are the record of what the site does.`,
    "",
    "The site is hosted on Vercel. Vercel receives the usual request data for a hosted site, including IP address and user agent, under its own hosting logs. This project does not copy those logs into an app database.",
    "",
    "Opening a skill in the map calls a server action that reads the pinned file from GitHub. The action is rate-limited per IP so a burst of requests does not hammer GitHub. The file is cached against that immutable commit URL. The skill page itself is rendered with the file in the HTML, so a normal visit does not need the action.",
    "",
    "Upstream freshness is a separate check against the GitHub API, cached for about an hour. An optional GITHUB_TOKEN on the server raises GitHub's rate limit. The token is not sent to the browser.",
    "",
    `- [About](${absolute("/about")})`,
    `- [Contact](${absolute("/contact")})`,
  ].join("\n");
}

export function llmsText(): string {
  return [
    `# ${siteName}`,
    "",
    `> ${description}`,
    "",
    "## When to use this",
    "",
    "Use Skill atlas when you need to choose between pstack and Matt Pocock's skills, or when you need the pinned text of one of those skills. Start with Which flow if the question is which pack should own a phase. Open a skill page when the question is what that skill says. Do not use this site for gstack yet. gstack is not catalogued here. A future pack does not have a name yet, and it is not on the map either.",
    "",
    "## Start here",
    "",
    `- [Which flow](${absolute("/")}): pstack only, Pocock only, or a hybrid, and the same job in both packs`,
    `- [All skills](${absolute("/skills")}): every skill title, blurb, and pinned file`,
    `- [About](${absolute("/about")}): licenses, attribution, and what is not included`,
    `- [Privacy](${absolute("/privacy")}): no accounts and no analytics`,
    `- [Contact](${absolute("/contact")}): GitHub issues are the contact path`,
    "",
    "## Packs on the map",
    "",
    ...watches.map((watch) => `- [${watch.label}](${packTree(watch)}): ${watch.license}, ${watch.copyright}, pin ${watch.pinnedSha}`),
    "",
    `Skill pages live under ${absolute("/skills")}. Fetch that index, then fetch the skill URL. Each skill page includes the pinned file.`,
    "",
  ].join("\n");
}

export function notFoundMarkdown(): string {
  return [
    "# Page not found",
    "",
    `This URL is not a page on ${siteName}. The map, the skill index, and the agent index are linked below.`,
    "",
    `- [Which flow](${absolute("/")})`,
    `- [All skills](${absolute("/skills")})`,
    `- [llms.txt](${absolute("/llms.txt")})`,
    `- [Sitemap](${absolute("/sitemap.xml")})`,
    "",
  ].join("\n");
}

export function skillPreface(id: string): { title: string; blurb: string; markdown: string } | null {
  for (const pack of packViews) {
    const skill = skillsFor(pack.id).find((item) => item.id === id);
    if (!skill) continue;
    const source = sourceOf(id);
    const watch = watches.find((item) => item.id === pack.id);
    if (!source || !watch) return null;
    return {
      title: skill.title,
      blurb: skill.blurb,
      markdown: [
        `# ${skill.title}`,
        "",
        skill.blurb,
        "",
        `Pack: ${pack.label}. ${watch.license}. ${watch.copyright}.`,
        "",
        `Pinned file: ${source.href}`,
        "",
        "The upstream file follows.",
        "",
      ].join("\n"),
    };
  }
  return null;
}

function packTree(watch: (typeof watches)[number]): string {
  const suffix = watch.path ? `/${watch.path}` : "";
  return `https://github.com/${watch.repo}/tree/${watch.pinnedSha}${suffix}`;
}

function attribution(): string {
  return watches.map((watch) => `${watch.label} is ${watch.license}, ${watch.copyright}.`).join(" ");
}

