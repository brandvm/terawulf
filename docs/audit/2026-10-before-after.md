# TeraWulf website clean-up: before and after

Measured 2026-10-09 on www.terawulf.com, with all six clean-up batches live.
The "before" figures come from the audit taken earlier the same day
([`2026-10-terawulf-audit.md`](2026-10-terawulf-audit.md)), before any change was made.
The design and the wording of the site were not changed.

## Summary

- **The homepage paints much sooner on phones.** First content now appears after
  1.8 s, down from 4.5 s. The mobile speed score went from 59 to 73 (median of three runs).
- **Less data on the homepage.** A phone now downloads 4.3 MB in its first
  seconds, down from about 17 MB in your PageSpeed test. Most of the saving
  comes from a phone-sized hero video: 3.2 MB, down from 7.2 MB.
- **The Careers preview video is 3.9 MB instead of 56.5 MB.** It is now a
  30-second clip of the same footage, so it no longer streams a full-length
  video in the background.
- **Desktop is fast across the board.** Desktop scores are 89–94 on every
  measured page except News (77). The homepage went from 86 to 91.
- **Search engines see a clean site.** All 19 pages in the sitemap load
  directly with no redirects. `/home` and `/leadership` now redirect in one
  step; before, they showed "page not found". robots.txt now points to the sitemap.

## Speed scores

Lighthouse lab test, median of three runs. Scores run from 0 to 100, and
higher is better. LCP is the time until the main content is visible, and
lower is better.

**Homepage, before and after**

| | Mobile before | Mobile after | Desktop before | Desktop after |
| --- | --- | --- | --- | --- |
| Score | 59 (your PageSpeed test: 69) | **73** | 86 (your PageSpeed test: 81) | **91** |
| First content visible (FCP) | 4.5 s | **1.8 s** | 0.7 s | 0.6 s |
| Main content visible (LCP) | 8.7 s | **6.5 s** | 1.9 s | 1.7 s |
| Blocking time (TBT) | 120 ms | 91 ms | 10 ms | 4 ms |
| Layout shift (CLS) | 0.054 | 0.053 | 0.01 | 0.013 |
| Data transferred | 6.7 MB | **5.1 MB** | not measured | 6.0 MB |

**Other pages: after only** (no "before" lab scores were recorded for these pages)

| Page | Mobile score | Mobile LCP | Desktop score | Desktop LCP |
| --- | --- | --- | --- | --- |
| About | 96 | 1.9 s | 92 | 1.5 s |
| Our Operations | 71 | 7.7 s | 90 | 1.8 s |
| Our Sites | 74 | 5.8 s | 94 | 1.6 s |
| Careers | 67 | see note | 89 | 1.5 s |
| News | 73 | 4.5 s | 77 | 3.1 s |

Notes:
- **Careers, mobile:** the lab test reports an LCP of 32.7 s. The page actually
  showed its content after about 2.5 s in the same runs. The lab figure is
  inflated by the embedded ADP job board, which loads about 4.6 MB of its own
  code (see Page weight).
- **Our Operations and Our Sites, mobile:** most of the remaining delay comes
  from the page-load animations, which hold back the first screen until they
  start. That is the next step (see Still to do).

## Page weight

Measured in Chrome with the cache off. Each figure is everything downloaded
from page load until 6 seconds later, as a first-time visitor would get it.
Phone means a 390 × 844 screen and desktop means 1440 × 900. Each figure is
the median of three loads.

| Page | Screen | Total | Video | Images | Fonts | Styles | Scripts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | Phone | **4.3 MB** | 3.7 MB | 0.16 MB | 0.11 MB | 0.03 MB | 0.25 MB |
| Home | Desktop | 7.2 MB | 6.6 MB | 0.16 MB | 0.11 MB | 0.03 MB | 0.25 MB |
| About | Phone | 7.2 MB | 6.4 MB | 0.31 MB | 0.11 MB | 0.03 MB | 0.26 MB |
| About | Desktop | 7.3 MB | 6.6 MB | 0.26 MB | 0.11 MB | 0.03 MB | 0.27 MB |
| Careers | Phone | 10.2 MB | 3.5 MB | 0.61 MB | 0.50 MB | 0.31 MB | 5.1 MB |
| Careers | Desktop | 10.2 MB | 3.5 MB | 0.61 MB | 0.50 MB | 0.31 MB | 5.1 MB |

**Before, where it was measured:**

