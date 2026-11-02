// Stats "show more / show less" (stats-more.ts) — replaces Webflow IX2 "Site
// | Show More Info / Show Less Info" (e / e-2) on `.section-stat.is_show-more`.
//
// As IX2: the `.section-stats` panel rests at 80 px (CSS, styles.css §05, so
// it is collapsed at first paint, as Webflow's inline start state was); a
// click grows it to its full height over 0.74 s, turns the icon 45° and
// swaps "more" for "less"; a second click reverses it. Added: aria-expanded
// on the button. Off while the IX2 events are still published.
import { DURATION, EASE, tween, unlessWebflowIx2 } from '../lib/ix2';

const COLLAPSED = '80px';

export function initStatsMore(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>('.section-stat.is_show-more'));
  if (!buttons.length) return;

  unlessWebflowIx2(['.section-stat.link-underline.is_show-more'], () => {
    for (const btn of buttons) {
      const panel = btn.closest<HTMLElement>('.section-stats');
      if (!panel) continue;
      let open = false;
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', (e) => {
        e.preventDefault(); // href="#"
        open = !open;
        btn.setAttribute('aria-expanded', String(open));
        panel.getAnimations().forEach((a) => a.cancel());
        const from = `${panel.getBoundingClientRect().height}px`;
        if (open) {
          panel.setAttribute('data-wfc-open', '');
          const to = `${panel.scrollHeight}px`;
          tween(panel, [{ height: from }, { height: to }], DURATION, EASE);
        } else {
          panel.removeAttribute('data-wfc-open');
          tween(panel, [{ height: from }, { height: COLLAPSED }], DURATION, EASE);
        }
      });
    }
  });
}
