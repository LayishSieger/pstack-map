import { Atlas } from "@/components/atlas";
import { getUpstreamStatus } from "@/lib/upstream-status";

export const dynamic = "force-dynamic";

export default function Home() {
  const initialStatus = getUpstreamStatus();
  return <Atlas initialStatus={initialStatus} />;
}
