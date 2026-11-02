// Puts Webflow's window.gsap back after the bundled plugins evaluated (see
// gsap.ts). Only gsap.ts imports this, in that order.
const w = window as unknown as { gsap?: unknown; __wfcGsap?: unknown };
if (w.__wfcGsap !== undefined) w.gsap = w.__wfcGsap;
delete w.__wfcGsap;

export {};
