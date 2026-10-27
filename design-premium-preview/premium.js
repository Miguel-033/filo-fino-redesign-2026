'use strict';

// Progressive enhancement: useful copy, links and all process stages stay in HTML.
document.documentElement.classList.add('has-js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches) document.getAnimations().forEach(animation => animation.cancel());
});
// One message system; static HTML hrefs are equivalent no-JS fallbacks.
const whatsappPrefix = '[Filo Fino · Web]';
const whatsappMessages = {
  "general": "Hola, tengo una consulta sobre el afilado de una herramienta. ¿Te puedo enviar una foto?",
  "knives": "Hola, me gustaría afilar mis cuchillos. ¿Te puedo enviar unas fotos para consultar el trabajo y el plazo?",
  "japanese": "Hola, tengo un cuchillo japonés y me gustaría saber si puedes afilarlo. ¿Te puedo enviar unas fotos?",
  "hair": "Hola, quisiera consultar el afilado y ajuste de mis tijeras. ¿Te puedo enviar unas fotos y contarte para qué las utilizo?",
  "manicure": "Hola, me gustaría revisar mis herramientas de manicura. ¿Te puedo enviar unas fotos y contarte qué les ocurre?"
};
document.querySelectorAll('[data-whatsapp]').forEach(link => {
  const message = whatsappMessages[link.dataset.whatsapp];
  if (message) link.href = `https://wa.me/34614005053?text=${encodeURIComponent(`${whatsappPrefix}\n${message}`)}`;
});
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

[gallery].forEach(dialog => {
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    returnFocus?.focus({ preventScroll: true });
  });
});

// Add reviewed owner photos here; retain the first three preview indexes.
const photographs = [
  {
    "src": "assets/illustrations/knife-study.svg",
    "alt": "Ilustración de un cuchillo de cocina",
    "caption": "Cuchillos / La forma sigue al uso"
  },
  {
    "src": "assets/images/manicura.webp",
    "alt": "Alicate de manicura entre manos enguantadas",
    "caption": "Manicura / La pieza, en detalle"
  },
  {
    "src": "assets/images/tijeras.webp",
    "alt": "Prueba de corte de unas tijeras sobre un mechón",
    "caption": "Tijeras / Una prueba de corte"
  }
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
  galleryImage.onload = () => {
    galleryImage.getAnimations().forEach(animation => animation.cancel());
    animate(galleryImage, [{ opacity: .25, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
  };
  galleryImage.src = photo.src;
  galleryImage.alt = photo.alt;
  document.querySelector('#gallery-caption').textContent = photo.caption;
  document.querySelector('#gallery-counter').textContent = `${photographIndex + 1} / ${photographs.length}`;

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

// Original vector studies, not photos or a documented customer commission.
const stages = [
  {
    "src": "assets/illustrations/escuchar.svg",
    "alt": "Conversación sobre la herramienta apoyada en la mesa",
    "stageCaption": "01 / Escuchar · El uso y lo que notas al cortar"
  },
  {
    "src": "assets/illustrations/revisar.svg",
    "alt": "Inspección visual del filo con una lupa sin tocar el corte",
    "stageCaption": "02 / Revisar · El estado, la geometría y el ajuste"
  },
  {
    "src": "assets/illustrations/afilar.svg",
    "alt": "Afilado ilustrativo sobre piedra: mano en el mango y apoyo en la cara de la hoja",
    "stageCaption": "03 / Afilar · Trabajo adaptado a cada herramienta"
  },
  {
    "src": "assets/illustrations/comprobar.svg",
    "alt": "Prueba de corte en papel con la mano de sujeción alejada del recorrido del cuchillo",
    "stageCaption": "04 / Comprobar · Una prueba adecuada a la pieza"
  }
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
    document.querySelector('#process-caption').textContent = stages[index].stageCaption;
    document.querySelector('.process-line span').style.transform = `scaleY(${(index + 1) / stages.length})`;
    processImage.getAnimations().forEach(animation => animation.cancel());
    animate(processImage, [{ opacity: .3, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], {duration: 380, easing: 'ease-out'});
  });
});

// One coordinated opening; the page never depends on an animation to reveal copy.
animate(document.querySelector('.hero h1'), [{ opacity: .25, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }], {
  duration: 650, easing: 'cubic-bezier(.2,.6,.2,1)'
});
animate(document.querySelector('.hero-photo'), [{ opacity: .25, transform: 'translateX(44px)' }, { opacity: 1, transform: 'none' }], {
  duration: 750, easing: 'cubic-bezier(.2,.6,.2,1)'
});
// Replay only after leaving the viewport: readable even without JS/observer.
// No scroll handlers or layout reads; at most one group of cards moves together.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) { entry.target.dataset.inView = 'false'; return; }
      if (entry.target.dataset.inView === 'true') return;
      entry.target.dataset.inView = 'true';
      const cards = entry.target.matches('.service-composition, .intake-grid') ? [...entry.target.children] : [entry.target];
      cards.forEach((item, index) => {
        item.getAnimations().forEach(animation => animation.cancel());
        animate(item, [{ opacity: .25, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: index * 85, fill: 'backwards', easing: 'cubic-bezier(.2,.65,.2,1)' });
      });
      const graphic = entry.target.querySelector('.craft-rule, .process-line span, .address-line');
      if (graphic) animate(graphic, [{ opacity: .2, transform: 'scaleY(.2)' }, { opacity: 1, transform: 'none' }], {duration: 800, easing: 'ease-out'});
    });
  }, { threshold: .08 });
  document.querySelectorAll('.section-heading, .service-composition, .craft-lead, .intake-grid, .japanese-note, .gallery-composition, .process-layout, .visit-top, .visit-layout, .footer-top, .footer-grid').forEach(item => observer.observe(item));
  // Approved touch hints live only on the large service cards; respect reduced motion.
  const hints = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.classList.toggle('hint-visible', entry.isIntersecting);
  }), {threshold: .4});
  document.querySelectorAll('.service-link').forEach(card => hints.observe(card));
}

// Native disclosures stay useful without JavaScript; motion is enhancement only.
document.querySelectorAll('.service-detail').forEach(detail => {
  detail.addEventListener('toggle', () => {
    if (detail.open) animate(detail.querySelector('p'), [
      { opacity: .35, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }
    ], { duration: 280, easing: 'ease-out' });
  });
});
document.querySelectorAll('[data-photo-count]').forEach(item => { item.textContent = photographs.length; });
