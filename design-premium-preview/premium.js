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
  "hair": "Hola, quisiera consultar el afilado y ajuste de mis herramientas de peluquería. ¿Te puedo enviar unas fotos?",
  "manicure": "Hola, me gustaría revisar mis herramientas de manicura. ¿Te puedo enviar unas fotos y contarte qué les ocurre?"
};
document.querySelectorAll('[data-whatsapp]').forEach(link => {
  const message = whatsappMessages[link.dataset.whatsapp];
  if (message) link.href = `https://wa.me/34614005053?text=${encodeURIComponent(`${whatsappPrefix}\n${message}`)}`;
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

// Add reviewed owner photos here; retain the first three preview indexes.
const photographs = [
  {
    "src": "assets/images/drive/img_6874.webp",
    "alt": "Selección de cuchillos del archivo de Filo Fino",
    "caption": "Cuchillos / Distintas piezas, distintos filos"
  },
  {
    "src": "assets/images/drive/img_0734.webp",
    "alt": "Tijeras pequeñas de manicura en una mano enguantada",
    "caption": "Manicura / Herramientas en detalle"
  },
  {
    "src": "assets/images/drive/img_7653.webp",
    "alt": "Tijeras de peluquería abiertas en una mano enguantada",
    "caption": "Peluquería / Geometría y ajuste"
  },
  {
    "src": "assets/images/drive/img_7034.webp",
    "alt": "Dos cuchillos de cocina con mangos rojos",
    "caption": "Cocina / Las piezas completas"
  },
  {
    "src": "assets/images/drive/img_8001.webp",
    "alt": "Primer plano de la punta y el filo de un cuchillo",
    "caption": "Cuchillos / El filo, de cerca"
  },
  {
    "src": "assets/images/drive/img_6018.webp",
    "alt": "Detalle del bisel de un cuchillo",
    "caption": "Cuchillos / Geometría del bisel"
  },
  {
    "src": "assets/images/drive/img_1118.webp",
    "alt": "Dos piezas de un bloque de corte de máquina en una mano enguantada",
    "caption": "Máquinas / Bloque de corte desmontado"
  },
  {
    "src": "assets/images/drive/img_6463.webp",
    "alt": "Puntas de unas tijeras pequeñas en una mano enguantada",
    "caption": "Manicura / Una mirada al detalle"
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

// Illustrative archive photos, not evidence of the actual process step.
const stages = [
  {
    "src": "assets/images/drive/img_6874.webp",
    "alt": "Selección de cuchillos del archivo de Filo Fino",
    "caption": "Cuchillos / Distintas piezas, distintos filos",
    "stageCaption": "01 / Escuchar · Fotografía de referencia del archivo"
  },
  {
    "src": "assets/images/drive/img_6018.webp",
    "alt": "Detalle del bisel de un cuchillo",
    "caption": "Cuchillos / Geometría del bisel",
    "stageCaption": "02 / Revisar · Detalle del filo del archivo"
  },
  {
    "placeholder": true,
    "stageCaption": "03 / Afilar · Vídeo pendiente de incorporar"
  },
  {
    "src": "assets/images/drive/img_7653.webp",
    "alt": "Tijeras de peluquería abiertas en una mano enguantada",
    "caption": "Peluquería / Geometría y ajuste",
    "stageCaption": "04 / Comprobar · Pieza del archivo, no una prueba de corte"
  }
];
const processImage = document.querySelector('#process-image');
document.querySelectorAll('.step-button').forEach((button, index) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.process-stage').forEach((stage, stageIndex) => {
      stage.classList.toggle('is-current', stageIndex === index);
      stage.querySelector('button').setAttribute('aria-pressed', String(stageIndex === index));
    });
    const stage = stages[index];
    const placeholder = document.querySelector('#process-placeholder');
    processImage.hidden = Boolean(stage.placeholder);
    placeholder.hidden = !stage.placeholder;
    if (!stage.placeholder) {
      processImage.src = stage.src;
      processImage.alt = stage.alt;
    }
    document.querySelector('#process-caption').textContent = stage.stageCaption;
    document.querySelector('.process-line span').style.transform = `scaleY(${(index + 1) / stages.length})`;
    const visual = stage.placeholder ? placeholder : processImage;
    visual.getAnimations().forEach(animation => animation.cancel());
    animate(visual, [{ opacity: .25, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], {
      duration: 420, easing: 'cubic-bezier(.22,.7,.2,1)'
    });
  });
});

// One coordinated opening; the page never depends on an animation to reveal copy.
animate(document.querySelector('.hero h1'), [{ opacity: .25, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }], {
  duration: 650, easing: 'cubic-bezier(.2,.6,.2,1)'
});
animate(document.querySelector('.hero-photo'), [{ opacity: .25, transform: 'translateX(44px)' }, { opacity: 1, transform: 'none' }], {
  duration: 750, easing: 'cubic-bezier(.2,.6,.2,1)'
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animate(entry.target, [{ opacity: .45, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'ease-out' });
      observer.unobserve(entry.target);
    });
  }, { threshold: .15 });
  document.querySelectorAll('.section-heading, .craft-photo, .gallery-main, .visit-photo, .footer-top').forEach(item => observer.observe(item));
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
