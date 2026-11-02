// Hides Webflow's window.gsap while the bundled GSAP plugins evaluate (see
// gsap.ts). Only gsap.ts imports this, in that order.
const w = window as unknown as { gsap?: unknown; __wfcGsap?: unknown };
w.__wfcGsap = w.gsap;
delete w.gsap;

export {};
