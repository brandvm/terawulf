// Nav dropdown motion (nav-dropdown.ts) — replaces Webflow IX2 "G Nav | Drop
// Open / Drop Close" (e-3 / e-4) on every `.g-nav-drop`.
//
// Webflow's dropdown component still opens and closes the list (w--open,
// keyboard and ARIA are its own); this only animates it, as IX2 did: the
// list grows from height 0, scale 0.5, blur 0.5em, opacity 0 to its natural
// size in 0.74 s, and back on close. The toggle icon turns 135° (CSS,
// styles.css §05). Off while the IX2 events are still published.
import { DURATION, EASE_DROPDOWN, tween, unlessWebflowIx2 } from '../lib/ix2';

const CLOSED = { height: '0px', transform: 'scale(0.5)', filter: 'blur(0.5em)', opacity: 0 };

export function initNavDropdown(): void {
  const drops = Array.from(document.querySelectorAll<HTMLElement>('.g-nav-drop'));
  if (!drops.length) return;

  unlessWebflowIx2(['.g-nav-drop'], () => {
    for (const drop of drops) {
      const list = drop.querySelector<HTMLElement>('.g-nav-drop-list');
      if (!list) continue;
      drop.setAttribute('data-wfc-dropdown', '');
      let open = list.classList.contains('w--open');

      new MutationObserver(() => {
        const now = list.classList.contains('w--open');
        if (now === open) return;
        open = now;
        list.getAnimations().forEach((a) => a.cancel());
        if (now) {
          list.removeAttribute('data-wfc-closing');
          const height = `${list.scrollHeight}px`;
          tween(list, [CLOSED, { height, transform: 'scale(1)', filter: 'blur(0em)', opacity: 1 }], DURATION, EASE_DROPDOWN);
        } else {
          // Webflow hides the list at once; keep it shown while it closes.
          const height = `${list.scrollHeight}px`;
          list.setAttribute('data-wfc-closing', '');
          tween(list, [{ height, transform: 'scale(1)', filter: 'blur(0em)', opacity: 1 }, CLOSED], DURATION, EASE_DROPDOWN).then(() => {
            if (!open) list.removeAttribute('data-wfc-closing');
          });
        }
      }).observe(list, { attributes: true, attributeFilter: ['class'] });
    }
  });
}
