"use client";

import { useState } from "react";
import Link from "next/link";
import { packViews, type PackId } from "@/catalog";
import { Freshness } from "@/components/freshness";
import { Decide } from "@/components/decide";
import { SkillMap } from "@/components/pstack-map";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UpstreamStatus } from "@/lib/upstream-types";

const views = [
  ...packViews.map((pack) => ({ id: pack.id, label: pack.label })),
  { id: "decide" as const, label: "Compare" },
];

type ViewId = PackId | "decide";

function isViewId(value: unknown): value is ViewId {
  return views.some((item) => item.id === value);
}

export function Atlas({ initialStatus }: { initialStatus: UpstreamStatus | null }) {
  const [view, setView] = useState<ViewId>("decide");

  return (
    <Tabs
      value={view}
      onValueChange={(value) => {
        if (isViewId(value)) setView(value);
      }}
      className="flex min-h-0 flex-1 flex-col bg-background lg:overflow-hidden"
    >
      <header className="sticky top-0 z-20 shrink-0 border-b bg-background/80 backdrop-blur-md lg:static">
        <Freshness initial={initialStatus} />
        <div className="flex min-h-12 items-center gap-3 px-4">
          <Link href="/" className="shrink-0 text-sm font-medium text-foreground">
            Skill atlas
          </Link>
          <TabsList
            variant="line"
            className="h-12 w-full justify-start gap-0 bg-transparent p-0 group-data-horizontal/tabs:h-12 lg:w-auto"
          >
            {views.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="h-12 flex-1 rounded-none px-3 after:bottom-0 data-active:text-foreground lg:flex-none"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </header>

      <div className="flex min-h-0 w-full flex-1 flex-col">
        {packViews.map((pack) => (
          <TabsContent key={pack.id} value={pack.id} className="flex min-h-0 flex-1 flex-col text-base">
            <SkillMap pack={pack.id} kicker={pack.kicker} title={pack.title} lede={pack.lede} />
          </TabsContent>
        ))}

        <TabsContent value="decide" className="flex min-h-0 flex-1 flex-col text-base">
          <Decide />
        </TabsContent>
      </div>
    </Tabs>
  );
}
