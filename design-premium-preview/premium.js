'use strict';

document.documentElement.classList.add('has-js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motion = window.FiloFinoMotion;
const media = window.FiloFinoMedia;
const menu = document.querySelector('#menu-dialog');
const gallery = document.querySelector('#gallery-dialog');
const focusOrigins = new WeakMap();
const closingModals = new WeakMap();
let menuNavigation = 0;

const whatsappMessages = Object.freeze({
  general: 'Hola, tengo una consulta sobre el afilado de una herramienta. ¿Te puedo enviar unas fotos? [Filo Fino · Web]',
  knives: 'Hola, me gustaría afilar mis cuchillos. ¿Te puedo enviar unas fotos para consultar? [Filo Fino · Web]',
  japanese: 'Hola, tengo un cuchillo japonés y me gustaría saber si puedes afilarlo. ¿Te puedo enviar unas fotos? [Filo Fino · Web]',
  hair: 'Hola, tengo unas tijeras de peluquería que no cortan bien. ¿Te puedo enviar unas fotos para consultar? [Filo Fino · Web]',
  manicure: 'Hola, me gustaría consultar sobre el afilado de mis herramientas de manicura. ¿Te puedo enviar unas fotos? [Filo Fino · Web]'
});
function whatsappURL(context = 'general') {
  return `https://wa.me/34614005053?text=${encodeURIComponent(whatsappMessages[context] || whatsappMessages.general)}`;
}
document.querySelectorAll('[data-wa-context]').forEach(link => {
  link.href = whatsappURL(link.dataset.waContext);
});
// Deterministic link templates, no analytics, network request or automatic message.
window.FiloFinoContact = Object.freeze({ messages: whatsappMessages, url: whatsappURL });

function openModal(dialog, trigger) {
  if (dialog.open) return;
  focusOrigins.set(dialog, trigger);
  dialog.showModal();
  document.body.classList.add('modal-open');
}
function closeModal(dialog) {
  if (!dialog.open) return Promise.resolve();
  const pending = closingModals.get(dialog);
  if (pending) return pending;
  const state = getComputedStyle(dialog);
  const from = { opacity: state.opacity, transform: state.transform };
  const task = (async () => {
    const animation = motion.play(dialog,
      [from, { opacity: .35, transform: dialog === menu ? 'translateX(7%)' : 'translateY(12px)' }],
      { duration: 180, easing: 'ease-in' });
    if (animation) await animation.finished.catch(() => {});
    dialog.close();
  })();
  closingModals.set(dialog, task);
  task.finally(() => closingModals.delete(dialog));
  return task;
}
[menu, gallery].forEach(dialog => {
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeModal(dialog);
  });
  dialog.addEventListener('close', () => {
    if (!menu.open && !gallery.open) document.body.classList.remove('modal-open');
    focusOrigins.get(dialog)?.focus({ preventScroll: true });
  });
});

document.querySelector('.menu-trigger').addEventListener('click', event => {
  openModal(menu, event.currentTarget);
  motion.play(menu,
    [{ transform: 'translateX(100%)' }, { transform: 'none' }],
    { duration: 520, easing: 'cubic-bezier(.2,.75,.2,1)' });
  menu.querySelectorAll('nav > a, .menu-future').forEach((item, index) => {
    motion.play(item,
      [{ opacity: .3, transform: 'translateX(38px)' }, { opacity: 1, transform: 'none' }],
      { duration: 420, delay: 100 + index * 45, fill: 'backwards', easing: 'cubic-bezier(.2,.7,.2,1)' });
  });
  motion.play(menu.querySelector('.menu-photo'),
    [{ transform: 'translateX(20px) scale(.95)', opacity: .4 }, { transform: 'none', opacity: 1 }],
    { duration: 680, delay: 180, fill: 'backwards', easing: 'ease-out' });
});
document.querySelector('.menu-close').addEventListener('click', () => closeModal(menu));
menu.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', async event => {
    event.preventDefault();
    const navigation = ++menuNavigation;
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.setAttribute('tabindex', '-1');
      focusOrigins.set(menu, target);
    }
    await closeModal(menu);
    if (!target || navigation !== menuNavigation) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    history.replaceState(null, '', link.getAttribute('href'));
  });
});

// The carousel uses stable IDs and a manifest independent of the three homepage previews.
const photographs = media.gallery;
let photographIndex = 0;
let photographRequest = 0;
const galleryImage = document.querySelector('#gallery-image');
const galleryView = document.querySelector('.gallery-view');
const zoomButton = document.querySelector('.gallery-zoom');
const thumbnailNav = document.querySelector('.gallery-thumbnails');
const galleryConsult = document.querySelector('.gallery-consult');
const thumbnailButtons = photographs.map((photo, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gallery-thumbnail';
  button.setAttribute('aria-label', `Ver fotografía ${index + 1}: ${photo.caption}`);
  const image = document.createElement('img');
  image.src = photo.src;
  image.alt = '';
  image.width = photo.width;
  image.height = photo.height;
  image.loading = 'lazy';
  button.append(image);
  button.addEventListener('click', () => showPhotograph(index, index >= photographIndex ? 1 : -1));
  thumbnailNav.append(button);
  return button;
});

