// Dotted canvas — renders a silhouette image as an animated dot grid on a
// <canvas> element.
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
//     data-hotspots='[{"cx":81.5,"cy":20,"r":12.3}, ...]'
//   ></canvas>
//
//   data-image-stretch="false" (default) — object-fit: contain (letterboxed)
//   data-image-stretch="true"            — stretch to fill canvas 1:1
//   data-canvas-container                — optional selector for the element
//                                          that receives mouse movement
//
// The source is img.interactive-canvas-image next to (or inside) the canvas.
// Multiple instances on the same page are supported.

interface Hotspot {
  cx: number;
  cy: number;
  r: number;
}

interface Config {
  dotColor: string;
  dotOpacity: number;
  dotSize: number;
  dotSpacing: number;
  threshold: number;
  hotspotOpacity: number;
  hotspotFade: number;
  inertiaStrength: number;
  inertiaSmoothness: number;
  invertDots: boolean;
  imageStretch: boolean;
  hotspots: Hotspot[];
}

type CanvasEl = HTMLCanvasElement & { _dottedCanvasInit?: boolean };

const DEFAULTS: Readonly<Config> = Object.freeze({
  dotColor: '#5C7491',
  dotOpacity: 0.32,
  dotSize: 2,
  dotSpacing: 7,
  threshold: 128,
  hotspotOpacity: 1.0,
  hotspotFade: 16,
  inertiaStrength: 20,
  inertiaSmoothness: 100,
  invertDots: false,
  imageStretch: false,
  hotspots: [
    { cx: 81.5, cy: 20, r: 12.3 },
    { cx: 85.7, cy: 41.4, r: 7.1 },
    { cx: 72, cy: 52.5, r: 8.5 },
    { cx: 42.8, cy: 73.7, r: 5.5 },
  ],
});

function parseConfig(canvas: HTMLCanvasElement): Config {
  const d = canvas.dataset;
  const cfg: Config = { ...DEFAULTS, hotspots: DEFAULTS.hotspots.slice() };

  if (d.dotColor) cfg.dotColor = d.dotColor;
  if (d.dotOpacity) cfg.dotOpacity = parseFloat(d.dotOpacity);
  if (d.dotSize) cfg.dotSize = parseFloat(d.dotSize);
  if (d.dotSpacing) cfg.dotSpacing = parseInt(d.dotSpacing, 10);
  if (d.threshold) cfg.threshold = parseInt(d.threshold, 10);
  if (d.hotspotOpacity) cfg.hotspotOpacity = parseFloat(d.hotspotOpacity);
  if (d.hotspotFade) cfg.hotspotFade = parseFloat(d.hotspotFade);
  if (d.inertiaStrength) cfg.inertiaStrength = parseInt(d.inertiaStrength, 10);
  if (d.inertiaSmoothness) cfg.inertiaSmoothness = parseInt(d.inertiaSmoothness, 10);
  if (d.imageStretch !== undefined) cfg.imageStretch = d.imageStretch === 'true';
  if (d.invertDots !== undefined) cfg.invertDots = d.invertDots === 'true';
  if (d.hotspots) {
    try {
      cfg.hotspots = JSON.parse(d.hotspots);
    } catch {
      /* keep the defaults */
    }
  }
  return cfg;
}

