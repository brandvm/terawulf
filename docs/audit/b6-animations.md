# B6: moving off Webflow interactions (IX3) — code side

Status 2026-10-09: built and tested in the repo; **not released**. Cutover
needs the Webflow connector (delete interactions + turn off Webflow's GSAP
setting) in the same publish as the release.

## What replaces what

| IX3 interaction | Replacement |
| --- | --- |
| i-22814008 Page Load / Home (hero logo, text, CTA, stats bar) | CSS `@keyframes` in `src/styles.css` §05: same 0.735 s, `power1.inOut`, 0.24 s "from edges" stagger |
| i-c2567f92 G \| Page Header Load (bg 3 s, title 0.8 s, CTA 1.6 s) | CSS `@keyframes`, same durations, delays and custom curve. **Difference:** the title fades/slides as one block instead of word by word (a word split needs JS — what made the h1 wait) |
| the other 19 (scroll: text reveals, para-in, parallax, stats, What We Do stack, smoke, home transition, timeline, page header out, About values, What's Next, Beowulf tracks, Impact features) | `src/modules/motion.ts` replaying `src/modules/motion-spec.ts`, generated from the decoded IX3 data (`docs/audit/ix3-spec.json`, `scripts/ix3-to-motion.mjs`) |
| IX2 e-19 "Image Overlay \| Hide" (About, all 6 `.image-overlay`) — added 2026-11-02 | `src/modules/image-overlay-wipe.ts` + a `js-state` CSS transition in §05: width 100% → 0, 2 s, `cubic-bezier(.64,.05,0,1)`, once per overlay on entering the viewport. Off while the IX2 event is still published (its `data-w-id` is on the page) |

The other 14 IX2 events stay in Webflow: nav dropdown and mobile menu
(G \| Navigation), Deliver Card hover, stats "show more", Our Impact
approach section, About team pop-ups, and the video pop-ups' open/close
(`popup-video.ts` only handles playback). Full list:
`docs/rollback/2026-11-02/README.md`.

The IX3 data was decoded from the published `webflow.achunk.*.js` (no
connector needed): triggers, start/end, clamp, scrub, toggle actions,
per-tween duration/position/stagger/ease (ease table from the IX3 runtime;
custom curve → `cubic-bezier(.65,.045,0,1)` / `(.64,.05,0,1)`), SplitText
type and mask, and breakpoint conditions.

## Better than IX3, on purpose

- First-screen content (hero, h1, CTA) animates from CSS at first paint, not
  after IX3's JS and its `visibility:hidden` gate.
- Timelines and text splitting are built one screen before they are needed
  (IntersectionObserver), not all at load.
- Opacity-only text reveals keep split pieces inline: the text never
  reflows (IX3's inline-block words changed line breaks while split).
- Split reveals restore the original text when finished (as IX3 does) but
  without IX3's leftover `aria-label` on `<div>`/`<p>` (invalid ARIA); the
  footer CTA buttons keep their names.
- `prefers-reduced-motion: reduce` → no motion at all.
- One GSAP (bundled 3.15.0) instead of Webflow's GSAP + IX3 runtime chunks.

## Transition guard

`motion.ts` does nothing while Webflow still loads its own GSAP (IX3 on);
the CSS keyframes only apply on `html:not(.w-mod-ix3)`. So releasing the
bundle early cannot double-animate — but it would add ~60 KB gzipped to every
page until cutover, so **release v1.4.0 together with the cutover**.

The bundled GSAP plugins are imported only through `src/lib/gsap.ts`, which
hides `window.gsap` while they evaluate: otherwise their import-time
`registerPlugin` lands on Webflow's GSAP and replaces `window.ScrollTrigger`
under IX3 (wf-template lesson 2026-10-20; test "bundled GSAP plugins never
register on Webflow's window.gsap").

## Verification so far (harness, not the real cutover)

`scripts/motion-compare.mjs`: production (IX3) vs staging with IX3 blocked and
the local build injected (`?wfc-motion=1`), screenshots at matched scroll
positions every 0.8 viewport after motion settles, SSIM per pair.

| Page | 1440 mean (min) | 390 mean (min) |
| --- | --- | --- |
| News | 0.996 (0.991) | 0.995 (0.969) |
| Our Operations | 0.989 (0.935) | 0.986 (0.956) |
| Our Expertise | 0.990 (0.978) | 0.966 (0.931) |
| About | 0.982 (0.967) | 0.574 — see below |
| Home | 0.987 (0.956) | 0.670 — see below |
| Our Impact | 0.925 (0.634) | 0.885 (0.511) |

Rerun 2026-11-02 after the `position` fix below: only Home 1440 moved
(0.980 (0.946) → 0.987 (0.956)); every other cell is unchanged.

Lessons from getting here (all fixed in motion.ts): IX3 `clamp: true` on
most triggers; a missing IX3 ease means GSAP's default `power1.out`, not
linear; IX3 keeps split text split (spans, `gsap_split_*` classes) — words as
inline blocks decide line breaks and so page heights. From wf-template 0.8.0
(2026-11-02): IX3 places an action with no `position` at 0, not after the
previous one (i-092acefe, i-1033166a, i-d34c4117 had actions appended); it
skips actions with no properties, uses 0.5 s when no duration is given and
adds `force3D: true`.

**Open, to verify at the real cutover on staging (with the connector):**
- Home and About on mobile: content below "What we do" / the first
  "Wulf value" sits ~20–25 px differently. The score did not change across
  five different versions of the code while desktop did, so the harness is
  the main suspect (it strips IX3's gate style and scripts, but not the
  inline start styles Webflow writes into the HTML for IX3).
- Our Impact, top: the "Our approach" parallax image is further along under
  IX3 at the same scroll position.
Check both by eye on staging after step 2 below, with production open side
by side, before "publish".

## Cutover steps (needs the connector)

Progress: v1.4.0 tagged 2026-11-02 (c90288e). Step 2 IX3 part done
2026-11-02: all 21 deleted through `webflow-terawulf` (list now empty),
saved in Webflow, **not published**. Step 2 IX2 part done in the Designer
the same day ("Image Overlay | Hide" deleted; site saved 17:05 UTC); the
`data-w-id` removal is confirmed only after the staging publish. Step 3:
GSAP turned off in Webflow by the user, 2026-11-02 (check on staging that
gsap/ScrollTrigger/SplitText/CustomEase no longer load and IX2 still runs).
Step 4 done through the MCP: head `RELEASE = "1.4.0"`, Embed 2a `@1.4.0`;
read back, only those two lines differ from `docs/rollback/2026-11-02/`.
Staging published 17:09 UTC (custom domains untouched). Checked on
staging: Webflow GSAP/plugins and the IX3 gate gone, no `data-w-id`, IX2
"Image Overlay | Hide" gone from the published chunk and the other 14
work (nav dropdown, mobile menu, team and video pop-ups, Deliver Card
hover; stats "show more" behaves as on production), overlay wipe runs,
reduced motion and keyboard fine, mobile lab TBT 115–143 ms → 0 and LCP
Home/Our Operations ~1.3–1.5 s → ~0.5 s.

**Found on staging:** v1.4.0 left split text inline (GOTCHAS 2026-11-02),
which was the mobile Home/About shift below. Fixed for **v1.4.1**:
harness SSIM vs production, 1440 / 390 mean (min) — Home 1.000 (1.000) /
1.000 (0.998), About 0.998 (0.993) / 0.998 (0.988), Our Operations 0.994
(0.948) / 0.995 (0.959), Our Impact 0.988 (0.873) / 0.995 (0.945). Our
Impact's lowest frame is the open parallax item. v1.4.1 tagged (35b9533);
RELEASE and Embed 2a set to 1.4.1 through the MCP.

**Found on v1.4.1:** mobile About varied run to run (0.998 / 0.714): a
line reveal could split before the heading inside it and cut that h2 into
2–3 h2 elements (GOTCHAS 2026-11-02). Fixed for **v1.4.2** (inner splits
build first); harness 3 runs, all identical: Home 1.000 / 1.000 (0.991),
About 0.998 / 0.998 (0.988). v1.4.2 tagged (8a2e937); RELEASE and
Embed 2a set to 1.4.2 (read back: only those two lines differ from the
rollback copy). Full harness on v1.4.2, 1440 / 390 mean (min): Home 1.000
(1.000) / 1.000 (0.998), About 0.998 (0.994) / 0.998 (0.988), News 1.000 /
0.999, Our Expertise 0.998 (0.978) / 0.994 (0.932), Our Operations 0.994
(0.948) / 0.995 (0.959), Our Impact 0.988 (0.873) / 0.995 (0.945). Our
Impact's lowest frame is the same picture with the parallax photo a few
px apart mid-scrub; not a visible difference. Ready for production.

1. Merge, tag **v1.4.0** (also carries the Finsweet bundle — see
   `finsweet-v2-migration.md`; do both in the same publish or ship Finsweet
   first).
2. Webflow → Interactions: delete all 21 IX3 interactions (list in
   `ix-inventory.md`). Then, in the Designer (the MCP cannot edit IX2),
   delete only the IX2 event "Image Overlay \| Hide" (scroll into view on
   About `.image-overlay`); its `data-w-id` then disappears from the page.
   Keep the other 14 IX2 events.
3. Site settings: turn off GSAP / interactions so gsap, ScrollTrigger,
   SplitText, CustomEase and the IX3 chunks stop loading. Check that IX2
   still runs: nav dropdown and mobile menu, team and video pop-ups open
   and close, Deliver Card hover, stats "show more".
4. Embed 2a `@1.4.0`, head `RELEASE = "1.4.0"`.
5. Staging: compare against production (harness), Lighthouse mobile on
   Home/Our Operations/About, keyboard + reduced motion; then "publish".

Rollback: RELEASE/Embed 2a back to 1.3.1 and restore the interactions from
the Webflow backup "Before Motion Migration (Nov 02)"
(`docs/rollback/2026-11-02/`).
