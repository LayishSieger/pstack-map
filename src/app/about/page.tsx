import type { Metadata } from "next";
import { PageMain } from "@/components/page-main";
import { SkillMarkdownView } from "@/components/skill-markdown-view";
import { aboutMarkdown } from "@/lib/public-copy";

export const metadata: Metadata = {
  title: "About",
  description: "What Skill atlas covers, whose skill files it shows, and which packs are not on the map yet.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PageMain>
      <SkillMarkdownView text={aboutMarkdown()} headingLevel={1} />
    </PageMain>
  );
}
