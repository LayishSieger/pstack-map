export type Kind = "skill" | "playbook" | "principle" | "agent";

export type Repo = "cursor/plugins" | "mattpocock/skills";

/** A skill record before the catalog fills in its source path. */
export type SkillDraft = {
  id: string;
  title: string;
  kind: Kind;
  group: string;
  blurb: string;
  path?: string;
};

export type Skill = {
  id: string;
  title: string;
  kind: Kind;
  group: string;
  blurb: string;
  repo: Repo;
  path: string;
};

export type Edge = {
  from: string;
  to: string;
  why: string;
};

export type FlowStep = {
  label: string;
  skillId: string;
};
