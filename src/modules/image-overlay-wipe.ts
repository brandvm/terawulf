// Image overlay wipe (image-overlay-wipe.ts) — replaces the Webflow IX2
// interaction "Image Overlay | Hide" (e-19 / a-15) on About.
//
// Same motion as IX2: each `.image-overlay` starts covering its image (width
// 100%) and, once it scrolls into view, shrinks to width 0 over 2 s with
// cubic-bezier(.64,.05,0,1). Each overlay runs on its own, once. The motion
// is a CSS transition (styles.css §05, js-state); this module only arms the
// overlays and flips them when they enter the viewport.
//
// Without JS, or with prefers-reduced-motion, nothing is armed: the overlay
// keeps its Designer style (no width), so the image is simply visible.
//
// Transition guard: while the IX2 event is still published, Webflow writes
// its data-w-id on one of the overlays and IX2 animates them all. This
// module does nothing until that event is deleted in the Designer, so the
// wipe never runs twice.

const SELECTOR = '.image-overlay';

export function initImageOverlayWipe(): void {
  const overlays = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
  if (!overlays.length) return;
  if (overlays.some((el) => el.hasAttribute('data-w-id'))) return; // IX2 still on
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Armed overlays cover their image straight away (width auto -> 100% does
  // not transition), as IX2's initial state did.
  overlays.forEach((el) => el.setAttribute('data-wipe', 'armed'));

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const el = e.target as HTMLElement;
      void el.offsetWidth; // commit the armed width so the wipe transitions
      el.setAttribute('data-wipe', 'done');
    }
  });
  overlays.forEach((el) => io.observe(el));
}
