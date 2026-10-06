export type Kind = "skill" | "playbook" | "principle" | "agent";

/** Add an id here when a pack joins the atlas. gstack and a still-unnamed own pack are next. */
export type PackId = "pstack" | "pocock";

/** Add the GitHub repo here in the same change as the pack. */
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
