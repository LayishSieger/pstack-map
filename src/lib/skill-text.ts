import "server-only";
import { sourceOf } from "@/catalog";
import { githubHeaders } from "@/lib/github";

const TTL_MS = 15 * 60 * 1000;
const MAX_CHARS = 80_000;

type CacheEntry = { at: number; text: string };
const cache = new Map<string, CacheEntry>();
const MAX_IN_FLIGHT = 4;
let inFlight = 0;
const waiters: (() => void)[] = [];

async function withSlot<T>(run: () => Promise<T>): Promise<T> {
  if (inFlight >= MAX_IN_FLIGHT) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  inFlight += 1;
  try {
    return await run();
  } finally {
    inFlight -= 1;
    waiters.shift()?.();
  }
}

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
  return withSlot(() => readGitHub(url));
}

async function readGitHub(url: string): Promise<string> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.text;
  let response: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(url, {
      cache: "force-cache",
      headers: githubHeaders(),
      signal: AbortSignal.timeout(8000),
    });
    const retry = response.status === 429 || response.status === 403;
    if (response.ok || !retry || attempt === 2) break;
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  if (!response?.ok) throw new Error(`GitHub returned ${response?.status ?? "no response"}`);
  const text = await response.text();
  cache.set(url, { at: Date.now(), text });
  return text;
}

export function sliceSkillText(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_CHARS) return { text, truncated: false };
  return { text: text.slice(0, MAX_CHARS), truncated: true };
}

export async function getSkillText(id: string): Promise<SkillText> {
  const source = sourceOf(id);
  if (!source) return empty;
  try {
    const text = await githubText(source.rawUrl);
    return { ok: true, text, href: source.href, truncated: false, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load the file.";
    return { ok: false, text: "", href: source.href, truncated: false, error: message };
  }
}
