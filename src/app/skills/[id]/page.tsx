import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { skillsFor, sourceOf, packViews } from "@/catalog";
import { PageMain } from "@/components/page-main";
import { SkillMarkdownView } from "@/components/skill-markdown-view";
import { watches } from "@/data/upstream";
import { getSkillText } from "@/lib/skill-text";

export function generateStaticParams() {
  return packViews.flatMap((pack) => skillsFor(pack.id).map((skill) => ({ id: skill.id })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const found = findSkill(id);
  if (!found) return {};
  return {
    title: found.skill.title,
    description: found.skill.blurb,
    alternates: { canonical: `/skills/${found.skill.id}` },
  };
}

export default async function SkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = findSkill(id);
  if (!found) notFound();
  const source = sourceOf(id);
  const loaded = await getSkillText(id);
  if (!loaded.ok || !source) {
    throw new Error(loaded.error ?? "Could not load the skill file.");
  }
  return (
    <PageMain>
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{found.pack.label}</p>
        <h1 className="font-mono text-3xl font-semibold tracking-tight">{found.skill.title}</h1>
        <p className="text-base leading-relaxed text-muted-foreground">{found.skill.blurb}</p>
        <p className="text-sm text-muted-foreground">
          {found.watch.license}. {found.watch.copyright}.{" "}
          <a href={source.href} className="text-foreground underline-offset-4 hover:underline">
            Pinned file on GitHub
          </a>
        </p>
      </header>
      <SkillMarkdownView text={loaded.text} />
    </PageMain>
  );
}

function findSkill(id: string) {
  for (const pack of packViews) {
    const skill = skillsFor(pack.id).find((item) => item.id === id);
    const watch = watches.find((item) => item.id === pack.id);
    if (skill && watch) return { skill, pack, watch };
  }
  return null;
}
