# Decisions — audit 2026-10-09

What was decided on the findings in
[`2026-10-terawulf-audit.md`](2026-10-terawulf-audit.md), and by whom. Webflow
changes still go one item at a time with a go-ahead, staged on
terawulff.webflow.io first. Decisions 1–6 are the agency's and need no client
sign-off; only new AEO/GEO content goes to the client
([`CLIENT-APPROVALS.md`](CLIENT-APPROVALS.md)).

| # | Topic | Decision (agency, 2026-10-09) | Client sign-off |
| --- | --- | --- | --- |
| 1 | Kerri Langlais old URL | One 301, both the slash and no-slash forms → `/news`. The item "Bitcoin Mining: Separating Fact From Fiction…" gets a new External Link: [TeraWulf press release, Apr 2023](https://investors.terawulf.com/news-events/press-releases/detail/56/terawulf-announces-participation-in-upcoming-industry-events). Today the link points at the old URL itself, so the card loops back to /news | No |
| 2 | 8 cards whose outside article is dead | Unpublish all 8 (kept in the CMS, restorable) and 301 each `/resources/<slug>` → `/news` | No |
| 3 | 3 press-release items with original text | Keep excluded from the sitemap/index (time-bound; they duplicate investors.terawulf.com) | No |
| 4 | Video items in the index | Exclude all 88 Videos (switch off the 13 currently included). Note the rule in the handoff docs for future items | No (SEO setting, nothing visible changes) |
| 5 | Duplicate Resources | Keep the clean-slug copy, unpublish the others, 301 them to it. The copies differ in date, category and source; sets listed below | No |
| 6 | Company schema | `"@type": "Corporation"`, same `@id` and facts, `"tickerSymbol": "NASDAQ: WULF"` | No |
| 7 | FAQ blocks for AEO/GEO | Draft from facts already on the site, for client approval only | Yes (A1) |
| 8 | Animation approach | Move off all Webflow interactions (IX, IX2, IX3): CSS first, repo modules where CSS can't, keeping the approved motion and timing. See AGENTS.md › Project notes | No |
| — | CEO letter link (Feb 2023) | Swap the href to `https://investors.terawulf.com/news-events/presentations`; copy unchanged | No (exact replacement) |

Items 3 and 4 reverse nothing visible; they only change the per-item sitemap
switch, which also sets or clears the item's `noindex`.

## Decision 2 — the 8 cards to unpublish (each 301 → /news)

| Item slug | Card date | Dead link |
| --- | --- | --- |
| terawulf-revolutionizing-cryptocurrency-mining-with-clean-energy | 2023-06-09 | afpkudos.com (404) |
| terawulf-launches-americas-first-100-nuclear-powered-bitcoin-mining-facility-in-pennsylvania | 2023-03-07 | coinpedia.org (404) |
| terawulf-and-hut-8-lead-februarys-bitcoin-mining-boom-amplifying-hash-rates-and-sustainability | 2024-03-05 | bnnbreaking.com (404) |
| 6-surprising-ways-bitcoin-mining-benefits-the-environment | 2023-07-14 | makeuseof.com (404) |
| 7-wild-bitcoin-mining-rigs | 2022-03-24 | coindesk.com (404) |
| terawulf-launches-nuclear-powered-bitcoin-mining-at-nautilus-complex-with-almost-8-000k-rigs | 2023-03-07 | bollyinside.com (domain gone) |
| terawulf-signs-a-purchase-order-with-bitmain-for-30-000-units-of-antminer-s19j-pro | 2021-06-29 | blog.bitmain.com (domain gone) |
| why-nuclear-powered-bitcoin-mining-matters | 2023-06-08 | cryptotvplus.com (invalid certificate; recheck before removing) |

## Decision 5 — duplicate sets

Rule: keep the clean-slug copy, unpublish the others and 301 them to it.
The copies are not identical: dates, categories and sometimes the source
differ.

| Title | Keep (clean slug) | Unpublish + 301 | What differs |
| --- | --- | --- | --- |
| TeraWulf CEO: Google has an in-house expert at every stage of value chain | …-value-chain (2025-11-26, Company News, CNBC) | …-value-chain-gmo4u (2026-09-15, Videos, YouTube) | Date, category, source |
| Terawulf CEO on recent deals: Represents chance to meet energy demand needs from hyperscalers | …-hyperscalers (2026-02-03, no category, CNBC) | …-2 (2026-02-03, Company News, CNBC); …-3 (2026-09-10, Videos, YouTube) | Category, source |
| Terawulf CEO on demand in AI infrastructure | …-infrastructure (2026-05-27, Company News) | …-2 (2026-09-09, Videos) | Date, category; same video |
| TeraWulf CEO Excited About Anthropic Data Center Agreement | …-agreement (2026-07-07, Company News, Bloomberg) | …-agreement-2 (2026-09-06, Videos, YouTube) | Date, category, source |
| AI's Biggest Bottleneck Isn't Chips — It's Power | …-paul-prager (2026-03-15, Company News) | …-st517 (2026-09-02, Videos) | Date, category; same video |
| Huge TeraWulf News, CFO Site Expansion Q&A | …-wulf-news (2026-02-03, Company News) | …-vv2go (2026-09-02, Videos) | Date, category; same video |
| TeraWulf's AI Power Play With Nazar Khan | …-nazar-khan (2025-05-27, no category) | …-2 (2026-08-31, Videos) | Date, category; same video |
| TeraWulf CEO on Anthropic deal: … tip of the iceberg | …-iceberg (2026-07-06, Company News) | …-iceberg-2 (draft, never live) | Nothing visible; the draft can simply stay a draft |
| TeraWulf CFO explains massive $WULF Q3 | …-q3 (2025-11-15, Videos) | …-q3-2 (2026-03-16, Company News) | Date, category; same video |

Pattern: the suffixed copies are mostly re-posts from Aug–Sep 2026 under
Videos; the clean slugs are the original entries. Keeping the clean slug
restores the original dates, so these stories move down the /news list.
