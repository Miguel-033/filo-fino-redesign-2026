'use strict';
// Native dialog supplies focus containment and Escape. No menu/global modal state.
(() => {
  const dialog = document.querySelector('#shipping-dialog');
  const trigger = document.querySelector('#shipping-open');
  if (!dialog || !trigger || typeof dialog.showModal !== 'function') return;
  let saved = null;
  const restore = () => {
    if (!saved) return;
    const state = saved;
    saved = null;
    for (const [property, value, priority] of state.styles) {
      if (value) document.body.style.setProperty(property, value, priority);
      else document.body.style.removeProperty(property);
    }
    trigger.focus({ preventScroll: true });
    window.scrollTo({ top: state.y, left: state.x, behavior: 'instant' });
  };
  trigger.addEventListener('click', () => {
    if (dialog.open) return;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    saved = {
      x: window.scrollX, y: window.scrollY,
      styles: ['overflow', 'padding-right'].map(property => [property, document.body.style.getPropertyValue(property), document.body.style.getPropertyPriority(property)])
    };
    const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    if (gutter) document.body.style.paddingRight = `${padding + gutter}px`;
    dialog.querySelector('.shipping-dialog-scroll').scrollTop = 0;
    dialog.querySelector('.shipping-close').focus({ preventScroll: true });
  });
  dialog.querySelector('.shipping-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', restore);
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const first = dialog.querySelector('.shipping-close');
    const last = dialog.querySelector('.shipping-dialog-foot a');
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  window.addEventListener('pageshow', () => { if (!dialog.open) restore(); });
})();
