import { block, blockNames, card, categories, mediaItem, mediaMarkup } from './templates.mjs';
import { bindReorder } from './reorder.mjs';

const $ = id => document.getElementById(id);
const ui = {
  page: $('page'), preview: $('preview'), undo: $('undo'), save: $('save'), status: $('status'),
  frame: $('canvas'), result: $('result'), dialog: $('dialog'), title: $('dialog-title'),
  fields: $('fields'), form: $('form'), formStatus: $('form-status'), itemActions: $('item-actions'),
  apply: $('apply'), cancel: $('cancel'), photos: $('photos'),
  publish: $('publish'), publication: $('publication'), publishStatus: $('publish-status'), publishLinks: $('publish-links'),
};
const accept = {
  image: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
  video: '.mov,.mp4,.m4v,.webm,.avi,.mkv,.mpeg,.mpg,.ogv,.mts,.m2ts,.wmv,video/*',
};
const editorCss = `
  .editor-bar { display:flex; flex-wrap:wrap; gap:6px; align-items:center; justify-content:center;
    margin:0; padding:5px; background:#202e33; border-block:1px dashed #667579; color:#f2f4f4; font:14px/1.4 system-ui,sans-serif }
  .editor-bar button { border:1px solid #697b80; border-radius:4px; padding:5px 9px; min-height:33px;
    color:#f2f4f4; background:#273a40; font:inherit; cursor:pointer }
  .editor-bar button:hover,.editor-bar button:focus-visible { outline:2px solid #e6bd80; outline-offset:1px }
  .editor-bar button:disabled { opacity:.45; cursor:default }
  .editor-bar button:first-child { color:#ffda9c }
  [data-editor-position] { position:relative }
  .editor-drag { touch-action:none; cursor:grab !important; user-select:none; min-width:36px; min-height:34px }
  .editor-drag--overlay { position:absolute; z-index:4; inset:5px auto auto 5px; padding:3px 7px;
    background:#202e33; color:#ffda9c; border:1px solid #697b80; border-radius:4px; font:600 16px system-ui,sans-serif }
  .editor-drag--end { inset:5px 5px auto auto }
  .editor-resize { inset:5px 5px auto auto; cursor:ew-resize !important }
  .stone-photo:has(> .editor-drag--end) > .editor-resize { right:47px }
  .editor-drag:focus-visible { outline:2px solid #e6bd80; outline-offset:2px }
  [data-editor-dragging] { opacity:.65 }
  [data-editor-drop] { outline:3px solid #d6a66a; outline-offset:3px }
  [data-editor-target]:hover { outline:2px dashed #d6a66a; outline-offset:2px; cursor:pointer }
  [data-editor-target]:focus-visible { outline:2px solid #e6bd80; outline-offset:2px }
`;

let session;
let page;
let revision;
let doc;
let main;
let hero;
let original;
let media;
let dirty = false;
let busy = false;
let previewing = false;
let formAction;
let publishing = false;
let handles;
let photoEdits;
const editorNode = '[data-editor-target], [data-editor-ui], [data-editor-position], [data-editor-dragging], [data-editor-drop]';
const minMediaWidth = 80;
const maxMediaWidth = 2000;

function status(message) {
  ui.status.textContent = message;
}

function buttons() {
  ui.page.disabled = busy;
  ui.photos.disabled = busy || !doc || previewing;
  ui.preview.disabled = busy || !doc;
  ui.save.disabled = busy || !dirty;
  ui.publish.disabled = busy || publishing || dirty || !doc;
  ui.publish.title = dirty ? 'Сначала сохраните изменения локально' : '';
  ui.undo.disabled = busy || !dirty;
  ui.preview.setAttribute('aria-pressed', String(previewing));
  ui.preview.textContent = previewing ? 'Вернуться к редактированию' : 'Предпросмотр';
}

function changed() {
  dirty = true;
  status('Есть несохранённые изменения');
  buttons();
}

