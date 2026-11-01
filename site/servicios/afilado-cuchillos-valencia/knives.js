'use strict';
// Copy and all service links live in HTML; JavaScript only enhances interaction.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
function animationsFor(element) { return typeof element.getAnimations === 'function' ? element.getAnimations() : []; }
function motion(element, frames, options) {
  if (!motionPreference.matches && typeof element.animate === 'function') element.animate(frames, options);
}
function stopMotion() { if (motionPreference.matches && typeof document.getAnimations === 'function') document.getAnimations().forEach(a => a.cancel()); }
if (motionPreference.addEventListener) motionPreference.addEventListener('change', stopMotion);
else if (motionPreference.addListener) motionPreference.addListener(stopMotion);
// Same progressive hero opening as the workshop homepage; copy stays visible.
motion(document.querySelector('.hero h1'), [{opacity:.25,transform:'translateY(32px)'},{opacity:1,transform:'none'}], {duration:650,easing:'cubic-bezier(.2,.6,.2,1)'});
motion(document.querySelector('.hero-photo'), [{opacity:.25,transform:'translateX(44px)'},{opacity:1,transform:'none'}], {duration:750,easing:'cubic-bezier(.2,.6,.2,1)'});
// Visible by default, no scroll handlers, no forced page scrolling or layout reads.
if ('IntersectionObserver' in window) {
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting){entry.target.dataset.inView='false';return;}
   if(entry.target.dataset.inView==='true')return;
   entry.target.dataset.inView='true';
   const targets=entry.target.matches('.knife-type-list,.knife-method')?[...entry.target.children]:[entry.target];
   targets.forEach((target,index)=>{animationsFor(target).forEach(a=>a.cancel());motion(target,[{opacity:.3,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:600,delay:Math.min(index,2)*80,fill:'backwards',easing:'cubic-bezier(.2,.65,.2,1)'});});
 }),{threshold:.08});
 document.querySelectorAll('.knife-types-heading,.knife-type-list,.knife-approach-lead,.knife-method,.japan-copy,.japan-drawing,.knife-bring,.knife-faq,.knife-contact').forEach(el=>observer.observe(el));
}
