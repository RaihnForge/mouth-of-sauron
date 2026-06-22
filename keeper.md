# keeper.md — CTO Command Channel (MON)

> Keeper-authored directives. Sessions execute uncompleted `- [ ]` items as first
> order of business, mark `[x]` when done, and leave them for Keeper to audit and
> clear. Do not delete items.

## Directives

- [x] Onboard Grima's Bane into the ecosystem (pillar docs, root CLAUDE.md,
      workspace.manifest, project-tracker, developer assignment). (2026-06-21)
- [ ] **Selector-hardening verification.** Before cutting v0.2.0, load all four
      sites and confirm every hide rule + redirect still fires against current
      markup. Record results in KPSP-Shard M4. This is the single biggest risk
      to the tool's value — third-party DOM drift silently un-blocks Shorts.
- [ ] **Web Store decision.** Confirm with Joshua whether to pursue the Chrome
      Web Store listing (M3) or stay unpacked/Pages-only. If pursuing, he must
      register the dev account; everything else is prepared.
- [ ] **Retrofit to the private-canonical + public-mirror publishing standard**
      (added 2026-06-22; standard landed concurrently in
      `sanctum/DEVELOPMENT-STANDARDS.md` → "Publishing to the Public"). This repo
      is currently a lone PUBLIC `RaihnForge/grimas-bane` exposing every internal
      pillar doc — the exact one-off the new standard supersedes. Convert:
      canonical → PRIVATE `E4Keyes/grimas-bane` (full source + 7 docs,
      manifest-tracked); public face → a SEPARATE `RaihnForge/grimas-bane` mirror
      holding only a `.public-manifest` whitelist, pushed by
      `scripts/publish-public.ps1`; product page under `raihnforge.github.io`.
      Use Narya as the reference example. NOTE: Claude can reduce repo visibility
      but cannot create public repos — Joshua runs those steps via `!`. See KPSP
      M5. Until then the deviation note below is superseded.

## Notes

- Sovereign tool published under RaihnForge for the Pages site — intentional
  deviation from the E4Keyes consolidation convention. Documented in
  workspace.manifest and KPSP-Shard decisions log. **(Superseded 2026-06-22 by
  the publishing-standard retrofit directive above — keep until that lands.)**