function hexRgb(h: string): [number, number, number] {
  const c = h.replace('#', '');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

// Load the image into a pixel buffer.
// stretch=false → object-fit: contain (white-padded letterbox)
// stretch=true  → fill the canvas 1:1, mirrors CSS object-fit: cover/fill
function loadImagePixels(
  img: HTMLImageElement,
  W: number,
  H: number,
  stretch: boolean,
  cb: (px: Uint8ClampedArray, w: number, h: number) => void,
): void {
  function drawToCanvas(source: HTMLImageElement) {
    const oc = document.createElement('canvas');
    oc.width = W;
    oc.height = H;
    const ox = oc.getContext('2d');
    if (!ox) return;

    if (stretch) {
      ox.drawImage(source, 0, 0, W, H);
    } else {
      ox.fillStyle = '#ffffff';
      ox.fillRect(0, 0, W, H);
      const scale = Math.min(W / source.naturalWidth, H / source.naturalHeight);
      const dw = source.naturalWidth * scale;
      const dh = source.naturalHeight * scale;
      ox.drawImage(source, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }

    try {
      cb(ox.getImageData(0, 0, W, H).data, W, H);
    } catch {
      // CORS tainted — re-fetch with crossOrigin, then redraw.
      const proxy = new Image();
      proxy.crossOrigin = 'anonymous';
      proxy.onload = () => drawToCanvas(proxy);
      proxy.src = source.src + (source.src.includes('?') ? '&' : '?') + '_nocache=' + Date.now();
    }
  }
  drawToCanvas(img);
}

function findImg(el: HTMLElement): HTMLImageElement | null {
  const wrapper = el.parentElement;
  const sib = wrapper?.querySelector<HTMLImageElement>('img.interactive-canvas-image');
  return sib || el.querySelector<HTMLImageElement>('img.interactive-canvas-image');
}

const isReady = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0;

// Call `fn` once the image has decoded. Replaces the old 200 ms polling:
// decode() resolves as soon as the pixels are usable, and the load event
// covers browsers where decode() rejects for a still-loading image.
function whenReady(img: HTMLImageElement, fn: () => void): void {
  if (isReady(img)) return fn();
  let done = false;
  const once = () => {
    if (done || !isReady(img)) return;
    done = true;
    fn();
  };
  img.addEventListener('load', once, { once: true });
  if (typeof img.decode === 'function') img.decode().then(once, () => {});
}

function createInstance(canvasEl: HTMLCanvasElement) {
  const cfg = parseConfig(canvasEl);
  const DPR = window.devicePixelRatio || 1;

  // Webflow writes stale design-px width/height attributes on the canvas
  // (GOTCHAS 2026-09-02); drop them so only the CSS layout size counts.
  canvasEl.removeAttribute('width');
  canvasEl.removeAttribute('height');

  let W = canvasEl.offsetWidth;
  let H = canvasEl.offsetHeight;
  if (!W || !H) {
    W = 900;
    H = 560;
  }

  canvasEl.width = Math.round(W * DPR);
  canvasEl.height = Math.round(H * DPR);
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return;
  ctx.scale(DPR, DPR);

  let srcPx: Uint8ClampedArray | null = null;
  let srcW = 0;
  let srcH = 0;
  let lastMX = 0;
  let lastMY = 0;
  let velX = 0;
  let velY = 0;
  let rawOffX = 0;
  let rawOffY = 0;
  let offX = 0;
  let offY = 0;
  let rafId: number | null = null;

  const VEL_SMOOTH = 0.18;

  function inMap(cx: number, cy: number): boolean {
    if (!srcPx) return false;
    const sx = Math.min(Math.max(Math.floor((cx / W) * srcW), 0), srcW - 1);
    const sy = Math.min(Math.max(Math.floor((cy / H) * srcH), 0), srcH - 1);
    const i = (sy * srcW + sx) * 4;
    const dark = (srcPx[i] + srcPx[i + 1] + srcPx[i + 2]) / 3 < cfg.threshold;
    return cfg.invertDots ? !dark : dark;
  }

  function hotspotBoost(cx: number, cy: number): number {
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

  function render() {
    if (!ctx) return;
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
          boost > 0 ? cfg.dotOpacity + boost * (cfg.hotspotOpacity - cfg.dotOpacity) : cfg.dotOpacity;
        ctx.beginPath();
        ctx.arc(x, y, cfg.dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(0.99, alpha).toFixed(3)})`;
        ctx.fill();
      }
    }
  }

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

  function canvasCoords(e: MouseEvent) {
    const rect = canvasEl.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height),
    };
  }

  // data-canvas-container: absent/empty → the canvas's parent wrapper;
  // a selector → the closest matching ancestor instead.
  const containerAttr = canvasEl.getAttribute('data-canvas-container');
  const selector = containerAttr ? containerAttr.trim() : '';
  const mouseTarget: HTMLElement =
    (selector && canvasEl.closest<HTMLElement>(selector)) || canvasEl.parentElement || canvasEl;

  mouseTarget.addEventListener('mousemove', (e) => {
    const { x, y } = canvasCoords(e);
    const dx = x - lastMX;
    const dy = y - lastMY;
    velX = velX * (1 - VEL_SMOOTH) + dx * VEL_SMOOTH;
    velY = velY * (1 - VEL_SMOOTH) + dy * VEL_SMOOTH;
    startAnim();
    lastMX = x;
    lastMY = y;
  });

  function loadImg(img: HTMLImageElement) {
    loadImagePixels(img, W, H, cfg.imageStretch, (px, w, h) => {
      srcPx = px;
      srcW = w;
      srcH = h;
      render();
      // Hide the source image now that the canvas has painted.
      img.classList.add('is-canvas-painted');
    });
  }

  function applySize(newW: number, newH: number) {
    if (!newW || !newH || (newW === W && newH === H && srcPx)) return;
    W = newW;
    H = newH;
    canvasEl.width = Math.round(W * DPR);
    canvasEl.height = Math.round(H * DPR);
    ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    const img = findImg(canvasEl);
    if (img) whenReady(img, () => loadImg(img));
  }

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const box = entry.contentBoxSize && entry.contentBoxSize[0];
      const w = box ? box.inlineSize : canvasEl.offsetWidth;
      const h = box ? box.blockSize : canvasEl.offsetHeight;
      applySize(Math.round(w), Math.round(h));
    }
  });
  resizeObserver.observe(canvasEl);

  const imgEl = findImg(canvasEl);
  if (imgEl) {
    // A lazy source image can sit unloaded forever behind the canvas that
    // covers it: switch it to eager and restart the request.
    if (!isReady(imgEl) && imgEl.getAttribute('loading') === 'lazy') {
      imgEl.removeAttribute('loading');
      const src = imgEl.src;
      if (src) {
        imgEl.src = '';
        imgEl.src = src;
      }
    }
    whenReady(imgEl, () => loadImg(imgEl));
  }
}

export function initDottedCanvas(): void {
  function boot() {
    document.querySelectorAll<CanvasEl>('canvas[data-dotted-canvas]').forEach((el) => {
      if (el._dottedCanvasInit) return;
      el._dottedCanvasInit = true;
      try {
        createInstance(el);
      } catch (err) {
        console.error('[wfc] dotted-canvas failed on', el, err);
      }
    });
  }

  // Defer to rAF so Webflow layout has painted and offsetWidth is real; retry
  // on window load for elements that were hidden until then.
  requestAnimationFrame(() => {
    boot();
    if (document.readyState !== 'complete') window.addEventListener('load', boot, { once: true });
  });
}
