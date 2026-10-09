# TeraWulf — Webflow custom code

Agent instructions for this repository. Codex, Cursor and similar tools read
this file directly; Claude Code reads it through `CLAUDE.md`. It is the single
source of agent rules — edit this file, never a copy of it.

## Project facts

Adopted from `brandvm/wf-template` 0.1.0 (63bfb79) on 2026-10-09
(`.wf-template.json`); the repo predates the template layout.

- Client / site: TeraWulf (live, SEO/AEO/GEO retainer)
- GitHub: `brandvm/terawulf`, default branch `master`
- Webflow site ID: `69cc1149c7144d8f6b6c386a` (workspace
  `67d43a7ab8bacff8137b6bb3`). A legacy "Terawulf (2025)" site
  `66ec3b11f11d4b8b14e1f1e9` also exists — never edit it.
- Staging site: `https://terawulff.webflow.io` (double f)
- Staging bundles: `https://brandvm.github.io/terawulf/`
- Production domain: `https://www.terawulf.com` (apex redirects to www)
- Production release: **`1.3.0`** (published 2026-10-09, batch 6; 1.2.0 was batch 1), installed
  with the template loader: `RELEASE` in head code + the `@1.3.0` in Embed 2a
  (G | Components). Previous release 1.1.1 with the old two-piece loader is
  saved in `docs/rollback/2026-10-09/`. Release plan: small batches, each
  staging → check → production (`docs/audit/STATUS.md`).
- Global code component: **G | Components** (2026-10-09, wf-template
  shell): fixed 0×0 div, `aria-hidden="true"`, first child of `body` on all
  15 pages, holding Embed 2a (`#wfc-css` pinned release; Phosphor icons are inlined in styles.css since 1.3.0) and
  Embed 2b. It replaced **G | Embed Code**, whose definition is kept unused
  until production is confirmed, then deleted. G | Grid Guide was deleted.
- Origin: migrated 2026-09-02 from CodeSandbox (`terawulf-main.js`,
  `terawulf-main.css`) plus the inline `<style>` of the global embed.

## Project notes

- **Rollback point:** `docs/rollback/2026-10-09/` (verbatim Webflow custom code and page schema) + tag `rollback/2026-10-09-pre-cleanup`. Make a new dated folder before any later round of Webflow changes.
- **Live site — no Webflow change without explicit approval per item.**
  Stage on terawulff.webflow.io, check, then publish with `safe-publish`.
  Audit and fix plan: `docs/audit/`.
- `src/styles.css` §01 keeps TeraWulf's legacy **`:root`** fluid scale and
  the `--_colors---*` redefinitions (`override-webflow`, GOTCHAS 2026-09-02).
  Do not add the template's body scaling on top: both would apply.
- Webflow loads GSAP 3.15 + ScrollTrigger, SplitText and CustomEase itself
  (IX3, site settings). Never bundle a second GSAP; if a module needs GSAP,
  read `window.gsap` and no-op without it.
- Page custom code outside this repo (move into modules when touched):
  Home/About/Careers popup-video scripts, Finsweet v1 + v2 on /news and
  /careers, a resize-reload on /our-operations, BlogPosting JSON-LD on the
  Resources template, Organization/WebSite JSON-LD in site head code.
- **Animation: moving off Webflow interactions — all versions (classic IX,
  IX2, IX3)** (decided 2026-10-09). New motion never goes into Webflow
  Interactions. Existing interactions are rebuilt in the repo, keeping the
  approved motion and timing, then removed from Webflow page by page:
  1. CSS first: transitions/`@keyframes` on a class or `[data-state]` that a
     module toggles (`js-state`), CSS scroll-driven animations
     (`animation-timeline: view()`, behind `@supports`) for parallax-style
     effects, `prefers-reduced-motion` in §07.
  2. A repo module only where CSS can't: one shared IntersectionObserver
     for reveals keyed by the existing `data-gsap="text-animate" | "para-in"`
     attributes; GSAP (`pnpm add gsap`, only the plugins used) for
     SplitText line/word reveals and scrubbed or pinned scenes.
  3. Never hide first-screen content (hero logo, h1, CTA) with
     `visibility: hidden` waiting for JS — that is today's IX3 gate and the
     main mobile LCP cost. Hero motion starts from visible content.
  4. When a page has no Webflow interactions left, it drops the IX3 gate
     style; when the site has none, turn off Webflow's GSAP/IX site settings
     so gsap, ScrollTrigger, SplitText and CustomEase stop loading.
  Inventory as of 2026-10-09: IX3 on every page (`data-gsap` text/para
  reveals, hero, page headers, parallax, stats, timeline overlays, smoke and
  home-transition on desktop); IX2 on /about (`data-w-id` on
  `.image-overlay.is_left`, Our Vision). Webflow components (nav, dropdown,
  tabs) are not interactions and stay.
- **Release = two strings** (TeraWulf loader): `RELEASE` in head code AND
  the `@x.y.z` in Embed 2a's href (G | Embed Code). 2a pins the release so
  production downloads the CSS once (GOTCHAS 2026-10-09). 2b logs a console
  error when they disagree.
- Installing the template loader: remove the old head/footer snippets and
  the old CSS link in G | Embed Code, keep the existing `theme-color` meta
  only once, set `RELEASE` to the new tag, paste 2a/2b into G | Embed Code.

## Who owns what

