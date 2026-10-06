import type { Metadata } from "next";
import { PageMain } from "@/components/page-main";
import { SkillMarkdownView } from "@/components/skill-markdown-view";
import { contactMarkdown } from "@/lib/public-copy";

export const metadata: Metadata = {
  title: "Contact",
  description: "Skill atlas is a personal map. GitHub issues are the contact path.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageMain>
      <SkillMarkdownView text={contactMarkdown()} headingLevel={1} />
    </PageMain>
  );
}
