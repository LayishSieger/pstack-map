"use server";

import { getSkillText } from "@/lib/skill-text";
import { waitForUpstreamStatus } from "@/lib/upstream-status";

export async function loadUpstreamStatus() {
  return waitForUpstreamStatus();
}

export async function loadSkillText(id: string) {
  return getSkillText(id);
}
