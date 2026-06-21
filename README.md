# Mouth of Sauron

A Chrome (MV3) extension that **shuts the short-form feed**. Blocks Shorts / Reels
on YouTube, Facebook, Instagram, and TikTok — unless you toggle a platform off.

> The Mouth of Sauron was the herald that spoke the endless words of the Dark Tower.
> This shuts it.

## What it does

| Platform | Behavior when ON (default) |
|----------|----------------------------|
| **YouTube** | Hides Shorts shelves, sidebar/mini-guide Shorts entries, and Shorts grid rows. Redirects `youtube.com/shorts/<id>` to the normal `watch?v=<id>` player. |
| **Facebook** | Hides Reels feed cards and the Reels nav entry. Redirects `/reel/...` and `/reels/...` to the home feed. |
| **Instagram** | Hides the Reels nav entry. Redirects `/reels/...` to home. |
| **TikTok** | The whole site is short-form, so it's held behind a block overlay. Toggle TikTok off to enter. |

Blocking is **on by default**. The toggle is the off switch — "unless turned off."

## Install (unpacked)

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the folder: `c:\development\dev-tools\mouth-of-sauron`
5. Pin the red "no" icon to the toolbar if you like.

Click the icon to open the popup — a master switch plus one toggle per platform.
Settings sync via `chrome.storage.sync`, so they follow your Chrome profile across
machines. Changes take effect on the next page load (use **Reload this tab** in the
popup for the current page).

## Files

```
manifest.json            MV3 manifest
src/content.js           per-platform hide + redirect + overlay logic
src/content.css          default-hide CSS rules (no flash before settings load)
src/popup.html/css/js    toolbar popup with master + per-site toggles
scripts/generate-icons.js  regenerates icons/ (Node stdlib only)
icons/                   generated PNG icons
```

## Maintenance note

YouTube/Meta/TikTok ship obfuscated, frequently-changing DOM. The selectors in
`content.css` and the JS hide passes in `content.js` are the parts most likely to
need a touch-up when a site reshuffles its markup. The URL redirects are far more
stable. To re-skin the icon, edit `scripts/generate-icons.js` and re-run
`node scripts/generate-icons.js`.