async function api(path, body, upload = false) {
  const headers = { 'X-Filo-Editor': session?.key || '' };
  if (body && !upload) headers['Content-Type'] = 'application/json';
  const response = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers,
    body: upload ? body : body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

function workGrid() {
  return doc.querySelector('#trabajos-reales > .real-works__grid');
}

function serviceSections() {
  return [...main.children].filter(element => element.matches('section, article, aside') && element !== hero);
}

function entries(grid) {
  return [...grid.children].filter(element => element.matches('article.real-work, figure'));
}

function pageHref(id) {
  return '/site/' + session.pages[id].path + '?editor=' + crypto.randomUUID();
}

function loadFrame(frame, url) {
  return new Promise(resolve => {
    frame.addEventListener('load', resolve, { once: true });
    frame.src = url;
  });
}

function clean(element) {
  const clone = element.cloneNode(true);
  for (const node of [clone, ...clone.querySelectorAll(editorNode + ', [data-editor-photo-index], [data-editor-details-open]')]) {
    if (node.hasAttribute('data-editor-ui')) {
      node.remove();
      continue;
    }
    for (const attribute of ['data-editor-position', 'data-editor-dragging', 'data-editor-drop', 'data-editor-photo-index']) {
      node.removeAttribute(attribute);
    }
    if (node.hasAttribute('data-editor-target')) {
      node.removeAttribute('data-editor-target');
      if (node.hasAttribute('data-editor-tab')) node.removeAttribute('tabindex');
      node.removeAttribute('data-editor-tab');
    }
    if (node.hasAttribute('data-editor-details-open')) {
      node.removeAttribute('open');
      node.removeAttribute('data-editor-details-open');
    }
  }
  return clone.outerHTML;
}

function draft() {
  const photos = [...photoEdits.values()];
  const data = [...main.querySelectorAll('[data-real-work]')]
    .map(node => media.get(node.dataset.realWork)).filter(Boolean);
  const blocks = [...main.children].filter(node => !node.hasAttribute('data-editor-ui')).map(node => {
    const saved = original.get(node);
    if (!node.matches('section, article, aside')) return { index: saved.index };
    const html = clean(node);
    if (!saved) return { html };
    return saved.html === html ? { index: saved.index } : { index: saved.index, html };
  });
  return { page, revision, media: data, photos, blocks };
}

function element(html) {
  const template = doc.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function editMode() {
  previewing = false;
  ui.frame.hidden = false;
  ui.result.hidden = true;
  if (doc) status(dirty ? 'Есть несохранённые изменения' : 'Нажмите на текст или медиа, чтобы изменить содержимое');
  buttons();
}

async function openPage(id, scrollY = null) {
  busy = true;
  buttons();
  editMode();
  status('Загружаю страницу…');
  try {
    const state = await api('/api/page?id=' + id);
    await loadFrame(ui.frame, pageHref(id));
    doc = ui.frame.contentDocument;
    main = doc.querySelector('main');
    hero = main?.querySelector(':scope > .hero');
    page = id;
    revision = state.revision;
    ui.page.value = id;
    const data = JSON.parse(doc.querySelector('#real-works-data')?.textContent || '[]');
    media = new Map(data.map(item => [item.id, item]));
    photoEdits = new Map();
    original = new Map([...main.children].map((node, index) => [node, { html: clean(node), index }]));
    const style = doc.createElement('style');
    style.textContent = editorCss;
    doc.head.append(style);
    ensureStyle('water-stones.css', 'servicios/afilado-manual-piedras-de-agua-valencia/water-stones.css');
    ensureStyle('real-works.css', 'real-works.css');
    doc.addEventListener('click', onCanvasClick, true);
    doc.addEventListener('keydown', onCanvasKey, true);
    main.querySelectorAll('details:not([open])').forEach(details => {
      details.setAttribute('data-editor-details-open', '');
      details.open = true;
    });
    refresh();
    if (scrollY !== null) ui.frame.contentWindow.scrollTo(0, scrollY);
    dirty = false;
    status('Нажмите на текст или медиа, чтобы изменить содержимое');
  } catch (error) {
    status(error.message);
  } finally {
    busy = false;
    buttons();
  }
}

function showDialog(title, fields, action, controls = []) {
  ui.title.textContent = title;
  ui.fields.replaceChildren(...fields);
  ui.itemActions.replaceChildren(...controls);
  ui.formStatus.textContent = '';
  ui.apply.hidden = !action;
  ui.apply.textContent = 'Готово';
  ui.apply.disabled = false;
  ui.cancel.disabled = false;
  formAction = action;
  if (!ui.dialog.open) ui.dialog.showModal();
  ui.fields.querySelector('input, textarea, select, button')?.focus();
}

function field(name, label, options = {}) {
  const wrapper = document.createElement('label');
  wrapper.textContent = label;
  const control = document.createElement(options.choices ? 'select' : options.long ? 'textarea' : 'input');
  control.name = name;
  control.required = Boolean(options.required);
  if (options.choices) {
    for (const choice of options.choices) control.add(new Option(choice, choice));
  } else if (options.file) {
    control.type = 'file';
    control.accept = options.file;
  } else if (options.number) {
    control.type = 'number';
    control.min = options.number.min;
    control.max = options.number.max;
  } else if (options.range) {
    control.type = 'range';
    control.min = options.range.min;
    control.max = options.range.max;
  } else {
    control.maxLength = options.long ? 4000 : 180;
  }
  if (options.value !== undefined) control.value = options.value;
  wrapper.append(control);
  return wrapper;
}

function button(label, action, options = {}) {
  const control = (options.owner || document).createElement('button');
  control.type = 'button';
  control.textContent = label;
  if (options.disabled) {
    control.disabled = true;
    control.setAttribute('data-originally-disabled', '');
  }
  if (options.danger) control.className = 'danger';
  control.addEventListener('click', action);
  return control;
}

function bar(...controls) {
  const result = doc.createElement('div');
  result.className = 'editor-bar';
  result.setAttribute('data-editor-ui', '');
  result.append(...controls);
  return result;
}

function canvasButton(label, action, options) {
  return button(label, action, { ...options, owner: doc });
}

function mark(node) {
  if (!node || node.hasAttribute('data-editor-target')) return;
  node.setAttribute('data-editor-target', '');
  if (!node.matches('a, button, summary, video, [tabindex]')) {
    node.tabIndex = 0;
    node.setAttribute('data-editor-tab', '');
  }
}

const textSelector = 'h1, h1 span, h2, h3, h4, h5, h6, p, dt, dd, li, td, th, figcaption, summary, strong, em, a, .service-cta span, .knife-hero-fact span';
function editableText(node) {
  return node.matches(textSelector) && !node.closest('nav, button, [data-real-work], [data-editor-ui]') &&
    textNodes(node).length > 0;
}

function pagePhotos() {
  return [...doc.querySelectorAll('img')].filter(image =>
    !image.closest('[data-editor-ui]') && !image.getAttribute('src')?.includes('assets/illustrations/'));
}

function assetPrefix() {
  return '../'.repeat(session.pages[page].path.split('/').length - 1);
}

function ensureStyle(name, path) {
  if (doc.querySelector('link[href*="' + name + '"]')) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = assetPrefix() + path + '?v=editor';
  doc.head.append(link);
}

function photoPatch(image, change) {
  if (image.dataset.editorPhotoIndex !== undefined) {
    const index = Number(image.dataset.editorPhotoIndex);
    photoEdits.set(index, { ...photoEdits.get(index), ...change, index });
  }
}

function usePhotoFrame(image, frame) {
  const names = ['fit', 'x', 'y', 'scale', 'width'];
  for (const name of names) {
    if (frame?.[name] == null) image.removeAttribute('data-photo-' + name);
    else image.setAttribute('data-photo-' + name, frame[name]);
  }
  for (const name of names.slice(1)) image.style.removeProperty('--photo-' + name);
  if (frame) {
    image.style.setProperty('--photo-x', frame.x + '%');
    image.style.setProperty('--photo-y', frame.y + '%');
    image.style.setProperty('--photo-scale', frame.scale / 100);
    if (frame.width) image.style.setProperty('--photo-width', frame.width + 'px');
    ensureStyle('photo-framing.css', 'photo-framing.css');
  }
  if (!image.style.length) image.removeAttribute('style');
}

function fixedPhoto(image) {
  return !!image.closest('.hero-photo, .service-link, .menu-photo, .real-work__preview') ||
    doc.defaultView.getComputedStyle(image).position === 'absolute';
}

function savedPhotoFrame(image) {
  if (!image?.dataset.photoFit) return null;
  return { fit: image.dataset.photoFit, x: Number(image.dataset.photoX), y: Number(image.dataset.photoY),
    scale: Number(image.dataset.photoScale), width: Number(image.dataset.photoWidth) || null };
}

function editPicture(image, framingOnly = false) {
  const fixed = fixedPhoto(image);
  const sample = document.createElement('div');
  sample.className = 'photo-sample';
  const preview = document.createElement('img');
  preview.alt = '';
  preview.src = image.currentSrc || image.src;
  const rect = (fixed ? image.parentElement : image).getBoundingClientRect();
  const ratio = rect.width && rect.height ? rect.width / rect.height : 1.5;
  sample.style.aspectRatio = String(ratio);
  sample.style.maxWidth = 'calc(26vh * ' + ratio + ')';
  sample.append(preview);
  const fitNames = ['Целиком', 'Заполнить рамку'];
  const computed = doc.defaultView.getComputedStyle(image);
  preview.style.filter = computed.filter;
  const position = computed.objectPosition.match(/^([\d.]+)% ([\d.]+)%$/);
  const fit = field('fit', 'Как показать фото', { choices: fitNames,
    value: (image.dataset.photoFit || computed.objectFit) === 'cover' ? fitNames[1] : fitNames[0] });
  const sliders = [
    field('scale', 'Масштаб, %', { range: { min: 50, max: 200 }, value: image.dataset.photoScale || 100 }),
    field('x', 'Положение по горизонтали, %', { range: { min: 0, max: 100 }, value: image.dataset.photoX ?? Math.round(Number(position?.[1] ?? 50)) }),
    field('y', 'Положение по вертикали, %', { range: { min: 0, max: 100 }, value: image.dataset.photoY ?? Math.round(Number(position?.[2] ?? 50)) }),
  ];
  for (const wrapper of sliders) {
    const input = wrapper.querySelector('input');
    const value = document.createElement('output');
    value.textContent = input.value + '%';
    input.addEventListener('input', () => { value.textContent = input.value + '%'; });
    wrapper.append(value);
  }
  const width = fixed || framingOnly ? null : field('width', 'Ширина фото, px (необязательно)', {
    value: image.dataset.photoWidth || '', number: { min: minMediaWidth, max: maxMediaWidth },
  });
  const file = framingOnly ? null : field('file', 'Заменить фото (необязательно)', { file: accept.image });
  const description = framingOnly ? null : field('alt', 'Описание при замене фото', { value: image.alt });
  const settings = [sample, fit, ...sliders, ...[width, file, description].filter(Boolean)];
  function readFrame(values) {
    return {
      fit: values.fit === fitNames[0] ? 'contain' : 'cover',
      x: Number(values.x), y: Number(values.y), scale: Number(values.scale),
      width: values.width ? Number(values.width) : null,
    };
  }
  function draw() {
    const frame = readFrame(Object.fromEntries(new FormData(ui.form)));
    preview.style.objectFit = frame.fit;
    preview.style.objectPosition = frame.x + '% ' + frame.y + '%';
    preview.style.transformOrigin = preview.style.objectPosition;
    preview.style.transform = 'scale(' + frame.scale / 100 + ')';
  }
  let localUrl;
  file?.querySelector('input').addEventListener('change', event => {
    if (localUrl) URL.revokeObjectURL(localUrl);
    const picked = event.target.files[0];
    localUrl = picked ? URL.createObjectURL(picked) : null;
    preview.src = localUrl || image.currentSrc || image.src;
  });
  showDialog('Кадрирование фото', settings, async values => {
    const frame = readFrame(values);
    if (values.file?.size) {
      const item = await upload(values.file, 'image');
      const replacement = { src: assetPrefix() + 'assets/editor-media/' + item.id + '/' + item.filename,
        width: item.width, height: item.height, alt: values.alt };
      for (const [name, value] of Object.entries(replacement)) image.setAttribute(name, value);
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
      photoPatch(image, { replacement });
    }
    usePhotoFrame(image, frame);
    photoPatch(image, { frame });
    changed();
  }, [button('Сбросить кадрирование', () => {
    usePhotoFrame(image, null);
    photoPatch(image, { frame: null });
    ui.dialog.close();
    changed();
  }, { disabled: !image.hasAttribute('data-photo-fit') })]);
  for (const wrapper of [fit, ...sliders]) wrapper.addEventListener('input', draw);
  ui.dialog.addEventListener('close', () => { if (localUrl) URL.revokeObjectURL(localUrl); }, { once: true });
  draw();
}

function photoMenu() {
  const list = document.createElement('div');
  list.className = 'photo-list';
  for (const [index, image] of pagePhotos().entries()) {
    const title = image.closest('.service-link, article, figure')?.querySelector('h3, .real-work__title, figcaption')?.textContent.trim();
    const label = title || image.alt || (image.closest('.hero-photo') ? 'Главное фото' : 'Фото ' + (index + 1));
    list.append(button(label, () => {
      image.scrollIntoView({ block: 'center' });
      activateTarget(image);
    }));
  }
  showDialog('Фото на странице', [list], null);
}

const gallerySelector = '[data-content-gallery], .stone-portfolio__grid';
const groupSelector = '[data-content-media-group], .stone-types__photos';

function sectionUnits(section) {
  return [...section.children].filter(node => !node.matches('[data-editor-ui], script, dialog, ' + gallerySelector));
}

function moveItem(source, target, items, focus = false) {
  const siblings = items();
  const from = siblings.indexOf(source);
  const to = siblings.indexOf(target);
  if (from < 0 || to < 0 || from === to) return;
  if (from > to) target.before(source);
  else target.after(source);
  changed();
  refresh();
  if (focus) handles.get(source)?.focus({ preventScroll: true });
  source.scrollIntoView({ block: 'nearest' });
}

function dragHandle(source, items, label, overlay = false) {
  const handle = doc.createElement('button');
  handle.type = 'button';
  handle.textContent = overlay ? '↕' : '↕ Перетащить';
  handle.className = 'editor-drag' + (overlay ? ' editor-drag--overlay' : '');
  handle.setAttribute('aria-label', label);
  handle.title = label;
  handle.setAttribute('data-editor-ui', '');
  const move = (from, to) => moveItem(from, to, items, true);
  bindReorder(handle, source, items, move, () => {
    const siblings = items();
    const index = siblings.indexOf(source);
    const step = offset => {
      ui.dialog.close();
      move(source, siblings[index + offset]);
    };
    showDialog(label, [], null, [
      button('Вверх', () => step(-1), { disabled: index < 1 }),
      button('Вниз', () => step(1), { disabled: index >= siblings.length - 1 }),
    ]);
  });
  handles.set(source, handle);
  return handle;
}

function markSortable(items, label, alignEnd = false) {
  const siblings = items();
  if (siblings.length < 2) return;
  for (const [index, node] of siblings.entries()) {
    if (node.matches('img, br, hr, source, track, input')) continue;
    if (node.matches('video')) {
      node.after(bar(dragHandle(node, items, label + ' ' + (index + 1))));
      continue;
    }
    if (doc.defaultView.getComputedStyle(node).position === 'static') node.setAttribute('data-editor-position', '');
    const handle = dragHandle(node, items, label + ' ' + (index + 1), true);
    if (alignEnd) handle.classList.add('editor-drag--end');
    node.append(handle);
  }
}

function mediaWidth(figure) {
  return Number(figure.dataset.contentMediaWidth || figure.dataset.contentPhotoWidth || 0);
}

function setMediaWidth(figure, width) {
  figure.removeAttribute('data-content-photo-width');
  figure.style.removeProperty('--content-photo-width');
  if (!width) {
    figure.removeAttribute('data-content-media-width');
    figure.style.removeProperty('--content-media-width');
    if (!figure.style.length) figure.removeAttribute('style');
    return;
  }
  figure.dataset.contentMediaWidth = String(width);
  figure.style.setProperty('--content-media-width', width + 'px');
}

function editMediaWidth(figure, kind) {
  const note = document.createElement('p');
  note.textContent = 'Оставьте поле пустым, чтобы вернуть автоматический размер. На узком экране размер подстроится под колонку.';
  showDialog('Размер ' + kind, [
    field('width', 'Ширина ' + kind + ', px', {
      value: mediaWidth(figure) || '',
      number: { min: minMediaWidth, max: maxMediaWidth },
    }),
    note,
  ], values => {
    const width = Number(values.width);
    if (width !== mediaWidth(figure)) {
      setMediaWidth(figure, width);
      changed();
    }
  });
}

function mediaResizeHandle(figure) {
  const nativeVideo = figure.matches('video');
  const inlineImage = figure.matches('img');
  const inline = nativeVideo || inlineImage;
  const kind = nativeVideo || figure.querySelector('video') ? 'видео' : 'фото';
  if (!inline && doc.defaultView.getComputedStyle(figure).position === 'static') {
    figure.setAttribute('data-editor-position', '');
  }
  const handle = doc.createElement('button');
  handle.type = 'button';
  handle.textContent = '↔';
  handle.className = inline ? 'editor-drag editor-resize' : 'editor-drag editor-drag--overlay editor-resize';
  handle.setAttribute('data-editor-ui', '');
  handle.setAttribute('aria-label', 'Размер ' + kind);
  handle.title = 'Размер ' + kind + ' — нажмите или потяните в сторону';
  let drag;
  let suppressClick = false;
  const clamp = value => Math.max(minMediaWidth, Math.min(maxMediaWidth, Math.round(value)));
  const savedWidth = () => inlineImage ? savedPhotoFrame(figure)?.width || 0 : mediaWidth(figure);
  function resize(width) {
    if (inlineImage) {
      const frame = savedPhotoFrame(figure) || { fit: 'contain', x: 50, y: 50, scale: 100 };
      usePhotoFrame(figure, { ...frame, width });
    } else setMediaWidth(figure, width);
  }
  function finish() {
    if (inlineImage) photoPatch(figure, { frame: savedPhotoFrame(figure) });
    changed();
  }

  handle.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || busy) return;
    suppressClick = false;
    drag = {
      id: event.pointerId, x: event.clientX, width: figure.getBoundingClientRect().width,
      saved: savedWidth(),
      frame: inlineImage ? savedPhotoFrame(figure) : null,
    };
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    if (!drag.moved && Math.abs(delta) < 4) return;
    drag.moved = true;
    // Resized figures are centered in their column, so the right edge travels half the width change.
    resize(clamp(drag.width + delta * 2));
  });
  function end(event) {
    if (drag?.id !== event.pointerId) return;
    const previous = drag;
    drag = null;
    if (!previous.moved) return;
    suppressClick = true;
    if (event.type !== 'pointerup') {
      if (inlineImage) usePhotoFrame(figure, previous.frame);
      else setMediaWidth(figure, previous.saved);
    } else if (previous.saved !== savedWidth()) finish();
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(type, end);
  handle.addEventListener('click', event => {
    if (!suppressClick || event.detail === 0) {
      if (inlineImage) editPicture(figure);
      else editMediaWidth(figure, kind);
    }
    suppressClick = false;
  });
  handle.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const width = figure.getBoundingClientRect().width;
    resize(clamp(width + (event.key === 'ArrowLeft' ? -16 : 16)));
    finish();
  });
  if (nativeVideo) figure.after(bar(handle, canvasButton('Заменить видео', () => editMedia(figure))));
  else if (inlineImage) figure.after(bar(handle));
  else figure.append(handle);
}

