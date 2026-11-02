// Scroll motion (motion.ts) — replaces Webflow IX3 scroll interactions.
//
// Replays the interactions exactly as Webflow published them: the spec in
// motion-spec.ts is generated from the decoded IX3 data (same triggers, start
// and end, scrub, toggle actions, staggers, eases and SplitText modes). The
// two load interactions (Home hero, page header) are CSS @keyframes in
// styles.css §05 instead, so first-screen content never waits for JS.
//
// What is better than IX3 here, on purpose:
// - Lazy: a trigger's timeline (and its SplitText) is built only when the
//   trigger comes within one screen of the viewport, not all at load. IX3
//   split every text block on the page up front (main-thread cost on phones).
// - Readable: SplitText runs with aria "none", so the text stays a normal
//   accessible name (IX3's aria-label on <div>/<p> was invalid ARIA, and
//   buttons lost their names).
// - prefers-reduced-motion: nothing animates; content stays as designed.
//
// Transition guard: while Webflow still loads its own GSAP (IX3 still on),
// window.gsap is Webflow's copy, not ours, and this module does nothing, so
// nothing animates twice. It takes over once the interactions are removed and
// Webflow's GSAP setting is off. On staging, ?wfc-motion=1 forces it on for
// testing (with IX3 blocked by the test harness).
import { gsap, ScrollTrigger, SplitText, CustomEase } from '../lib/gsap';
import { MOTION } from './motion-spec';

type Target = { self?: true; sel?: string | null; within?: string | null };
type Action = {
  targets: Target[];
  tt: 0 | 1 | 2 | 3; // IX3: 0 to, 1 from, 2 fromTo, 3 set
  from: Record<string, unknown>;
  to: Record<string, unknown>;
  duration?: number;
  position?: number;
  ease?: string;
  stagger?: Record<string, unknown>;
  split?: { type: 'chars' | 'words' | 'lines'; mask?: 'words' | 'lines' };
};
export type MotionSpec = {
  id: string;
  pages?: string[];
  trigger: string | null;
  start: string;
  end: string;
  scrub?: number;
  clamp?: boolean; // IX3 clamp: start/end never before the page top or after its end
  toggle: string;
  skip?: string[];
  actions: Action[];
};

const BREAKPOINTS = [
  '(min-width: 992px)',
  '(min-width: 768px) and (max-width: 991px)',
  '(min-width: 480px) and (max-width: 767px)',
  '(max-width: 479px)',
];
const NEAR = '100% 0px'; // build a timeline about one screen ahead

function forced(): boolean {
  if (!/\.webflow\.io$/.test(location.hostname)) return false;
  return new URLSearchParams(location.search).get('wfc-motion') === '1';
}

const eases = new Map<string, string>();
function ease(name?: string): string | undefined {
  if (!name || !name.startsWith('cubic(')) return name;
  if (!eases.has(name)) {
    const [a, b, c, d] = name.slice(6, -1).split(',');
    const id = 'wfc' + eases.size;
    CustomEase.create(id, `M0,0 C${a},${b} ${c},${d} 1,1`);
    eases.set(name, id);
  }
  return eases.get(name);
}

function split(el: Element, a: Action): Element[] {
  const s = a.split!;
  // Same markup as IX3's SplitText (span tags, gsap_split_* classes, words
  // always split as inline blocks): the live layout and any CSS written
  // against those classes stay exactly as they are. Like IX3, the split is
  // kept after the reveal. aria "none": the text stays the accessible name.
  const r = SplitText.create(el, {
    type: s.type === 'words' ? 'words' : `words,${s.type}`,
    mask: s.mask,
    tag: 'span',
    wordsClass: 'gsap_split_word++',
    charsClass: 'gsap_split_letter++',
    linesClass: 'gsap_split_line++',
    aria: 'none',
  });
  // With tag 'span', GSAP 3.15 leaves every piece display:inline. IX3 writes
  // these inline styles itself; without them words wrap differently (page
  // heights shift on mobile) and transforms on lines do nothing.
  const set = (els: Element[], display: string) =>
    els.forEach((e) => Object.assign((e as HTMLElement).style, { position: 'relative', display }));
  set(r.words, 'inline-block');
  set(r.chars, 'inline-block');
  set(r.lines, 'block');
  for (const m of r.masks) set([m], m.className.includes('line') ? 'block' : 'inline-block');
  return s.type === 'chars' ? r.chars : s.type === 'words' ? r.words : r.lines;
}

