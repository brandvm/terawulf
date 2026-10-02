# TeraWulf — Webflow custom code

Agent instructions for this repository. Codex, Cursor and similar tools read
this file directly; Claude Code reads it through `CLAUDE.md`. It is the single
source of agent rules — edit this file, never a copy of it.

## Project facts

- Client / site: TeraWulf
- GitHub: `brandvm/terawulf`, default branch `master`
- Webflow site ID: unknown — fill in
- Staging site: unknown — fill in (`https://<slug>.webflow.io`; the loader
  matches any `*.webflow.io` host)
- Staging bundles: `https://brandvm.github.io/terawulf/`
- Production bundles: `https://cdn.jsdelivr.net/gh/brandvm/terawulf@<VER>/dist/`
- Production domain: unknown — fill in
- Production release: `v1.1.1` (tags `v1.0.0`, `v1.1.0`, `v1.1.1`; snippet URLs
  use `@1.1.1`, which jsDelivr resolves to the `v`-prefixed tag)
- Origin: migrated 2026-09-02 from CodeSandbox (`terawulf-main.js`,
  `terawulf-main.css`) plus the inline `<style>` block that lived in the global
  embed component.

## Who owns what

Webflow owns markup, layout, classes, components, CMS content, interactions
**and styling by default**. This repo owns JavaScript behaviour and only the
CSS the Designer cannot express.

That split is deliberate. Repo CSS loads after `webflow.css`, so it wins every
specificity tie against the Designer. Any rule written here that the Designer
could have expressed becomes a hidden override: the next person changes that
style in the Designer, nothing happens, and the only fix is edit `src/` →
release → bump the version in Webflow → publish. Every project built from
`wf-template` has lost time to that loop.

## CSS policy — Designer first

Before writing any CSS, decide where it belongs.

1. **Can the Designer do it?** A class or combo class style, a variable, a
   breakpoint style, a state (hover/focus/current), an interaction. If yes:
   - With the Webflow MCP connected, apply it in Webflow (styles and
     variables tools), then tell the user what was changed.
   - Without the MCP, give the user exact Designer steps: class, breakpoint,
     property, value.
   - Do **not** add it to `src/styles.css`.
2. **Repo CSS needs a reason.** Every rule — or the section header comment
   covering a group of rules — carries one tag from this list:

   ```css
   /* repo-css: <tag> — <short why> */
   ```

   | Tag | Use for |
   | --- | --- |
   | `js-state` | Classes/attributes a module toggles (`.is-open`, `.is-loading`, `[data-state]`) |
   | `designer-cant` | Name the feature: `:has()`, complex combinators, `@keyframes`, `@supports`, container queries, `::marker`, `color-mix()`, masks |
   | `third-party` | Swiper, Lenis, Finsweet or other library markup |
   | `canvas-preview` | `.w-editor`, `.wf-design-mode`, `html:not([data-wf-domain])` helpers |
   | `approved-base` | A site-wide base the user explicitly asked to keep in code |
   | `override-webflow` | Overriding a `.w-*` default or a Designer style |

3. **`override-webflow` needs the user's explicit approval** and a
   `GOTCHAS.md` entry explaining why. Ask before writing it.
4. **Never, without that approval:** set `font-size` on `:root`/`html`,
   neutralize `.w-*` defaults, or reference Webflow variable names
   (`--_layout---…`, `--_typography---…`). A renamed variable in Webflow
   silently breaks every rule that reads it — Webflow rewrites its own
   references, never this bundle's.
5. **Ambiguous request?** Say which parts go in the Designer and which go in
   code before editing anything. "Make the heading bigger on mobile" is a
   Designer breakpoint style, not a media query here.

Existing rules predate this policy and are untagged; add a `repo-css` tag to
any rule you touch, and question rules the Designer could own. In particular
`src/styles.css` §01 sets a fluid `:root` font-size and §02 redefines Webflow
`--_colors---*` variables; both were migrated as-is (see `GOTCHAS.md`).

## Architecture

