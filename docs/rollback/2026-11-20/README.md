# Rollback point — 2026-11-20 (before batch TW-1, the template 1.0.x loader)

Everything needed to put www.terawulf.com's custom code back as it was
before batch TW-1. Files are **verbatim**; don't reformat them
(`.prettierignore` excludes this folder).

How they were made: the 2026-11-02 copies with `1.3.1` → `1.4.2`, then
checked against the published HTML of www.terawulf.com on 2026-11-20 (last
published 2026-11-10 22:35 UTC): site head, site footer, Embed 2a and 2b are
found character for character on Home; the page code of About, Careers,
News (head + footer), Our Operations and the Resources template footer on
those pages. The Resources template head differs only where CMS fields are
bound (expected). Read from the published site, not through the MCP: the
`webflow-terawulf` server wasn't loaded in the session that made this.

| Layer | Current version | File |
| --- | --- | --- |
| Custom code bundle (live) | release **`v1.4.2`** (`cdn.jsdelivr.net/gh/brandvm/terawulf@1.4.2`) | Git tag `v1.4.2` |
| Site head / footer code | pre-0.8.0 template loader with dev mode, `RELEASE = "1.4.2"` | [`site-head.html`](site-head.html), [`site-footer.html`](site-footer.html) |
| G \| Components | Embed 2a (`@1.4.2`), Embed 2b | [`g-components-embed-2a.html`](g-components-embed-2a.html), [`g-components-embed-2b.html`](g-components-embed-2b.html) |
| Page custom code | unchanged by TW-1 | [`pages/`](pages/) |

## Before the first Webflow write: Webflow backup (person step)

Webflow → Site settings → **Backups** → *Create backup*.

- [ ] Backup created: name, date, by whom.

## How to roll back

1. **Release only:** `RELEASE` back to `"1.4.2"` in head code and Embed 2a's
   href back to `@1.4.2` (or paste `g-components-embed-2a.html`), publish.
2. **Loader as before TW-1:** paste `site-head.html` and `site-footer.html`
   into Site settings → Custom code, `g-components-embed-2a.html` and
   `-2b.html` into the two Embeds in G | Components, publish.
3. **Everything:** restore the Webflow backup above.
