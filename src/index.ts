/**
 * File: terawulf-main.js
 *
 * Sections:
 * 1) Console Start Message
 * 2) Utilities (minimal)
 * 3) Modules
 * 4) Init
 * 5) Console End Message
 */

(() => {
  "use strict";

  //=============================================================================
  // 1) CONSOLE START MESSAGE
  //-----------------------------------------------------------------------------
  const START_BADGE =
    "color:#fff;background:#111;padding:4px 8px;border-radius:6px;font-weight:700;";
  const START_BADGE_2 =
    "color:#111;background:#badeca;padding:4px 8px;border-radius:6px;font-weight:700;";
  try {
    // eslint-disable-next-line no-console
    console.log("%cSite Modules%c boot", START_BADGE, START_BADGE_2);
  } catch (_) {}

  //=============================================================================
  // 2) UTILITIES (minimal)
  //-----------------------------------------------------------------------------
  const Utils = (() => {
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) =>
      Array.from(root.querySelectorAll(sel));

    const isFn = (v) => typeof v === "function";

    const safeConsole = {
      log: (...args) => {
        try {
          // eslint-disable-next-line no-console
          console.log(...args);
        } catch (_) {}
      },
      warn: (...args) => {
        try {
          // eslint-disable-next-line no-console
          console.warn(...args);
        } catch (_) {}
      },
      error: (...args) => {
        try {
          // eslint-disable-next-line no-console
          console.error(...args);
        } catch (_) {}
      },
    };

    // Safe module runner: one module error won't stop the rest
    const run = (name, fn) => {
      try {
        fn();
        safeConsole.log(`✅ ${name}`);
      } catch (err) {
        safeConsole.error(`❌ ${name} failed`, err);
      }
    };

    // Optional: wait for DOM ready
    const onReady = (fn) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
      } else {
        fn();
      }
    };

    return Object.freeze({ qs, qsa, isFn, run, onReady, safeConsole });
  })();

  //=============================================================================
  // 3) MODULES
  //-----------------------------------------------------------------------------

  //-----------------------------------------------------------------------------
  // KEYBOARD -> WEBFLOW IX3 CUSTOM EVENTS (TOGGLE)
  // Shift + G toggles:
  // - if CLOSED: emit("Shift G") and mark OPEN
  // - if OPEN:   emit("Reverse Shift G") and mark CLOSED
  //-----------------------------------------------------------------------------
  const KeyboardIx3ShiftGToggle = (() => {
    const DEFAULTS = Object.freeze({
      key: "g",
      forwardEvent: "Shift G",
      reverseEvent: "Reverse Shift G",
      openClass: "is-shift-g-open", // state stored on <body>
      allowRepeat: false,
      ignoreWhenTyping: true,
    });

    const isTypingField = (el) => {
      if (!el) return false;
      const tag = (el.tagName || "").toLowerCase();
      return tag === "input" || tag === "textarea" || el.isContentEditable;
    };

    const emit = (eventName) => {
      try {
        const ix3 = window.Webflow?.require?.("ix3");
        if (ix3 && typeof ix3.emit === "function") ix3.emit(eventName);
      } catch (_) {}
    };

    const init = (options = {}) => {
      const cfg = Object.assign({}, DEFAULTS, options);

      const onKeyDown = (e) => {
        if (!cfg.allowRepeat && e.repeat) return;
        if (cfg.ignoreWhenTyping && isTypingField(document.activeElement))
          return;

        // Only Shift + G (no Ctrl/Cmd/Alt)
        if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;

        const k = String(e.key || "").toLowerCase();
        if (k !== cfg.key) return;

        e.preventDefault();

        const isOpen = document.body.classList.contains(cfg.openClass);

        if (!isOpen) {
          emit(cfg.forwardEvent);
          document.body.classList.add(cfg.openClass);
        } else {
          emit(cfg.reverseEvent);
          document.body.classList.remove(cfg.openClass);
        }
      };

      window.Webflow = window.Webflow || [];
      window.Webflow.push(() => {
        window.addEventListener("keydown", onKeyDown);
      });
    };

    return Object.freeze({ init });
  })();

  //-----------------------------------------------------------------------------
  // GO TO TOP (Lenis-first, native fallback)
  // Finds: [data-function="go-to-top"]
  //-----------------------------------------------------------------------------
  const GoToTop = (() => {
    const DEFAULTS = Object.freeze({
      selector: '[data-function="go-to-top"]',
      // Change this if your Lenis instance lives elsewhere
      getLenis: () => window.lenis || null,
      // Lenis scroll options (modern Lenis expects (target, options))
      lenisOptions: {
        duration: 1.1, // seconds
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        immediate: false,
        force: true,
        lock: false,
      },
    });

    const scrollToTop = (cfg) => {
      const lenis = cfg.getLenis?.();
      if (lenis && Utils.isFn(lenis.scrollTo)) {
        lenis.scrollTo(0, cfg.lenisOptions);
        return;
      }
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };

    const bind = (el, cfg) => {
      el.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          scrollToTop(cfg);
        },
        { passive: false }
      );
    };

    const init = (options = {}) => {
      const cfg = Object.assign({}, DEFAULTS, options);
      const els = Utils.qsa(cfg.selector);
      if (!els.length) return;
      els.forEach((el) => bind(el, cfg));
    };

    return Object.freeze({ init });
  })();

  // -----------------------------------------------------------------------------
  // SMART SWIPER
  // - Auto loads Swiper CSS/JS (v11)
  // - Lazy init via IntersectionObserver
  // - Repairs on tab clicks + resize
  // - Supports optional thumbs slider per config
  // - Properly scopes nav + thumbs within each wrapper
  // -----------------------------------------------------------------------------
  const SmartSwiper = (() => {
    const hasIO = "IntersectionObserver" in window;
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------------------------------------------------------------------------
    // CONFIGS
    // ---------------------------------------------------------------------------
    const CONFIGS = [
      {
        selector: ".default-slider-w .swiper",
        wrapper: "default-slider-w",
        opts: {
          slidesPerView: 3,
          spaceBetween: 20,
          loop: false,
          speed: 735,
          autoplay: false,
          watchOverflow: true,
          touchReleaseOnEdges: true,
          simulateTouch: true,
          breakpoints: {
            0: { spaceBetween: 14, slidesPerView: 1 },
            768: { spaceBetween: 16, slidesPerView: 2 },
            1024: { spaceBetween: 20, slidesPerView: 3 },
          },
        },
        navPrev: ".swiper-prev",
        navNext: ".swiper-next",
      },
    ];

    // ---------------------------------------------------------------------------
    // Utils
    // ---------------------------------------------------------------------------
    const idle = (fn) =>
      "requestIdleCallback" in window
        ? window.requestIdleCallback(fn)
        : setTimeout(fn, 0);

    const isDisplayed = (el) => {
      if (!el) return false;
      if (!el.getClientRects || !el.getClientRects().length) return false;
      return true;
    };

    function ensureCSS() {
      if (document.querySelector('link[href*="swiper-bundle.min.css"]')) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
      document.head.appendChild(link);
    }

    function ensureJS(cb) {
      if (window.Swiper) return cb();

      const existing = document.querySelector(
        'script[src*="swiper-bundle.min.js"]'
      );
      if (existing) {
        const wait = () => (window.Swiper ? cb() : setTimeout(wait, 40));
        return wait();
      }

      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
      s.defer = true;
      s.onload = cb;
      s.onerror = () => {};
      document.body.appendChild(s);
    }

    function normalizeOpts(base) {
      const o = Object.assign(
        {
          touchReleaseOnEdges: true,
          simulateTouch: true,
          observer: true,
          observeParents: true,
          observeSlideChildren: true,
        },
        base || {}
      );

      if (reduceMotion) {
        if (o.autoplay) o.autoplay = false;
        o.speed = Math.min(o.speed || 400, 300);
      }

      return o;
    }

    function getInstance(el) {
      return el ? el._smartSwiperInstance || el.swiper || null : null;
    }

    function getRoot(mainEl, cfg) {
      return (
        (cfg.wrapper && mainEl.closest(cfg.wrapper)) ||
        mainEl.parentElement ||
        document
      );
    }

    function resolveNav(el, cfg) {
      const scope = getRoot(el, cfg);

      const prev = cfg.navPrev
        ? scope.querySelector(cfg.navPrev)
        : scope.querySelector(".swiper-prev");

      const next = cfg.navNext
        ? scope.querySelector(cfg.navNext)
        : scope.querySelector(".swiper-next");

      return { scope, prev, next };
    }

    function withNav(el, cfg, opts) {
      const { prev, next } = resolveNav(el, cfg);
      if (prev || next) {
        opts.navigation = {
          prevEl: prev || null,
          nextEl: next || null,
        };
      }
      return opts;
    }

    function readDataOverrides(el, opts) {
      const over = Object.assign({}, opts);
      const { dataset } = el;

      if ("swiperLoop" in dataset) {
        over.loop = dataset.swiperLoop === "true";
      }

      if ("swiperSpeed" in dataset) {
        over.speed = Math.max(
          0,
          parseInt(dataset.swiperSpeed, 10) || over.speed || 400
        );
      }

      if ("swiperAutoplay" in dataset) {
        if (dataset.swiperAutoplay === "false") {
          over.autoplay = false;
        } else {
          const delay = Math.max(0, parseInt(dataset.swiperAutoplay, 10) || 0);
          over.autoplay = delay ? { delay, disableOnInteraction: true } : false;
        }
      }

      return over;
    }

    function bindEdgeNavHiding(el, swiper, prevEl, nextEl) {
      if (!swiper || el.dataset.edgeNavBound) return;
      el.dataset.edgeNavBound = "1";

      const setHidden = (btn, hidden) => {
        if (!btn) return;
        btn.style.opacity = hidden ? "0.2" : "";
      };

      const update = () => {
        const locked = !!swiper.isLocked;
        setHidden(prevEl, locked || !!swiper.isBeginning);
        setHidden(nextEl, locked || !!swiper.isEnd);
      };

      update();

      [
        "slideChange",
        "reachBeginning",
        "reachEnd",
        "fromEdge",
        "resize",
        "update",
        "lock",
        "unlock",
      ].forEach((evt) => {
        try {
          swiper.on(evt, update);
        } catch (_) {}
      });
    }

    function resolveScopedEl(mainEl, cfg, selector) {
      const scope = getRoot(mainEl, cfg);
      return scope.querySelector(selector);
    }

    function resolveThumbsEl(mainEl, cfg) {
      if (!cfg.thumbs || !cfg.thumbs.selector) return null;
      return resolveScopedEl(mainEl, cfg, cfg.thumbs.selector);
    }

    function ensureThumbsInit(mainEl, cfg) {
      const thumbsEl = resolveThumbsEl(mainEl, cfg);
      if (!thumbsEl) return null;

      let thumbsSwiper = getInstance(thumbsEl);
      if (thumbsSwiper) return thumbsSwiper;

      const thumbsOpts = normalizeOpts(
        readDataOverrides(thumbsEl, (cfg.thumbs && cfg.thumbs.opts) || {})
      );

      try {
        thumbsSwiper = new Swiper(thumbsEl, thumbsOpts);
        thumbsEl._smartSwiperInstance = thumbsSwiper;
        try {
          thumbsSwiper.update();
          thumbsSwiper.slideTo(0, 0);
        } catch (_) {}
        return thumbsSwiper;
      } catch (_) {
        return null;
      }
    }

    function syncThumbs(mainSwiper, thumbsSwiper) {
      if (!mainSwiper || !thumbsSwiper) return;

      try {
        if (!mainSwiper.thumbs) mainSwiper.thumbs = {};
        mainSwiper.thumbs.swiper = thumbsSwiper;

        if (typeof mainSwiper.thumbs.init === "function") {
          mainSwiper.thumbs.init();
        }
        if (typeof mainSwiper.thumbs.update === "function") {
          mainSwiper.thumbs.update();
        }

        mainSwiper.update();
        thumbsSwiper.update();
      } catch (_) {}
    }

    function repairIfNeeded(el) {
      const cfg = CONFIGS.find((c) => el.matches(c.selector));
      if (!cfg) return;

      const inst = getInstance(el);
      if (!inst) return;

      const { prev, next } = resolveNav(el, cfg);

      try {
        if (cfg.thumbs) {
          const thumbsEl = resolveThumbsEl(el, cfg);
          const thumbsInst =
            (thumbsEl && getInstance(thumbsEl)) || ensureThumbsInit(el, cfg);

          if (thumbsInst) {
            syncThumbs(inst, thumbsInst);
          }
        }
      } catch (_) {}

      if (isDisplayed(el)) {
        try {
          inst.update();
          if (inst.navigation && typeof inst.navigation.update === "function") {
            inst.navigation.update();
          }
        } catch (_) {}
      }

      bindEdgeNavHiding(el, inst, prev, next);
    }

    function initOne(el) {
      if (!el) return;

      const cfg = CONFIGS.find((c) => el.matches(c.selector));
      if (!cfg) return;

      const existing = getInstance(el);
      if (existing) {
        repairIfNeeded(el);
        return;
      }

      if (!isDisplayed(el)) return;

      const opts = withNav(
        el,
        cfg,
        normalizeOpts(readDataOverrides(el, cfg.opts))
      );

      const { prev, next } = resolveNav(el, cfg);

      let thumbsSwiper = null;
      if (cfg.thumbs) {
        thumbsSwiper = ensureThumbsInit(el, cfg);
        if (thumbsSwiper) {
          opts.thumbs = { swiper: thumbsSwiper };
        }
      }

      el.dataset.swiperInited = "1";

      try {
        const swiper = new Swiper(el, opts);
        el._smartSwiperInstance = swiper;

        bindEdgeNavHiding(el, swiper, prev, next);

        if (thumbsSwiper) {
          syncThumbs(swiper, thumbsSwiper);
        }

        try {
          swiper.update();
          if (thumbsSwiper) thumbsSwiper.update();
        } catch (_) {}
      } catch (err) {
        delete el.dataset.swiperInited;
        throw err;
      }
    }

    function scan() {
      const sels = CONFIGS.map((c) => c.selector).join(", ");
      if (!sels) return [];
      return Array.from(document.querySelectorAll(sels));
    }

    function observeAndInit(els) {
      if (!els.length) return;

      els.forEach(initOne);

      if (!hasIO) return;

      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              initOne(e.target);
              obs.unobserve(e.target);
            }
          });
        },
        { rootMargin: "200px 0px" }
      );

      els.forEach((el) => io.observe(el));
    }

    function boot() {
      const els = scan();
      if (!els.length) return;

      ensureCSS();
      ensureJS(() => observeAndInit(els));
    }

    let debounceT;
    function refresh() {
      clearTimeout(debounceT);
      debounceT = setTimeout(() => {
        boot();

        scan().forEach((el) => {
          try {
            repairIfNeeded(el);
          } catch (_) {}
        });
      }, 100);
    }

    function init() {
      const start = () => {
        boot();

        document.addEventListener(
          "click",
          (e) => {
            const link =
              e.target && e.target.closest
                ? e.target.closest(".w-tab-link")
                : null;

            if (!link) return;

            setTimeout(refresh, 60);
            setTimeout(refresh, 180);
            setTimeout(refresh, 320);
          },
          true
        );

        window.addEventListener("resize", refresh, { passive: true });

        Object.defineProperty(window, "athleticSlider", {
          value: Object.freeze({ refresh }),
          writable: false,
          configurable: false,
        });
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
      } else {
        start();
      }
    }

    return Object.freeze({ init, refresh });
  })();

  //-----------------------------------------------------------------------------
  // CLICK ON LOAD (module)
  //-----------------------------------------------------------------------------
  const ClickOnLoad = (() => {
    const DEFAULTS = Object.freeze({
      selector: "[data-click-on-load]",
      clickedAttr: "data-clicked-on-load",
      retryDelays: [0, 50, 200, 800, 2000],
      observeMutations: true,
      mutationDebounce: 120,
      alsoRunOnWindowLoad: true,
      skipAnchorsWithHref: false,
      domReadyDelay: 320,
    });

    const safeDispatchClick = (el) => {
      try {
        el.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
      } catch (_) {}
      try {
        if (typeof el.click === "function") el.click();
      } catch (_) {}
    };

    const shouldSkip = (el, cfg) => {
      if (!el || el.nodeType !== 1) return true;
      if (el.hasAttribute(cfg.clickedAttr)) return true;
      if (cfg.skipAnchorsWithHref && el.matches("a[href]")) return true;
      return false;
    };

    const clickOne = (el, cfg) => {
      if (shouldSkip(el, cfg)) return false;
      el.setAttribute(cfg.clickedAttr, "1");
      safeDispatchClick(el);
      return true;
    };

    const clickAll = (cfg, root = document) => {
      const nodes = root.querySelectorAll(
        `${cfg.selector}:not([${cfg.clickedAttr}])`
      );
      nodes.forEach((el) => clickOne(el, cfg));
      return nodes.length;
    };

    const scheduleRetries = (cfg) => {
      cfg.retryDelays.forEach((ms) => setTimeout(() => clickAll(cfg), ms));
    };

    const debounce = (fn, wait) => {
      let t;
      return () => {
        clearTimeout(t);
        t = setTimeout(fn, wait);
      };
    };

    const onWebflowReady = (fn) => {
      if (window.Webflow && Array.isArray(window.Webflow))
        window.Webflow.push(fn);
      else fn();
    };

    const init = (options = {}) => {
      const cfg = Object.assign({}, DEFAULTS, options);

      const start = () => {
        scheduleRetries(cfg);

        if (cfg.observeMutations && "MutationObserver" in window) {
          const recheck = debounce(
            () => scheduleRetries(cfg),
            cfg.mutationDebounce
          );
          const mo = new MutationObserver(recheck);
          mo.observe(document.documentElement, {
            childList: true,
            subtree: true,
          });
          window.__clickOnLoadMO = mo;
        }

        if (cfg.alsoRunOnWindowLoad) {
          window.addEventListener("load", () => scheduleRetries(cfg), {
            once: true,
          });
        }
      };

      const boot = () => {
        setTimeout(() => onWebflowReady(start), cfg.domReadyDelay);
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
      } else {
        boot();
      }
    };

    return Object.freeze({ init });
  })();

  //-----------------------------------------------------------------------------
  // NAV SHRINK ON SCROLL (toggles .is-shrunk on multiple nav wrappers at 5vh)
  //-----------------------------------------------------------------------------
  const NavShrink = (() => {
    function init() {
      const targets = document.querySelectorAll(
        ".g-navigation-w, .s-g-navigation, .sw-g-nav"
      );
      if (!targets.length) return;

      const getThresholdPx = () => window.innerHeight * 0.05; // 5vh
      let thresholdPx = getThresholdPx();

      const update = () => {
        const shouldShrink = window.scrollY >= thresholdPx;
        targets.forEach((el) => el.classList.toggle("is-shrunk", shouldShrink));
      };

      const onResize = () => {
        thresholdPx = getThresholdPx();
        update();
      };

      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
    }

    return { init };
  })();

  //-----------------------------------------------------------------------------
  // SESSION MODAL (timed auto-open, once per browser session)
  // Finds: [data-modal="site"]
  //
  // Markup (set these as Custom attributes in the Webflow Settings panel):
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
  // Requires the matching CSS - see the .is-open / html.modal-open rules.
  //-----------------------------------------------------------------------------
  const SessionModal = (() => {
    const DEFAULTS = Object.freeze({
      selector: '[data-modal="site"]',
      cardSelector: "[data-modal-card]",
      closeSelector: "[data-modal-close]",
      openSelector: "[data-modal-open]",
      focusSelector: "[data-modal-focus]",
      openClass: "is-open",
      lockClass: "modal-open", // applied to <html>
      storageKey: "tw_modal_v1",
      storage: "session", // "session" | "cookie" | "none"
      delay: 2500, // ms after DOM ready
      animDuration: 350, // must match the longest CSS transition
      exposeGlobal: true,
    });

    const FOCUSABLE =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // sessionStorage access throws outright in Safari private mode and
    // wherever storage is blocked, so every read/write is guarded.
    const store = {
      read: (cfg) => {
        if (cfg.storage === "none") return false;
        if (cfg.storage === "cookie") {
          return document.cookie.indexOf(cfg.storageKey + "=1") > -1;
        }
        try {
          return sessionStorage.getItem(cfg.storageKey) === "1";
        } catch (_) {
          return false;
        }
      },
      write: (cfg) => {
        if (cfg.storage === "none") return;
        if (cfg.storage === "cookie") {
          document.cookie = cfg.storageKey + "=1; path=/; SameSite=Lax";
          return;
        }
        try {
          sessionStorage.setItem(cfg.storageKey, "1");
        } catch (_) {}
      },
      clear: (cfg) => {
        if (cfg.storage === "cookie") {
          document.cookie =
            cfg.storageKey + "=; path=/; Max-Age=0; SameSite=Lax";
          return;
        }
        try {
          sessionStorage.removeItem(cfg.storageKey);
        } catch (_) {}
      },
    };

    const readDataOverrides = (el, base) => {
      const cfg = Object.assign({}, base);
      const d = el.dataset;

      if (d.modalDelay) {
        const n = parseInt(d.modalDelay, 10);
        if (!isNaN(n) && n >= 0) cfg.delay = n;
      }
      if (d.modalKey) cfg.storageKey = d.modalKey;
      if (d.modalStorage) cfg.storage = d.modalStorage;

      return cfg;
    };

    const init = (options = {}) => {
      const base = Object.assign({}, DEFAULTS, options);

      const modal = Utils.qs(base.selector);
      if (!modal) return; // no modal on this page - nothing to wire up

      const cfg = readDataOverrides(modal, base);
      const card = Utils.qs(cfg.cardSelector, modal);

      let lastFocus = null;
      let downOnBackdrop = false;
      let hideTimer = null;
      let openTimer = null;

      const isOpen = () => modal.classList.contains(cfg.openClass);

      const open = () => {
        if (isOpen()) return;

        // Mark first, so a reload mid-animation still counts as seen.
        store.write(cfg);

        clearTimeout(hideTimer);
        lastFocus = document.activeElement;

        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        void modal.offsetWidth; // force reflow so the CSS transition runs
        modal.classList.add(cfg.openClass);
        document.documentElement.classList.add(cfg.lockClass);

        const target =
          Utils.qs(cfg.focusSelector, modal) ||
          Utils.qs(cfg.closeSelector, modal);
        if (target && Utils.isFn(target.focus)) target.focus();
      };

      const close = () => {
        if (!isOpen()) return;

        modal.classList.remove(cfg.openClass);
        modal.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove(cfg.lockClass);

        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          if (!isOpen()) modal.style.display = "none";
        }, cfg.animDuration);

        if (lastFocus && Utils.isFn(lastFocus.focus)) lastFocus.focus();
        lastFocus = null;
      };

      const onKeyDown = (e) => {
        if (!isOpen()) return;

        if (e.key === "Escape") {
          close();
          return;
        }
        if (e.key !== "Tab") return;

        // Keep Tab inside the dialog.
        const f = Utils.qsa(FOCUSABLE, modal);
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
      Utils.qsa(cfg.closeSelector, modal).forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          close();
        });
      });

      // Backdrop click. mousedown is tracked as well, so dragging a text
      // selection from inside the card out onto the backdrop doesn't close it.
      modal.addEventListener("mousedown", (e) => {
        downOnBackdrop = !!card && !card.contains(e.target);
      });
      modal.addEventListener("click", (e) => {
        if (downOnBackdrop && card && !card.contains(e.target)) close();
        downOnBackdrop = false;
      });

      document.addEventListener("keydown", onKeyDown);

      // --- manual triggers anywhere on the page ---
      Utils.qsa(cfg.openSelector).forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          open();
        });
      });

      // --- the timed auto-open: the only part gated by the session flag ---
      if (!store.read(cfg)) {
        openTimer = setTimeout(open, cfg.delay);
      }

      if (cfg.exposeGlobal && !window.twModal) {
        Object.defineProperty(window, "twModal", {
          value: Object.freeze({
            open,
            close,
            isOpen,
            // twModal.reset() then reload to see it again while testing
            reset: () => {
              clearTimeout(openTimer);
              store.clear(cfg);
              Utils.safeConsole.log(
                `twModal: cleared "${cfg.storageKey}" - reload to see it again`
              );
            },
          }),
          writable: false,
          configurable: false,
        });
      }
    };

    return Object.freeze({ init });
  })();

  // =============================================================================
  // DOTTED CANVAS
  // Renders a silhouette image as an animated dot grid on a <canvas> element.
  //
  // HTML usage (Webflow):
  //   <canvas data-dotted-canvas
  //     data-dot-color="#5C7491"
  //     data-dot-opacity="0.32"
  //     data-dot-size="2"
  //     data-dot-spacing="7"
  //     data-threshold="128"
  //     data-hotspot-opacity="1"
  //     data-hotspot-fade="16"
  //     data-inertia-strength="20"
  //     data-inertia-smoothness="100"
  //     data-image-stretch="false"
  //     data-hotspots='[
  //       {"cx":81.5,"cy":20,"r":12.3},
  //       {"cx":85.7,"cy":41.4,"r":7.1},
  //       {"cx":72,"cy":52.5,"r":8.5},
  //       {"cx":42.8,"cy":73.7,"r":5.5}
  //     ]'
  //   ></canvas>
  //
  //   data-image-stretch="false" (default) — object-fit: contain (letterboxed)
  //   data-image-stretch="true"            — stretch to fill canvas 1:1
  //
  // Multiple instances on the same page are fully supported.
  // =============================================================================

  const DottedCanvas = (() => {
    // ── Defaults ──────────────────────────────────────────────────────────────
    const DEFAULTS = Object.freeze({
      dotColor: "#5C7491",
      dotOpacity: 0.32,
      dotSize: 2,
      dotSpacing: 7,
      threshold: 128,
      hotspotOpacity: 1.0,
      hotspotFade: 16,
      inertiaStrength: 20,
      inertiaSmoothness: 100,
      invertDots: false,
      hotspots: [
        { cx: 81.5, cy: 20, r: 12.3 },
        { cx: 85.7, cy: 41.4, r: 7.1 },
        { cx: 72, cy: 52.5, r: 8.5 },
        { cx: 42.8, cy: 73.7, r: 5.5 },
      ],
    });

    // ── Parse data attributes ─────────────────────────────────────────────────
    function parseConfig(canvas) {
      const d = canvas.dataset;
      const cfg = Object.assign({}, DEFAULTS);

      if (d.dotColor) cfg.dotColor = d.dotColor;
      if (d.dotOpacity) cfg.dotOpacity = parseFloat(d.dotOpacity);
      if (d.dotSize) cfg.dotSize = parseFloat(d.dotSize);
      if (d.dotSpacing) cfg.dotSpacing = parseInt(d.dotSpacing, 10);
      if (d.threshold) cfg.threshold = parseInt(d.threshold, 10);
      if (d.hotspotOpacity) cfg.hotspotOpacity = parseFloat(d.hotspotOpacity);
      if (d.hotspotFade) cfg.hotspotFade = parseFloat(d.hotspotFade);
      if (d.inertiaStrength)
        cfg.inertiaStrength = parseInt(d.inertiaStrength, 10);
      if (d.inertiaSmoothness)
        cfg.inertiaSmoothness = parseInt(d.inertiaSmoothness, 10);
      if (d.imageStretch !== undefined)
        cfg.imageStretch = d.imageStretch === "true";
      if (d.invertDots !== undefined) cfg.invertDots = d.invertDots === "true";
      if (d.hotspots) {
        try {
          cfg.hotspots = JSON.parse(d.hotspots);
        } catch (_) {}
      }

      return cfg;
    }

    // ── Hex → RGB ─────────────────────────────────────────────────────────────
    function hexRgb(h) {
      const c = h.replace("#", "");
      return [
        parseInt(c.slice(0, 2), 16),
        parseInt(c.slice(2, 4), 16),
        parseInt(c.slice(4, 6), 16),
      ];
    }

    // ── Load image into pixel buffer ──────────────────────────────────────────
    // stretch=false → object-fit: contain (white-padded letterbox)
    // stretch=true  → fill canvas 1:1, mirrors CSS object-fit: cover/fill
    function loadImagePixels(img, W, H, stretch, cb) {
      function drawToCanvas(source) {
        const oc = document.createElement("canvas");
        oc.width = W;
        oc.height = H;
        const ox = oc.getContext("2d");

        if (stretch) {
          ox.drawImage(source, 0, 0, W, H);
        } else {
          ox.fillStyle = "#ffffff";
          ox.fillRect(0, 0, W, H);
          const scale = Math.min(
            W / source.naturalWidth,
            H / source.naturalHeight
          );
          const dw = source.naturalWidth * scale;
          const dh = source.naturalHeight * scale;
          ox.drawImage(source, (W - dw) / 2, (H - dh) / 2, dw, dh);
        }

        try {
          cb(ox.getImageData(0, 0, W, H).data, W, H);
        } catch (_) {
          /* CORS tainted — re-fetch with crossOrigin then redraw */
          const proxy = new Image();
          proxy.crossOrigin = "anonymous";
          proxy.onload = () => drawToCanvas(proxy);
          proxy.src =
            source.src +
            (source.src.includes("?") ? "&" : "?") +
            "_nocache=" +
            Date.now();
        }
      }
      drawToCanvas(img);
    }

    // ── Single instance ───────────────────────────────────────────────────────
    function createInstance(canvasEl) {
      const cfg = parseConfig(canvasEl);
      const DPR = window.devicePixelRatio || 1;

      function readSize() {
        /* Use only the CSS rendered size — ignore Webflow's stale HTML
         width/height attributes which reflect design px, not layout px */
        return {
          w: canvasEl.offsetWidth,
          h: canvasEl.offsetHeight,
        };
      }

      /* Remove Webflow's stale design-px width/height attributes so they
       don't override CSS layout or confuse offsetWidth reads */
      canvasEl.removeAttribute("width");
      canvasEl.removeAttribute("height");

      let { w: W, h: H } = readSize();
      if (!W || !H) {
        W = 900;
        H = 560;
      }

      canvasEl.width = Math.round(W * DPR);
      canvasEl.height = Math.round(H * DPR);
      const ctx = canvasEl.getContext("2d");
      ctx.scale(DPR, DPR);

      let srcPx = null,
        srcW = 0,
        srcH = 0;
      let lastMX = 0,
        lastMY = 0;
      let velX = 0,
        velY = 0;
      let rawOffX = 0,
        rawOffY = 0;
      let offX = 0,
        offY = 0;
      let rafId = null;

      const VEL_SMOOTH = 0.18;

      // ── Helpers ─────────────────────────────────────────────────────────────

      function inMap(cx, cy) {
        if (!srcPx) return false;
        const sx = Math.min(Math.max(Math.floor((cx / W) * srcW), 0), srcW - 1);
        const sy = Math.min(Math.max(Math.floor((cy / H) * srcH), 0), srcH - 1);
        const i = (sy * srcW + sx) * 4;
        const dark =
          (srcPx[i] + srcPx[i + 1] + srcPx[i + 2]) / 3 < cfg.threshold;
        return cfg.invertDots ? !dark : dark;
      }

      function hotspotBoost(cx, cy) {
        let best = 0;
        const fadeZone = Math.max(cfg.hotspotFade * cfg.dotSpacing, 0.001);
        for (const h of cfg.hotspots) {
          const dx = cx - (h.cx / 100) * W;
          const dy = cy - (h.cy / 100) * H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const r = (h.r / 100) * Math.min(W, H);
          if (dist >= r) continue;
          const inner = r - fadeZone;
          const t = dist <= inner ? 1 : 1 - (dist - inner) / fadeZone;
          best = Math.max(best, t);
        }
        return best;
      }

      // ── Render ──────────────────────────────────────────────────────────────

      function render() {
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.clearRect(0, 0, W, H);
        if (!srcPx) return;

        const [r, g, b] = hexRgb(cfg.dotColor);
        const half = cfg.dotSpacing / 2;

        for (let y = half; y < H; y += cfg.dotSpacing) {
          for (let x = half; x < W; x += cfg.dotSpacing) {
            if (!inMap(x - offX, y - offY)) continue;
            const boost = hotspotBoost(x - offX, y - offY);
            const alpha =
              boost > 0
                ? cfg.dotOpacity + boost * (cfg.hotspotOpacity - cfg.dotOpacity)
                : cfg.dotOpacity;
            ctx.beginPath();
            ctx.arc(x, y, cfg.dotSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(
              0.99,
              alpha
            ).toFixed(3)})`;
            ctx.fill();
          }
        }
      }

      // ── Physics loop ────────────────────────────────────────────────────────

      function animLoop() {
        const t = Math.max(0, Math.min(100, cfg.inertiaSmoothness)) / 100;
        const velDecay = 0.6 + t * 0.38;
        const spring = 0.25 - t * 0.24;
        const dispLerp = 0.45 - t * 0.43;
        const maxOff = cfg.inertiaStrength;

        velX *= velDecay;
        velY *= velDecay;
        rawOffX += velX;
        rawOffY += velY;
        rawOffX += -rawOffX * spring;
        rawOffY += -rawOffY * spring;
        rawOffX = Math.max(-maxOff, Math.min(maxOff, rawOffX));
        rawOffY = Math.max(-maxOff, Math.min(maxOff, rawOffY));
        offX += (rawOffX - offX) * dispLerp;
        offY += (rawOffY - offY) * dispLerp;

        render();

        const settled =
          Math.abs(rawOffX) < 0.02 &&
          Math.abs(rawOffY) < 0.02 &&
          Math.abs(offX) < 0.02 &&
          Math.abs(offY) < 0.02 &&
          Math.abs(velX) < 0.01 &&
          Math.abs(velY) < 0.01;

        if (!settled) {
          rafId = requestAnimationFrame(animLoop);
        } else {
          rawOffX = rawOffY = offX = offY = 0;
          render();
          rafId = null;
        }
      }

      function startAnim() {
        if (!rafId) rafId = requestAnimationFrame(animLoop);
      }

      // ── Canvas coordinate correction ────────────────────────────────────────

      function canvasCoords(e) {
        const rect = canvasEl.getBoundingClientRect();
        return {
          x: (e.clientX - rect.left) * (W / rect.width),
          y: (e.clientY - rect.top) * (H / rect.height),
        };
      }

      // ── Mouse events ────────────────────────────────────────────────────────

      /* data-canvas-container:
       - absent / empty → listen on the canvas's parent wrapper (default)
       - CSS selector   → listen on that element instead (e.g. "body", ".hero") */
      const containerAttr = canvasEl.getAttribute("data-canvas-container");
      let mouseTarget;
      if (containerAttr && containerAttr.trim()) {
        mouseTarget =
          canvasEl.closest(containerAttr.trim()) ||
          canvasEl.parentElement ||
          canvasEl;
      } else {
        mouseTarget = canvasEl.parentElement || canvasEl;
      }

      mouseTarget.addEventListener("mousemove", (e) => {
        const { x, y } = canvasCoords(e);
        const dx = x - lastMX;
        const dy = y - lastMY;
        velX = velX * (1 - VEL_SMOOTH) + dx * VEL_SMOOTH;
        velY = velY * (1 - VEL_SMOOTH) + dy * VEL_SMOOTH;
        startAnim();
        lastMX = x;
        lastMY = y;
      });

      // ── Resize / first-paint ────────────────────────────────────────────────

      function findImg(el) {
        const wrapper = el.parentElement;
        if (wrapper) {
          const sib = wrapper.querySelector("img.interactive-canvas-image");
          if (sib) return sib;
        }
        return el.querySelector("img.interactive-canvas-image");
      }

      function loadImg(img) {
        loadImagePixels(img, W, H, cfg.imageStretch, (px, w, h) => {
          srcPx = px;
          srcW = w;
          srcH = h;
          render();
          /* Hide source image now that canvas has painted */
          img.classList.add("is-canvas-painted");
        });
      }

      function applySize(newW, newH) {
        if (!newW || !newH || (newW === W && newH === H && srcPx)) return;
        W = newW;
        H = newH;
        canvasEl.width = Math.round(W * DPR);
        canvasEl.height = Math.round(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        const img = findImg(canvasEl);
        if (img && img.complete && img.naturalWidth) {
          loadImg(img);
        } else if (img) {
          img.addEventListener("load", () => loadImg(img), { once: true });
        }
      }

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { inlineSize: w, blockSize: h } = entry.contentBoxSize
            ? entry.contentBoxSize[0]
            : {
                inlineSize: canvasEl.offsetWidth,
                blockSize: canvasEl.offsetHeight,
              };
          applySize(Math.round(w), Math.round(h));
        }
      });
      resizeObserver.observe(canvasEl);

      const imgEl = findImg(canvasEl);
      if (imgEl) {
        if (imgEl.complete && imgEl.naturalWidth) {
          loadImg(imgEl);
        } else {
          /* Image not ready — listen for load event.
           Also poll as fallback for lazy images that may never fire load
           if they're in viewport but blocked by loading="lazy" */
          imgEl.addEventListener("load", () => loadImg(imgEl), { once: true });

          /* Force-load by removing lazy attribute and resetting src */
          if (imgEl.getAttribute("loading") === "lazy") {
            imgEl.removeAttribute("loading");
            const src = imgEl.src;
            if (src) {
              imgEl.src = "";
              imgEl.src = src;
            }
          }

          /* Polling fallback — check every 200ms for up to 10s */
          let polls = 0;
          const poll = setInterval(() => {
            polls++;
            if (imgEl.complete && imgEl.naturalWidth) {
              clearInterval(poll);
              loadImg(imgEl);
            } else if (polls > 50) {
              clearInterval(poll);
            }
          }, 200);
        }
      }

      return { render, destroy: () => resizeObserver.disconnect() };
    }

    // ── Public init ───────────────────────────────────────────────────────────

    function init() {
      function boot() {
        /* querySelector matches data-dotted-canvas="" but Webflow sometimes
         writes data-dotted-canvas=" " (with a space). Trim and re-check. */
        const canvases = document.querySelectorAll(
          "canvas[data-dotted-canvas]"
        );
        canvases.forEach((el) => {
          if (el._dottedCanvasInit) return;
          el._dottedCanvasInit = true;
          try {
            createInstance(el);
          } catch (err) {
            try {
              console.error("DottedCanvas failed on", el, err);
            } catch (_) {}
          }
        });
      }

      /* Defer to rAF so Webflow layout has painted and offsetWidth is real.
       Also retry on window load for lazy-loaded / hidden-until-scroll elements. */
      requestAnimationFrame(() => {
        boot();
        if (document.readyState !== "complete") {
          window.addEventListener("load", boot, { once: true });
        }
      });
    }

    return Object.freeze({ init });
  })();

  //=============================================================================
  // 4) INIT
  //-----------------------------------------------------------------------------
  Utils.onReady(() => {
    const modules = [
      {
        name: "KeyboardIx3ShiftGToggle",
        init: () => KeyboardIx3ShiftGToggle.init(),
      },
      { name: "GoToTop", init: () => GoToTop.init() },
      { name: "SmartSwiper", init: () => SmartSwiper.init() },
      { name: "ClickOnLoad", init: () => ClickOnLoad.init() },
      { name: "NavShrink", init: () => NavShrink.init() },
      { name: "SessionModal", init: () => SessionModal.init() },
      { name: "DottedCanvas", init: () => DottedCanvas.init() },
    ];

    modules.forEach((m) => Utils.run(m.name, m.init));
  });

  //=============================================================================
  // 5) CONSOLE END MESSAGE
  //-----------------------------------------------------------------------------
  try {
    // eslint-disable-next-line no-console
    console.log("%cSite Modules%c ready", START_BADGE, START_BADGE_2);
  } catch (_) {}
})();