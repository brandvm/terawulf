// Popup video — plays the page's popup video, unmuted, from the start when its
// trigger is clicked, and pauses + rewinds it on close. Replaces the inline
// page scripts on Home, About and Careers (same selectors, same behaviour).
//
// Markup (already on the live pages):
//   [data-popup-video]        the <video> inside the popup
//   [data-popup-video-close]  the close button
//   trigger                   .is_home-video-player (Home) or
//                             .about-intro-visual-w (About, Careers), or any
//                             element with [data-popup-video-open]
//
// Opening and closing the popup itself is still a Webflow interaction; this
// module only handles playback.
//
// Accessibility (added; nothing changes visually):
//   - a trigger with no focusable element inside becomes a keyboard button
//     (role, tabindex, Enter/Space). About/Careers already contain a "Play"
//     link, which stays the keyboard route; the div is not made a second one.
//   - the close control becomes a labelled keyboard button.
//   - the popup is a labelled dialog; focus moves to Close once it is shown,
//     Escape closes it, and focus returns to the trigger.
//
// Loading: the popup files are large (the Home one is 31 MB) and hidden until
// clicked, but a <video> with no preload attribute still starts downloading
// on page load. The module detaches the source at boot (aborting that
// download) and puts it back on the first click, inside the click so the
// unmuted play() is still allowed. With preload="none" and data-src on the
// <source> in Webflow, nothing is requested before the click at all.

const TRIGGERS = '[data-popup-video-open], .is_home-video-player, .about-intro-visual-w';
const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

function asButton(el: HTMLElement, label?: string) {
  const native = el.matches('a[href], button');
  if (!native && !el.querySelector(FOCUSABLE)) {
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

const isShown = (el: HTMLElement) => el.getClientRects().length > 0; // false while display: none

// Webflow's interaction shows the popup a moment after the click: wait (max 1 s).
function whenShown(el: HTMLElement, fn: () => void) {
  const t0 = performance.now();
  const tick = () => {
    if (isShown(el) && getComputedStyle(el).visibility !== 'hidden') fn();
    else if (performance.now() - t0 < 1000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function detach(video: HTMLVideoElement): () => void {
  const sources = Array.from(video.querySelectorAll('source'));
  const srcs = sources.map((s) => s.getAttribute('src') || s.getAttribute('data-src') || '');
  const own = video.getAttribute('src') || video.getAttribute('data-src');
  const hadSrc = sources.some((s) => s.hasAttribute('src')) || video.hasAttribute('src');

  video.preload = 'none';
  if (hadSrc) {
    sources.forEach((s) => s.removeAttribute('src'));
    video.removeAttribute('src');
    video.load(); // aborts the request already in flight
  }

  let attached = false;
  return () => {
    if (attached) return;
    attached = true;
    sources.forEach((s, i) => {
      if (srcs[i]) s.setAttribute('src', srcs[i]);
    });
    if (own) video.setAttribute('src', own);
    video.load();
  };
}

export function initPopupVideo(): void {
  const trigger = document.querySelector<HTMLElement>(TRIGGERS);
  const video = document.querySelector<HTMLVideoElement>('video[data-popup-video]');
  const closeBtn = document.querySelector<HTMLElement>('[data-popup-video-close]');
  if (!trigger || !video) return;

  const attach = detach(video);
  const popup = video.closest<HTMLElement>('[data-popup-video-w]');

  asButton(trigger);
  if (closeBtn) asButton(closeBtn, 'Close video');
  if (popup) {
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    if (!popup.hasAttribute('aria-label'))
      popup.setAttribute('aria-label', (trigger.textContent || '').trim().replace(/\s+/g, ' ') || 'Video');
  }
  let returnFocus: HTMLElement | null = null;

  // Open: attach the source (first time), rewind, unmute, play.
  trigger.addEventListener('click', (e) => {
    e.preventDefault(); // stops href="#" from jumping the page
    returnFocus = (document.activeElement as HTMLElement) || trigger;
    attach();
    try {
      video.currentTime = 0;
    } catch {
      /* not seekable yet */
    }
    video.muted = false;
    video.volume = 1;
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch((err) => console.warn('[wfc] popup video play blocked:', err));
    if (popup && closeBtn) whenShown(popup, () => closeBtn.focus({ preventScroll: true }));
  });

  // Escape closes the open popup through its own close control, so Webflow's
  // close interaction runs exactly as on a click.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && closeBtn && popup && isShown(popup)) closeBtn.click();
  });

  // Close: pause + reset to start.
  closeBtn?.addEventListener('click', () => {
    video.pause();
    try {
      video.currentTime = 0;
    } catch {
      /* not seekable yet */
    }
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  });
}
