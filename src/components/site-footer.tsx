import { watches } from "@/data/upstream";

const links = [
  { href: "/", label: "Which flow" },
  { href: "/skills", label: "Skills" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/llms.txt", label: "llms.txt" },
  { href: "https://github.com/LayishSieger/pstack-map", label: "Repository" },
];

export function SiteFooter() {
  return (
    <footer className="flex shrink-0 flex-col gap-2 border-t px-4 py-3 text-sm text-muted-foreground">
      <nav className="flex flex-wrap gap-x-4 gap-y-1">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="text-foreground underline-offset-4 hover:underline">
            {link.label}
          </a>
        ))}
        {watches.map((watch) => (
          <a
            key={watch.id}
            href={`https://github.com/${watch.repo}/blob/${watch.pinnedSha}/${watch.licensePath}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {watch.label} license
          </a>
        ))}
      </nav>
      <p className="max-w-3xl text-xs leading-relaxed">
        {watches.map((watch) => `${watch.label} text is ${watch.license}, ${watch.copyright}.`).join(" ")} The map
        itself is MIT, Copyright (c) 2026 Layish Sieger.
      </p>
    </footer>
  );
}
