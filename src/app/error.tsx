"use client";

import { AppError } from "@/components/app-error";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return <AppError error={error} />;
}
