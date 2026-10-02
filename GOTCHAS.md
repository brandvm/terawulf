# Gotchas

A running log of things that cost time on this project. Agents read it at
the start of every session and add to it when they hit something new (see
the Session protocol in `AGENTS.md`). Never delete an entry — update its
`Status` instead.

Entries tagged `Scope: template-candidate` are harvested across all client
repos to improve `brandvm/wf-template`.

## Entry format

```md
### YYYY-MM-DD · Short title
- Area: designer | css | loader | release | mcp | ci | js | perf
- Scope: project | template-candidate
- Symptom: what was observed
- Cause: why it happened
- Fix: what was done, or the workaround
- Status: open | fixed <sha> | upstreamed wf-template <sha>
- Found by: claude | codex | human
```

## This project

<!-- Add new entries here, newest first. -->

### 2026-09-02 · LAN dev mode is blocked as mixed content
- Area: loader
- Scope: template-candidate
- Symptom: `?bv-dev=1&bv-host=192.168.x.x:3000` on another device loads
  nothing from the dev machine.
- Cause: The staging page is https; browsers allow `http://localhost` but
  block `http://<LAN IP>` as mixed content (4c28f55, `loader.html` header).
- Fix: allow insecure content for the webflow.io site on the testing device,
  or push and use the staging bundle (~1 min).
- Status: documented (loader.html)
- Found by: human

### 2026-09-02 · Release version lives in two snippets; README names one
- Area: release
- Scope: template-candidate
- Symptom: After a release only JS (or only CSS) moves to the new version.
- Cause: The pinned CSS `<link>` in head code and `VER` in the footer loader
  each carry the version (`loader.html`: "bump the @1.1.1 in BOTH"); the
  README release section only says to bump the footer loader.
- Fix: bump both strings at every release and rollback.
- Status: open (README not updated)
- Found by: human

### 2026-09-02 · v1.1.1 was tagged with no changes
- Area: release
- Scope: template-candidate
- Symptom: Two release tags with identical trees.
- Cause: e804b0d "release: v1.1.1" is an empty commit;
  `git diff v1.1.0 v1.1.1` is empty. `dist/` is tracked permanently and only
  rebuilt by hand, so nothing shows whether a build actually changed.
- Fix: run `pnpm build` and check `git status -- dist` before tagging; do not
  tag when nothing changed.
- Status: open
- Found by: human

### 2026-09-02 · Staging and dev CSS stack on top of the pinned release CSS
- Area: css
- Scope: project
- Symptom: A rule deleted in `src/styles.css` still applies on staging and in
  dev mode.
