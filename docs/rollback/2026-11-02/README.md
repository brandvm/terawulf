# Rollback point — 2026-11-02 (before the B6 cutover)

Everything needed to put www.terawulf.com back as it was before B6 (moving
off Webflow interactions). The files here are **verbatim**: each was read
through the `webflow-terawulf` MCP on 2026-11-02 and the custom code was
checked character for character against the published site. Don't reformat
them (`.prettierignore` excludes this folder).

## What "current" means

| Layer | Current version | Where it lives |
| --- | --- | --- |
| Custom code bundle (live) | release **`v1.3.1`**, loaded from `cdn.jsdelivr.net/gh/brandvm/terawulf@1.3.1` | Git tag `v1.3.1` (permanent, ruleset) |
| Webflow site custom code | template loader, `RELEASE = "1.3.1"` | [`site-head.html`](site-head.html), [`site-footer.html`](site-footer.html) |
| G \| Components | Embed 2a (`@1.3.1` stylesheet), Embed 2b | [`g-components-embed-2a.html`](g-components-embed-2a.html), [`g-components-embed-2b.html`](g-components-embed-2b.html) |
| Page custom code | About, Careers, News, Our Operations, Resources template (Home is empty) | [`pages/`](pages/) (`<page>-head.html` / `<page>-footer.html`; no file = empty block) |
| IX3 interactions | 21, full definitions with timelines | [`ix3-interactions.json`](ix3-interactions.json) |
| IX2 interactions | 15 events / 14 actions (see below) | [`ix2-webflow-achunk.c2629e51869d5c0a.js`](ix2-webflow-achunk.c2629e51869d5c0a.js), the published Webflow chunk holding them (reference only) |
| Webflow Designer, CMS, settings | last published 2026-10-13 20:23 UTC | **Webflow backup** (see below), not in Git |

Production and staging both carry the 2026-10-13 publish. Webflow records
Designer saves after it (Resources template 2026-10-15, Home 2026-10-28, site
2026-11-02 16:01 UTC); custom code, embeds and interactions read today are
identical to what is published.

### IX2 events published on 2026-10-13

| Event | Trigger | Page | Action |
| --- | --- | --- | --- |
| e-2 | second click `.section-stat.link-underline.is_show-more` | site (class) | a-2 Site \| Show Less Info |
| e-3 / e-4 | dropdown open / close `.g-nav-drop` | G \| Navigation | a-3 / a-4 G Nav \| Drop Open / Close |
| e-5 / e-6 | hover in / out `.deliver-card` | site (class) | a-5 / a-6 Deliver Card \| Hover In / Out |
| e-7 / e-8 | scroll into / out of view `.section.s-approach` | Our Impact | a-7 / a-8 Approach Section \| In / Out View |
| e-9 / e-10 | click / second click `.g-nav-menu-drawer` | G \| Navigation | a-9 / a-10 G Nav \| Menu Open / Close |
| e-11 | click `.team-card` | About | a-11 Team Pop Up \| Open |
| e-13 | click `.tpu-pu-close` | About | a-12 Team Pop Up \| Close |
| e-15 | click `.button-link.is_home-video-player` | Home | a-13 Home Video Pop Up \| Open |
| e-17 | click `.home-video-pu-close` | Home | a-14 Home Video Pop Up \| Close |
| e-19 | scroll into view `.image-overlay` (class, all 6 on About) | About | a-15 Image Overlay \| Hide (width 100% → 0, 2 s, `cubic-bezier(.64,.05,0,1)`) |
| e-21 | click `.about-intro-visual-w` | About | a-13 Home Video Pop Up \| Open |

e-19 is the one that writes `data-w-id="6529e6da-…"` on the first About
`.image-overlay.is_left`. That id is the element's own Webflow id, not a
custom attribute: it goes away only when the IX2 event is deleted in the
Designer's Interactions panel.

## Before any Webflow change: make a Webflow backup (person step)

Webflow → Site settings → **Backups** → *Create backup*. Record it here:

- [x] Backup created: `Before Motion Migration (Nov 02)`, 2026-11-02, by the account owner.

## How to roll back

Choose the smallest step that fixes the problem.

1. **Release only:** set `RELEASE` back to `"1.3.1"` in Site settings → Head
   code **and** Embed 2a's href back to `@1.3.1` (or paste
   `g-components-embed-2a.html`), then publish.
2. **Custom code exactly as today:** paste `site-head.html` / `site-footer.html`
   into Site settings, the two embed files into G \| Components, and each
   `pages/*` file into that page's custom code. Then publish.
3. **Interactions, GSAP setting, Designer or CMS:** Webflow → Site settings →
   Backups → restore `Before Motion Migration (Nov 02)`, then publish. Restoring also rolls
   back CMS items edited since then; check the CMS change log first.
   `ix3-interactions.json` lets an interaction be recreated through
   `data_interactions_tool › create_interaction` if a full restore is too
   much (ids will differ).
4. **Repo:** `git checkout v1.3.1`. Never move or delete a pushed tag.
