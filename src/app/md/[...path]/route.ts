import { getSkillText } from "@/lib/skill-text";
import {
  aboutMarkdown,
  contactMarkdown,
  homeMarkdown,
  notFoundMarkdown,
  privacyMarkdown,
  skillIndexMarkdown,
  skillPreface,
} from "@/lib/public-copy";

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const joined = path.join("/");
  const document = await documentFor(joined);
  return markdown(document.body, document.status);
}

async function documentFor(path: string): Promise<{ status: number; body: string }> {
  if (path === "home") return { status: 200, body: homeMarkdown() };
  if (path === "skills") return { status: 200, body: skillIndexMarkdown() };
  if (path === "about") return { status: 200, body: aboutMarkdown() };
  if (path === "contact") return { status: 200, body: contactMarkdown() };
  if (path === "privacy") return { status: 200, body: privacyMarkdown() };
  if (path.startsWith("skills/")) {
    const id = path.slice("skills/".length);
    const preface = id.includes("/") ? null : skillPreface(id);
    if (!preface) return { status: 404, body: notFoundMarkdown() };
    const loaded = await getSkillText(id);
    if (!loaded.ok) return { status: 404, body: notFoundMarkdown() };
    return { status: 200, body: `${preface.markdown}${loaded.text}` };
  }
  return { status: 404, body: notFoundMarkdown() };
}

function markdown(body: string, status: number) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "Cache-Control": status === 200 ? "public, max-age=300" : "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
