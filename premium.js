'use strict';

// Progressive enhancement: useful copy, links and all process stages stay in HTML.
document.documentElement.classList.add('has-js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches) document.getAnimations().forEach(animation => animation.cancel());
});
const menu = document.querySelector('#menu-dialog');
const gallery = document.querySelector('#gallery-dialog');
let returnFocus = null;

function animate(element, frames, options) {
  if (!reduceMotion.matches && typeof element.animate === 'function') {
    return element.animate(frames, options);
  }
}

function openModal(dialog, trigger) {
  returnFocus = trigger;
  dialog.showModal();
  document.body.classList.add('modal-open');
}

function closeModal(dialog) {
  dialog.close();
}

[menu, gallery].forEach(dialog => {
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    returnFocus?.focus({ preventScroll: true });
  });
});

document.querySelector('.menu-trigger').addEventListener('click', event => {
  openModal(menu, event.currentTarget);
  animate(menu, [
    { transform: 'translateX(100%)' },
    { transform: 'none' }
  ], { duration: 420, easing: 'cubic-bezier(.22,.7,.2,1)' });
  menu.querySelectorAll('nav > a, .menu-future').forEach((item, index) => {
    animate(item, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], {
      duration: 350, delay: 100 + index * 35, fill: 'backwards', easing: 'ease-out'
    });
  });
});
document.querySelector('.menu-close').addEventListener('click', () => closeModal(menu));
menu.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) returnFocus = target;
    closeModal(menu);
    if (!target) return;
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    history.replaceState(null, '', link.getAttribute('href'));
  });
});

const photographs = [
  { src: 'assets/images/revision.webp', alt: 'Un cuchillo sostenido a mano en el taller', caption: 'Cuchillos / La pieza, en detalle' },
  { src: 'assets/images/manicura.webp', alt: 'Detalle de una herramienta de manicura entre manos enguantadas', caption: 'Manicura / Pequeña escala' },
  { src: 'assets/images/prueba-tijeras.webp', alt: 'Tijeras durante una prueba de corte de cabello', caption: 'Peluquería / Comprobar el corte' }
];
let photographIndex = 0;
const galleryImage = document.querySelector('#gallery-image');
const galleryView = document.querySelector('.gallery-view');
const zoomButton = document.querySelector('.gallery-zoom');

function resetZoom() {
  galleryView.classList.remove('is-zoomed');
  zoomButton.setAttribute('aria-pressed', 'false');
  zoomButton.setAttribute('aria-label', 'Ampliar imagen');
  galleryView.scrollTo(0, 0);
}

function showPhotograph(index) {
  photographIndex = (index + photographs.length) % photographs.length;
  const photo = photographs[photographIndex];
  resetZoom();
  galleryImage.src = photo.src;
  galleryImage.alt = photo.alt;
  document.querySelector('#gallery-caption').textContent = photo.caption;
  document.querySelector('#gallery-counter').textContent = `${photographIndex + 1} / ${photographs.length}`;
  animate(galleryImage, [{ opacity: .3, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], {
    duration: 240, easing: 'ease-out'
  });
}

document.querySelectorAll('.gallery-open').forEach(button => {
  button.addEventListener('click', () => {
    showPhotograph(Number(button.dataset.gallery));
    openModal(gallery, button);
    document.querySelector('.gallery-close').focus();
  });
});
document.querySelector('.gallery-close').addEventListener('click', () => closeModal(gallery));
document.querySelector('.gallery-prev').addEventListener('click', () => showPhotograph(photographIndex - 1));
document.querySelector('.gallery-next').addEventListener('click', () => showPhotograph(photographIndex + 1));
zoomButton.addEventListener('click', () => {
  const zoomed = galleryView.classList.toggle('is-zoomed');
  zoomButton.setAttribute('aria-pressed', String(zoomed));
  zoomButton.setAttribute('aria-label', zoomed ? 'Restaurar tamaño de imagen' : 'Ampliar imagen');
});
gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    showPhotograph(photographIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
let touchStart = null;
galleryView.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
}, { passive: true });
galleryView.addEventListener('touchend', event => {
  if (!touchStart || galleryView.classList.contains('is-zoomed')) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhotograph(photographIndex + (dx < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });

const stages = [
  { src: 'assets/images/taller.webp', alt: 'Interior del taller, donde se recibe la herramienta', caption: '01 / Recepción · Archivo del taller' },
  { src: 'assets/images/revision.webp', alt: 'Cuchillo en la mano para observar la pieza', caption: '02 / Revisión · Archivo del taller' },
  { src: 'assets/images/afilado.webp', alt: 'Manos trabajando el filo de un cuchillo', caption: '03 / Afilado · Archivo del taller' },
  { src: 'assets/images/prueba-tijeras.webp', alt: 'Prueba de corte con unas tijeras', caption: '04 / Comprobación · Archivo del taller' }
];
const processImage = document.querySelector('#process-image');
document.querySelectorAll('.step-button').forEach((button, index) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.process-stage').forEach((stage, stageIndex) => {
      stage.classList.toggle('is-current', stageIndex === index);
      stage.querySelector('button').setAttribute('aria-pressed', String(stageIndex === index));
    });
    processImage.src = stages[index].src;
    processImage.alt = stages[index].alt;
    document.querySelector('#process-caption').textContent = stages[index].caption;
    document.querySelector('.process-line span').style.transform = `scaleY(${(index + 1) / stages.length})`;
    animate(processImage, [{ opacity: .35, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], {
      duration: 350, easing: 'cubic-bezier(.2,.6,.2,1)'
    });
  });
});

// One coordinated opening; the page never depends on an animation to reveal copy.
animate(document.querySelector('.hero h1'), [{ opacity: .6, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], {
  duration: 650, easing: 'cubic-bezier(.2,.6,.2,1)'
});
animate(document.querySelector('.hero-photo'), [{ opacity: .45, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }], {
  duration: 750, easing: 'cubic-bezier(.2,.6,.2,1)'
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animate(entry.target, [{ transform: 'translateY(16px)' }, { transform: 'none' }], { duration: 600, easing: 'ease-out' });
      observer.unobserve(entry.target);
    });
  }, { threshold: .15 });
  document.querySelectorAll('.craft-photo, .gallery-main, .visit-photo').forEach(item => observer.observe(item));
}
