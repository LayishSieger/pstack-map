import type { MetadataRoute } from "next";
import { packViews, skillsFor } from "@/catalog";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages = ["/", "/skills", "/about", "/contact", "/privacy"];
  return [
    ...pages.map((path) => ({
      url: path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...packViews.flatMap((pack) =>
      skillsFor(pack.id).map((skill) => ({
        url: `${siteUrl}/skills/${skill.id}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ),
  ];
}
