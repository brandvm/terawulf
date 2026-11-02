// The only entry point for the bundled GSAP. Never import `gsap/…` anywhere
// else.
//
// GSAP's plugin files end with `_getGSAP() && gsap.registerPlugin(Plugin)`,
// and _getGSAP() falls back to window.gsap. While Webflow still loads its
// own GSAP (IX3 on), importing them would register the bundled plugins on
// Webflow's core and replace window.ScrollTrigger under IX3. So window.gsap
// is hidden while they evaluate (ES modules evaluate in import order) and
// put back after; callers register the plugins on the bundled core.
// wf-template lesson 2026-10-20 (webflow-build lessons/js.md).
import { gsap } from 'gsap';
import './gsap-hide';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import './gsap-restore';

export { gsap, ScrollTrigger, SplitText, CustomEase };
