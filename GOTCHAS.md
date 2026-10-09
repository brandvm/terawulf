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

### 2026-10-09 · Template Embed 2a makes production download the CSS twice
- Area: loader, perf
- Scope: template-candidate
- Symptom: with the template loader, every production page requested
  `styles.css` from github.io (staging) **and** from jsDelivr (release).
- Cause: Embed 2a's static href is the staging URL; the browser's preload
  scanner requests it before Embed 2b rewrites the href to the release.
  Measured in Chromium on 2026-10-09: 3 of 3 runs fetched both.
- Fix: 2a carries the pinned release URL; 2b only rewrites the href when it
  differs (staging, dev) and logs an error if 2a's version ≠ RELEASE.
  Trade-off: a release updates two strings (RELEASE and 2a), and the canvas
  shows the release CSS. Also dropped the `is-loading` scroll lock: the
  bundle loads after Webflow's interaction scripts here.
- Status: fixed in loader.html
- Found by: claude

### 2026-10-09 · Template tests require `RELEASE = null` in loader.html
- Area: release
- Scope: template-candidate
- Symptom: `tests/environment-switcher.spec.mjs` throws unless
  `loader.html` contains `var RELEASE = null;`, but AGENTS.md says to keep
  `loader.html` identical to what is installed — and a live site always has
  a release set.
- Cause: the template assumes a new project; an adopted live site has a
  release from day one.
- Fix: keep `RELEASE = null` in the repo and record the installed value in
  AGENTS.md › Project facts; set it only in the pasted snippet.
- Status: open
- Found by: claude

### 2026-10-09 · Template loader double-fetches staging CSS
- Area: loader
- Scope: template-candidate
- Symptom: on `*.webflow.io`, `styles.css` is requested twice with two
  different `?v=` values.
- Cause: Embed 2b and the footer loader each build their own
  `Date.now()` cache-buster, and every href change refetches the sheet
  (skill lesson 2026-10-06 describes the fix; template 0.1.0 lacks it).
- Fix: `loader.html` keeps one shared `WFC.v`, and the footer only rewrites
  the href when the URL differs. The lesson's `wfc-css-wait` body hiding
  was **not** adopted: hiding the body until CSS loads would delay LCP on
  a site whose main goal is PageSpeed.
- Status: fixed in loader.html (not installed yet)
- Found by: claude

### 2026-09-02 · LAN dev mode is blocked as mixed content
- Area: loader
- Scope: template-candidate
- Symptom: `?bv-dev=1&bv-host=192.168.x.x:3000` on another device loads
  nothing from the dev machine.
- Cause: The staging page is https; browsers allow `http://localhost` but
  block `http://<LAN IP>` as mixed content (4c28f55, `loader.html` header).
- Fix: allow insecure content for the webflow.io site on the testing device,
  or push and use the staging bundle (~1 min).
- Status: superseded — the template loader is localhost-only; LAN dev goes away when it is installed
- Found by: human

### 2026-09-02 · Release version lives in two snippets; README names one
- Area: release
- Scope: template-candidate
- Symptom: After a release only JS (or only CSS) moves to the new version.
- Cause: The pinned CSS `<link>` in head code and `VER` in the footer loader
  each carry the version (`loader.html`: "bump the @1.1.1 in BOTH"); the
  README release section only says to bump the footer loader.
- Fix: bump both strings at every release and rollback.
- Status: fixed in loader.html (one `RELEASE`); takes effect when the template loader is installed
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
- Status: fixed — CI now fails when `dist/` differs from a fresh build (template staging.yml)
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
- Status: fixed in loader.html (staging CSS replaces the release CSS); takes effect when installed
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
- Status: fixed — SessionModal and DottedCanvas are typed modules (2026-10-09); `pnpm check` runs in CI
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

Lessons inherited from earlier builds now live in the webflow-build skill's
[`lessons/`](.claude/skills/webflow-build/lessons/README.md), read by area
(they were copied here until the 2026-10-09 template adoption).