| | Before | After |
| --- | --- | --- |
| Homepage, your PageSpeed test (mobile) | ~17 MB | 5.1 MB (lab), 4.3 MB (phone in Chrome) |
| Homepage hero video, phone | 7.2 MB | 3.2 MB |
| Homepage hero video, desktop | 7.2 MB | 6.4 MB |
| About preview video, full file, phone | 11.9 MB | 8.0 MB |
| About preview video, full file, desktop | 11.9 MB | 11.9 MB (kept; a re-encode saved nothing) |
| Careers preview video | 56.5 MB (full-length file, downloaded twice) | 3.9 MB |
| Image in the Resources menu (on every page) | 2.8 MB | 279 KB |
| "Why TeraWulf" background image (Home) | 850 KB | 682 KB |
| "Purpose-Built" image (WULF Compute) | 985 KB | 310 KB |
| Icon files per page | 5 requests, ~550 KB, 3 of them holding up the first paint | 0 extra requests, 2 KB built in |
| Video downloaded before a popup video is clicked | ~150–180 KB per page | 0 |

- **About** still downloads 6.4–6.6 MB of video in the first 6 seconds, on
  phones and on desktop. Before, the figure for phones was 6.5 MB. The preview
  sits in the first screen, so it starts at once. On phones the full file is now
  a third smaller (8.0 MB, down from 11.9 MB).
- **Careers:** about 5.8 MB of the 10.2 MB is the ADP job board
  (workforcenow.adp.com), a third-party embed. It is the same as before and
  outside this clean-up. TeraWulf's own part of the page is about 4.4 MB.

## What changed

1. **Batch 1, new site code (v1.2.0).** Full-length popup videos now download
   only when someone clicks play. The dotted map does far less work. Old page
   scripts were replaced with lighter, keyboard-friendly versions.
2. **Batch 2, search setup.** The company profile Google reads was corrected,
   robots.txt now lists the sitemap, and internal design pages left the sitemap.
3. **Batch 3, links and redirects.** Old addresses now redirect in one step,
   dead news links and duplicate pages were retired, and the 2.8 MB menu
   image was compressed.
4. **Batch 4, images.** Large background images were made smaller with the
   same look. Hero images on Our Sites, Our Operations and Our Impact now load
   first, which made Our Sites appear up to 0.4 s sooner.
5. **Batch 5, videos.** Phones get a smaller hero video. About gets a smaller
   phone version. Careers gets a 30-second preview clip. Every video now has
   a still image that shows while it loads.
6. **Batch 6, icons and accessibility.** Icons are built into the site's own
   code instead of five extra downloads. There is now a "Skip to main content"
   link, and labels were added for screen readers on menus, social links, news
   cards and the contact form.

## Still to do

- **Animations off Webflow interactions (in progress).** This is the main
  remaining cost on phones. The current animations keep the first screen
  hidden until their code has loaded. Rebuilding them with the same motion
  should bring the homepage, Our Operations and Our Sites LCP down further. It
  also fixes the remaining screen-reader and contrast warnings.
- **Waiting on your approval:** the FAQ content (for Google and AI answers)
  and the `llms.txt` file.
- **Worth a look:** on phones, the News page cards shift slightly as the page
  loads (layout shift 0.25; under 0.1 is "good"). The Careers job board is
  heavy, but that is up to ADP.
- **Hero video pause button:** this needs a design decision.

## Crawl health (checked 2026-10-09)

| Check | Before | After |
| --- | --- | --- |
| Sitemap pages that load directly (no redirect) | not measured | 19 of 19 |
| `/home` | page not found | one redirect to `/` |
| `/leadership` | page not found | one redirect to `/about#leadership` |
| Old Kerri Langlais video address | 2 redirects to `/news` | 1 redirect to `/news`* |
| robots.txt | empty | lists the sitemap and allows AI crawlers |

\* The same addresses written with a trailing slash (`/home/`, `/leadership/`
and the Kerri Langlais URL ending in `/`) take one extra step. Webflow
removes the slash first, and that can't be changed. No link on the site uses
the slash versions.

## Method

- **Speed scores:** Lighthouse 12.8.2, run on a Mac with Chrome in headless
  mode. Each page was tested 3 times on mobile (the default settings: a
  simulated mid-range phone on a slow 4G connection) and 3 times on desktop.
  The tables show the median.
- **Lab scores vary.** The same page scored anywhere from 66 to 95 across
  three mobile runs (Our Sites), and from 81 to 95 on desktop (About).
  Treat differences of a few points as noise. Google's PageSpeed Insights
  also runs from Google's servers, so its numbers won't match these exactly.
  Your earlier PageSpeed test gave 69 / 81 when our local test gave 59 / 86.
- **Page weight:** Chrome driven by Playwright, cache off, real network (no
  throttling), with all bytes counted until 6 seconds after load, including
  embedded frames. Median of 3 loads.
- **Crawl:** every address in `sitemap.xml`, plus the retired addresses,
  checked one by one for status code and number of redirects.
- **"Before":** the 2026-10-09 audit (Lighthouse 12 on the same machine, plus
  your PageSpeed test) and the measurements recorded for each batch. Where no
  before figure was recorded, this report says "not measured".
- **Dates:** before, 2026-10-09 (pre-clean-up audit); after, 2026-10-09
  (batches 1–6 live, site code v1.3.0).
