// Shared helpers for the modules that replace Webflow's classic IX2
// interactions (nav dropdown and menu, pop-ups, Deliver Card, approach
// section, stats "show more"). The motion values are the ones Webflow
// published (docs/audit/ix-inventory.md).

// The curve almost every IX2 action used; the nav dropdown used a variant.
export const EASE = 'cubic-bezier(.64,.05,0,1)';
export const EASE_DROPDOWN = 'cubic-bezier(.064,.05,0,1)';
export const DURATION = 740;

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Ix2Event = { target?: { selector?: string } };

// Selectors Webflow's IX2 still triggers on. Webflow starts IX2 when the
// document is complete, so this is only meaningful from window load on.
function liveIx2Selectors(): string[] {
  try {
    const w = window as unknown as { Webflow?: { require?: (m: string) => unknown } };
    const ix2 = w.Webflow?.require?.('ix2') as { store?: { getState?: () => { ixData?: { events?: Record<string, Ix2Event> } } } } | undefined;
    const events = ix2?.store?.getState?.().ixData?.events;
    return events ? Object.values(events).map((e) => e.target?.selector || '') : [];
  } catch {
    return [];
  }
}

// Transition guard: runs `fn` only once Webflow's IX2 no longer triggers on
// any of `selectors`, so an interaction never animates twice while it is
// being moved out of Webflow (the Designer deletion and the release can
// land in either order). Like IX2 itself, it starts at window load.
export function unlessWebflowIx2(selectors: string[], fn: () => void): void {
  const go = () => {
    const live = liveIx2Selectors();
    if (selectors.some((s) => live.includes(s))) return;
    fn();
  };
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}

// One Web Animations API tween; instant under reduced motion. Resolves when
// done or when replaced by another tween on the same element.
export function tween(el: Element, frames: Keyframe[], duration = DURATION, easing = EASE): Promise<void> {
  const a = el.animate(frames, { duration: reducedMotion() ? 0 : duration, easing });
  return a.finished.then(
    () => undefined,
    () => undefined, // cancelled
  );
}

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Makes a non-native trigger reachable and operable from the keyboard.
export function asButton(el: HTMLElement, label?: string): void {
  if (!el.matches('a[href], button') && !el.querySelector(FOCUSABLE)) {
    el.setAttribute('role', 'button');
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      el.click();
    });
  }
  if (label && !el.getAttribute('aria-label') && !(el.textContent || '').trim()) el.setAttribute('aria-label', label);
}

let ids = 0;
export function ensureId(el: Element, prefix: string): string {
  if (!el.id) el.id = `${prefix}-${++ids}`;
  return el.id;
}
