// Mobile nav menu (nav-menu.ts) — replaces Webflow IX2 "G Nav | Menu Open /
// Menu Close" (e-9 / e-10): the `.g-nav-menu-drawer` button below 992 px.
//
// Same motion as IX2: the menu grows from height 0, scale 0.5, opacity 0 to
// its natural size in 0.74 s, and back on close; the open/close icons swap
// (CSS, styles.css §05, keyed on aria-expanded). Added: aria-expanded and
// aria-controls on the button, Escape closes and returns focus, and the menu
// resets when the window grows past the tablet breakpoint. Off while the
// IX2 events are still published.
import { DURATION, EASE, ensureId, tween, unlessWebflowIx2 } from '../lib/ix2';

const MOBILE = '(max-width: 991px)';
const CLOSED = { height: '0px', transform: 'scale(0.5)', opacity: 0 };

export function initNavMenu(): void {
  const drawer = document.querySelector<HTMLElement>('.g-nav-menu-drawer');
  const menu = document.querySelector<HTMLElement>('.g-nav-menu-w');
  if (!drawer || !menu) return;

  unlessWebflowIx2(['.g-nav-menu-drawer'], () => {
    const mq = window.matchMedia(MOBILE);
    let open = false;
    drawer.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-controls', ensureId(menu, 'wfc-nav-menu'));

    const set = (next: boolean, focusBack = false) => {
      if (next === open) return;
      open = next;
      drawer.setAttribute('aria-expanded', String(next));
      menu.getAnimations().forEach((a) => a.cancel());
      if (next) {
        menu.setAttribute('data-wfc-open', '');
        const height = `${menu.getBoundingClientRect().height}px`; // respects the Designer's max-height
        tween(menu, [CLOSED, { height, transform: 'scale(1)', opacity: 1 }], DURATION, EASE);
      } else {
        const height = `${menu.getBoundingClientRect().height}px`;
        tween(menu, [{ height, transform: 'scale(1)', opacity: 1 }, CLOSED], DURATION, EASE).then(() => {
          if (!open) menu.removeAttribute('data-wfc-open');
        });
        if (focusBack) drawer.focus({ preventScroll: true });
      }
    };

    drawer.addEventListener('click', (e) => {
      if (!mq.matches) return;
      e.preventDefault(); // href="#"
      set(!open);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) set(false, true);
    });
    mq.addEventListener('change', () => {
      if (mq.matches) return;
      open = false;
      menu.getAnimations().forEach((a) => a.cancel());
      menu.removeAttribute('data-wfc-open');
      drawer.setAttribute('aria-expanded', 'false');
    });
  });
}
