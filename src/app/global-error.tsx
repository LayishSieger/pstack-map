"use client";

import { AppError } from "@/components/app-error";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppError error={error} reset={reset} />
      </body>
    </html>
  );
}
