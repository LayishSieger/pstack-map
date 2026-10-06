# Skill atlas

A map of agent skill packs, and which flow to run.

Today the map covers [pstack](https://github.com/cursor/plugins/tree/main/pstack) and [Matt Pocock's skills](https://github.com/mattpocock/skills). gstack is the next pack. A pack of my own is planned and does not have a name yet. The site is named for the atlas, not for the first pack inside it.

Skill text is loaded from the pinned commit when you open a card or a skill page. This repository does not copy those files. Each pack stays under its own MIT license. The map, the compare guide, and this site are MIT, Copyright (c) 2026 Layish Sieger.

## Develop

```bash
npm install
npm run dev
```

The app serves on port 8080.

Pins for “out of date” live in [src/data/upstream.ts](src/data/upstream.ts). When you refresh the map, move those pins in the same change. The server remembers a check for an hour. The page does not call GitHub itself, and it does not wait on that check before you can use the map.

## Vercel

Import this repository. Next.js is the framework and the build command is `npm run build`. The build fetches each pinned skill file, so it needs network access to GitHub.

`GITHUB_TOKEN` is optional. Set it on the server to raise GitHub's rate limit for skill text and the freshness check. The site works without it: skill URLs are the pinned commit, and those responses are cached. The token is not sent to the browser.

A new pack is a data module, a `PackId`, a `Repo`, a watch in `src/data/upstream.ts`, and a `packViews` entry. Compare columns are only the packs a job names, so a pack can ship as its own tab before it joins the comparison.

## Mail when upstream moves

GitHub cannot watch only the `pstack/` folder inside `cursor/plugins`. A daily Actions run compares the pins to upstream and stays quiet when they match. When `pstack/` on `main`, Matt Pocock `main`, or the latest Pocock release moves, it opens one issue and mentions you.
