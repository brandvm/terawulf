// Team pop-ups on About (team-popup.ts) — replaces Webflow IX2 "Team Pop Up
// | Open / Close" (e-11 / e-13).
//
// Same motion as IX2: clicking a `.team-card` shows its `.team-card-pop-up`
// (display flex) and fades it in over 0.74 s; `.tpu-pu-close` fades it out
// and hides it. Added: the card is a keyboard button, the pop-up is a
// labelled modal dialog, focus moves to Close and back, Escape closes.
//
// Finsweet smartlightbox (About head code) moves the pop-ups out of their
// cards but does not open them, so each card is paired with its pop-up at
// boot: its sibling if still in place, otherwise the pop-up at the same
// index. Off while the IX2 events are still published.
import { DURATION, EASE, asButton, tween, unlessWebflowIx2 } from '../lib/ix2';

export function initTeamPopup(): void {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.team-card'));
  if (!cards.length) return;

  unlessWebflowIx2(['.team-card', '.tpu-pu-close'], () => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('.team-card-pop-up'));
    const popupFor = (card: HTMLElement, i: number) =>
      card.parentElement?.querySelector<HTMLElement>(':scope > .team-card-pop-up') ||
      (all.length === cards.length ? all[i] : null);

    let current: HTMLElement | null = null;
    let returnFocus: HTMLElement | null = null;

    const close = () => {
      const popup = current;
      if (!popup) return;
      current = null;
      tween(popup, [{ opacity: 1 }, { opacity: 0 }], DURATION, EASE).then(() => {
        if (current !== popup) popup.removeAttribute('data-wfc-open');
      });
      if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
      returnFocus = null;
    };

    cards.forEach((card, i) => {
      const popup = popupFor(card, i);
      if (!popup) return;
      const name = (card.querySelector('.team-card-info')?.textContent || '').trim().replace(/\s+/g, ' ');
      asButton(card);
      popup.setAttribute('role', 'dialog');
      popup.setAttribute('aria-modal', 'true');
      if (name && !popup.hasAttribute('aria-label')) popup.setAttribute('aria-label', name);
      popup.querySelectorAll<HTMLElement>('.tpu-pu-close').forEach((btn) => {
        asButton(btn, 'Close');
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          close();
        });
      });
      card.addEventListener('click', (e) => {
        if ((e.target as Element).closest('.team-card-pop-up')) return; // clicks inside an un-moved pop-up
        e.preventDefault();
        if (current) close();
        current = popup;
        returnFocus = card;
        popup.getAnimations().forEach((a) => a.cancel());
        popup.setAttribute('data-wfc-open', '');
        tween(popup, [{ opacity: 0 }, { opacity: 1 }], DURATION, EASE);
        popup.querySelector<HTMLElement>('.tpu-pu-close')?.focus({ preventScroll: true });
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && current) close();
    });
  });
}
