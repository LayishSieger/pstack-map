import { choices, jobs } from "../data/decide.ts";
import {
  edges as pstackHandEdges,
  flow as pstackFlow,
  groups as pstackGroups,
  nodes as pstackNodes,
  routerSkillIds,
} from "../data/pstack.ts";
import { pocockEdges, pocockFlow, pocockGroups, pocockNodes } from "../data/pocock.ts";
import type { Edge, FlowStep, Repo, Skill, SkillDraft } from "./types.ts";

export type { Skill } from "./types.ts";

const PLAYBOOK_WHY = "Matched from the goal and the check. Steps are copied into the todo list.";
const ROUTER_WHY = "Called when a playbook step needs it, not up front.";
const PRINCIPLE_WHY = "The index is read at task start. The leaf skill is opened only if the principle is applied.";

export type MapState = {
  query?: string;
  group?: string;
  selectedId?: string;
};

export type MapView = {
  groups: readonly string[];
  flow: readonly { label: string; skillId: string; active: boolean }[];
  visible: readonly Skill[];
  selected: Skill;
  calls: readonly { skill: Skill; why: string }[];
  calledBy: readonly { skill: Skill; why: string }[];
  shown: number;
  total: number;
};

export type Source = {
  repo: Repo;
  path: string;
  href: string;
  rawUrl: string;
};

type PackId = "pstack" | "pocock";

type Pack = {
  id: PackId;
  defaultSkillId: string;
  skills: readonly Skill[];
  byId: ReadonlyMap<string, Skill>;
  edges: readonly Edge[];
  flow: readonly FlowStep[];
  groups: readonly string[];
};

function fail(message: string): never {
  throw new Error(`Skill catalog: ${message}`);
}

function pstackPath(draft: SkillDraft): string {
  if (draft.path) return draft.path;
  if (draft.kind === "skill") return `pstack/skills/${draft.id}/SKILL.md`;
  if (draft.kind === "playbook") return `pstack/skills/poteto-mode/playbooks/${draft.id}.md`;
  if (draft.kind === "principle") return `pstack/skills/principle-${draft.id}/SKILL.md`;
  return fail(`Agent ${draft.id} needs a path.`);
}

function pocockPath(draft: SkillDraft): string {
  if (!draft.path) return fail(`${draft.id} needs a path.`);
  return draft.path;
}

function materialize(drafts: readonly SkillDraft[], repo: Repo, pathFor: (draft: SkillDraft) => string): Skill[] {
  const seen = new Set<string>();
  return drafts.map((draft) => {
    if (seen.has(draft.id)) fail(`Duplicate id ${draft.id}.`);
    seen.add(draft.id);
    return {
      id: draft.id,
      title: draft.title,
      kind: draft.kind,
      group: draft.group,
      blurb: draft.blurb,
      repo,
      path: pathFor(draft),
    };
  });
}

function pstackEdges(skills: readonly Skill[]): Edge[] {
  const generated: Edge[] = [];
  for (const skill of skills) {
    if (skill.kind === "playbook") generated.push({ from: "poteto-mode", to: skill.id, why: PLAYBOOK_WHY });
  }
  for (const id of routerSkillIds) {
    generated.push({ from: "poteto-mode", to: id, why: ROUTER_WHY });
  }
  for (const skill of skills) {
    if (skill.kind === "principle") generated.push({ from: "poteto-mode", to: skill.id, why: PRINCIPLE_WHY });
  }
  return [...generated, ...pstackHandEdges];
}

function requireSkill(pack: Pack, id: string): Skill {
  const skill = pack.byId.get(id);
  if (!skill) fail(`${pack.id} is missing ${id}.`);
  return skill;
}

function assertEdges(edges: readonly Edge[], pack: Pack) {
  const seen = new Set<string>();
  for (const edge of edges) {
    if (!pack.byId.has(edge.from)) fail(`${pack.id} edge from unknown skill ${edge.from}.`);
    if (!pack.byId.has(edge.to)) fail(`${pack.id} edge to unknown skill ${edge.to}.`);
    const key = `${edge.from}->${edge.to}`;
    if (seen.has(key)) fail(`${pack.id} has a duplicate edge ${key}.`);
    seen.add(key);
  }
}

function assertFlow(flow: readonly FlowStep[], pack: Pack) {
  for (const step of flow) {
    if (!pack.byId.has(step.skillId)) fail(`${pack.id} flow step opens unknown skill ${step.skillId}.`);
  }
}

function assertGroups(groups: readonly string[], pack: Pack) {
  if (groups.includes("All")) fail(`${pack.id} group list includes All. The catalog adds it.`);
  const allowed = new Set(groups);
  for (const skill of pack.skills) {
    if (!allowed.has(skill.group)) {
      fail(`${pack.id} skill ${skill.id} uses group ${skill.group}, which is not in the menu.`);
    }
  }
}

