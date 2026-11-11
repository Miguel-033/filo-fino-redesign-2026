'use strict';
// Native dialog enhancement; source links remain useful without JavaScript.
(() => {
  const dialog = document.querySelector('#real-works-dialog');
  const data = document.querySelector('#real-works-data');
  if (!dialog || !data || typeof dialog.showModal !== 'function') return;
  let items;
  try { items = new Map(JSON.parse(data.textContent).map(item => [item.id, item])); }
  catch { return; }
  const host = dialog.querySelector('.real-works-dialog__media');
  const title = dialog.querySelector('#real-works-view-title');
  const close = dialog.querySelector('.real-works-dialog__close');
  let saved = null;
  function releaseMedia() {
    const video = host.querySelector('video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    host.replaceChildren();
  }
  function restore() {
    releaseMedia();
    if (!saved) return;
    const state = saved;
    saved = null;
    for (const [property, value, priority] of state.styles) {
      if (value) document.body.style.setProperty(property, value, priority);
      else document.body.style.removeProperty(property);
    }
    state.trigger.focus({ preventScroll: true });
    window.scrollTo({ top: state.y, left: state.x, behavior: 'instant' });
  }
  function showError(item) {
    const message = document.createElement('p');
    message.className = 'real-works-dialog__error';
    message.textContent = 'No se ha podido cargar el archivo.';
    const link = document.createElement('a');
    link.href = item.source;
    link.textContent = 'Abrir archivo original';
    message.append(link);
    host.replaceChildren(message);
  }
  document.querySelectorAll('[data-real-work]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || dialog.open) return;
      const item = items.get(trigger.dataset.realWork);
      if (!item) return;
      event.preventDefault();
      saved = {
        trigger, x: window.scrollX, y: window.scrollY,
        styles: ['overflow', 'padding-right'].map(property => [property, document.body.style.getPropertyValue(property), document.body.style.getPropertyPriority(property)])
      };
      title.textContent = item.caption;
      releaseMedia();
      const media = document.createElement(item.type === 'video' ? 'video' : 'img');
      media.width = item.width;
      media.height = item.height;
      if (item.type === 'video') {
        media.controls = true;
        media.playsInline = true;
        media.preload = 'metadata';
        media.poster = item.poster;
        media.style.setProperty('--real-work-ratio', item.width / item.height);
        media.setAttribute('aria-label', item.caption);
      } else {
        media.alt = item.alt;
        media.decoding = 'async';
      }
      media.addEventListener('error', () => showError(item), { once: true });
      // The full-size file is assigned only after this explicit user action.
      media.src = item.source;
      host.append(media);
      const gutter = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      if (gutter) document.body.style.paddingRight = `${padding + gutter}px`;
      close.focus({ preventScroll: true });
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', event => { event.preventDefault(); dialog.close(); });
  dialog.addEventListener('close', restore);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  window.addEventListener('pageshow', () => { if (!dialog.open) restore(); });
})();
