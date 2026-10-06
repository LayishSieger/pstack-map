import { useMemo, useState } from "react";
import { SkillSource } from "@/components/skill-source";
import { ArrowRight, Search } from "lucide-react";
import type { Edge, Kind, NodeItem } from "@/data/pstack";

const kindLabel: Record<Kind, string> = {
  skill: "Skill",
  playbook: "Playbook",
  principle: "Principle",
  agent: "Agent",
};

export type FlowStep = { id: string; label: string };

type SkillMapProps = {
  kicker: string;
  title: string;
  lede: string;
  nodes: NodeItem[];
  edges: Edge[];
  flow: readonly FlowStep[];
  groups: readonly string[];
  defaultId: string;
  hubs?: Record<string, string>;
};

export function SkillMap({
  kicker,
  title,
  lede,
  nodes,
  edges,
  flow,
  groups,
  defaultId,
  hubs = {},
}: SkillMapProps) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");
  const [selectedId, setSelectedId] = useState(defaultId);

  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const selected = byId.get(selectedId) ?? nodes[0];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nodes.filter((node) => {
      if (group !== "All" && node.group !== group) return false;
      if (!q) return true;
      return (
        node.title.toLowerCase().includes(q) ||
        node.blurb.toLowerCase().includes(q) ||
        node.group.toLowerCase().includes(q)
      );
    });
  }, [group, nodes, query]);

  const outgoing = edges.filter((edge) => edge.from === selected.id);
  const incoming = edges.filter((edge) => edge.to === selected.id);
  const linked = new Set<string>([
    selected.id,
    ...outgoing.map((edge) => edge.to),
    ...incoming.map((edge) => edge.from),
  ]);
  const showLinks = linked.size <= 16;

  return (
    <div>
      <header className="mb-6 max-w-3xl">
        <p className="font-mono text-sm text-accent">{kicker}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted">{lede}</p>
      </header>

      <ol className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {flow.map((step, index) => {
          const hubTarget = hubs[step.id];
          const active = !hubTarget && selected.id === step.id;
          return (
            <li key={step.id} className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setGroup("All");
                  setQuery("");
                  setSelectedId(hubTarget ?? step.id);
                }}
                className={`min-h-11 rounded-card border px-3 py-2 text-left ${
                  active ? "border-accent bg-raised text-fg" : "border-line bg-surface text-muted"
                }`}
              >
                <span className="block font-mono text-xs text-accent">0{index + 1}</span>
                <span className="block text-sm font-medium text-fg">{step.label}</span>
              </button>
              {index < flow.length - 1 ? <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search the map</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this map"
                suppressHydrationWarning
                className="h-11 w-full rounded-card border border-line bg-surface pr-3 pl-10 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
              />
            </label>
            <p className="font-mono text-xs text-muted">
              {visible.length} of {nodes.length}
            </p>
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {groups.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGroup(item)}
                className={`min-h-11 shrink-0 rounded-full border px-3 text-sm ${
                  group === item ? "border-accent bg-raised text-fg" : "border-line text-muted"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="rounded-card border border-line bg-surface p-6 text-muted">Nothing matches that filter.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {visible.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  active={node.id === selected.id}
                  linked={showLinks && linked.has(node.id) && node.id !== selected.id}
                  onSelect={() => setSelectedId(node.id)}
                />
              ))}
            </ul>
          )}
        </section>

        <aside className="rounded-card border border-line bg-surface p-4 lg:sticky lg:top-4">
          <p className="font-mono text-xs text-accent">
            {kindLabel[selected.kind]} · {selected.group}
          </p>
          <h2 className="mt-1 font-mono text-lg font-medium">{selected.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{selected.blurb}</p>
          <ConnectionList title="Calls" items={outgoing} direction="to" byId={byId} onSelect={setSelectedId} />
          <ConnectionList title="Called by" items={incoming} direction="from" byId={byId} onSelect={setSelectedId} />
          <SkillSource id={selected.id} />
        </aside>
      </div>
    </div>
  );
}

function NodeCard({
  node,
  active,
  linked,
  onSelect,
}: {
  node: NodeItem;
  active: boolean;
  linked: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`h-full w-full rounded-card border p-3 text-left ${
          active ? "border-accent bg-raised" : linked ? "border-line bg-raised" : "border-line bg-surface"
        }`}
      >
        <span className="font-mono text-xs text-accent">
          {kindLabel[node.kind]} · {node.group}
        </span>
        <span className="mt-1 block font-medium">{node.title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">{node.blurb}</span>
      </button>
    </li>
  );
}

function ConnectionList({
  title,
  items,
  direction,
  byId,
  onSelect,
}: {
  title: string;
  items: Edge[];
  direction: "to" | "from";
  byId: Map<string, NodeItem>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-medium">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">None on this map.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.slice(0, 8).map((edge) => {
            const id = direction === "to" ? edge.to : edge.from;
            const node = byId.get(id);
            return (
              <li key={`${edge.from}-${edge.to}`}>
                <button type="button" onClick={() => onSelect(id)} className="w-full text-left">
                  <span className="font-mono text-sm text-accent">{node?.title ?? id}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted">{edge.why}</span>
                </button>
              </li>
            );
          })}
          {items.length > 8 ? (
            <li className="text-sm text-muted">+ {items.length - 8} more. Filter the list to browse them.</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