- **No HTML Embed carries repo CSS.** `loader.html` has two pieces:
  1. The pinned release stylesheet — a `<link>` to
     `cdn.jsdelivr.net/gh/brandvm/terawulf@<VER>/dist/styles.css` in
     **Site settings → Head code** ("or the site's global embed component if
     one exists" — confirm which in Webflow and record it here).
  2. The JS loader in **Site settings → Footer code**. Prod loads the pinned
     `index.js`. On `*.webflow.io` it loads the staging `index.js` (falling
     back to prod) and **appends** the staging `styles.css` after the pinned
     base link. In dev mode it loads localhost JS/CSS the same way (falling
     back to staging JS).
- Staging and dev CSS are therefore layered **on top of** the pinned release
  CSS, not instead of it. A rule deleted in `src/` still applies on staging
  until the next release.
- `src/index.ts` is one migrated legacy IIFE marked `// @ts-nocheck`:
  `Utils` → modules (`SessionModal`, `DottedCanvas`) → `Utils.run(name, init)`
  per module (one failing module does not stop the others). Modules removed in
  the 2026-09-02 audit (KeyboardIx3ShiftGToggle, GoToTop, SmartSwiper,
  ClickOnLoad, NavShrink) can be restored from tag `v1.0.0`.
- New features: put them in a new typed file (there is no `src/modules/` yet),
  import it into `src/index.ts`, register it in the `modules` list, and make it
  no-op when its markup is absent. The header comment asks for new modules to
  be typed.
- `src/styles.css` is numbered (00 font-face … 09 site overrides). Add rules to
  the section they belong to, never to the end of the file. The SessionModal
  CSS (`.is-open`, `html.modal-open`) pairs with the JS module.
- Third-party libraries are bundled with `pnpm add`, not added as CDN tags.
  The footer loader appends the bundle dynamically, so a sibling
  `<script defer>` has no ordering guarantee.

## Webflow canvas facts

- **The Designer canvas never runs scripts.** Anything shown only after JS
  runs (the modal, `DottedCanvas`) is invisible there; use a `canvas-preview`
  rule if the Designer needs to see it.
- **Repo CSS loads from head code, which the canvas does not render.** The
  canvas therefore shows no repo CSS at all — and never staging or localhost
  CSS, because those are added by the footer script. If the base link is in
  the global embed component instead, the canvas shows the pinned *release*
  CSS only. Either way, CSS work in `src/` cannot be checked in the Designer;
  check it on the published `*.webflow.io` page.
- No live reload on the canvas. Reload the Designer tab.
- Debug "is my CSS loading?" with `background`, not `outline` — outlines on
  `body` paint outside the canvas iframe and get clipped.

## Snippets are not versioned

A push updates the staging JS/CSS bundles only. Any change to `loader.html`
must be re-pasted into Webflow and published to take effect — say so in the
commit message, and keep `loader.html` identical to what is installed.

## Commands, dev mode and release

```bash
pnpm dev      # watch + server on :3000 (logs each entry URL)
pnpm build    # minified -> dist/
pnpm check    # tsc --noEmit (src/index.ts is @ts-nocheck)
```

No test suite. Node 22 and the pinned pnpm in `package.json`. CI
(`.github/workflows/staging.yml`) builds on every push to `master` and deploys
`dist/` to GitHub Pages; it runs no type check.

Dev mode on the staging site (persists in localStorage):
`?bv-dev=1` on, `?bv-dev=1&bv-host=<lan-ip>:3000` against a LAN machine,
`?bv-dev=0` off. LAN hosts are blocked as mixed content unless the testing
browser allows insecure content for the site; otherwise push and use staging.

Release (`README.md` + `loader.html`):

```bash
pnpm build
git add dist && git commit -m "release: vX.Y.Z"
git tag vX.Y.Z && git push && git push --tags
```

- `dist/` is **tracked permanently** here (not gitignored, never un-tracked)
  and there is no CI drift check, so `dist/` on `master` can lag `src/`
  between releases. Only commit `dist/` in release commits.
- Bump the version in **both** places: the CSS `<link>` in head code and
  `VER` in the footer loader (the README only mentions the footer). Publish
  staging → verify → publish prod. Rollback = revert both strings.
- Never move a pushed tag; cut the next patch. Never use `@latest` or a branch
  URL in production. Do not tag a release with no changes (v1.1.1 was).

## Webflow MCP limits

Worked around, not fixed — do not rediscover these.

- `custom_value` is rejected for Color and Size variables (`color-mix()`,
  `oklch()`, `calc()`). Create those through the variables JSON import with
  `valueType: "custom"`.
- No variable rename or reorder within a collection. Rename in the Designer
  (preserves ids and aliases; recreating does not).
- The WHTML importer drops `class` attributes. Create the style, then apply
  it.
- `get_all_elements` does not descend into component definitions — pass the
  component scope. An element "missing" from a page is usually inside one.
- Concurrent Designer edits change element ids. Re-query on "Element not
  found" instead of assuming deletion.
- Responsive styles are only returned when breakpoints are requested
  explicitly (`include_breakpoints`).

## Session protocol

1. **Start:** read `GOTCHAS.md`. Do not repeat a mistake already logged.
2. **During:** when something surprising costs time — a Webflow quirk, a
   template default that gets in the way, an MCP limitation, a fix that had
   to be reverted — add an entry to `GOTCHAS.md` in the same commit as the
   fix, using the format at the top of that file.
3. **Scope:** tag an entry `template-candidate` when it would recur on any
   project built from `wf-template`; those entries are collected later to
   improve the template. Otherwise tag it `project`.
4. Never delete entries. Update `Status` when something is fixed or
   upstreamed.
