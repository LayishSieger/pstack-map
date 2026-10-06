import { PageMain } from "@/components/page-main";

export default function NotFound() {
  return (
    <PageMain>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-base leading-relaxed text-muted-foreground">
        This URL is not a page on Skill atlas. The map and the skill index are the places to start.
      </p>
      <nav className="flex flex-col gap-2 text-sm">
        <a href="/" className="text-foreground underline-offset-4 hover:underline">
          Which flow
        </a>
        <a href="/skills" className="text-foreground underline-offset-4 hover:underline">
          All skills
        </a>
        <a href="/llms.txt" className="text-foreground underline-offset-4 hover:underline">
          llms.txt
        </a>
      </nav>
    </PageMain>
  );
}