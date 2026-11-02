# Webflow interaction inventory (2026-10-09)

The starting point for moving off Webflow interactions (AGENTS.md › Project notes:
all IX versions → CSS first, repo modules second, same motion and timing).
Read with `data_interactions_tool > list_interactions`. Each interaction is
migrated, compared on staging, then deleted in Webflow.

**IX3: 21 interactions.** Every scroll trigger has `showMarkers: true`.
That's a Designer preview setting; check that no markers render on
published pages.

| Id | Name | Trigger | Scope | Target |
| --- | --- | --- | --- | --- |
| i-22814008 | Page Load / Home | load | Home | hero (the LCP gate) |
| i-c2567f92 | G \| Page Header Load | load | site | page headers |
| i-c395b50a | Scroll \| Page Header | scroll | component 4822c4c0 (S \| Page Header) | page header main |
| i-db73fe76 | Scroll / Text Animate | scroll, no scrub | site | `[data-gsap="text-animate"]` (SplitText) |
| i-27137dc6 | Scroll / Para | scroll, scrub 0.8 | site | `[data-gsap="para-in"]` (SplitText) |
| i-5283cd32 | Scroll / Parallax | scroll, scrub 1 | site | class 016079e5 (parallax content) |
| i-c0784607 | Scroll / Section Stats | scroll | site | class f8b8b43d (section stats) |
| i-ca872f25 | Scroll /What We Do Stack | scroll, scrub 0.8 | site | What We Do stack |
| i-f72f480a | Smoke Scroll In | scroll, scrub 0.8 | site | `[data-smoke-bottom]` |
| i-0d1f3428 | Scroll Smoke | scroll, scrub 0.8 | site | class bc01a3d6 (smoke) |
| i-1033166a | Scroll Home Transition | scroll, scrub 2 | Home | home transition |
| i-90ace60a | Scroll / Wulf Value Header | scroll | About | class 0478abfe |
| i-9824863c | Scroll / Wulf Value Header Mobile | scroll | About | class 0478abfe |
| i-115d5f85 | Scroll / Wulf Section | scroll | About | wulf section |
| i-310abe23 | Scroll \| What Next | scroll, scrub 2 | Our Operations | what's next |
| i-0066fb3b | Whats \| Next Scroll | scroll, scrub 0.8 | Our Operations | class 721e58d9 |
| i-d34c4117 | Scroll What's Next \| Section | scroll | Our Operations | class 3a40be7c |
| i-092acefe | Scroll / Timeline Item | scroll | component 33b593a6 (C \| Timeline Item) | timeline overlay |
| i-ff7d39ee | Scroll Beowulf Who Track | scroll, scrub 0.8 | Our Expertise | class ab083580 |
| i-9e440da0 | Scroll / Beowulf Service | scroll, scrub 0.8 | Our Expertise | beowulf service |
| i-2e7d5b07 | Scroll \| Impact Feature | scroll, scrub 0.8 | Our Impact | class 3fd5c3a8 |

**IX2:** 15 events (corrected 2026-11-02 from the published Webflow chunk;
the MCP cannot list IX2). Full table: `docs/rollback/2026-11-02/README.md`.
- e-19 "Image Overlay \| Hide" on About `.image-overlay` (all 6): the one
  that writes `data-w-id` on the first `.image-overlay.is_left`. Replaced
  by `image-overlay-wipe.ts`; delete at the B6 cutover.
- Stays in Webflow: nav dropdown and mobile menu drawer (G \| Navigation),
  Deliver Card hover, stats "show more", Our Impact approach section in/out
  view, About team pop-up open/close, Home/About video pop-up open/close
  (the wrappers' inline `display:none; opacity:0; scale 0.8` is their
  initial state).

Status 2026-11-02: the 21 IX3 interactions above are unchanged (ids,
triggers, timelines match `ix3-spec.json`; What We Do Stack now states the
0.5 s default duration explicitly).

**Removed 2026-10-09:**
- the G \| Grid Guide component (0 instances, then unregistered);
- its classes G \| Grid Guide, Grid Guide \| Col W, Grid Guide \| Col and
  Grid Guide \| Col Num.

It had no IX3 interaction; its Shift+G toggle was the repo module
KeyboardIx3ShiftGToggle, removed 2026-09-02. The class `Grid Guide W` is still
used somewhere, so Webflow refused to delete it; investigate.
