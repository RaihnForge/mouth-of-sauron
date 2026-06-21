# Mouth of Sauron — Memory (MON)

Cross-session AI memory + breadcrumbs. Newest first.

## Project facts

- MV3 Chrome extension, no build step, no deps. Node stdlib-only helper scripts
  (`generate-icons.js`, `build-zip.js`) use `zlib` to emit PNG + ZIP by hand.
- Default-hide is CSS at `document_start`; the content script only *un-hides*
  by adding `mos-allow-<platform>` to `<html>` when a site is toggled off. Do not
  invert this — it's what prevents the flash of Shorts.
- Repo is under **RaihnForge** (not E4Keyes) on purpose: GitHub Pages landing at
  `raihnforge.github.io/mouth-of-sauron/`. Pages serves from `/docs` on `main`.
- State = booleans in `chrome.storage.sync`: `master, youtube, facebook,
  instagram, tiktok` (all default true = blocking on).
- Developer: Thane.

## Breadcrumbs

- **2026-06-21** — Built v0.1.0 end to end in one session: extension (4
  platforms), fanged-maw icon (3rd icon iteration — first was a "no" sign, second
  read as a zigzag W, third = pointed teeth over red maw, legible at 16px),
  public repo created via `gh`, Pages enabled and verified 200, Web Store package
  + listing copy prepared (`STORE-LISTING.md`). Then full studio onboarding +
  Thane assignment.
- **Open follow-up:** Web Store submission is the next real milestone but needs
  Joshua's registered dev account ($5) and screenshots — can't be done from here.

## Gotchas

- Selectors for YouTube/Meta/TikTok are the fragile layer and will drift. The
  URL redirects are stable. When something leaks, fix `content.css` /
  `content.js` hide passes, not the redirects.
- `dist/*.zip` is gitignored — the Web Store package is rebuilt fresh, never
  committed.
