# Rollback point — 2026-10-09 (before the clean-up)

Everything needed to put www.terawulf.com back exactly as it was before the
2026-10 clean-up, whoever published what. The files here are **verbatim**:
each was read from Webflow and checked character for character against the
published site. Don't reformat them (`.prettierignore` excludes this folder).

## What "current" means

| Layer | Current version | Where it lives |
| --- | --- | --- |
| Custom code bundle (live) | release `v1.1.1` (commit `e804b0d`), loaded from `cdn.jsdelivr.net/gh/brandvm/terawulf@1.1.1` | Git tag `v1.1.1`. jsDelivr serves a tag forever, so this file can't change or disappear while the tag exists |
| Repo | `master` at `5e15856` | Git tag **`rollback/2026-10-09-pre-cleanup`** |
| Webflow site custom code | old two-piece loader (`VER = '1.1.1'`, `bv-dev`) | [`site-head.html`](site-head.html), [`site-footer.html`](site-footer.html) |
| G \| Embed Code component | Phosphor icon CSS ×3 + `terawulf@1.1.1/dist/styles.css` | [`g-embed-code.html`](g-embed-code.html) |
| Page custom code | Home, About, News, Our Operations, Careers, Resources template | [`pages/`](pages/) (`<page>-head.html` / `<page>-footer.html`; a page with no file had that block empty) |
| Page settings schema | JSON-LD of the 11 static pages | [`page-settings-schema.json`](page-settings-schema.json) |
| Webflow Designer, CMS, settings | last published 2026-09-21 17:24 UTC | **Webflow backup** (see below), not in Git |

## Before any Webflow change: make a Webflow backup (person step)

Webflow → Site settings → **Backups** → *Create backup*, named
`Pre-cleanup 2026-10-09`. Webflow also keeps an automatic backup at each
publish, but a named one is easy to find. Record it here:

- [x] Backup created: `Pre-cleanup 2026-10-09`, 2026-10-09, by the account owner. Confirmed complete.

## How to roll back

Choose the smallest step that fixes the problem.

1. **Custom code only (the usual case)**
   - **New loader installed:** set `RELEASE` back to the previous value in Site settings → Head code, then publish. With the old loader it's `VER`.
   - **Back to exactly today:** paste `site-head.html` into Site settings → Head code, and `site-footer.html` into Site settings → Footer code. Replace the G \| Embed Code contents with `g-embed-code.html`. Paste each `pages/*` file into that page's custom code. Then publish. This works no matter what's on `master`, because the old loader pins `@1.1.1`.
2. **Schema:** paste the page's `jsonLdSchema` from `page-settings-schema.json` into Page settings → Schema markup. For the site-wide graph, use `site-head.html`.
3. **Designer, CMS or settings changes:** Webflow → Site settings → Backups → restore `Pre-cleanup 2026-10-09`, then publish. Note that restoring a backup also rolls back CMS items edited since then. Check the CMS change log first.
4. **Repo:** `git checkout rollback/2026-10-09-pre-cleanup` shows the repo exactly as it was. Never move or delete that tag, `v1.1.1`, or any pushed release tag.

## Safety rules in place

- Production loads a **pinned tag**. Pushing a branch, merging to `master` or deploying staging never changes the live site. Only a Webflow publish with a new `RELEASE`/`VER` does.
- GitHub Actions deploys staging only from `master`; branch pushes and PRs only run the checks.
- Each Webflow change is staged on terawulff.webflow.io and published to production with `safe-publish`, one approved item at a time.
- GitHub rulesets (set 2026-10-09, no bypass):
  - `master: PR with passing tests` (#24800613): `master` only changes through a pull request whose `test` check passed. No direct or force pushes, and no deletion. No reviewer is required: there's a single maintainer.
  - `release and rollback tags are permanent` (#24800614): `v*` and `rollback/*` tags can be created, but never deleted or moved. That keeps every jsDelivr release, and this rollback point, available.
