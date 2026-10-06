"use client";

import { AppError } from "@/components/app-error";
import "./globals.css";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body>
        <AppError error={error} />
      </body>
    </html>
  );
}
