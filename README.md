# TeraWulf — Webflow custom code

Custom code for [www.terawulf.com](https://www.terawulf.com) (Webflow site
`69cc1149c7144d8f6b6c386a`, staging `terawulff.webflow.io`). Built on
[`brandvm/wf-template`](https://github.com/brandvm/wf-template) (adopted
at 0.1.0 on 2026-10-09, updated to 1.0.0 on 2026-11-20) — see `AGENTS.md` › Project facts for what is installed
in Webflow today.

> **Live site.** Production runs the release named in `AGENTS.md` ›
> Project facts, through the loader in `loader.html`. No Webflow change
> without explicit approval; stage on terawulff.webflow.io first. Audit and
> fix plan: [`docs/audit/`](docs/audit/README.md).

TypeScript + esbuild toolchain for Webflow client sites — JS **and** CSS.
Staging = auto-deploy on push · Prod = pinned jsDelivr tag.

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
pnpm build    # minified -> dist/ (commit the result)
pnpm check    # tsc --noEmit
pnpm test     # build + browser checks
pnpm update-skills   # agent skills, build tooling and new scripts from the latest template release
```

`.wf-template.json` records the template version a repo was created from
and, after `pnpm update-skills`, the skills' version. The template's own
history is in `CHANGELOG.md` (template repo only).

`dist/` is committed: run `pnpm build` and commit `dist/` together with any `src/` change — CI
fails the push if they disagree, and staging does not deploy until it passes.

## Daily

- Edit `src/`, run `pnpm build`, commit `src/` and `dist/` together and
  push. The staging bundle updates in ~1 min (no Webflow publish): reload
  the `.webflow.io` page, and reload the Designer tab for CSS on the canvas.
- There is no local mode (wf-template 1.0.0): no page ever loads code from
  this machine.

### Verify the loader

```sh
pnpm exec playwright install chromium  # one-time browser setup
pnpm test                              # build + browser checks
```

`tests/loader.spec.mjs` runs the pasted snippets against mocked asset
responses: staging, production with and without `RELEASE`, one stylesheet
download on production, first paint waiting for the release sheet in
`<head>`, the jsDelivr and staging fallbacks, and no scroll lock.

## Release (launch / retainer updates)

```
pnpm build                      # dist/ must match src/ — CI checks this too
git commit -am "release: vX.Y.Z" # only if the build changed anything
git tag vX.Y.Z && git push && git push --tags
```

`dist/` is always committed, so every tag carries its build and jsDelivr can
serve it. There is no force-add or un-track step.

Then set `RELEASE = "X.Y.Z"` in the head code snippet **and** the
`@X.Y.Z` in Embed 2a (TeraWulf pins the release there, see `loader.html`),
and publish staging → verify → publish prod.
Rollback = set both back to the previous tag and publish. Never use
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

If the staging bundle fails to load and a `RELEASE` is set, staging falls
back to the pinned release, CSS included. On production, if the release
stylesheet fails, Embed 2a moves to the staging stylesheet.

Pushing to `master` triggers
[`.github/workflows/staging.yml`](.github/workflows/staging.yml): type check,
build, browser tests and the `dist/` check, then — only if all pass — publish
`dist/` to GitHub Pages. Pull requests run the same checks without deploying.
Production is pinned to a tag, so a staging deploy never touches the live
site.

The Designer canvas shows the **release** stylesheet on TeraWulf (Embed 2a
pins it). Never put a localhost link in the Embed: every public visitor's
browser would request it.

## Project structure

```
src/
  index.ts            entry point; a manifest of module imports and calls
  styles.css          the whole stylesheet, in numbered sections
  modules/            one file per feature, each exporting an init function
build.mjs             esbuild config
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
