// Approach section zoom on Our Impact (approach-scale.ts) — replaces Webflow
// IX2 "Approach Section | In View / Out View" (e-7 / e-8).
//
// As IX2: once the section is 40% into the viewport its `.parallax-w` scales
// 1 -> 1.2 over 1.2 s; when it has fully left the viewport it scales back.
// It replays on every pass. The transition is CSS (styles.css §05); this
// module sets [data-wfc-in]. The image inside keeps the scroll parallax from
// motion.ts (that animates `.parallax-content`, this the wrapper's `scale`).
import { unlessWebflowIx2 } from '../lib/ix2';

export function initApproachScale(): void {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.section.s-approach'));
  if (!sections.length) return;

  unlessWebflowIx2(['.section.s-approach'], () => {
    // IX2 "scroll into view" with a 40% offset: the top has to be 40% of the
    // viewport above its bottom edge.
    const into = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.setAttribute('data-wfc-in', '')),
      { rootMargin: '0px 0px -40% 0px' },
    );
    const out = new IntersectionObserver((entries) =>
      entries.forEach((e) => !e.isIntersecting && e.target.removeAttribute('data-wfc-in')),
    );
    for (const s of sections) {
      s.setAttribute('data-wfc-scale', '');
      into.observe(s);
      out.observe(s);
    }
  });
}