function resolve(t: Target, trigger: Element): Element[] {
  if (t.self) return [trigger];
  if (!t.sel) return [];
  if (!t.within) return Array.from(document.querySelectorAll(t.sel));
  const scopes =
    t.within === 'trigger'
      ? [trigger]
      : trigger.matches(t.within)
        ? [trigger]
        : Array.from(trigger.querySelectorAll(t.within));
  const pool = scopes.length ? scopes : Array.from(document.querySelectorAll(t.within));
  return pool.flatMap((s) => Array.from(s.querySelectorAll(t.sel as string)));
}

function fill(tl: gsap.core.Timeline, spec: MotionSpec, trigger: Element) {
  for (const a of spec.actions) {
    const hasFrom = Object.keys(a.from).length > 0;
    const hasTo = Object.keys(a.to).length > 0;
    // IX3 skips an action with no properties; it is not a spacer.
    if (!hasFrom && !hasTo) continue;
    let els = a.targets.flatMap((t) => resolve(t, trigger));
    if (!els.length) continue;
    if (a.split) els = els.flatMap((el) => split(el, a));
    // No ease in the IX3 data means GSAP's default (power1.out), as in IX3.
    // No duration means 0.5 s, and IX3 adds force3D to every tween.
    const vars: gsap.TweenVars = {
      stagger: a.stagger as gsap.TweenVars['stagger'],
      duration: a.duration ?? 0.5,
      force3D: true,
    };
    if (a.ease) vars.ease = ease(a.ease);
    // IX3 places every action at `position ?? 0`: actions without a
    // position start together, they are not appended one after another.
    const at = a.position ?? 0;
    if (a.tt === 3) tl.set(els, a.to, at);
    else if (a.tt === 0 || (a.tt === 2 && !hasFrom)) tl.to(els, { ...a.to, ...vars }, at);
    else if (a.tt === 1 || !hasTo) tl.from(els, { ...a.from, ...vars }, at);
    else tl.fromTo(els, a.from, { ...a.to, ...vars }, at);
  }
}

const built: string[] = [];
// Lazily created triggers measure the page as it is at that moment; later
// shifts (images, fonts, text restored after a reveal) would leave their
// start/end stale. One refresh per frame, after any batch of builds.
let refreshQueued = false;
function queueRefresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
}
function build(spec: MotionSpec, trigger: Element) {
  built.push(spec.id);
  const range = {
    trigger,
    start: spec.clamp ? `clamp(${spec.start})` : spec.start,
    end: spec.clamp ? `clamp(${spec.end})` : spec.end,
  };
  const tl = gsap.timeline({
    scrollTrigger: { ...range, scrub: spec.scrub ?? false, toggleActions: spec.scrub ? undefined : spec.toggle },
  });
  fill(tl, spec, trigger);
}

export function initMotion(): void {
  const webflowGsap = (window as unknown as { gsap?: unknown }).gsap;
  if (webflowGsap && webflowGsap !== gsap && !forced()) return; // IX3 still on
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  // Staging test hook (?wfc-motion=1 only): lets the comparison harness
  // count timelines without shipping a global on production.
  if (forced()) (window as unknown as { wfcMotion?: unknown }).wfcMotion = { ScrollTrigger, built };
  const page = document.documentElement.getAttribute('data-wf-page') || '';
  const mm = gsap.matchMedia();
  document.fonts.ready.then(queueRefresh);
  window.addEventListener('load', queueRefresh, { once: true });

  for (const spec of MOTION) {
    if (spec.pages && !spec.pages.includes(page)) continue;
    if (!spec.trigger) continue;
    const triggers = Array.from(document.querySelectorAll(spec.trigger));
    if (!triggers.length) continue;
    const allowed = BREAKPOINTS.filter((q) => !spec.skip?.includes(q)).join(', ');
    if (!allowed) continue;

    mm.add(allowed, () => {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            io.unobserve(e.target);
            // Lines depend on the final font metrics.
            const go = () => {
              build(spec, e.target);
              queueRefresh();
            };
            if (spec.actions.some((a) => a.split?.type === 'lines')) document.fonts.ready.then(go);
            else go();
          }
        },
        { rootMargin: NEAR },
      );
      triggers.forEach((t) => io.observe(t));
      return () => io.disconnect();
    });
  }
}
