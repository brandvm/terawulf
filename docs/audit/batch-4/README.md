# Batch 4: images and first-screen loading

Staged on terawulff.webflow.io, then **published to production 2026-10-09**
(after "publish"; only the six batch 4 pages had changed since batch 3).

## What changed in Webflow

| Where | Change | Saving |
| --- | --- | --- |
| Home › C \| Parallax Image (Why TeraWulf) | Instance image override: `Why Background.jpg` (850 KB, 4000 px) → `Why Background-2880.webp` (682 KB) | −168 KB on Home |
| WULF Compute › C \| Parallax Image (Purpose-Built) | Image prop: `Purpose-Built.jpg` (985 KB) → `Purpose-Built-1400.webp` (310 KB); displayed ≤ 656 px, so 1400 covers 2× screens | −675 KB on WULF Compute |
| Our Operations, Our Impact, Our Sites › page head code | `<link rel="preload" as="image" fetchpriority="high">` for the hero image (files in `page-heads/`) | LCP, see below |

Same images and crops; only the size and format changed. The component's
default image (Why Background.jpg) is untouched, so other instances that
inherit it are unaffected. The new files were uploaded with
`data_assets_tool › create_asset` plus a signed S3 POST (no public URL
needed). Old assets are kept.

## Tried and dropped (measured, not guessed)

A/B on production HTML (Playwright route injection, 7 runs each, median,
mobile 390 px, 4× CPU, ~1.6 Mbps / 150 ms):

| Page | Baseline LCP | + font preloads | + fonts + hero preload |
| --- | --- | --- | --- |
| Our Sites | 928 | 904 | **508** |
| Our Operations | 1556 | 1516 | **1424** |
| Our Impact | 1504 | 1484 | **1424** |
| WULF Compute | 2000 | 1976 | 1976 |
| Home | 1424 | 1408 | 1432 |

- **Font preloads (Space Grotesk, Satoshi): dropped.** −20–40 ms LCP but
  +30–100 ms FCP; both faces already use `font-display: swap`. Site head
  stays as `batch-2/site-head.html`.
- **Home logo, WULF Compute hero, Connect desktop image preloads: dropped.**
  No measurable gain (WULF Compute's LCP is held by the IX3 reveal gate, not
  the download; that's B6). Their page head code is empty again.
- **Resources template cover preload: not added.** The cover `<img>` has a
  Webflow `srcset`, so a plain `href` preload would download a second
  file; a matching `imagesrcset` can't be built from a CMS binding.
- **Eager loading / width-height in the Designer: not needed for now.** The
  preloads cover the three pages where loading order mattered; no CLS from
  these images was measured. Revisit with B6 when the IX3 gate goes.

## Verification on staging

- `wf:baseline compare` against `baselines/production-2026-10-09`: the
  Why Background and Purpose-Built areas look identical; remaining diffs
  are the News & Media cards (batch 3 unpublishes) and the scroll-scene
  noise measured in batch 1 (Our Sites @820, Our Operations).
- No duplicate downloads introduced (Map.webp ×2 is pre-existing,
  MANUAL-TODO row A).

## Rollback

Home instance: reset the Image prop override (default is Why Background).
WULF Compute instance: set Image back to asset `6a04ad3f93f9adcafb0adf2b`.
Page head code on the three pages: clear it.