function resetZoom() {
  galleryView.classList.remove('is-zoomed');
  zoomButton.setAttribute('aria-pressed', 'false');
  zoomButton.setAttribute('aria-label', 'Ampliar imagen');
  galleryView.scrollTo(0, 0);
}
async function showPhotograph(index, direction = 1, immediate = false) {
  if (!photographs.length) return;
  const request = ++photographRequest;
  photographIndex = (index + photographs.length) % photographs.length;
  const photo = photographs[photographIndex];
  document.querySelector('#gallery-caption').textContent = photo.caption;
  document.querySelector('#gallery-counter').textContent = `${photographIndex + 1} / ${photographs.length}`;
  galleryConsult.dataset.waContext = photo.whatsappContext || 'general';
  galleryConsult.href = whatsappURL(galleryConsult.dataset.waContext);
  thumbnailButtons.forEach((button, i) => {
    if (i === photographIndex) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  galleryView.setAttribute('aria-busy', 'true');
  if (!immediate) {
    const exit = motion.play(galleryImage,
      [{ opacity: 1, transform: 'none' }, { opacity: .2, transform: `translateX(${-direction * 20}px)` }],
      { duration: 130, easing: 'ease-in' });
    if (exit) await exit.finished.catch(() => {});
  }
  if (request !== photographRequest) return;
  resetZoom();
  galleryImage.src = photo.src;
  galleryImage.alt = photo.alt;
  galleryImage.width = photo.width;
  galleryImage.height = photo.height;
  await galleryImage.decode().catch(() => {});
  if (request !== photographRequest) return;
  galleryView.setAttribute('aria-busy', 'false');
  motion.play(galleryImage,
    [{ opacity: .35, transform: `translateX(${direction * 22}px)` }, { opacity: 1, transform: 'none' }],
    { duration: 280, easing: 'cubic-bezier(.2,.65,.2,1)' });
}
document.querySelectorAll('.gallery-open').forEach(button => {
  button.addEventListener('click', () => {
    const index = photographs.findIndex(photo => photo.id === button.dataset.gallery);
    showPhotograph(index < 0 ? 0 : index, 1, true);
    openModal(gallery, button);
    document.querySelector('.gallery-close').focus();
  });
});
gallery.addEventListener('close', () => {
  photographRequest++;
  galleryView.setAttribute('aria-busy', 'false');
  resetZoom();
});
document.querySelector('.gallery-close').addEventListener('click', () => closeModal(gallery));
document.querySelector('.gallery-prev').addEventListener('click', () => showPhotograph(photographIndex - 1, -1));
document.querySelector('.gallery-next').addEventListener('click', () => showPhotograph(photographIndex + 1, 1));
zoomButton.addEventListener('click', () => {
  const zoomed = galleryView.classList.toggle('is-zoomed');
  zoomButton.setAttribute('aria-pressed', String(zoomed));
  zoomButton.setAttribute('aria-label', zoomed ? 'Restaurar tamaño de imagen' : 'Ampliar imagen');
});
gallery.addEventListener('keydown', event => {
  if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Home') showPhotograph(0, -1);
  else if (event.key === 'End') showPhotograph(photographs.length - 1, 1);
  else showPhotograph(photographIndex + (event.key === 'ArrowRight' ? 1 : -1), event.key === 'ArrowRight' ? 1 : -1);
});
let touchStart = null;
galleryView.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
}, { passive: true });
galleryView.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
galleryView.addEventListener('touchend', event => {
  const start = touchStart;
  touchStart = null;
  if (!start || galleryView.classList.contains('is-zoomed') || !event.changedTouches.length) return;
  const dx = event.changedTouches[0].clientX - start.x;
  const dy = event.changedTouches[0].clientY - start.y;
  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    showPhotograph(photographIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }
}, { passive: true });

const stages = media.process;
const processImage = document.querySelector('#process-image');
const stageButtons = [...document.querySelectorAll('.step-button')];
let stageRequest = 0;
async function showStage(index) {
  const stage = stages[index];
  if (!stage) return;
  const request = ++stageRequest;
  stageButtons.forEach((button, i) => {
    button.setAttribute('aria-pressed', String(i === index));
    button.closest('.process-stage').classList.toggle('is-current', i === index);
  });
  document.querySelector('#process-caption').textContent = stage.caption;
  document.querySelector('.process-line span').style.transform = `scaleY(${(index + 1) / stages.length})`;
  const exit = motion.play(processImage,
    [{ opacity: 1, transform: 'none' }, { opacity: .25, transform: 'translateX(-10px)' }],
    { duration: 120, easing: 'ease-in' });
  if (exit) await exit.finished.catch(() => {});
  if (request !== stageRequest) return;
  processImage.src = stage.src;
  processImage.alt = stage.alt;
  processImage.width = stage.width;
  processImage.height = stage.height;
  processImage.style.objectFit = stage.fit || 'contain';
  processImage.style.objectPosition = stage.position || 'center';
  await processImage.decode().catch(() => {});
  if (request !== stageRequest) return;
  motion.play(processImage,
    [{ opacity: .35, transform: 'translateX(14px)' }, { opacity: 1, transform: 'none' }],
    { duration: 360, easing: 'cubic-bezier(.2,.7,.2,1)' });
}
stageButtons.forEach((button, index) => {
  button.addEventListener('click', () => showStage(index));
  button.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + stageButtons.length) % stageButtons.length;
    stageButtons[next].focus();
    showStage(next);
  });
});