function buildPack(input: {
  id: PackId;
  defaultSkillId: string;
  drafts: readonly SkillDraft[];
  repo: Repo;
  pathFor: (draft: SkillDraft) => string;
  edges: (skills: readonly Skill[]) => readonly Edge[];
  flow: readonly FlowStep[];
  groups: readonly string[];
}): Pack {
  const skills = materialize(input.drafts, input.repo, input.pathFor);
  const paths = new Set<string>();
  for (const skill of skills) {
    const key = `${skill.repo}/${skill.path}`;
    if (paths.has(key)) fail(`Duplicate source ${key}.`);
    paths.add(key);
  }
  const pack: Pack = {
    id: input.id,
    defaultSkillId: input.defaultSkillId,
    skills,
    byId: new Map(skills.map((skill) => [skill.id, skill])),
    edges: [],
    flow: input.flow,
    groups: ["All", ...input.groups],
  };
  pack.edges = input.edges(skills);
  assertEdges(pack.edges, pack);
  assertFlow(pack.flow, pack);
  assertGroups(input.groups, pack);
  requireSkill(pack, input.defaultSkillId);
  return pack;
}

const packs: Record<PackId, Pack> = {
  pstack: buildPack({
    id: "pstack",
    defaultSkillId: "poteto-mode",
    drafts: pstackNodes,
    repo: "cursor/plugins",
    pathFor: pstackPath,
    edges: pstackEdges,
    flow: pstackFlow,
    groups: pstackGroups,
  }),
  pocock: buildPack({
    id: "pocock",
    defaultSkillId: "mp-ask-matt",
    drafts: pocockNodes,
    repo: "mattpocock/skills",
    pathFor: pocockPath,
    edges: () => pocockEdges,
    flow: pocockFlow,
    groups: pocockGroups,
  }),
};

const skillsById = new Map<string, Skill>();
for (const pack of Object.values(packs)) {
  for (const skill of pack.skills) {
    if (skillsById.has(skill.id)) fail(`Id ${skill.id} is in more than one pack.`);
    skillsById.set(skill.id, skill);
  }
}

function resolveJobSkills(ids: readonly string[], pack: Pack, job: string): Skill[] {
  return ids.map((id) => {
    const skill = pack.byId.get(id);
    if (!skill) fail(`Job "${job}" names unknown skill ${id}.`);
    return skill;
  });
}

const resolvedJobs = jobs.map((job) => ({
  job: job.job,
  pstack: resolveJobSkills(job.pstack, packs.pstack, job.job),
  pocock: resolveJobSkills(job.pocock, packs.pocock, job.job),
  keep: job.keep,
}));

function linked(pack: Pack, id: string, direction: "from" | "to") {
  return pack.edges
    .filter((edge) => edge[direction] === id)
    .map((edge) => ({
      skill: requireSkill(pack, direction === "from" ? edge.to : edge.from),
      why: edge.why,
    }));
}

export function openPack(packId: PackId, state: MapState = {}): MapView {
  const pack = packs[packId];
  if (!pack) fail(`Unknown pack ${String(packId)}.`);
  const selected = (state.selectedId && pack.byId.get(state.selectedId)) || requireSkill(pack, pack.defaultSkillId);
  const group = state.group && pack.groups.includes(state.group) ? state.group : "All";
  const query = state.query?.trim().toLowerCase() ?? "";
  const visible = pack.skills.filter((skill) => {
    if (group !== "All" && skill.group !== group) return false;
    if (!query) return true;
    return (
      skill.title.toLowerCase().includes(query) ||
      skill.blurb.toLowerCase().includes(query) ||
      skill.group.toLowerCase().includes(query)
    );
  });
  return {
    groups: pack.groups,
    flow: pack.flow.map((step) => ({
      label: step.label,
      skillId: step.skillId,
      active: selected.id === step.skillId,
    })),
    visible,
    selected,
    calls: linked(pack, selected.id, "from"),
    calledBy: linked(pack, selected.id, "to"),
    shown: visible.length,
    total: pack.skills.length,
  };
}

export function sourceOf(id: string): Source | null {
  const skill = skillsById.get(id);
  if (!skill) return null;
  return {
    repo: skill.repo,
    path: skill.path,
    href: `https://github.com/${skill.repo}/blob/main/${skill.path}`,
    rawUrl: `https://raw.githubusercontent.com/${skill.repo}/main/${skill.path}`,
  };
}

export function compare() {
  return { choices, jobs: resolvedJobs };
}
