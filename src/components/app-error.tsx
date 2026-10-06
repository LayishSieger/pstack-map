"use client";

import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppError({ error, reset }: { error: unknown; reset?: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
      <TriangleAlert className="size-10 text-destructive" aria-hidden />
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-muted-foreground">{errorMessage(error)}</p>
      {reset ? (
        <button
          type="button"
          onClick={reset}
          className="mt-1 h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          Try again
        </button>
      ) : null}
    </main>
  );
}
