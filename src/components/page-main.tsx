import type { ReactNode } from "react";

export function PageMain({ children }: { children: ReactNode }) {
  return <main className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-8">{children}</main>;
}
