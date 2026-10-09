// Entry point. Keep this file a manifest: one run() call per module.
// Feature code lives in src/modules/<name>.ts and exports an init
// function that no-ops when its selector is absent from the page.
//
// 2026-09-02 audit: KeyboardIx3ShiftGToggle, GoToTop, SmartSwiper,
// ClickOnLoad and NavShrink were removed (no matching markup on the live
// site). Restore from git tag v1.0.0 if that markup returns.
import { initEnvironmentSwitcher } from './modules/environment-switcher';
import { initSessionModal } from './modules/session-modal';
import { initDottedCanvas } from './modules/dotted-canvas';
import { initPopupVideo } from './modules/popup-video';
import { initAutoplayVideo } from './modules/autoplay-video';
import { initResizeReload } from './modules/resize-reload';
import { initHashScroll } from './modules/hash-scroll';

// Each module runs in isolation: one that throws is logged and skipped,
// and every module after it still initializes.
function run(name: string, init: () => void) {
  try {
    init();
  } catch (error) {
    console.error(`[wfc] ${name} failed to initialize`, error);
  }
}

function boot() {
  // Release the pre-paint scroll lock set by loader.html first, before any
  // module measures the page. The head snippet also has a fallback timeout.
  document.documentElement.classList.remove('is-loading');

  run('environment-switcher', initEnvironmentSwitcher);
  run('session-modal', () => initSessionModal());
  run('dotted-canvas', initDottedCanvas);
  run('popup-video', initPopupVideo);
  run('autoplay-video', initAutoplayVideo);
  run('resize-reload', initResizeReload);
  run('hash-scroll', initHashScroll);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
