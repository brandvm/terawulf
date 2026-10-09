// Reload when the layout crosses a Webflow breakpoint — replaces the inline
// /our-operations script, which reloaded on ANY width change.
//
// Tested on the live page (2026-10-09): resizing within one breakpoint
// (1440 → 1100) renders identically to a fresh load, so no reload is needed.
// Crossing a breakpoint (1440 → 390) leaves the scroll scene in its desktop
// layout and the text blocks stack on top of each other; ScrollTrigger.refresh()
// does not fix that, a reload does. So: reload only on a breakpoint change.
//
// No resize listener: three matchMedia queries fire only when a breakpoint is
// actually crossed. The mobile address bar changes height, never these.
//
// Goes away with the animation migration (AGENTS.md › Project notes). Runs on
// the paths below, or on any page whose <body> carries data-reload-on-resize.

const PATHS = ['/our-operations'];
// Webflow's breakpoints on this site (webflow.css): 991, 767, 479.
const QUERIES = ['(max-width: 991px)', '(max-width: 767px)', '(max-width: 479px)'];

const band = () => QUERIES.filter((q) => window.matchMedia(q).matches).length;

export function initResizeReload(): void {
  const path = location.pathname.replace(/\/$/, '');
  if (!PATHS.includes(path) && !document.body.hasAttribute('data-reload-on-resize')) return;

  const atLoad = band();
  let timer: number | undefined;
  const check = () => {
    clearTimeout(timer);
    // 250 ms after the last change, as before; a drag back into the original
    // band cancels the reload.
    timer = window.setTimeout(() => {
      if (band() !== atLoad) location.reload();
    }, 250);
  };
  for (const q of QUERIES) {
    const mql = window.matchMedia(q);
    if (mql.addEventListener) mql.addEventListener('change', check);
    else mql.addListener(check); // Safari < 14
  }
}
