'use strict';
// Copy and all service links live in HTML; JavaScript only enhances interaction.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const menuDialog = document.querySelector('#menu-dialog');
const galleryDialog = document.querySelector('#knife-gallery-dialog');
const menuTrigger = document.querySelector('.menu-trigger');
const galleryImage = document.querySelector('#knife-gallery-image');
const galleryView = document.querySelector('#knife-gallery-dialog .gallery-view');
const zoomButton = document.querySelector('.knife-zoom');
const supportsDialog = typeof menuDialog.showModal === 'function';
if (supportsDialog) document.documentElement.classList.add('has-js');
function animationsFor(element) { return typeof element.getAnimations === 'function' ? element.getAnimations() : []; }
function motion(element, frames, options) {
  if (!motionPreference.matches && typeof element.animate === 'function') element.animate(frames, options);
}
function stopMotion() { if (motionPreference.matches && typeof document.getAnimations === 'function') document.getAnimations().forEach(a => a.cancel()); }
if (motionPreference.addEventListener) motionPreference.addEventListener('change', stopMotion);
else if (motionPreference.addListener) motionPreference.addListener(stopMotion);
let focusReturn = null;
function openDialog(dialog, trigger) { focusReturn = trigger; dialog.showModal(); document.body.classList.add('modal-open'); }
function closeDialog(dialog) { dialog.close(); }
[menuDialog, galleryDialog].forEach(dialog => dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  focusReturn?.focus({preventScroll: true});
  menuTrigger.setAttribute('aria-expanded', 'false');
}));
menuTrigger.setAttribute('aria-expanded', 'false');
menuTrigger.addEventListener('click', () => {
  if (!supportsDialog) return;
  openDialog(menuDialog, menuTrigger); menuTrigger.setAttribute('aria-expanded', 'true');
  motion(menuDialog, [{opacity:.2, transform:'translateX(35px)'},{opacity:1,transform:'none'}], {duration:350,easing:'ease-out'});
});
document.querySelector('.menu-close').addEventListener('click', () => closeDialog(menuDialog));
menuDialog.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  event.preventDefault(); focusReturn = target; closeDialog(menuDialog);
  target.setAttribute('tabindex','-1'); target.focus({preventScroll:true}); target.scrollIntoView({behavior:motionPreference.matches?'auto':'smooth'});
  target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
  history.replaceState(null,'',link.hash);
}));
const images = [
  {src:'../../assets/images/afilado.webp', width:1140,height:641,alt:'Manos trabajando un cuchillo sobre piedra',caption:'Imagen del taller / Trabajo sobre el filo'},
  {src:'../../assets/illustrations/knife-study.svg',width:640,height:440,alt:'Ilustración de un cuchillo de cocina',caption:'Estudio gráfico / Cuchillo de cocina'},
  {src:'../../assets/illustrations/revisar.svg',width:640,height:440,alt:'Ilustración de una revisión visual del filo',caption:'Estudio gráfico / Examen del filo'}
];
let imageIndex = 0;
function resetZoom() { galleryView.classList.remove('is-zoomed'); zoomButton.setAttribute('aria-pressed','false'); zoomButton.setAttribute('aria-label','Ampliar imagen'); galleryView.scrollTo(0,0); }
function showImage(index) {
  imageIndex = (index + images.length) % images.length;
  const image = images[imageIndex]; resetZoom();
  galleryImage.width = image.width; galleryImage.height = image.height;
  galleryImage.onload = () => { animationsFor(galleryImage).forEach(a=>a.cancel()); motion(galleryImage,[{opacity:.3},{opacity:1}],{duration:260,easing:'ease-out'}); };
  galleryImage.src=image.src;galleryImage.alt=image.alt;
  document.querySelector('#knife-gallery-counter').textContent=`${imageIndex+1} / ${images.length}`;
  document.querySelector('#knife-gallery-caption').textContent=image.caption;
}
document.querySelectorAll('[data-photo]').forEach(link=>link.addEventListener('click',event=>{
  if(!supportsDialog) return;
  event.preventDefault();showImage(Number(link.dataset.photo));openDialog(galleryDialog,link);document.querySelector('.knife-close').focus();
}));
document.querySelector('.knife-close').addEventListener('click',()=>closeDialog(galleryDialog));
document.querySelector('.knife-prev').addEventListener('click',()=>showImage(imageIndex-1));
document.querySelector('.knife-next').addEventListener('click',()=>showImage(imageIndex+1));
zoomButton.addEventListener('click',()=>{const active=galleryView.classList.toggle('is-zoomed');zoomButton.setAttribute('aria-pressed',String(active));zoomButton.setAttribute('aria-label',active?'Restaurar tamaño de imagen':'Ampliar imagen');});
galleryDialog.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();showImage(imageIndex+(event.key==='ArrowRight'?1:-1));}});
let touchStart=null;
galleryView.addEventListener('touchstart',event=>{touchStart=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
galleryView.addEventListener('touchend',event=>{if(!touchStart)return;const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;touchStart=null;if(!galleryView.classList.contains('is-zoomed')&&Math.abs(dx)>70&&Math.abs(dx)>1.5*Math.abs(dy))showImage(imageIndex+(dx<0?1:-1));},{passive:true});
// Visible by default, no scroll handlers, no forced page scrolling or layout reads.
if ('IntersectionObserver' in window) {
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting){entry.target.dataset.inView='false';return;}
   if(entry.target.dataset.inView==='true')return;
   entry.target.dataset.inView='true';
   const targets=entry.target.matches('.knife-type-list,.knife-method')?[...entry.target.children]:[entry.target];
   targets.forEach((target,index)=>{animationsFor(target).forEach(a=>a.cancel());motion(target,[{opacity:.3,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:600,delay:Math.min(index,2)*80,fill:'backwards',easing:'cubic-bezier(.2,.65,.2,1)'});});
 }),{threshold:.08});
 document.querySelectorAll('.knife-hero-visual,.knife-types-heading,.knife-type-list,.knife-approach-lead,.knife-method,.japan-copy,.japan-drawing,.knife-gallery,.knife-bring,.knife-faq,.knife-contact').forEach(el=>observer.observe(el));
}
