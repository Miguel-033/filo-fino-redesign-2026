'use strict';
// Shared native dialog: one interaction implementation for every developed page.
(() => {
 const dialog=document.querySelector('#menu-dialog');
 const trigger=document.querySelector('.menu-trigger');
 if(!dialog || !trigger || typeof dialog.showModal!=='function') return;
 document.documentElement.classList.add('has-js');
 let returnTarget=trigger;
 const unlock=()=>{
  document.body.classList.remove('modal-open');
  trigger.setAttribute('aria-expanded','false');
  returnTarget.focus({preventScroll:true});
 };
 trigger.addEventListener('click',()=>{
  returnTarget=trigger;
  dialog.showModal();
  trigger.setAttribute('aria-expanded','true');
  document.body.classList.add('modal-open');
 });
 dialog.querySelector('.menu-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',unlock);
 // Native Escape provides focus trapping and close behavior; close cleans scroll lock.
 dialog.querySelectorAll('a[href]').forEach(link=>link.addEventListener('click',event=>{
  const url=new URL(link.href,location.href);
  const samePage=url.origin===location.origin && url.pathname===location.pathname;
  const target=samePage && url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
  if(target){
   event.preventDefault();
   returnTarget=target;
   target.setAttribute('tabindex','-1');
   dialog.close();
   target.focus({preventScroll:true});
   target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
   target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
   history.replaceState(null,'',url.hash);
  } else dialog.close();
 }));
 // Back/forward cache must not restore a locked document.
 window.addEventListener('pageshow',()=>{if(!dialog.open) document.body.classList.remove('modal-open');});
})();
