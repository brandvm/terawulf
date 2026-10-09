# TeraWulf — Webflow custom code

Custom code for [www.terawulf.com](https://www.terawulf.com) (Webflow site
`69cc1149c7144d8f6b6c386a`, staging `terawulff.webflow.io`). Built on
[`brandvm/wf-template`](https://github.com/brandvm/wf-template) 0.1.0,
adopted 2026-10-09 — see `AGENTS.md` › Project facts for what is installed
in Webflow today.

> **Live site.** Production runs release `1.1.1` through the *old* loader
> until the template loader in `loader.html` is installed with the next
> release. No Webflow change without explicit approval; stage on
> terawulff.webflow.io first. Audit and fix plan: [`docs/audit/`](docs/audit/README.md).

TypeScript + esbuild toolchain for Webflow client sites — JS **and** CSS.
Dev = localhost live reload · Staging = auto-deploy on push · Prod = pinned jsDelivr tag.

Source files: `src/index.ts` (bundled to `dist/index.js`) and `src/styles.css`
(minified to `dist/styles.css`). Both ship together under one version tag.

## Requirements

- [Node](https://nodejs.org) 22 (the version CI builds with)
- [pnpm](https://pnpm.io/installation) 11 — `corepack enable`

```bash
pnpm install
```

## Commands

```bash
pnpm dev      # esbuild watch + server on :3000 (in memory, sourcemaps)
pnpm build    # minified -> dist/ (commit the result)
pnpm check    # tsc --noEmit
pnpm test     # build + browser checks
pnpm update-skills   # agent skills from the latest template release
```

`.wf-template.json` records the template version a repo was created from
and, after `pnpm update-skills`, the skills' version. The template's own
history is in `CHANGELOG.md` (template repo only).

`dist/` is committed. `pnpm dev` serves from memory and never touches it;
run `pnpm build` and commit `dist/` together with any `src/` change — CI
fails the push if they disagree, and staging does not deploy until it passes.

## Daily

- Run `pnpm dev`, then click the small **Staging** pill in the bottom-left of
  the `.webflow.io` site and choose **Dev**. Choose **Staging** to switch back.
  The page reloads and remembers your choice. The control starts collapsed;
  click elsewhere or press Escape to collapse it again.
- The pill shows the bundle actually loaded. If localhost fails and the loader
  uses staging, it shows **Staging** with a fallback note when expanded.
  Start `pnpm dev` and select **Dev** again to retry. If staging falls back to a
  pinned release, the note identifies that fallback; select **Staging** to retry.
- `?wfc-dev=1` / `?wfc-dev=0` still work, including when localStorage is blocked.
- `git push` → client-facing staging bundle updates in ~1 min (no Webflow publish)
- Live reload works in the browser. It does **not** work on the Designer canvas,
  which never runs scripts — reload the Designer tab instead.

The switcher is limited to `*.webflow.io`, hidden in the Webflow editor/Designer
and print, and isolated from site styles with Shadow DOM. Its implementation is
`src/modules/environment-switcher.ts`; `src/index.ts` initializes it after the DOM
is ready. It has no runtime dependencies or client-specific URLs.

New projects created from this template include it automatically. Existing
projects can copy the module, merge the types from `src/globals.d.ts`, add the initializer, and update
all three snippets from `loader.html` (move their version into `RELEASE`).
The loader's `window.WFC.source` field records fallback selection before the bundle
runs. A JS fallback also removes local CSS and selects the fallback stylesheet.

### Verify the switcher

```sh
pnpm exec playwright install chromium  # one-time browser setup
pnpm test                              # build + browser checks
```

The tests use a generic example project and mocked asset responses, covering
mode selection, URL/storage persistence, fallback, keyboard/mobile interaction,
and host/editor restrictions without starting a local server.

## Release (launch / retainer updates)

```
pnpm build                      # dist/ must match src/ — CI checks this too
git commit -am "release: vX.Y.Z" # only if the build changed anything
git tag vX.Y.Z && git push && git push --tags
```

`dist/` is always committed, so every tag carries its build and jsDelivr can
serve it. There is no force-add or un-track step.

Then set `RELEASE = "X.Y.Z"` in the head code snippet — the only version
string — and publish staging → verify → publish prod.
Rollback = set `RELEASE` back to the previous tag and publish. Never use
`@latest` or branch URLs in prod.

**Tag rules (learned the hard way):**

- Tag a commit whose CI run passed — that proves `dist/` matches `src/`
- A pushed tag must **never** be moved (`tag -f`) — jsDelivr snapshots a
  version once and keeps it forever, so a half-baked snapshot is permanent.
  Botched release? Cut the next patch version instead

**Before attaching a custom domain,** set `RELEASE`. While it is `null` a
custom domain serves the *staging* bundle and logs a console error, so the
site still renders — but staging changes on every push and must never be
what production runs on.

## How the files reach the page

Three snippets, documented in [`loader.html`](loader.html) — read that file
before touching any of them.

| Environment    | Source                  |
| -------------- | ----------------------- |
| Production     | pinned jsDelivr tag (`RELEASE`) |
| `*.webflow.io` | GitHub Pages staging    |
| `?wfc-dev=1`    | `http://localhost:3000` |

Dev mode is localhost-only by design: `http://localhost` is a
potentially-trustworthy origin so an https page may load it, but a LAN IP is
not and gets blocked as mixed content. To check work on another device, push
and use the staging bundle.

Pushing to `master` triggers
[`.github/workflows/staging.yml`](.github/workflows/staging.yml): type check,
build, browser tests and the `dist/` check, then — only if all pass — publish
`dist/` to GitHub Pages. Pull requests run the same checks without deploying.
Production is pinned to a tag, so a staging deploy never touches the live
site.

The Designer canvas shows the **staging** stylesheet, so seeing a CSS change
there means push → ~1 min → reload the Designer tab. There is no static
localhost link in the Embed (public visitors' browsers used to request it);
`loader.html` explains how to add one temporarily while designing.

## Project structure

```
src/
  index.ts            entry point; a manifest of module imports and calls
  styles.css          the whole stylesheet, in numbered sections
  modules/            one file per feature, each exporting an init function
build.mjs             esbuild config and dev server
loader.html           the three Webflow snippets, documented
scripts/              new-project setup and the repo checks
tests/                Playwright checks and the new-project test
docs/handoff/         HANDOFF, MANUAL-TODO and BUILD-NOTES for this project
.claude/skills/       webflow-build (workflow, checklists, conventions,
                      lessons, prototype starter, check scripts) and
                      webflow-launch (QA, launch, handoff, first 30 days)
AGENTS.md             agent rules; CLAUDE.md imports it
GOTCHAS.md            the project's log of things that cost time
webflow-build.config.json   URLs for the check scripts (pnpm new-project)
```

`src/styles.css` opens with cascade notes and a numbered table of contents.
Section order is the tiebreaker for same-specificity rules — add to the
section a rule belongs to, never to the end of the file.


TeraWulf's stylesheet predates the template foundation and was kept rule for
rule when it was re-sectioned (2026-10-09). Unlike the template it **does**
set the root font-size (legacy fluid scale, §01) and redefine Webflow
`--_colors---*` variables — both tagged `override-webflow` and logged in
`GOTCHAS.md`. New rules follow the template policy: no root font-size, no
Webflow variable names, nothing the Designer can style (see the
webflow-build skill's `lessons/css.md`).

Modules run through `run(name, init)` in `src/index.ts`: one that throws is
logged and skipped, and the rest still initialize.

TypeScript runs `strict`, targets ES2019, and defines no path aliases —
imports are relative.

## AI agents

- [`AGENTS.md`](AGENTS.md) — the agent rules: ownership, the Designer-first
  CSS policy, canvas facts, release, Webflow MCP limits. Codex and similar
  tools read it directly.
- [`CLAUDE.md`](CLAUDE.md) — imports `AGENTS.md` and `GOTCHAS.md` for Claude
  Code. Edit `AGENTS.md`, not this file.
- [`GOTCHAS.md`](GOTCHAS.md) — this project's log; agents append to it
  when something costs time. It starts empty: lessons from earlier builds
  are in the skill's [`lessons/`](.claude/skills/webflow-build/lessons/README.md),
  read by area. Entries tagged `template-candidate` are collected there.
- [`docs/handoff/`](docs/handoff/HANDOFF.md) — the design handoff, manual
  Designer steps and build notes, kept current during the build.
- [`.claude/skills/webflow-build`](.claude/skills/webflow-build/SKILL.md) —
  the build workflow for Claude Code: design handoff → Webflow section by
  section, checks against the prototype at three widths (`pnpm wf:*`), the
  conventions, the lessons and a prototype starter.
  [`webflow-launch`](.claude/skills/webflow-launch/SKILL.md) takes over at
  the build handoff. Every repo from this template has both. Improvements are welcome from anyone with a
  GitHub account: fork, change the skill, open a pull request (see the
  skill's Contributing section).

Every repo CSS rule carries a `/* repo-css: <tag> — why */` comment; the
allowed tags are listed in `AGENTS.md`. Styling the Designer can express
belongs in the Designer.

## Webflow MCP

`.mcp.json` carries the Webflow MCP server definition; `pnpm new-project`
copies it to the workspace, since Claude Code only reads `.mcp.json` from
the folder it starts in. Approve the project server on first launch, then
run `/mcp` to authorise Webflow — OAuth is per-machine, so this is
repeated on each new machine. The Figma connector (for designs sent as a
Figma link) is connected once per account.

## Auditing before launch

Before shipping, check every JS module and CSS block against the live markup —
modules whose selectors/attributes appear on no page are dead weight
(one migration dropped 5 of 7 inherited modules this way).

## Handoff (site leaving the agency)

Build → paste `dist/index.js` inline into Site footer, CSS inline (a
`<style>` block) into canvas Embed 2a in place of the link → remove Embed
2b, the loader and external tags → publish → zip `src/` for the client →
archive repo.