function refresh() {
  for (const item of doc.querySelectorAll('[data-editor-ui]')) item.remove();
  for (const item of doc.querySelectorAll('[data-editor-position]')) item.removeAttribute('data-editor-position');
  handles = new WeakMap();
  for (const image of pagePhotos()) {
    mark(image);
    if (main.contains(image) && !image.closest('.stone-photo') && !fixedPhoto(image)) mediaResizeHandle(image);
  }
  const homeGrid = workGrid();
  if (homeGrid) {
    const grid = homeGrid;
    grid.before(bar(canvasButton('+ Добавить работу', () => editWork(grid))));
    grid.querySelectorAll('[data-real-work]').forEach(mark);
    markSortable(() => entries(grid), 'Переместить работу');
  }
  const sections = serviceSections();
  for (const section of sections) {
    const index = sections.indexOf(section);
    section.before(bar(
      canvasButton('+ Добавить блок', () => chooseBlock(section)),
      canvasButton('Редактировать секцию', () => editSection(section), { disabled: !section.childElementCount }),
      ...(sections.length > 1 ? [dragHandle(section, serviceSections, 'Переместить секцию')] : []),
      canvasButton('Вверх', () => moveSection(section, -1), { disabled: !index }),
      canvasButton('Вниз', () => moveSection(section, 1), { disabled: index === sections.length - 1 }),
      canvasButton('Удалить блок', () => removeSection(section), { disabled: !section.textContent.trim() && !section.childElementCount }),
    ));
    markSortable(() => sectionUnits(section), 'Переместить содержимое секции', true);
    for (const group of section.querySelectorAll(groupSelector)) {
      markSortable(() => entries(group), 'Переместить фото или видео');
    }
  }
  main.append(bar(canvasButton('+ Добавить блок', () => chooseBlock(null))));
  for (const grid of main.querySelectorAll(gallerySelector)) {
    grid.before(bar(canvasButton('+ Добавить фото или видео', () => editWork(grid))));
    markSortable(() => entries(grid), 'Переместить работу');
  }
  for (const section of sections) {
    for (const figure of section.querySelectorAll('figure.stone-photo:has(img, video)')) {
      if (!figure.closest(gallerySelector)) mediaResizeHandle(figure);
    }
  }
  for (const video of main.querySelectorAll('video')) {
    if (!video.closest('.stone-photo, dialog')) mediaResizeHandle(video);
  }
  main.querySelectorAll('[data-real-work], video').forEach(node => {
    if (!node.closest('nav, [data-editor-ui]')) mark(node);
  });
  main.querySelectorAll(textSelector).forEach(node => {
    if (editableText(node)) mark(node);
  });
}

