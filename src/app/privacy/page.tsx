import type { Metadata } from "next";
import { PageMain } from "@/components/page-main";
import { SkillMarkdownView } from "@/components/skill-markdown-view";
import { privacyMarkdown } from "@/lib/public-copy";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Skill atlas has no accounts and no analytics. Skill files are read from pinned GitHub commits.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PageMain>
      <SkillMarkdownView text={privacyMarkdown()} headingLevel={1} />
    </PageMain>
  );
}
