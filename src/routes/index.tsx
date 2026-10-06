import { createFileRoute } from "@tanstack/react-router";
import { Atlas } from "@/components/atlas";
import { getUpstreamStatus } from "@/lib/upstream-status";

export const Route = createFileRoute("/")({
  loader: () => getUpstreamStatus(),
  component: Home,
});

function Home() {
  const initialStatus = Route.useLoaderData();
  return <Atlas initialStatus={initialStatus} />;
}
