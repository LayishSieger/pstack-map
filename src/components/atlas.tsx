import { useState } from "react";
import { Freshness } from "@/components/freshness";
import { Decide } from "@/components/decide";
import { SkillMap } from "@/components/pstack-map";
import { edges, flow, groups, nodes } from "@/data/pstack";
import { pocockEdges, pocockFlow, pocockGroups, pocockNodes } from "@/data/pocock";
import type { UpstreamStatus } from "@/lib/upstream-status";

const views = [
  { id: "pstack", label: "Pstack" },
  { id: "pocock", label: "Pocock" },
  { id: "decide", label: "Compare" },
] as const;

type ViewId = (typeof views)[number]["id"];

export function Atlas({ initialStatus }: { initialStatus: UpstreamStatus | null }) {
  const [view, setView] = useState<ViewId>("decide");

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex gap-2">
          {views.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`min-h-11 rounded-full border px-4 text-sm ${
                view === item.id ? "border-accent bg-raised text-fg" : "border-line text-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Freshness initial={initialStatus} />
      </div>

      {view === "pstack" ? (
        <SkillMap
          kicker="pstack"
          title="Skill map"
          lede="Name a goal and a check. The router picks one playbook, copies its steps into a todo list, and calls the other skills only when a step needs them."
          nodes={nodes}
          edges={edges}
          flow={flow}
          groups={groups}
          defaultId="poteto-mode"
          hubs={{ playbooks: "investigation" }}
        />
      ) : null}

      {view === "pocock" ? (
        <SkillMap
          kicker="matt pocock"
          title="Skill map"
          lede="Small skills you invoke. A user-invoked skill may call a model-invoked one, not another user-invoked skill. The main path is grill, spec, tickets, then either one ticket at a time or the whole graph."
          nodes={pocockNodes}
          edges={pocockEdges}
          flow={pocockFlow}
          groups={pocockGroups}
          defaultId="mp-ask-matt"
        />
      ) : null}

      {view === "decide" ? <Decide /> : null}
    </main>
  );
}
