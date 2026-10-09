// Session modal — timed auto-open, once per browser session.
//
// Markup (custom attributes in the Webflow Settings panel):
//   [data-modal="site"]   wrapper - position fixed, inset 0, display: none
//   [data-modal-card]     the inner card; anything outside it is the backdrop
//   [data-modal-close]    close button(s) - any number, anywhere inside
//   [data-modal-focus]    optional - element that receives focus on open
//   [data-modal-open]     optional - any element on the page opens it on click,
//                         and keeps working after the visitor has dismissed it
//
// Per-instance overrides via data attributes on the wrapper:
//   data-modal-delay="4000"        ms before the auto-open (default 2500)
//   data-modal-key="tw_modal_v2"   bump to re-show it to everyone
//   data-modal-storage="cookie"    "session" (default) | "cookie" | "none"
//
// Storage modes:
//   session  sessionStorage - scoped per TAB, cleared when the tab closes
//   cookie   session cookie - shared across tabs, cleared when the browser quits
//   none     no gate; opens on every page load (useful while designing)
//
// Console helpers (published site only): twModal.open() / .close() / .reset()
//
// Requires the matching CSS in src/styles.css (.is-open / html.modal-open).

type Storage = 'session' | 'cookie' | 'none';

interface Config {
  selector: string;
  cardSelector: string;
  closeSelector: string;
  openSelector: string;
  focusSelector: string;
  openClass: string;
  lockClass: string; // applied to <html>
  storageKey: string;
  storage: Storage;
  delay: number; // ms after DOM ready
  animDuration: number; // must match the longest CSS transition
  exposeGlobal: boolean;
}

interface TwModal {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
  reset: () => void;
}

declare global {
  interface Window {
    twModal?: TwModal;
  }
}

const DEFAULTS: Readonly<Config> = Object.freeze({
  selector: '[data-modal="site"]',
  cardSelector: '[data-modal-card]',
  closeSelector: '[data-modal-close]',
  openSelector: '[data-modal-open]',
  focusSelector: '[data-modal-focus]',
  openClass: 'is-open',
  lockClass: 'modal-open',
  storageKey: 'tw_modal_v1',
  storage: 'session',
  delay: 2500,
  animDuration: 350,
  exposeGlobal: true,
});

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// sessionStorage access throws outright in Safari private mode and
// wherever storage is blocked, so every read/write is guarded.
const store = {
  read(cfg: Config): boolean {
    if (cfg.storage === 'none') return false;
    if (cfg.storage === 'cookie') return document.cookie.indexOf(cfg.storageKey + '=1') > -1;
    try {
      return sessionStorage.getItem(cfg.storageKey) === '1';
    } catch {
      return false;
    }
  },
  write(cfg: Config): void {
    if (cfg.storage === 'none') return;
    if (cfg.storage === 'cookie') {
      document.cookie = cfg.storageKey + '=1; path=/; SameSite=Lax';
      return;
    }
    try {
      sessionStorage.setItem(cfg.storageKey, '1');
    } catch {
      /* storage blocked */
    }
  },
  clear(cfg: Config): void {
    if (cfg.storage === 'cookie') {
      document.cookie = cfg.storageKey + '=; path=/; Max-Age=0; SameSite=Lax';
      return;
    }
    try {
      sessionStorage.removeItem(cfg.storageKey);
    } catch {
      /* storage blocked */
    }
  },
};

function readDataOverrides(el: HTMLElement, base: Config): Config {
  const cfg = { ...base };
  const d = el.dataset;
  if (d.modalDelay) {
    const n = parseInt(d.modalDelay, 10);
    if (!isNaN(n) && n >= 0) cfg.delay = n;
  }
  if (d.modalKey) cfg.storageKey = d.modalKey;
  if (d.modalStorage) cfg.storage = d.modalStorage as Storage;
  return cfg;
}

export function initSessionModal(options: Partial<Config> = {}): void {
  const base: Config = { ...DEFAULTS, ...options };

  const modal = document.querySelector<HTMLElement>(base.selector);
  if (!modal) return; // no modal on this page - nothing to wire up

  const cfg = readDataOverrides(modal, base);
  const card = modal.querySelector<HTMLElement>(cfg.cardSelector);

  let lastFocus: Element | null = null;
  let downOnBackdrop = false;
  let hideTimer: number | undefined;
  let openTimer: number | undefined;

  const isOpen = () => modal.classList.contains(cfg.openClass);

  const open = () => {
    if (isOpen()) return;

    // Mark first, so a reload mid-animation still counts as seen.
    store.write(cfg);

    clearTimeout(hideTimer);
    lastFocus = document.activeElement;

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    void modal.offsetWidth; // force reflow so the CSS transition runs
    modal.classList.add(cfg.openClass);
    document.documentElement.classList.add(cfg.lockClass);

    const target =
      modal.querySelector<HTMLElement>(cfg.focusSelector) ||
      modal.querySelector<HTMLElement>(cfg.closeSelector);
    if (target) target.focus();
  };

  const close = () => {
    if (!isOpen()) return;

    modal.classList.remove(cfg.openClass);
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove(cfg.lockClass);

    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      if (!isOpen()) modal.style.display = 'none';
    }, cfg.animDuration);

    if (lastFocus instanceof HTMLElement) lastFocus.focus();
    lastFocus = null;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!isOpen()) return;

    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key !== 'Tab') return;

    // Keep Tab inside the dialog.
    const f = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!f.length) return;

    const first = f[0];
    const last = f[f.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // --- close handlers: always wired, so manual opens can close too ---
  modal.querySelectorAll(cfg.closeSelector).forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      close();
    });
  });

  // Backdrop click. mousedown is tracked as well, so dragging a text
  // selection from inside the card out onto the backdrop doesn't close it.
  modal.addEventListener('mousedown', (e) => {
    downOnBackdrop = !!card && !card.contains(e.target as Node);
  });
  modal.addEventListener('click', (e) => {
    if (downOnBackdrop && card && !card.contains(e.target as Node)) close();
    downOnBackdrop = false;
  });

  document.addEventListener('keydown', onKeyDown);

  // --- manual triggers anywhere on the page ---
  document.querySelectorAll(cfg.openSelector).forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  });

  // --- the timed auto-open: the only part gated by the session flag ---
  if (!store.read(cfg)) openTimer = window.setTimeout(open, cfg.delay);

  if (cfg.exposeGlobal && !window.twModal) {
    Object.defineProperty(window, 'twModal', {
      value: Object.freeze({
        open,
        close,
        isOpen,
        // twModal.reset() then reload to see it again while testing
        reset: () => {
          clearTimeout(openTimer);
          store.clear(cfg);
          console.log(`twModal: cleared "${cfg.storageKey}" - reload to see it again`);
        },
      }),
      writable: false,
      configurable: false,
    });
  }
}
