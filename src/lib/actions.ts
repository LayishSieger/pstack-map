"use server";

import { headers } from "next/headers";
import { sourceOf } from "@/catalog";
import { allow } from "@/lib/rate-limit";
import { getSkillText, sliceSkillText } from "@/lib/skill-text";
import { waitForUpstreamStatus } from "@/lib/upstream-status";
import type { UpstreamStatus } from "@/lib/upstream-types";

const WINDOW_MS = 60_000;

async function caller(bucket: string) {
  const header = await headers();
  const forwarded = header.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${bucket}:${forwarded || "local"}`;
}

export async function loadUpstreamStatus(): Promise<UpstreamStatus> {
  if (!allow(await caller("upstream"), 12, WINDOW_MS)) {
    return { checkedAt: Date.now(), items: [], error: "Too many update checks. Try again shortly." };
  }
  return waitForUpstreamStatus();
}

export async function loadSkillText(id: string) {
  const source = sourceOf(id);
  if (!allow(await caller("skill"), 60, WINDOW_MS)) {
    return {
      ok: false,
      text: "",
      href: source?.href ?? "",
      truncated: false,
      error: "Too many requests. Try again shortly.",
    };
  }
  const loaded = await getSkillText(id);
  if (!loaded.ok) return loaded;
  const sliced = sliceSkillText(loaded.text);
  return { ...loaded, text: sliced.text, truncated: sliced.truncated };
}
