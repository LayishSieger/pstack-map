# pstack map

Map of [pstack](https://github.com/cursor/plugins/tree/main/pstack) and [Matt Pocock skills](https://github.com/mattpocock/skills): what each skill calls, when to keep one flow, and a hybrid.

Skill text is loaded from those repos when you open a card. This repository does not copy those files.

## Develop

```bash
npm install
npm run dev
```

The app serves on port 8080.

Pins for “out of date” live in [src/data/upstream.ts](src/data/upstream.ts). When you refresh the map, move those pins in the same change. The server remembers a check for an hour. The page does not call GitHub itself, and it does not wait on that check before you can use the map.

## Vercel

Import this repository. Next.js is the framework and the build command is `npm run build`. Server actions read skill files and check upstream. No environment variables are required.

## Mail when upstream moves

GitHub cannot watch only the `pstack/` folder inside `cursor/plugins`. A daily Actions run compares the pins to upstream and stays quiet when they match. When `pstack/` on `main`, Matt Pocock `main`, or the latest Pocock release moves, it opens one issue and mentions you.