- Cause: The pinned release stylesheet stays linked in head code; the footer
  loader appends the staging or localhost `styles.css` after it ("loads after
  the base link → overrides it", `loader.html`). They are additive.
- Fix: verify deletions only after a release, or override the old rule
  explicitly until then.
- Status: open
- Found by: human

### 2026-09-02 · Repo CSS redefines Webflow colour variables and root font-size
- Area: css
- Scope: project
- Symptom: Changing a colour variable or type size in the Designer has no
  effect on the published site.
- Cause: The migrated CodeSandbox CSS (e1299b4) sets `:root` font-size from a
  fluid scale (§01) and redefines `--_colors---*` Webflow variables inside
  `@supports` blocks (§02); it also reads `--_colors---bg--dark`,
  `--_colors---text--light` and others by name.
- Fix: none yet. Move colours back to Webflow variables before editing them
  in the Designer; treat these sections as `override-webflow`.
- Status: open
- Found by: claude

### 2026-09-02 · Webflow writes stale size attributes on `<canvas>`
- Area: js
- Scope: project
- Symptom: DottedCanvas rendered at the design-time size, or did not match
  its selector.
- Cause: Webflow emits design-px `width`/`height` attributes on the canvas
  element and sometimes writes `data-dotted-canvas=" "` with a space
  (comments in `src/index.ts`, DottedCanvas).
- Fix: the module removes the attributes and measures `offsetWidth`, then
  boots on the next animation frame and again on `load`.
- Status: fixed 58273a2
- Found by: human

### 2026-09-02 · `pnpm check` does not type-check the site code
- Area: js
- Scope: project
- Symptom: Type errors in `src/index.ts` pass `pnpm check`.
- Cause: The migrated legacy file is marked `// @ts-nocheck` (3064da1), and
  CI runs no type check at all.
- Fix: write new modules as typed files; convert legacy modules when they
  are touched.
- Status: open
- Found by: human

### 2026-09-02 · Five legacy modules removed as dead code
- Area: js
- Scope: project
- Symptom: n/a — audit finding.
- Cause: KeyboardIx3ShiftGToggle, GoToTop, SmartSwiper, ClickOnLoad and
  NavShrink had no matching markup, interactions or styles on the live site.
- Fix: removed in e1299b4; restore from tag `v1.0.0` if markup returns.
- Status: fixed e1299b4
- Found by: human

## Known from previous projects

Inherited from `wf-template`. Found across earlier client repos; listed so
they are not rediscovered. Status refers to the template.

### 2026-10-02 · Neutralizers in §03 override Designer styles
- Area: css
- Scope: template-candidate
- Symptom: A style changed in the Designer has no effect on the page.
- Cause: `src/styles.css` loads after `webflow.css`, so the §03 `.w-*` rules
  win same-specificity ties by source order. `.w-layout-blockcontainer
  { max-width }` silently overrode Designer container caps (threestars
  b5f122c); the `.w-dropdown-toggle` reset broke Webflow's chevron spacing
  (reformdd 8c65a5c).
- Fix: reformdd removed ten neutralizers so "Webflow's own defaults now stand
  unopposed" (c2e5f4b). Delete a neutralizer the moment it fights the
  Designer.
- Status: open
- Found by: human

### 2026-10-02 · Root font-size scale drifts from Designer tokens
- Area: css
- Scope: template-candidate
- Symptom: Designer variables named for px values ("Max Width - 1280px")
  render at different sizes; the scale is retuned again and again.
- Cause: The §01 fluid scale sets `:root` font-size, so every rem/em value
  coming out of the Designer scales with it. reformdd retuned it seven times
  (1680 → 1440 → 1680 → clamp → revert → 1920 → 1440); threestars found em
  layout tokens rendering 6.25% short.
- Fix: none general. Agree the scale with the designer before building, or
  drop it and let Webflow variables own sizing.
- Status: open
- Found by: human

### 2026-10-02 · Renaming a Webflow variable silently breaks repo CSS
- Area: css
- Scope: template-candidate
- Symptom: A container cap or token-driven value quietly stops applying.
- Cause: Container/Max Width was renamed to Section/Max Width in Webflow.
  Webflow rewrites its own references but cannot reach this bundle, so
  `var(--_layout---container--max-width, none)` fell back to `none`
  (reformdd 1ca59f6).
- Fix: avoid referencing Webflow variable names in repo CSS; if one is
  needed, log it here so renames get checked.
- Status: open
- Found by: human

### 2026-10-02 · Removing a rule locally does not remove it on the canvas
- Area: designer
- Scope: template-candidate
- Symptom: A deleted CSS rule still applies in the Designer while `pnpm dev`
  runs.
- Cause: The canvas never runs scripts, so both the staging and the
  localhost `<link>` stay live. They are additive; staging's copy of the
  rule remains.
- Fix: push and wait for staging, or temporarily comment out the `bv-css`
  link in the Embed.
- Status: documented (loader.html, AGENTS.md)
- Found by: human

### 2026-10-02 · Static localhost link is requested by public visitors
- Area: loader
- Scope: template-candidate
- Symptom: Published pages request `http://localhost:3000/styles.css`; can
  block render and trigger Chrome's local-network-access prompt.
- Cause: The canvas Embed carries a static localhost `<link>` so the
  Designer can see local CSS; the script that removes it runs after the
  browser has already started the request.
- Fix: reformd e9f81ab and regenx a66d116 removed the static link
  independently and create it from script only in dev mode. Trade-off: the
  canvas then shows staging CSS only.
- Status: open in template
- Found by: human

### 2026-10-02 · VER lives in two snippets and a placeholder 404s at launch
- Area: release
- Scope: template-candidate
- Symptom: Prod CSS and JS both 404 the moment a custom domain is attached.
- Cause: `VER = "X.Y.Z"` is never exercised on `*.webflow.io`, and a release
  must bump VER in both the Embed and the footer snippet.
- Fix: regenx keeps one `RELEASE` value in the head config (`null` until the
  first tag) that the other snippets read.
- Status: open
- Found by: human

### 2026-10-02 · The add -f dist / untrack release ritual is error-prone
- Area: release
- Scope: template-candidate
- Symptom: Empty release tags, re-cut versions, `dist/` swept into unrelated
  commits.
- Cause: `dist/` is gitignored except in release commits. terawulf re-cut
  v1.1.1 with a tree identical to v1.1.0.
- Fix: brandvm, adaria and nexplan commit `dist/` permanently and fail CI on
  `git diff --exit-code -- dist`.
- Status: open
- Found by: human

### 2026-10-02 · One throwing module leaves the page scroll-locked
- Area: js
- Scope: template-candidate
- Symptom: Page stays locked, or later modules never initialise.
- Cause: `src/index.ts` runs modules as a chain.
- Fix: reformdd and brandvm wrap each init in `run(name, init)` with
  try/catch; the template only has `finally` around the lock release.
- Status: partly fixed
- Found by: human

### 2026-10-02 · CDN `defer` scripts cannot be ordered against the bundle
- Area: js
- Scope: template-candidate
- Symptom: Lenis, GSAP or Finsweet is undefined when a module runs.
- Cause: The footer loader appends the bundle dynamically (async), so a
  sibling `<script defer>` has no ordering promise.
- Fix: bundle libraries with `pnpm add`. Do not also load Webflow's own GSAP
  or jQuery a second time.
- Status: documented
- Found by: human

### 2026-10-02 · Webflow's anchor scroll ignores a sticky header
- Area: js
- Scope: project
- Symptom: Same-page hash links land under a sticky nav.
- Cause: Webflow's scroll module offsets only for `position: fixed` headers
  and never reads `scroll-margin-top`.
- Fix: threestars `anchor-scroll.ts` unbinds `click.wf-scroll` and measures
  `--nav-h` from the nav.
- Status: project pattern
- Found by: human
