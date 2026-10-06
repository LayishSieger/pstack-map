import "server-only";
import { blobUrl, docFor } from "@/data/docs";

const TTL_MS = 15 * 60 * 1000;
const MAX_CHARS = 80_000;

type CacheEntry = { at: number; text: string };
const cache = new Map<string, CacheEntry>();

export type SkillText = {
  ok: boolean;
  text: string;
  href: string;
  truncated: boolean;
  error: string | null;
};

const empty: SkillText = { ok: false, text: "", href: "", truncated: false, error: "No source file for this item." };

async function githubText(url: string): Promise<string> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.text;
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": "pstack-map" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  const text = await response.text();
  cache.set(url, { at: Date.now(), text });
  return text;
}

export async function getSkillText(id: string): Promise<SkillText> {
  const doc = docFor(id);
  if (!doc) return empty;
  const href = blobUrl(doc);
  try {
    const raw = await githubText(`https://raw.githubusercontent.com/${doc.repo}/main/${doc.path}`);
    const truncated = raw.length > MAX_CHARS;
    return { ok: true, text: truncated ? raw.slice(0, MAX_CHARS) : raw, href, truncated, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load the file.";
    return { ok: false, text: "", href, truncated: false, error: message };
  }
}
