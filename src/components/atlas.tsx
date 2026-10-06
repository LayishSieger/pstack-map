"use client";

import { useState } from "react";
import { Freshness } from "@/components/freshness";
import { Decide } from "@/components/decide";
import { SkillMap } from "@/components/pstack-map";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UpstreamStatus } from "@/lib/upstream-types";

const views = [
  { id: "pstack", label: "Pstack" },
  { id: "pocock", label: "Pocock" },
  { id: "decide", label: "Compare" },
] as const;

type ViewId = (typeof views)[number]["id"];

function isViewId(value: unknown): value is ViewId {
  return value === "pstack" || value === "pocock" || value === "decide";
}

export function Atlas({ initialStatus }: { initialStatus: UpstreamStatus | null }) {
  const [view, setView] = useState<ViewId>("decide");

  return (
    <Tabs
      value={view}
      onValueChange={(value) => {
        if (isViewId(value)) setView(value);
      }}
      className="flex min-h-dvh flex-col bg-background lg:h-dvh lg:overflow-hidden"
    >
      <header className="sticky top-0 z-20 shrink-0 border-b bg-background/80 backdrop-blur-md lg:static">
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 px-4">
          <TabsList
            variant="line"
            className="h-12 w-full justify-start gap-0 bg-transparent p-0 group-data-horizontal/tabs:h-12 sm:w-auto"
          >
            {views.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="h-12 flex-1 rounded-none px-3 after:bottom-0 data-active:text-foreground sm:flex-none"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Freshness initial={initialStatus} />
        </div>
      </header>

      <div className="flex min-h-0 w-full flex-1 flex-col">
        <TabsContent value="pstack" className="flex min-h-0 flex-1 flex-col text-base">
          <SkillMap
            pack="pstack"
            kicker="pstack"
            title="Skill map"
            lede="Name a goal and a check. The router picks one playbook, copies its steps into a todo list, and calls the other skills only when a step needs them."
          />
        </TabsContent>

        <TabsContent value="pocock" className="flex min-h-0 flex-1 flex-col text-base">
          <SkillMap
            pack="pocock"
            kicker="matt pocock"
            title="Skill map"
            lede="Small skills you invoke. A user-invoked skill may call a model-invoked one, not another user-invoked skill. The main path is grill, spec, tickets, then either one ticket at a time or the whole graph."
          />
        </TabsContent>

        <TabsContent value="decide" className="flex min-h-0 flex-1 flex-col text-base">
          <Decide />
        </TabsContent>
      </div>
    </Tabs>
  );
}
