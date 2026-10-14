'use strict';
const drawer = document.querySelector('.drawer');
const menuButton = document.querySelector('[data-menu]');
function openModal(dialog) { dialog.showModal(); document.body.classList.add('modal-open'); }
function closeModal(dialog) { dialog.close(); document.body.classList.remove('modal-open'); }
menuButton.addEventListener('click', () => openModal(drawer));
document.querySelector('[data-close]').addEventListener('click', () => closeModal(drawer));
drawer.addEventListener('close', () => document.body.classList.remove('modal-open'));
drawer.addEventListener('click', e => { if (e.target === drawer) closeModal(drawer); });
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeModal(drawer)));
const lightbox = document.querySelector('.lightbox');
const gallery = Array.from(document.querySelectorAll('.gallery-open'));
let current = 0;
function showPhoto(index) {
  current = (index + gallery.length) % gallery.length;
  const source = gallery[current].querySelector('img');
  const image = lightbox.querySelector('img');
  image.src = source.src; image.alt = source.alt;
  lightbox.querySelector('.lightbox-caption').textContent = gallery[current].dataset.caption;
}
gallery.forEach((button, i) => button.addEventListener('click', () => { showPhoto(i); openModal(lightbox); }));
lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => closeModal(lightbox));
lightbox.querySelector('[data-prev]').addEventListener('click', () => showPhoto(current - 1));
lightbox.querySelector('[data-next]').addEventListener('click', () => showPhoto(current + 1));
lightbox.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(current + (e.key === 'ArrowRight' ? 1 : -1)); }
});
lightbox.addEventListener('close', () => document.body.classList.remove('modal-open'));
const steps = ['Trae tu herramienta o consúltanos antes de venir.', 'Comprobamos el filo, el desgaste y el uso de la herramienta.', 'Afilado, ajuste o restauración según lo que necesite.', 'Revisamos el resultado antes de la entrega.'];
document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-step]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('.step-description').textContent = steps[Number(button.dataset.step)];
}));
const help = ['Para cuchillos que ya no cortan limpio, consulta nuestro servicio de afilado de cuchillos.', 'Si las tijeras tiran del pelo, consulta el servicio de peluquería.', 'Si el instrumento desgarra en lugar de cortar, consulta manicura y pedicura.'];
document.querySelectorAll('[data-symptom]').forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.symptom);
  document.querySelectorAll('[data-symptom]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('.symptom-result').textContent = help[index];
  document.querySelectorAll('.service').forEach((item, i) => item.classList.toggle('suggested', i === index));
}));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let observer;
function setupReveal() {
  if (observer) observer.disconnect();
  document.querySelectorAll('.reveal').forEach(item => item.classList.remove('reveal-ready'));
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(item => { item.classList.add('reveal-ready'); observer.observe(item); });
}
setupReveal(); reduced.addEventListener('change', setupReveal);
