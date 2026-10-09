# Batch 5: videos

Staged on terawulff.webflow.io, then **published to production 2026-10-09**
(after "publish"; only Home, About and Careers had changed since batch 4).
Verified live: all autoplay videos play with posters; video bytes as in the
table below. Original attributes: `rollback-video-attributes.md`.

## What changed in Webflow (DOM attributes only, no layout or class change)

| Page | Video | Change |
| --- | --- | --- |
| Home | Hero loop | `poster` (first frame, 8 KB). First `<source>`: WebM (7.2 MB) → **centre-cropped 540×720 MP4, 3.2 MB**, `media="(max-width: 767px) and (orientation: portrait)"`. Desktop gets the existing 6.4 MB MP4. WebM dropped (it was the larger file). |
| About | "Evolution of Energy" preview | `poster`. Phones: 960 px MP4 (8.0 MB, `media="(max-width: 767px)"`). Desktop: the existing MP4 (11.9 MB). WebM (13.4 MB) dropped. |
| Careers | Topping-out preview | **Decision 2026-10-09: 30-second clip.** Source: the full 4.5-min 1080p YouTube file with audio (28 MB, downloaded twice = 56.5 MB) → 0.5–29.5 s of the same footage, 720p, no audio, **3.9 MB**. `poster`. Cut starts after the black lead-in and ends on a scene cut, so the loop has no black flash. |

Popup videos (`data-popup-video`, full versions with sound) are untouched.

## Why these choices

- **Hero mobile crop is pixel-identical framing.** The hero is
  `object-fit: cover; object-position: 50% 50%`, so a portrait phone only
  ever shows the centre strip. A 3:4 centre crop covers every portrait
  aspect up to 0.75 (iPad mini portrait), so `cover` still fills the box and
  crops nothing extra. SSIM vs the same crop of the original: 0.989.
- **Desktop files kept.** Re-encoding the desktop hero and About files at
  matching quality (SSIM 0.99) saved nothing; the originals are already
  efficient.
- **About and Careers videos are in the first screen** (top ≈ 300–420 px
  at 390 and 1440), so lazy-loading them would delay visible content; the
  fix is smaller files, not deferral.
- `<source media>` is supported in Chrome/Edge 120+, Firefox 120+ and
  Safari. Older browsers ignore `media` and take the first source (the
  mobile file), which still plays.

## Verification on staging (Chromium, real network)

| Page | Production | Staging |
| --- | --- | --- |
| Home 390 | 7.2 MB WebM | 3.2 MB mobile MP4 |
| Home 1440 | 7.2 MB WebM | 6.4 MB MP4 |
| About 390 | 11.9 MB | 8.0 MB |
| About 1440 | 11.9 MB | 11.9 MB |
| Careers 390 / 1440 | 56.5 MB | 3.9 MB |

- All autoplay videos play with a poster; Careers played continuously in
  6/6 traced runs (no `pause()` calls). One earlier "paused" reading came
  from a measuring script, not the site.
- Byte-range requests (206) work on the uploaded files (Safari needs them).
- `wf:baseline compare`: About and Careers 0.0–0.2 %; Home differences are
  the News & Media cards from batch 3 (same as batch 4).
