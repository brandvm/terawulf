// Video pause/play button (video-toggle.ts) — WCAG 2.2.2 for looping videos.
//
// Markup (Webflow): a <button type="button" data-video-toggle> with an
// <i class="ph-bold ph-pause" aria-hidden="true"> inside, placed in the same
// section as the video. The button controls the first non-popup <video> in
// its closest ancestor that has one.
//
// - The label says what a press will do ("Pause background video" /
//   "Play background video"); the icon swaps to match. No aria-pressed:
//   a changing label and a pressed state together read as a contradiction.
// - State follows the video's own play/pause events, so it stays right when
//   autoplay-video.ts pauses an off-screen video or honours reduced motion.
// - A press-to-pause is a visitor pause: autoplay-video.ts never resumes it
//   (it marks any pause it did not cause as the visitor's choice).

const LABEL_PAUSE = 'Pause background video';
const LABEL_PLAY = 'Play background video';

function findVideo(button: HTMLElement): HTMLVideoElement | null {
  for (let el = button.parentElement; el; el = el.parentElement) {
    const video = el.querySelector<HTMLVideoElement>('video:not([data-popup-video])');
    if (video) return video;
  }
  return null;
}

export function initVideoToggle(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-video-toggle]');
  buttons.forEach((button) => {
    const video = findVideo(button);
    if (!video) return;
    const icon = button.querySelector('i');

    const render = () => {
      const paused = video.paused;
      button.setAttribute('aria-label', paused ? LABEL_PLAY : LABEL_PAUSE);
      if (icon) {
        icon.classList.toggle('ph-pause', !paused);
        icon.classList.toggle('ph-play', paused);
      }
    };

    button.addEventListener('click', () => {
      if (video.paused) {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', render);
    video.addEventListener('pause', render);
    render();
  });
}
