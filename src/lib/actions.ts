"use server";

import { getSkillText } from "@/lib/skill-text";
import { getUpstreamStatus } from "@/lib/upstream-status";

export async function loadUpstreamStatus() {
  return getUpstreamStatus();
}

export async function loadSkillText(id: string) {
  return getSkillText(id);
}
