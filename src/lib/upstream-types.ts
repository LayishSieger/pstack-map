import type { Watch } from "@/data/upstream";

export type UpstreamItem = {
  id: Watch["id"];
  label: string;
  behind: boolean;
  subject: string | null;
  compareUrl: string;
};

export type UpstreamStatus = {
  checkedAt: number;
  items: UpstreamItem[];
  error: string | null;
};