Webflow owns markup, layout, classes, components, CMS content, interactions
**and styling by default**. This repo owns JavaScript behaviour and only the
CSS the Designer cannot express.

That split is deliberate. Repo CSS loads from an Embed after `webflow.css`,
so it wins every specificity tie against the Designer. Any rule written here
that the Designer could have expressed becomes a hidden override: the next
person changes that style in the Designer, nothing happens, and the only fix
is edit `src/` → push → wait for staging → reload the Designer. Every project
built from this template has lost time to that loop.

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

## Read before changing integration

- `README.md` — commands, daily flow, release, handoff.
- `loader.html` — the three snippets pasted into Webflow (head code, the
  two canvas Embeds — 2a the stylesheet link, 2b its script — and footer
  code). Read it before touching any
  of them.
- `src/index.ts` is a manifest: one `run('<name>', init<Name>)` call per
  module, so a module that throws is logged and the rest still run. Features
  go in `src/modules/`, one file each, exporting an init function that no-ops
  when its target markup is absent.
- `src/styles.css` opens with cascade notes. Add rules to the section they
  belong to, never to the end of the file.
- Third-party libraries are bundled with `pnpm add`, not added as CDN tags.
  The footer loader appends the bundle dynamically, so a sibling
  `<script defer>` has no ordering guarantee. Finsweet Attributes too: use
  the webflow-build skill's `recipes/finsweet/`, never Finsweet's script
  tag in Webflow.
- `src/styles.css` §01 scales the **root** font-size with the viewport
  (TeraWulf's legacy scale, not the template's body scaling — see Project
  notes). Don't set a root or body font-size in the Designer.

## Webflow canvas facts

- **The Designer canvas never runs scripts.** Anything shown only after JS
  runs is invisible there; use a `canvas-preview` rule if the Designer needs
  to see it.
- **The canvas shows the staging stylesheet only.** Seeing a CSS change in
  the Designer means push → ~1 min → reload the Designer tab. Never add a
  static `http://localhost` link to the Embed for good — every public
  visitor's browser would request it. `loader.html` describes the temporary
  opt-in; if one is in use, the local and staging sheets are additive and a
  deleted rule keeps applying from staging until pushed.
- No live reload on the canvas. Reload the Designer tab.
- Debug "is my CSS loading?" with `background`, not `outline` — outlines on
  `body` paint outside the canvas iframe and get clipped.

## Snippets are not versioned

A push updates the JS/CSS bundles only. Any change to `loader.html` must be
re-pasted into Webflow and published to take effect — say so in the commit
or PR description, and keep `loader.html` identical to what is installed.

## Commands and release

```bash
pnpm dev      # watch + server on :3000
pnpm build    # minified -> dist/
pnpm check    # tsc --noEmit + repo checks (scripts parse, skill links)
pnpm test     # build + Playwright checks (loader + modules) + the new-project test
pnpm wf:pass /   # webflow-build checks: wf:compare, wf:pass, wf:anchors, wf:outline,
                 # wf:film, wf:transitions, wf:a11y, wf:links, wf:baseline
pnpm update-skills   # skills from the latest template release (ask first)
```

Node 22 and the pinned pnpm in `package.json`. `dist/` is committed: after
any `src/` change run `pnpm build` and commit `dist/` with it — CI fails the
push otherwise, and staging only deploys after `pnpm check`, the browser
tests and the `dist/` check pass. `pnpm dev` builds in memory and never
touches `dist/`.

Release as the README describes: tag a commit whose CI passed, then set
`RELEASE` in the head snippet — the only version string. Never move a pushed
tag; cut the next patch. Never use `@latest` or a branch URL in production.

## Webflow MCP limits

Worked around, not fixed — do not rediscover these.

- `custom_value` is rejected for Color and Size variables (`color-mix()`,
  `oklch()`, `calc()`). Create those through the variables JSON import with
  `valueType: "custom"`.
- No variable rename or reorder within a collection. Rename in the Designer
  (preserves ids and aliases; recreating does not).
- The WHTML importer keeps classes that already exist, but drops the whole
  class list if any one is missing (create classes first, then re-check
  `styleNames`). It drops every `<img>` attribute and the asset link, turns
  `<button>` into a Link and every `<span>` into a text Span, and trims a
  space before `<br>`. The webflow-build skill's `lessons/mcp.md` has the
  fixes.
- `get_all_elements` does not descend into component definitions — pass the
  component scope. An element "missing" from a page is usually inside one.
- Concurrent Designer edits change element ids. Re-query on "Element not
  found" instead of assuming deletion.
- Responsive styles are only returned when breakpoints are requested
  explicitly (`include_breakpoints`).

## Session protocol

1. **Start:** read `GOTCHAS.md`, `docs/handoff/`, and the webflow-build
   skill's lesson file for the area you will work in
   (`.claude/skills/webflow-build/lessons/`). Do not repeat a mistake
   already logged.
2. **During:** when something surprising costs time — a Webflow quirk, a
   template default that gets in the way, an MCP limitation, a fix that had
   to be reverted — add an entry to `GOTCHAS.md` in the same commit as the
   fix, using the format at the top of that file.
3. **Scope:** tag an entry `template-candidate` when it would recur on any
   project built from `wf-template`; those entries are collected later to
   improve the template. Otherwise tag it `project`.
4. Never delete entries. Update `Status` when something is fixed or
   upstreamed.
