export type Watch = {
  id: "pstack" | "pocock";
  label: string;
  repo: "cursor/plugins" | "mattpocock/skills";
  path: string;
  pinnedSha: string;
  pinnedRelease: string | null;
  license: "MIT";
  copyright: string;
  licensePath: string;
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
    license: "MIT",
    copyright: "Copyright (c) 2026 Lauren Tan",
    licensePath: "pstack/LICENSE",
  },
  {
    id: "pocock",
    label: "Matt Pocock skills",
    repo: "mattpocock/skills",
    path: "",
    pinnedSha: "6fd947921b935b7e1e69293a200400f0fdd5c15f",
    pinnedRelease: "v1.3.1",
    license: "MIT",
    copyright: "Copyright (c) 2026 Matt Pocock",
    licensePath: "LICENSE",
  },
];
