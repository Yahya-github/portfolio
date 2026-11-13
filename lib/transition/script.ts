import { DIVE_ROUTES, PROJECTS_ROUTE } from "@/lib/transition/rules";

/**
 * D-17 to D-19: inline handler for cross-document View Transitions. Reduced motion never
 * opts in (the @view-transition rule is media-gated in transition.css), so pageswap only
 * skips for paused motion, an off-screen source or a non-dive pair;
 * pagereveal lets any input finish it instantly, then focuses the deep-dive h1.
 * Build-time constant (T-05-09): only JSON.stringify'd route constants are interpolated.
 * Code, not copy.
 */
export const TRANSITION_SCRIPT = `try{var D=${JSON.stringify(DIVE_ROUTES)},P=${JSON.stringify(PROJECTS_ROUTE)};addEventListener("pageswap",function(e){var v=e.viewTransition;try{var f=location.pathname,t=new URL(e.activation.entry.url).pathname,p=f===P,r=document.querySelector(p?'[data-dive-source="'+t+'"]':"h1").getBoundingClientRect();if(document.documentElement.dataset.motion==="off"||!(p?D.includes(t):t===P&&D.includes(f))||r.bottom<1||r.top>innerHeight||r.right<1||r.left>innerWidth)v.skipTransition()}catch(x){v&&v.skipTransition()}});addEventListener("pagereveal",function(e){try{var v=e.viewTransition,a=navigation.activation,E="pointerdown keydown wheel".split(" "),k=function(){v.skipTransition()},d=function(){E.forEach(function(n){removeEventListener(n,k,!0)});var h=document.querySelector("h1");a&&a.from&&a.navigationType!=="reload"&&D.includes(location.pathname)&&h&&h.focus({preventScroll:!0})};if(!v)return d();E.forEach(function(n){addEventListener(n,k,!0)});v.finished.then(d,d)}catch(x){}})}catch(e){}`;
