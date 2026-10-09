"use strict";(()=>{function P(){var i,p,v,M;let t=window.WFC;if(!/\.webflow\.io$/.test(location.hostname)||!t||(p=(i=window.Webflow)==null?void 0:i.env)!=null&&p.call(i,"editor")||(M=(v=window.Webflow)==null?void 0:v.env)!=null&&M.call(v,"design")||document.getElementById("wfc-environment"))return;let e=t.source?t.source===t.devBase:!!t.dev,o=!!t.source&&t.source!==t.devBase&&t.source!==t.stag,n=!!t.dev&&!e||o,r=e?"Dev":"Staging",l=document.createElement("div");l.id="wfc-environment";let a=l.attachShadow({mode:"open"});a.innerHTML=`
    <style>
      :host {
        all: initial;
        position: fixed !important;
        left: max(10px, env(safe-area-inset-left)) !important;
        bottom: max(10px, env(safe-area-inset-bottom)) !important;
        z-index: 2147483000 !important;
        display: block !important;
        pointer-events: none !important;
        color-scheme: dark;
      }
      *, *::before, *::after { box-sizing: border-box; }
      [hidden] { display: none !important; }
      .control {
        width: max-content;
        padding: 3px;
        border: 1px solid #ffffff26;
        border-radius: 11px;
        background: #1b1b1bf2;
        box-shadow: 0 2px 10px #0002;
        opacity: .65;
        pointer-events: auto;
        transition: opacity 150ms ease;
      }
      .control:hover, .control:focus-within, .control[data-expanded] { opacity: 1; }
      button {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        margin: 0;
        border: 0;
        border-radius: 7px;
        padding: 0 10px;
        height: 28px;
        background: transparent;
        color: #c5c5c5;
        font: 500 11px/1 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        letter-spacing: 0;
        cursor: pointer;
        touch-action: manipulation;
      }
      button:hover { background: #ffffff12; color: #fff; }
      button:focus-visible { outline: 2px solid #d9ff54; outline-offset: 1px; }
      button[aria-pressed='true'] { background: #ffffff20; color: #fff; }
      .choices { display: flex; gap: 3px; }
      .segment { min-width: 44px; height: 32px; }
      .minimize { width: 28px; height: 32px; padding: 0; }
      .dot { width: 5px; height: 5px; border-radius: 50%; background: #b5b5b5; }
      .dot[data-dev] { background: #d9ff54; }
      svg { width: 10px; height: 10px; fill: none; stroke: currentColor; stroke-width: 1.5; }
      .status {
        margin: 5px 0 0;
        padding: 7px 9px;
        border-radius: 7px;
        background: #1b1b1bf2;
        color: #ddd;
        font: 11px/1.4 system-ui, sans-serif;
        pointer-events: auto;
      }
      @media (prefers-reduced-motion: reduce) { .control { transition: none; } }
      @media print { :host { display: none !important; } }
    </style>
    <div class="control">
      <button class="launcher" type="button" aria-expanded="false" aria-controls="choices">
        <span class="dot" aria-hidden="true"></span>
        <span class="label"></span>
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="m4 2 4 4-4 4"/></svg>
      </button>
      <div class="choices" id="choices" role="group" aria-label="Code environment" hidden>
        <button class="segment" type="button" data-mode="staging" title="Use the deployed staging code">Staging</button>
        <button class="segment" type="button" data-mode="dev" title="Use your local code \u2014 run pnpm dev first">Dev</button>
        <button class="minimize" type="button" aria-label="Minimize environment switcher" title="Minimize">
          <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8"/></svg>
        </button>
      </div>
    </div>
    <p class="status" role="status" hidden>Dev unavailable \xB7 using staging</p>
  `;let g=a.querySelector(".control"),m=a.querySelector(".launcher"),h=a.querySelector(".choices"),S=a.querySelector(".status"),b=a.querySelectorAll("[data-mode]");a.querySelector(".label").textContent=r,a.querySelector(".dot").toggleAttribute("data-dev",e),m.setAttribute("aria-label",`Choose environment (${r})`),o&&(S.textContent="Staging unavailable \xB7 using release"),m.title=o?"Staging could not load. Using the pinned release.":n?"Local dev could not load. Using staging.":"Switch between staging and local dev";function x(f,L=!1){var E;m.hidden=f,h.hidden=!f,S.hidden=!f||!n,g.toggleAttribute("data-expanded",f),m.setAttribute("aria-expanded",String(f)),L&&(f?(E=a.querySelector('[aria-pressed="true"]'))==null||E.focus():m.focus())}b.forEach(f=>{let L=f.dataset.mode==="dev";f.setAttribute("aria-pressed",String(L===e)),f.addEventListener("click",()=>{if(L===!!t.dev&&!n)return;let E=new URL(location.href);E.searchParams.set("wfc-dev",L?"1":"0");try{localStorage.setItem("wfc-dev",L?"1":"0")}catch{}location.assign(E.href)})}),m.addEventListener("click",()=>x(!0,!0)),a.querySelector(".minimize").addEventListener("click",()=>x(!1,!0)),g.addEventListener("keydown",f=>{f.key!=="Escape"||h.hidden||(f.preventDefault(),f.stopPropagation(),x(!1,!0))}),document.addEventListener("pointerdown",f=>{f.composedPath().includes(l)||x(!1)}),document.body.appendChild(l)}var V=Object.freeze({selector:'[data-modal="site"]',cardSelector:"[data-modal-card]",closeSelector:"[data-modal-close]",openSelector:"[data-modal-open]",focusSelector:"[data-modal-focus]",openClass:"is-open",lockClass:"modal-open",storageKey:"tw_modal_v1",storage:"session",delay:2500,animDuration:350,exposeGlobal:!0}),Z='a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',O={read(t){if(t.storage==="none")return!1;if(t.storage==="cookie")return document.cookie.indexOf(t.storageKey+"=1")>-1;try{return sessionStorage.getItem(t.storageKey)==="1"}catch{return!1}},write(t){if(t.storage!=="none"){if(t.storage==="cookie"){document.cookie=t.storageKey+"=1; path=/; SameSite=Lax";return}try{sessionStorage.setItem(t.storageKey,"1")}catch{}}},clear(t){if(t.storage==="cookie"){document.cookie=t.storageKey+"=; path=/; Max-Age=0; SameSite=Lax";return}try{sessionStorage.removeItem(t.storageKey)}catch{}}};function Q(t,e){let o={...e},n=t.dataset;if(n.modalDelay){let r=parseInt(n.modalDelay,10);!isNaN(r)&&r>=0&&(o.delay=r)}return n.modalKey&&(o.storageKey=n.modalKey),n.modalStorage&&(o.storage=n.modalStorage),o}function R(t={}){let e={...V,...t},o=document.querySelector(e.selector);if(!o)return;let n=Q(o,e),r=o.querySelector(n.cardSelector),l=null,a=!1,g,m,h=()=>o.classList.contains(n.openClass),S=()=>{if(h())return;O.write(n),clearTimeout(g),l=document.activeElement,o.style.display="flex",o.setAttribute("aria-hidden","false"),o.offsetWidth,o.classList.add(n.openClass),document.documentElement.classList.add(n.lockClass);let i=o.querySelector(n.focusSelector)||o.querySelector(n.closeSelector);i&&i.focus()},b=()=>{h()&&(o.classList.remove(n.openClass),o.setAttribute("aria-hidden","true"),document.documentElement.classList.remove(n.lockClass),clearTimeout(g),g=window.setTimeout(()=>{h()||(o.style.display="none")},n.animDuration),l instanceof HTMLElement&&l.focus(),l=null)},x=i=>{if(!h())return;if(i.key==="Escape"){b();return}if(i.key!=="Tab")return;let p=Array.from(o.querySelectorAll(Z));if(!p.length)return;let v=p[0],M=p[p.length-1];i.shiftKey&&document.activeElement===v?(i.preventDefault(),M.focus()):!i.shiftKey&&document.activeElement===M&&(i.preventDefault(),v.focus())};o.querySelectorAll(n.closeSelector).forEach(i=>{i.addEventListener("click",p=>{p.preventDefault(),b()})}),o.addEventListener("mousedown",i=>{a=!!r&&!r.contains(i.target)}),o.addEventListener("click",i=>{a&&r&&!r.contains(i.target)&&b(),a=!1}),document.addEventListener("keydown",x),document.querySelectorAll(n.openSelector).forEach(i=>{i.addEventListener("click",p=>{p.preventDefault(),S()})}),O.read(n)||(m=window.setTimeout(S,n.delay)),n.exposeGlobal&&!window.twModal&&Object.defineProperty(window,"twModal",{value:Object.freeze({open:S,close:b,isOpen:h,reset:()=>{clearTimeout(m),O.clear(n),console.log(`twModal: cleared "${n.storageKey}" - reload to see it again`)}}),writable:!1,configurable:!1})}var U=Object.freeze({dotColor:"#5C7491",dotOpacity:.32,dotSize:2,dotSpacing:7,threshold:128,hotspotOpacity:1,hotspotFade:16,inertiaStrength:20,inertiaSmoothness:100,invertDots:!1,imageStretch:!1,hotspots:[{cx:81.5,cy:20,r:12.3},{cx:85.7,cy:41.4,r:7.1},{cx:72,cy:52.5,r:8.5},{cx:42.8,cy:73.7,r:5.5}]});function ee(t){let e=t.dataset,o={...U,hotspots:U.hotspots.slice()};if(e.dotColor&&(o.dotColor=e.dotColor),e.dotOpacity&&(o.dotOpacity=parseFloat(e.dotOpacity)),e.dotSize&&(o.dotSize=parseFloat(e.dotSize)),e.dotSpacing&&(o.dotSpacing=parseInt(e.dotSpacing,10)),e.threshold&&(o.threshold=parseInt(e.threshold,10)),e.hotspotOpacity&&(o.hotspotOpacity=parseFloat(e.hotspotOpacity)),e.hotspotFade&&(o.hotspotFade=parseFloat(e.hotspotFade)),e.inertiaStrength&&(o.inertiaStrength=parseInt(e.inertiaStrength,10)),e.inertiaSmoothness&&(o.inertiaSmoothness=parseInt(e.inertiaSmoothness,10)),e.imageStretch!==void 0&&(o.imageStretch=e.imageStretch==="true"),e.invertDots!==void 0&&(o.invertDots=e.invertDots==="true"),e.hotspots)try{o.hotspots=JSON.parse(e.hotspots)}catch{}return o}function te(t){let e=t.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function oe(t,e,o,n,r){function l(a){let g=document.createElement("canvas");g.width=e,g.height=o;let m=g.getContext("2d");if(m){if(n)m.drawImage(a,0,0,e,o);else{m.fillStyle="#ffffff",m.fillRect(0,0,e,o);let h=Math.min(e/a.naturalWidth,o/a.naturalHeight),S=a.naturalWidth*h,b=a.naturalHeight*h;m.drawImage(a,(e-S)/2,(o-b)/2,S,b)}try{r(m.getImageData(0,0,e,o).data,e,o)}catch{let h=new Image;h.crossOrigin="anonymous",h.onload=()=>l(h),h.src=a.src+(a.src.includes("?")?"&":"?")+"_nocache="+Date.now()}}}l(t)}function $(t){let e=t.parentElement;return(e==null?void 0:e.querySelector("img.interactive-canvas-image"))||t.querySelector("img.interactive-canvas-image")}var D=t=>t.complete&&t.naturalWidth>0;function _(t,e){if(D(t))return e();let o=!1,n=()=>{o||!D(t)||(o=!0,e())};t.addEventListener("load",n,{once:!0}),typeof t.decode=="function"&&t.decode().then(n,()=>{})}function ne(t){let e=ee(t),o=window.devicePixelRatio||1;t.removeAttribute("width"),t.removeAttribute("height");let n=t.offsetWidth,r=t.offsetHeight;(!n||!r)&&(n=900,r=560),t.width=Math.round(n*o),t.height=Math.round(r*o);let l=t.getContext("2d");if(!l)return;l.scale(o,o);let a=null,g=0,m=0,h=0,S=0,b=0,x=0,i=0,p=0,v=0,M=0,f=null,L=.18;function E(s,c){if(!a)return!1;let d=Math.min(Math.max(Math.floor(s/n*g),0),g-1),u=(Math.min(Math.max(Math.floor(c/r*m),0),m-1)*g+d)*4,w=(a[u]+a[u+1]+a[u+2])/3<e.threshold;return e.invertDots?!w:w}function X(s,c){let d=0,y=Math.max(e.hotspotFade*e.dotSpacing,.001);for(let u of e.hotspots){let w=s-u.cx/100*n,T=c-u.cy/100*r,k=Math.sqrt(w*w+T*T),K=u.r/100*Math.min(n,r);if(k>=K)continue;let B=K-y,J=k<=B?1:1-(k-B)/y;d=Math.max(d,J)}return d}function I(){if(!l||(l.setTransform(o,0,0,o,0,0),l.clearRect(0,0,n,r),!a))return;let[s,c,d]=te(e.dotColor),y=e.dotSpacing/2;for(let u=y;u<r;u+=e.dotSpacing)for(let w=y;w<n;w+=e.dotSpacing){if(!E(w-v,u-M))continue;let T=X(w-v,u-M),k=T>0?e.dotOpacity+T*(e.hotspotOpacity-e.dotOpacity):e.dotOpacity;l.beginPath(),l.arc(w,u,e.dotSize,0,Math.PI*2),l.fillStyle=`rgba(${s},${c},${d},${Math.min(.99,k).toFixed(3)})`,l.fill()}}function H(){let s=Math.max(0,Math.min(100,e.inertiaSmoothness))/100,c=.6+s*.38,d=.25-s*.24,y=.45-s*.43,u=e.inertiaStrength;b*=c,x*=c,i+=b,p+=x,i+=-i*d,p+=-p*d,i=Math.max(-u,Math.min(u,i)),p=Math.max(-u,Math.min(u,p)),v+=(i-v)*y,M+=(p-M)*y,I(),Math.abs(i)<.02&&Math.abs(p)<.02&&Math.abs(v)<.02&&Math.abs(M)<.02&&Math.abs(b)<.01&&Math.abs(x)<.01?(i=p=v=M=0,I(),f=null):f=requestAnimationFrame(H)}function Y(){f||(f=requestAnimationFrame(H))}function W(s){let c=t.getBoundingClientRect();return{x:(s.clientX-c.left)*(n/c.width),y:(s.clientY-c.top)*(r/c.height)}}let z=t.getAttribute("data-canvas-container"),q=z?z.trim():"";(q&&t.closest(q)||t.parentElement||t).addEventListener("mousemove",s=>{let{x:c,y:d}=W(s),y=c-h,u=d-S;b=b*(1-L)+y*L,x=x*(1-L)+u*L,Y(),h=c,S=d});function F(s){oe(s,n,r,e.imageStretch,(c,d,y)=>{a=c,g=d,m=y,I(),s.classList.add("is-canvas-painted")})}function G(s,c){if(!s||!c||s===n&&c===r&&a)return;n=s,r=c,t.width=Math.round(n*o),t.height=Math.round(r*o),l.setTransform(o,0,0,o,0,0);let d=$(t);d&&_(d,()=>F(d))}new ResizeObserver(s=>{for(let c of s){let d=c.contentBoxSize&&c.contentBoxSize[0],y=d?d.inlineSize:t.offsetWidth,u=d?d.blockSize:t.offsetHeight;G(Math.round(y),Math.round(u))}}).observe(t);let C=$(t);if(C){if(!D(C)&&C.getAttribute("loading")==="lazy"){C.removeAttribute("loading");let s=C.src;s&&(C.src="",C.src=s)}_(C,()=>F(C))}}function j(){function t(){document.querySelectorAll("canvas[data-dotted-canvas]").forEach(e=>{if(!e._dottedCanvasInit){e._dottedCanvasInit=!0;try{ne(e)}catch(o){console.error("[wfc] dotted-canvas failed on",e,o)}}})}requestAnimationFrame(()=>{t(),document.readyState!=="complete"&&window.addEventListener("load",t,{once:!0})})}function A(t,e){try{e()}catch(o){console.error(`[wfc] ${t} failed to initialize`,o)}}function N(){document.documentElement.classList.remove("is-loading"),A("environment-switcher",P),A("session-modal",()=>R()),A("dotted-canvas",j)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",N,{once:!0}):N();})();
