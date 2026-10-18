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
    pinnedSha: "0b8e952052d482ee6de06deebf14d590d77b1b34",
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
    pinnedSha: "49dd158d1076134a641b33efb035946536778336",
    pinnedRelease: "v1.3.1",
    license: "MIT",
    copyright: "Copyright (c) 2026 Matt Pocock",
    licensePath: "LICENSE",
  },
];
