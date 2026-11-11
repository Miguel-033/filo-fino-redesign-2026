// Pointer events cover mouse, pen, and touch in the same preview frame.
export function bindReorder(handle, source, items, move, openControls) {
  const doc = handle.ownerDocument;
  const view = doc.defaultView;
  let drag;
  let suppressClick = false;

  function locate() {
    const hit = doc.elementFromPoint(drag.x, drag.y);
    const target = items().find(item => item !== source && item.contains(hit));
    if (drag.target !== target) {
      drag.target?.removeAttribute('data-editor-drop');
      target?.setAttribute('data-editor-drop', '');
      drag.target = target;
    }
  }

  function autoScroll() {
    if (!drag?.moving) return;
    const edge = 48;
    const bottom = view.innerHeight - edge;
    const distance = drag.y < edge ? drag.y - edge : drag.y > bottom ? drag.y - bottom : 0;
    if (distance) {
      view.scrollBy(0, Math.sign(distance) * Math.min(15, Math.ceil(Math.abs(distance) / 4)));
      locate();
    }
    drag.frame = view.requestAnimationFrame(autoScroll);
  }

  function end(event) {
    if (drag?.id !== event.pointerId) return;
    const { frame, moving, target } = drag;
    drag = null;
    view.cancelAnimationFrame(frame);
    source.removeAttribute('data-editor-dragging');
    target?.removeAttribute('data-editor-drop');
    if (moving) {
      suppressClick = true;
      if (target && event.type === 'pointerup') move(source, target);
    }
  }

  handle.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick = false;
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY };
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    drag.x = event.clientX;
    drag.y = event.clientY;
    if (!drag.moving && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) >= 6) {
      drag.moving = true;
      source.setAttribute('data-editor-dragging', '');
      autoScroll();
    }
    if (drag.moving) locate();
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(type, end);
  handle.addEventListener('click', () => {
    if (!suppressClick) openControls();
    suppressClick = false;
  });
  handle.addEventListener('keydown', event => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const siblings = items();
    const step = ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 1;
    const target = siblings[siblings.indexOf(source) + step];
    if (target) move(source, target);
  });
}
