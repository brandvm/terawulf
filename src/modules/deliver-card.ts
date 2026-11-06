// Deliver Card hover on Our Impact (deliver-card.ts) — replaces Webflow IX2
// "Deliver Card | Hover In / Hover Out" (e-5 / e-6, 768 px and up).
//
// The motion is pure CSS (styles.css §05): the centre image rises 2em and
// fades in over 0.74 s on hover, and also on keyboard focus inside the card
// (added). This module only marks the cards once the IX2 events are gone,
// so CSS and IX2 never run together.
import { unlessWebflowIx2 } from '../lib/ix2';

export function initDeliverCard(): void {
  const cards = document.querySelectorAll('.deliver-card');
  if (!cards.length) return;
  unlessWebflowIx2(['.deliver-card'], () => cards.forEach((c) => c.setAttribute('data-wfc-hover', '')));
}
