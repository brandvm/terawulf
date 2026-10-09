// Land on the URL's #anchor once the page has settled.
//
// Images and interactions change the layout after the browser's own jump, so a
// link like /about#team used to land short; /about had an inline fix for it.
// This runs on every page (deep links from search results, AI answers and
// press coverage land on anchors anywhere), only when the URL has a hash.
//
// Unlike the old inline script: getElementById instead of
// querySelector(location.hash), which threw a console error on every visit
// without a hash and on ids that aren't valid selectors; and it does nothing
// if the visitor has already scrolled away.

export function initHashScroll(): void {
  if (!location.hash || location.hash === '#') return;
  let id = location.hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    /* keep it as written */
  }
  if (!document.getElementById(id)) return;

  let userScrolled = false;
  const mark = () => {
    userScrolled = true;
  };
  window.addEventListener('wheel', mark, { once: true, passive: true });
  window.addEventListener('touchmove', mark, { once: true, passive: true });
  window.addEventListener('keydown', mark, { once: true });

  const go = () => {
    const target = document.getElementById(id);
    if (target && !userScrolled) requestAnimationFrame(() => target.scrollIntoView());
  };
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}