function moveSection(section, step) {
  const items = serviceSections();
  moveItem(section, items[items.indexOf(section) + step], serviceSections);
}

function removeSection(section) {
  showDialog('Удалить блок?', [], null, [
    button('Удалить', () => {
      const linked = section.id && [...doc.querySelectorAll('a[href]')].some(link =>
        link.getAttribute('href').endsWith('#' + section.id));
      if (linked) {
        const anchor = doc.createElement('section');
        anchor.id = section.id;
        anchor.setAttribute('aria-hidden', 'true');
        section.replaceWith(anchor);
      } else {
        section.remove();
      }
      ui.dialog.close();
      changed();
      refresh();
    }, { danger: true }),
  ]);
}

function chooseBlock(before) {
  const menu = Object.entries(blockNames).map(([kind, label]) =>
    button(label, () => createBlock(kind, before)));
  showDialog('Добавить блок', menu, null);
}

function editSection(section) {
  const gallery = section.querySelector(gallerySelector + ', .real-works__grid');
  const controls = gallery ? [button('Добавить фото или видео', () => editWork(gallery))] : [
    button('Добавить фото', () => addSectionMedia(section, 'image')),
    button('Добавить видео', () => addSectionMedia(section, 'video')),
  ];
  const units = sectionUnits(section);
  const visualSelector = 'figure, video, img, ' + groupSelector;
  const visual = units.find(node => node.matches(visualSelector));
  const text = units.find(node => !node.matches(visualSelector));
  if (visual && text) {
    controls.push(button('Поменять фото или видео и текст местами', () => {
      ui.dialog.close();
      moveItem(visual, text, () => sectionUnits(section), true);
    }));
  }
  const heading = section.querySelector('h2')?.textContent.trim();
  showDialog(heading ? 'Редактировать секцию · ' + heading : 'Редактировать секцию', controls, null);
}

