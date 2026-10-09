# Decisions — audit 2026-10-09

What was decided on the findings in
[`2026-10-terawulf-audit.md`](2026-10-terawulf-audit.md), and by whom. Webflow
changes still go one item at a time with a go-ahead, staged on
terawulff.webflow.io first. Anything that changes visible content also waits
for the client: see [`CLIENT-APPROVALS.md`](CLIENT-APPROVALS.md).

| # | Topic | Decision (agency, 2026-10-09) | Client sign-off needed |
| --- | --- | --- | --- |
| 1 | Kerri Langlais old URL | One 301, both the slash and no-slash forms → `/news`. The item "Bitcoin Mining: Separating Fact From Fiction…" gets a new External Link: [TeraWulf press release, Apr 2023](https://investors.terawulf.com/news-events/press-releases/detail/56/terawulf-announces-participation-in-upcoming-industry-events). Today the link points at the old URL itself, so the card loops back to /news | Card link change: yes (A1) |
| 2 | 8 cards whose outside article is dead | Unpublish all 8 (kept in the CMS, restorable) and 301 each `/resources/<slug>` → `/news` | Yes (A2) |
| 3 | 3 press-release items with original text | Keep excluded from the sitemap/index (time-bound; they duplicate investors.terawulf.com) | No |
| 4 | Video items in the index | Exclude all 88 Videos (switch off the 13 currently included). Note the rule in the handoff docs for future items | No (SEO setting, nothing visible changes) |
| 5 | Duplicate Resources | Keep the clean-slug copy, unpublish the others, 301 them to it. The copies differ in date, category and source, so this goes to the client per set | Yes (A3) |
| 6 | Company schema | `"@type": "Corporation"`, same `@id` and facts, `"tickerSymbol": "NASDAQ: WULF"` | No |
| 7 | FAQ blocks for AEO/GEO | Draft from facts already on the site, for client approval only | Yes (A4) |
| 8 | Animation approach | Move off Webflow IX3: CSS first, repo modules where CSS can't, keeping the approved motion and timing. See AGENTS.md › Animation | No (same motion) — the client sees it on staging |
| — | CEO letter link (Feb 2023) | Swap the href to `https://investors.terawulf.com/news-events/presentations`; copy unchanged | No (exact replacement) |

Items 3 and 4 reverse nothing visible; they only change the per-item sitemap
switch, which also sets or clears the item's `noindex`.
