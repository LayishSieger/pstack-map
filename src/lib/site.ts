export const siteName = "Skill atlas";

export const siteUrl = "https://pstack-map.vercel.app";

export const description =
  "A map of agent skill packs. Today it covers pstack and Matt Pocock's skills, and which flow to run. gstack is next.";

export function absolute(path: string): string {
  if (path === "/") return `${siteUrl}/`;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