function mediaGroup(section) {
  let group = [...section.children].find(node => node.matches(groupSelector));
  if (group) return group;
  group = doc.createElement('div');
  group.className = 'content-media-group';
  group.setAttribute('data-content-media-group', '');
  if (section.matches('.stone-types')) group.classList.add('stone-types__photos');
  const existing = [...section.children].filter(node => node.matches('figure.stone-photo'));
  if (existing.length) existing[0].before(group);
  else section.append(group);
  group.append(...existing);
  return group;
}

function addSectionMedia(section, type) {
  const photo = type === 'image';
  showDialog(photo ? 'Добавить фото в секцию' : 'Добавить видео в секцию', [
    field('file', photo ? 'Файл фотографии' : 'Файл видео', { file: accept[type], required: true }),
    field('alt', 'Описание', { required: true }),
    field('caption', 'Подпись (необязательно)'),
  ], async values => {
    const alt = values.alt.trim();
    if (!alt) throw new Error('Введите описание.');
    const uploaded = await upload(values.file, type);
    const item = mediaItem(uploaded, assetPrefix(), { title: values.caption || alt, alt });
    if (photo) media.set(item.id, item);
    const figure = element(mediaMarkup(type, item, values.caption, true));
    if (photo) setMediaWidth(figure, Math.min(560, Math.max(minMediaWidth, item.width)));
    mediaGroup(section).append(figure);
    changed();
    refresh();
    figure.scrollIntoView({ block: 'nearest' });
  });
}

