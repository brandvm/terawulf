# B7: moving the remaining Webflow IX2 interactions into the repo

Status 2026-11-02: built and tested in the repo (branch
`feat/ix2-to-repo`); **not released**. Follows B6 (`b6-animations.md`),
which moved all IX3 and the About overlay wipe (IX2 e-19). After B7 the
site has no Webflow interactions of any version.

## What replaces what

Decoded from the published Webflow IX2 data (`webflow.achunk.*.js` with
`eventTypeId`; the MCP cannot read IX2). Every action uses 0.74 s and
`cubic-bezier(.64,.05,0,1)` unless noted.

| IX2 event(s) | What it did | Replacement |
| --- | --- | --- |
| e-3 / e-4 G Nav \| Drop Open / Close, `.g-nav-drop` | list height 0 → auto, scale 0.5 → 1, blur 0.5em → 0, opacity 0 → 1; icon 0 → 135°; curve `(.064,.05,0,1)` | `nav-dropdown.ts` (Web Animations API on Webflow's `w--open`) + CSS icon turn |
| e-9 / e-10 G Nav \| Menu Open / Close, `.g-nav-menu-drawer`, < 992 px | menu height 0 → auto, scale 0.5 → 1, opacity 0 → 1; open/close icons swap | `nav-menu.ts` + CSS. Added `aria-expanded`/`aria-controls`, Escape, focus return |
| e-11 / e-13 Team Pop Up \| Open / Close (About) | `.team-card-pop-up` display flex, opacity 0 → 1; close reverses | `team-popup.ts` + CSS. Added dialog role/label, focus, Escape. Pairs each card with its pop-up although Finsweet smartlightbox moves them |
| e-15, e-21 / e-17 Home Video Pop Up \| Open / Close (Home, About, Careers) | `.home-video-pu` display block, opacity 0 → 1, scale 0.8 → 1 | `popup-video.ts` (already did playback and focus) + CSS |
| e-5 / e-6 Deliver Card \| Hover In / Out (Our Impact, ≥ 768 px) | centre image display flex, y 2em → 0, opacity 0 → 1 | CSS only, plus keyboard focus (`deliver-card.ts` only marks the cards) |
| e-7 / e-8 Approach Section \| In / Out View (Our Impact) | `.parallax-w` scale 1 → 1.2 (1.2 s) at 40% into view; back to 1 when out | `approach-scale.ts` (IntersectionObserver) + CSS `scale` transition |
| e / e-2 Site \| Show More / Less Info (`.section-stat.is_show-more`) | `.section-stats` 80 px ↔ auto; icon 0 ↔ 45°; "more"/"less" swap (0.5 s) | `stats-more.ts` + CSS (80 px at first paint via `:has()`), `aria-expanded` added |

Shared helpers: `src/lib/ix2.ts`.

## Transition guard

Each module reads Webflow's live IX2 event list
(`Webflow.require('ix2').store`) at window load, when IX2 itself starts,
and stays off for any event Webflow still runs. So the release and the
Designer deletions can land in either order and nothing animates twice
(test "every replacement stays off while Webflow IX2 still runs it").

Webflow writes each IX2 start state as inline styles into the published
HTML; they disappear with the events. The Designer styles already hide
the menu (< 992 px), both pop-ups and the Deliver Card centre (≥ 768 px);
only the stats panel needed a repo rule (80 px) to stay collapsed at
first paint.

## Verification (staging with IX2 removed vs production)

`scripts/ix2-compare.mjs` blocks Webflow's IX2 data, strips the inline
start states and injects `dist/`, then drives each interaction on both.
End states match (screenshots 0.95–1.000; the lower ones differ in
scroll-motion timing or scroll position, not in the interaction).
Frame-by-frame: dropdown, menu and video pop-up within a frame of
production; stats within ~25 ms. `pnpm test`: 58 passed.

## Cutover (after the B6 production publish)

1. Merge, tag **v1.5.0**.
2. Designer → Interactions: delete the 14 IX2 events above (the
   "Image Overlay | Hide" one is already gone). Check that the Webflow
   inline start styles are gone from the published HTML on staging.
3. Embed 2a `@1.5.0`, head `RELEASE = "1.5.0"`.
4. Staging: `node scripts/ix2-compare.mjs`, nav/menu/pop-ups by hand,
   keyboard and reduced motion; then production after approval.

Rollback: RELEASE/Embed 2a back to the previous release, and restore the
IX2 events from the Webflow backup made before step 2.
