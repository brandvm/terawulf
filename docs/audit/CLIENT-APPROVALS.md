# Client approvals — collected for the end of the clean-up

TeraWulf is specific about what appears on the site. Everything here changes
something a visitor can see: copy, cards, links or dates. Each item stays on
hold until the client approves it. The agency raises the whole list with the
client as the last step of the clean-up. Add an item whenever a fix would
change visible content; record the outcome in the Status column and never
delete a row.

| ID | What changes | Where | Why | Status |
| --- | --- | --- | --- | --- |
| A1 | External Link of "Bitcoin Mining: Separating Fact From Fiction – Bitcoin Policy Summit Livestream with Kerri Langlais" (2023-04-26) changes from the old removed page to [TeraWulf's Apr 2023 press release](https://investors.terawulf.com/news-events/press-releases/detail/56/terawulf-announces-participation-in-upcoming-industry-events) | /news card + its resource page | The current link points at a removed page that redirects back to /news, so the card goes nowhere. The livestream recording (Bitcoin Magazine) wasn't found; a recording link would be better if the client has one | Waiting |
| A2 | Unpublish 8 cards whose outside article no longer exists, and 301 their `/resources/<slug>` to `/news` | /news | Visitors get a 404 or error page from the outside site | Waiting |
| A3 | Merge duplicate Resources: keep the clean-slug copy, unpublish the rest, 301 them to it | /news | The same story shows twice or three times | Waiting — per set, below |
| A4 | New FAQ sections (4–6 questions each), drafted only from facts already on the site, with FAQPage schema | WULF Compute, Our Sites | AEO/GEO: plain, quotable answers for AI search | Draft not written yet |

## A2 — the 8 cards

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

## A3 — duplicate sets

The copies are not identical: dates, categories and sometimes the source
differ. "Keep" follows the agency rule (the clean slug); the client may prefer
the other copy where its date or source is the right one.

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