function createBlock(kind, before) {
  const isPhoto = kind === 'photo' || kind === 'feature';
  const isVideo = kind === 'video';
  const fields = [];
  if (!['photo', 'video'].includes(kind)) fields.push(field('title', 'Заголовок', { required: true }));
  if (['feature', 'text', 'cta'].includes(kind)) {
    fields.push(field('subtitle', 'Подзаголовок'), field('description', 'Описание', { long: true }));
  }
  if (isPhoto || isVideo) {
    fields.push(field('file', isVideo ? 'Файл видео' : 'Файл фотографии', {
      file: isVideo ? accept.video : accept.image, required: true,
    }), field('alt', isVideo ? 'Описание видео' : 'Описание фотографии', { required: true }),
    field('caption', 'Подпись (необязательно)'));
  }
  showDialog('Добавить · ' + blockNames[kind], fields, async values => {
    let item;
    if (isPhoto || isVideo) {
      const uploaded = await upload(values.file, isPhoto ? 'image' : 'video');
      item = mediaItem(uploaded, assetPrefix(), { title: values.caption || values.alt, alt: values.alt });
      media.set(item.id, item);
    }
    const contact = doc.querySelector('.hero-actions .button-brass, a[data-whatsapp], a[href*="wa.me/"]')?.cloneNode(true);
    if (contact) contact.classList.add('button', 'button-brass');
    const section = element(block(kind, values, item, contact ? clean(contact) : ''));
    if (before) before.before(section);
    else main.append(section);
    changed();
    refresh();
    section.scrollIntoView({ block: 'nearest' });
    if (kind === 'gallery') {
      editWork(section.querySelector('[data-content-gallery]'));
      return false;
    }
  });
}

function upload(file, expected) {
  if (!file?.size) throw new Error('Выберите файл с компьютера.');
  ui.formStatus.textContent = 'Загружаю и обрабатываю файл…';
  return api('/api/upload', file, true).then(result => {
    if (expected && result.type !== expected) {
      throw new Error(expected === 'image' ? 'Выберите фотографию.' : 'Выберите видео.');
    }
    return result;
  });
}

function updateCardTitle(work, item, title) {
  if (title === (item.coverTitle || item.caption)) return item;
  work.querySelector('.real-work__title, figcaption').textContent = title;
  const link = work.querySelector('[data-real-work]');
  link.setAttribute('aria-label', (item.type === 'video' ? 'Reproducir vídeo: ' : 'Ampliar foto: ') + title);
  return { ...item, caption: title, coverTitle: title };
}

