export type Watch = {
  id: "pstack" | "pocock";
  label: string;
  repo: "cursor/plugins" | "mattpocock/skills";
  path: string;
  pinnedSha: string;
  pinnedRelease: string | null;
};

/** The upstream commits this map was written against. Refresh these when the site is updated. */
export const watches: Watch[] = [
  {
    id: "pstack",
    label: "pstack",
    repo: "cursor/plugins",
    path: "pstack",
    pinnedSha: "df581122cde17e6e27686b5a448bde23e4ad4318",
    pinnedRelease: null,
  },
  {
    id: "pocock",
    label: "Matt Pocock skills",
    repo: "mattpocock/skills",
    path: "",
    pinnedSha: "2b47ffcf2385995a536e43ddc9226e32cf9793d9",
    pinnedRelease: "v1.3.1",
  },
];
