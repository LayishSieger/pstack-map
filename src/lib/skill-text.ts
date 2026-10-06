import "server-only";
import { sourceOf } from "@/catalog";

const TTL_MS = 15 * 60 * 1000;
const MAX_CHARS = 80_000;

type CacheEntry = { at: number; text: string; truncated: boolean };
const cache = new Map<string, CacheEntry>();

export type SkillText = {
  ok: boolean;
  text: string;
  href: string;
  truncated: boolean;
  error: string | null;
};

const empty: SkillText = { ok: false, text: "", href: "", truncated: false, error: "No source file for this item." };

async function githubText(url: string): Promise<{ text: string; truncated: boolean }> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return { text: hit.text, truncated: hit.truncated };
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": "pstack-map" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  const raw = await response.text();
  const truncated = raw.length > MAX_CHARS;
  const text = truncated ? raw.slice(0, MAX_CHARS) : raw;
  cache.set(url, { at: Date.now(), text, truncated });
  return { text, truncated };
}

export async function getSkillText(id: string): Promise<SkillText> {
  const source = sourceOf(id);
  if (!source) return empty;
  try {
    const loaded = await githubText(source.rawUrl);
    return { ok: true, text: loaded.text, href: source.href, truncated: loaded.truncated, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load the file.";
    return { ok: false, text: "", href: source.href, truncated: false, error: message };
  }
}