function editWork(grid, work = null) {
  const link = work?.querySelector('[data-real-work]');
  const item = media.get(link?.dataset.realWork);
  const list = entries(grid);
  const index = list.indexOf(work);
  const home = grid === workGrid();
  const title = field('title', 'Короткое название', { value: item?.coverTitle || item?.caption || '', required: true });
  const fields = [
    title,
    field('file', item ? 'Заменить фото или видео' : 'Файл фотографии или видео', {
      file: accept.image + ',' + accept.video, required: !item,
    }),
  ];
  if (home) fields.splice(1, 0, field('category', 'Категория', {
    value: work?.dataset.category || categories[0], choices: categories,
  }));
  const controls = work ? [
    button('Вверх', () => reorder(-1), { disabled: index <= 0 }),
    button('Вниз', () => reorder(1), { disabled: index >= list.length - 1 }),
    button('Удалить', () => {
      work.remove();
      if (!home && grid.closest('.stone-portfolio') && !entries(grid).length) {
        grid.className = 'stone-portfolio__grid';
        grid.removeAttribute('data-content-gallery');
      }
      ui.dialog.close();
      changed();
      refresh();
    }, { danger: true }),
  ] : [];
  const cover = work?.querySelector('img');
  if (cover) controls.unshift(button('Кадрирование', () => editPicture(cover, true)));

  function reorder(step) {
    const other = list[index + step];
    if (!other) return;
    ui.dialog.close();
    moveItem(work, other, () => entries(grid));
  }

  showDialog(work ? 'Редактировать работу' : 'Добавить работу', fields, async values => {
    values.title = values.title.trim();
    if (!values.title) throw new Error('Введите название.');
    if (values.file.size) {
      const uploaded = await upload(values.file);
      const entry = mediaItem(uploaded, assetPrefix(), { ...values, id: item?.id });
      if (item?.previewRatio) entry.previewRatio = item.previewRatio;
      if (item?.previewPosition) entry.previewPosition = item.previewPosition;
      media.set(entry.id, entry);
      const fresh = element(card(entry));
      const frame = savedPhotoFrame(cover);
      if (frame) usePhotoFrame(fresh.querySelector('img'), frame);
      if (work) work.replaceWith(fresh);
      else grid.append(fresh);
      if (!home) {
        grid.classList.replace('stone-portfolio__grid', 'real-works__grid');
        grid.setAttribute('data-content-gallery', '');
      }
    } else if (work && item) {
      media.set(item.id, updateCardTitle(work, item, values.title));
      if (home) {
        work.dataset.category = values.category;
        media.get(item.id).category = values.category;
      }
    }
    changed();
    refresh();
  }, controls);
}

function textNodes(node) {
  return [...node.childNodes].filter(child => child.nodeType === Node.TEXT_NODE && child.textContent.trim());
}

function editText(node) {
  const parts = textNodes(node);
  const fields = parts.map((part, index) => field('copy' + index,
    parts.length === 1 ? 'Текст на странице' : 'Текст на странице ' + (index + 1),
    { long: true, value: part.textContent.trim(), required: true }));
  showDialog('Редактировать текст', fields, values => {
    const text = parts.map((_, index) => values['copy' + index].trim());
    if (text.some(value => !value)) throw new Error('Введите текст.');
    for (const [index, part] of parts.entries()) {
      if (part.textContent.trim() !== text[index]) {
        part.textContent = part.textContent.replace(/\S[\s\S]*\S|\S/, () => text[index]);
      }
    }
    changed();
  });
}

function editMedia(node) {
  const link = node.closest('[data-real-work]');
  const figure = node.closest('figure.stone-photo');
  const type = node.matches('video') ? 'video' : 'image';
  const kind = type === 'image' ? 'фото' : 'видео';
  const caption = figure?.querySelector('figcaption')?.textContent || '';
  const item = media.get(link?.dataset.realWork);
  const controls = figure ? [button('Удалить ' + kind, () => {
    const group = figure.parentElement.closest(groupSelector);
    const section = figure.closest('main > section');
    figure.remove();
    if (group && !entries(group).length) group.remove();
    if (section && !sectionUnits(section).length) section.remove();
    ui.dialog.close();
    changed();
    refresh();
  }, { danger: true })] : [];
  if (figure || type === 'video') controls.unshift(button('Размер ' + kind, () => editMediaWidth(figure || node, kind)));
  if (figure && type === 'image') controls.unshift(button('Кадрирование', () => editPicture(node, true)));
  showDialog('Заменить ' + kind, [
    field('file', 'Выберите файл', { file: accept[type], required: true }),
    field('alt', 'Описание', { value: node.alt || node.getAttribute('aria-label') || '' }),
    ...(figure ? [field('caption', 'Подпись (необязательно)', { value: caption })] : []),
  ], async values => {
    const uploaded = await upload(values.file, type);
    const next = mediaItem(uploaded, assetPrefix(), {
      id: item?.id, title: values.caption || values.alt || (type === 'image' ? 'Foto' : 'Vídeo'), alt: values.alt,
    });
    if (figure) {
      const compact = Boolean(figure.closest('.stone-detail, ' + groupSelector));
      const replacement = element(mediaMarkup(type, next, values.caption, compact));
      if (mediaWidth(figure)) setMediaWidth(replacement, mediaWidth(figure));
      const frame = savedPhotoFrame(node);
      if (frame) usePhotoFrame(replacement.querySelector('img'), frame);
      figure.replaceWith(replacement);
      if (type === 'image') media.set(next.id, next);
    } else {
      node.src = next.source;
      node.removeAttribute('srcset');
      node.width = next.width;
      node.height = next.height;
      if (type === 'image') node.alt = values.alt;
      else {
        node.poster = next.poster;
        node.setAttribute('aria-label', next.alt);
        node.querySelectorAll('source').forEach(source => source.remove());
      }
    }
    changed();
    refresh();
  }, controls);
}

function activateTarget(target) {
  const work = target.closest('article.real-work, figure');
  const grid = work?.parentElement;
  if (grid?.matches('.real-works__grid, .stone-portfolio__grid') && work.querySelector('[data-real-work]')) {
    editWork(grid, work);
  } else if (target.matches('img') && !target.closest('figure.stone-photo')) {
    editPicture(target);
  } else if (target.matches('img, video')) {
    editMedia(target);
  } else if (editableText(target)) {
    editText(target);
  } else if (target.matches('[data-real-work]') && target.querySelector('img')) {
    editMedia(target.querySelector('img'));
  }
}

