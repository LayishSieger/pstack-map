import { createFileRoute } from "@tanstack/react-router";
import { Atlas } from "@/components/atlas";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Atlas />;
}
