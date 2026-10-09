// Autoplay videos (autoplay-video.ts) — load late, play only while visible, respect reduced motion.
//
// Applies to every muted autoplay video: Webflow Background Videos
// (`.w-background-video > video`), the home hero and the About/Careers intro
// previews. Popup videos ([data-popup-video]) are left to popup-video.ts.
//
// 1. Load late: a video that is not within ~1 screen of the viewport at boot
//    has its sources detached (aborting the download; the poster stays) and
//    re-attached as it approaches.
// 2. Play only while visible: off-screen videos pause and resume when they
//    come back. Nothing changes on screen; it stops decoding video nobody
//    sees, which frees the main thread and the battery while scrolling.
// 3. prefers-reduced-motion: no autoplay; the poster or first frame stays
//    (WCAG 2.2.2). Visitors without that setting see no difference.

const NEAR = '100% 0px'; // start loading about one screen ahead

type Video = HTMLVideoElement & { _wfcPausing?: boolean; _wfcUserPaused?: boolean };

function isNear(el: Element): boolean {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return r.bottom > -vh && r.top < vh * 2;
}

function pause(video: Video) {
  if (video.paused) return;
  video._wfcPausing = true;
  video.pause();
}

function play(video: Video) {
  if (video._wfcUserPaused) return; // someone pressed pause: leave it paused
  const p = video.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}

function detach(video: Video): () => void {
  if (!video.paused) video._wfcPausing = true; // load() below pauses it
  const sources = Array.from(video.querySelectorAll('source'));
  const srcs = sources.map((s) => s.getAttribute('src') || '');
  sources.forEach((s) => s.removeAttribute('src'));
  video.load(); // aborts the request already in flight
  return () => {
    sources.forEach((s, i) => {
      if (srcs[i]) s.setAttribute('src', srcs[i]);
    });
    video.load();
    play(video);
  };
}

export function initAutoplayVideo(): void {
  const videos = Array.from(document.querySelectorAll<Video>('video[autoplay]')).filter(
    (v) => !v.hasAttribute('data-popup-video') && v.muted,
  );
  if (!videos.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const v of videos) {
    v.autoplay = false; // from here on, this module decides when it plays
    // A pause we didn't cause (Webflow's play/pause control, the native
    // controls) is the visitor's choice: never auto-resume after it.
    v.addEventListener('pause', () => {
      if (v._wfcPausing) v._wfcPausing = false;
      else v._wfcUserPaused = true;
    });
    v.addEventListener('play', () => {
      v._wfcUserPaused = false;
    });
    // Visible videos keep playing untouched (no stutter); the observer below
    // pauses the ones that are off screen.
    if (reduced) pause(v);
  }
  if (reduced) return; // poster / first frame only

  if (!('IntersectionObserver' in window)) {
    videos.forEach(play);
    return;
  }

  // 1. Detach the far ones; re-attach when they come within a screen.
  const pending = new Map<Element, () => void>();
  const loader = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        loader.unobserve(e.target);
        pending.get(e.target)?.();
        pending.delete(e.target);
      }
    },
    { rootMargin: NEAR },
  );
  for (const v of videos) {
    if (v.querySelector('source[src]') && !isNear(v)) {
      pending.set(v, detach(v));
      loader.observe(v);
    }
  }

  // 2. Play while on screen, pause when off it.
  const player = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target as Video;
      if (e.isIntersecting) play(v);
      else pause(v);
    }
  });
  videos.forEach((v) => player.observe(v));
}