function onCanvasClick(event) {
  if (event.target.closest('[data-editor-ui]')) return;
  if (event.target.closest('.menu-trigger, .menu-close')) return;
  const target = event.target.closest('[data-editor-target]');
  if (target) {
    event.preventDefault();
    event.stopImmediatePropagation();
    activateTarget(target);
  } else if (event.target.closest('a, button')) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}

function onCanvasKey(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    const target = event.target.closest('[data-editor-target]');
    if (target) {
      event.preventDefault();
      activateTarget(target);
    }
  }
}

ui.form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!formAction) return;
  ui.apply.disabled = true;
  ui.cancel.disabled = true;
  for (const item of ui.itemActions.children) item.disabled = true;
  try {
    const done = await formAction(Object.fromEntries(new FormData(ui.form)));
    if (done !== false) ui.dialog.close();
  } catch (error) {
    ui.formStatus.textContent = error.message;
  } finally {
    ui.apply.disabled = false;
    ui.cancel.disabled = false;
    for (const item of ui.itemActions.children) {
      if (!item.hasAttribute('data-originally-disabled')) item.disabled = false;
    }
  }
});

ui.dialog.addEventListener('cancel', event => {
  if (ui.cancel.disabled) event.preventDefault();
});
ui.cancel.addEventListener('click', () => ui.dialog.close());
ui.photos.addEventListener('click', photoMenu);
ui.page.addEventListener('change', () => {
  if (dirty && !confirm('Отменить несохранённые изменения на этой странице?')) {
    ui.page.value = page;
    return;
  }
  openPage(ui.page.value);
});
ui.undo.addEventListener('click', () => {
  if (confirm('Отменить все несохранённые изменения?')) openPage(page);
});
ui.preview.addEventListener('click', async () => {
  if (previewing) return editMode();
  busy = true;
  buttons();
  try {
    const scroll = ui.frame.contentWindow.scrollY;
    const result = await api('/api/preview', draft());
    await loadFrame(ui.result, result.url);
    ui.result.hidden = false;
    ui.frame.hidden = true;
    ui.result.contentWindow.scrollTo(0, scroll);
    previewing = true;
    status(dirty ? 'Предпросмотр несохранённого черновика' : 'Предпросмотр сохранённой страницы');
  } catch (error) {
    status(error.message);
  } finally {
    busy = false;
    buttons();
  }
});
ui.save.addEventListener('click', async () => {
  busy = true;
  buttons();
  try {
    const scroll = ui.frame.contentWindow.scrollY;
    await api('/api/save', draft());
    dirty = false;
    await openPage(page, scroll);
    status('Сохранено локально. Для отправки в preview нажмите «Опубликовать на GitHub Pages».');
  } catch (error) {
    status(error.message);
  } finally {
    busy = false;
    buttons();
  }
});

function publication(message, links = []) {
  ui.publication.hidden = false;
  ui.publishStatus.textContent = message;
  ui.publishLinks.replaceChildren(...links.map(({ label, url }) => {
    const link = document.createElement('a');
    link.href = url;
    link.textContent = label;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }));
}

async function watchPublication(result) {
  publishing = true;
  buttons();
  try {
    while (result.state === 'building') {
      publication(result.message);
      await new Promise(resolve => setTimeout(resolve, 4000));
      const next = await api('/api/publish/status', { id: result.id });
      result = next;
    }
    const links = result.state === 'success'
      ? result.urls.map(({ label, url }) => ({ label: 'Открыть · ' + label, url }))
      : [{ label: 'Журнал GitHub Actions', url: result.actions }];
    publication(result.message + ' Коммит ' + result.sha.slice(0, 7) + '.', links);
  } catch (error) {
    publication('Не удалось проверить результат. Коммит ' + result.sha.slice(0, 7) + '. ' + error.message,
      [{ label: 'Журнал GitHub Actions', url: result.actions }]);
  } finally {
    publishing = false;
    buttons();
  }
}

ui.publish.addEventListener('click', async () => {
  if (dirty || publishing) return;
  busy = true;
  buttons();
  publication('Проверяю сохранённые файлы, медиа и ветку preview…');
  try {
    const result = await api('/api/publish/prepare', { page });
    if (!result.id) return publication(result.message);
    const description = document.createElement('p');
    description.textContent = 'Проверенные файлы будут отправлены в ' + result.branch + ' для GitHub Pages preview.';
    const files = document.createElement('ul');
    files.className = 'publish-files';
    for (const file of result.files) {
      const item = document.createElement('li');
      item.textContent = file;
      files.append(item);
    }
    publication('Статическая сборка готова. Подтвердите публикацию.');
    showDialog('Подтвердить публикацию', [description, files], async () => {
      if (dirty) throw new Error('Сначала сохраните изменения локально и повторите проверку.');
      ui.formStatus.textContent = 'Отправляю проверенную сборку в GitHub…';
      const sent = await api('/api/publish/confirm', { id: result.id });
      void watchPublication(sent);
    });
    ui.apply.textContent = 'Подтвердить и опубликовать';
    ui.dialog.addEventListener('close', () => {
      if (!publishing) publication('Публикация отменена.');
    }, { once: true });
  } catch (error) {
    publication(error.message);
  } finally {
    busy = false;
    buttons();
  }
});
window.addEventListener('beforeunload', event => {
  if (dirty) event.preventDefault();
});

try {
  session = await api('/api/session');
  for (const [id, entry] of Object.entries(session.pages)) ui.page.add(new Option(entry.label, id));
  await openPage('stones');
  if (session.publication) void watchPublication(session.publication);
} catch (error) {
  status(error.message);
}
