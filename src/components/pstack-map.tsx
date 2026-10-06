"use client";

import { useEffect, useMemo, useState } from "react";
import { SkillSource } from "@/components/skill-source";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import type { Edge, Kind, NodeItem } from "@/data/pstack";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const kindLabel: Record<Kind, string> = {
  skill: "Skill",
  playbook: "Playbook",
  principle: "Principle",
  agent: "Agent",
};

const desktopQuery = "(min-width: 64rem)";

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

function BrowseColumn({
  contained,
  kicker,
  title,
  lede,
  query,
  onQuery,
  groups,
  group,
  onGroup,
  visibleCount,
  totalCount,
  flow,
  hubs,
  selectedId,
  onStep,
  visible,
  linked,
  showLinks,
  onSelect,
}: {
  contained: boolean;
  kicker: string;
  title: string;
  lede: string;
  query: string;
  onQuery: (value: string) => void;
  groups: readonly string[];
  group: string;
  onGroup: (value: string) => void;
  visibleCount: number;
  totalCount: number;
  flow: readonly FlowStep[];
  hubs: Record<string, string>;
  selectedId: string;
  onStep: (targetId: string) => void;
  visible: NodeItem[];
  linked: Set<string>;
  showLinks: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={cn("flex flex-col gap-4 p-4", contained && "h-full min-h-0")}>
      <header className="flex max-w-3xl shrink-0 flex-col gap-2">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{kicker}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{lede}</p>
      </header>

      <div className="flex shrink-0 items-center gap-2 px-1">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search the map</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search this map"
            aria-label="Search the map"
            autoComplete="off"
            suppressHydrationWarning
            className="h-10 pl-9"
          />
        </label>
        <GroupFilter groups={groups} group={group} onChange={onGroup} />
        <p className="shrink-0 font-mono text-xs text-muted-foreground">
          {visibleCount} of {totalCount}
        </p>
      </div>

      <ol className="flex shrink-0 snap-x scroll-ps-1 items-center gap-2 overflow-x-auto p-1">
        {flow.map((step, index) => {
          const targetId = hubs[step.id] ?? step.id;
          const active = selectedId === targetId || selectedId === step.id;
          return (
            <li key={step.id} className="flex shrink-0 snap-start items-center gap-2">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onStep(targetId)}
                className={cn(
                  "min-h-11 rounded-lg border px-3 py-1.5 text-left",
                  active
                    ? "border-primary bg-secondary text-foreground ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                <span className={cn("block font-mono text-xs", active ? "text-foreground" : "text-muted-foreground")}>
                  0{index + 1}
                </span>
                <span className="block text-sm font-medium text-foreground">{step.label}</span>
              </button>
              {index < flow.length - 1 ? (
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className={cn(contained && "min-h-0 flex-1 overflow-y-auto overscroll-contain")}>
        {visible.length === 0 ? (
          <Empty className="border bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>Nothing matches</EmptyTitle>
              <EmptyDescription>Try another search or group.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="grid gap-3 p-1 sm:grid-cols-2">
            {visible.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                active={node.id === selectedId}
                linked={showLinks && linked.has(node.id) && node.id !== selectedId}
                onSelect={() => onSelect(node.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

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
  const [sheetOpen, setSheetOpen] = useState(false);

  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const selected = byId.get(selectedId) ?? nodes[0];

  useEffect(() => {
    const media = window.matchMedia(desktopQuery);
    const closeOnDesktop = () => {
      if (media.matches) setSheetOpen(false);
    };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

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

  function selectNode(id: string) {
    setSelectedId(id);
    if (window.matchMedia(desktopQuery).matches) return;
    setSheetOpen(true);
  }

  const browse = (contained: boolean) => (
    <BrowseColumn
      contained={contained}
      kicker={kicker}
      title={title}
      lede={lede}
      query={query}
      onQuery={setQuery}
      groups={groups}
      group={group}
      onGroup={setGroup}
      visibleCount={visible.length}
      totalCount={nodes.length}
      flow={flow}
      hubs={hubs}
      selectedId={selected.id}
      onStep={(targetId) => {
        setGroup("All");
        setQuery("");
        selectNode(targetId);
      }}
      visible={visible}
      linked={linked}
      showLinks={showLinks}
      onSelect={selectNode}
    />
  );

  return (
    <>
      <div className="hidden h-full min-h-0 flex-1 lg:block">
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          <ResizablePanel id="skills" defaultSize="64" minSize="34" style={{ overflow: "hidden" }}>
            {browse(true)}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="preview" defaultSize="36" minSize="22" style={{ overflow: "hidden" }}>
            <div className="h-full overflow-y-auto overscroll-contain p-4">
              <SkillDetail
                key={selected.id}
                selected={selected}
                outgoing={outgoing}
                incoming={incoming}
                byId={byId}
                onSelect={selectNode}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <div className="lg:hidden">{browse(false)}</div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 data-[side=right]:w-full! sm:data-[side=right]:max-w-md!"
        >
          <SheetHeader className="pe-16">
            <Badge variant="outline" className="font-mono">
              {kindLabel[selected.kind]} · {selected.group}
            </Badge>
            <SheetTitle className="font-mono text-lg">{selected.title}</SheetTitle>
            <SheetDescription className="text-sm leading-relaxed">{selected.blurb}</SheetDescription>
          </SheetHeader>
          <div key={selected.id} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6">
            <SkillBody
              selectedId={selected.id}
              outgoing={outgoing}
              incoming={incoming}
              byId={byId}
              onSelect={selectNode}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function SkillDetail({
  selected,
  outgoing,
  incoming,
  byId,
  onSelect,
}: {
  selected: NodeItem;
  outgoing: Edge[];
  incoming: Edge[];
  byId: Map<string, NodeItem>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs text-muted-foreground">
          {kindLabel[selected.kind]} · {selected.group}
        </p>
        <h2 className="font-mono text-lg font-medium">{selected.title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{selected.blurb}</p>
      </div>
      <SkillBody
        selectedId={selected.id}
        outgoing={outgoing}
        incoming={incoming}
        byId={byId}
        onSelect={onSelect}
      />
    </div>
  );
}

function SkillBody({
  selectedId,
  outgoing,
  incoming,
  byId,
  onSelect,
}: {
  selectedId: string;
  outgoing: Edge[];
  incoming: Edge[];
  byId: Map<string, NodeItem>;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <ConnectionList title="Calls" items={outgoing} direction="to" byId={byId} onSelect={onSelect} />
      <ConnectionList title="Called by" items={incoming} direction="from" byId={byId} onSelect={onSelect} />
      <Separator />
      <SkillSource id={selectedId} />
    </>
  );
}

function GroupFilter({
  groups,
  group,
  onChange,
}: {
  groups: readonly string[];
  group: string;
  onChange: (group: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="outline" className="h-10 shrink-0 px-3" />}
        aria-label="Filter by group"
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) setOpen(true);
        }}
        onMouseDown={(event) => event.preventDefault()}
      >
        <span className="max-w-28 truncate">{group}</span>
        <ChevronDown />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Groups">
          {groups.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={group === item ? "secondary" : "outline"}
              aria-pressed={group === item}
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
            >
              {item}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
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
    <li className="h-full">
      <button type="button" onClick={onSelect} aria-pressed={active} className="h-full w-full text-left">
        <Card className={cn("h-full", active && "ring-2 ring-primary", !active && linked && "bg-secondary")}>
          <CardHeader>
            <p className="font-mono text-xs text-muted-foreground">
              {kindLabel[node.kind]} · {node.group}
            </p>
            <CardTitle className="font-mono">{node.title}</CardTitle>
            <CardDescription className="leading-relaxed">{node.blurb}</CardDescription>
          </CardHeader>
        </Card>
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
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None on this map.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.slice(0, 8).map((edge) => {
            const id = direction === "to" ? edge.to : edge.from;
            const node = byId.get(id);
            return (
              <li key={`${edge.from}-${edge.to}`}>
                <button
                  type="button"
                  onClick={() => onSelect(id)}
                  className="w-full rounded-lg px-2 py-2 text-left hover:bg-muted"
                >
                  <span className="font-mono text-sm text-foreground underline-offset-4 hover:underline">
                    {node?.title ?? id}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{edge.why}</span>
                </button>
              </li>
            );
          })}
          {items.length > 8 ? (
            <li className="px-2 text-sm text-muted-foreground">
              + {items.length - 8} more. Filter the list to browse them.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
