import type { Metadata } from "next";
import { packViews, skillsFor } from "@/catalog";
import { PageMain } from "@/components/page-main";
import { watches } from "@/data/upstream";

export const metadata: Metadata = {
  title: "Skills",
  description: "Every pstack and Matt Pocock skill on the atlas, with the pinned file.",
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  return (
    <PageMain>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Skills</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Every skill on the atlas. The link opens the pinned file in the page. gstack is not listed yet.
        </p>
      </header>
      {packViews.map((pack) => {
        const watch = watches.find((item) => item.id === pack.id);
        return (
          <section key={pack.id} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight">{pack.label}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{pack.lede}</p>
            {watch ? (
              <p className="text-sm text-muted-foreground">
                {watch.license}. {watch.copyright}.{" "}
                <a
                  href={`https://github.com/${watch.repo}/blob/${watch.pinnedSha}/${watch.licensePath}`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  License
                </a>
              </p>
            ) : null}
            <ul className="flex flex-col gap-3">
              {skillsFor(pack.id).map((skill) => (
                <li key={skill.id} className="flex flex-col gap-1">
                  <a href={`/skills/${skill.id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                    {skill.title}
                  </a>
                  <p className="text-sm leading-relaxed text-muted-foreground">{skill.blurb}</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </PageMain>
  );
}
