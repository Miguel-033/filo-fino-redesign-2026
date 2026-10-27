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
function animate(element, frames, options) {
  if (!reduceMotion.matches && typeof element.animate === 'function') {
    return element.animate(frames, options);
  }
}

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
      const cards = entry.target.matches('.intake-grid') ? [...entry.target.children] : [entry.target];
      cards.forEach((item, index) => {
        item.getAnimations().forEach(animation => animation.cancel());
        animate(item, [{ opacity: .25, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: index * 85, fill: 'backwards', easing: 'cubic-bezier(.2,.65,.2,1)' });
      });
      const graphic = entry.target.querySelector('.craft-rule, .process-line span, .address-line');
      if (graphic) animate(graphic, [{ opacity: .2, transform: 'scaleY(.2)' }, { opacity: 1, transform: 'none' }], {duration: 800, easing: 'ease-out'});
    });
  }, { threshold: .08 });
  document.querySelectorAll('.section-heading, .craft-lead, .intake-grid, .japanese-note, .process-layout, .visit-top, .visit-layout, .footer-top, .footer-grid').forEach(item => observer.observe(item));
}
