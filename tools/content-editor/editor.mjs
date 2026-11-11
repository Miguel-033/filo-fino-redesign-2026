import { block, blockNames, card, categories, mediaItem, mediaMarkup } from './templates.mjs';
import { bindReorder } from './reorder.mjs';

const $ = id => document.getElementById(id);
const ui = {
  page: $('page'), preview: $('preview'), undo: $('undo'), save: $('save'), status: $('status'),
  frame: $('canvas'), result: $('result'), dialog: $('dialog'), title: $('dialog-title'),
  fields: $('fields'), form: $('form'), formStatus: $('form-status'), itemActions: $('item-actions'),
  apply: $('apply'), cancel: $('cancel'),
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
let originalHero;
let original;
let media;
let dirty = false;
let busy = false;
let previewing = false;
let formAction;
let publishing = false;
let handles;
const editorNode = '[data-editor-target], [data-editor-ui], [data-editor-position], [data-editor-dragging], [data-editor-drop]';

function status(message) {
  ui.status.textContent = message;
}

function buttons() {
  ui.page.disabled = busy;
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
  return [...main.children].filter(element => element.matches('section') && element !== hero);
}

function entries(grid) {
  return [...grid.children].filter(element => element.matches('article.real-work, figure'));
}

function pageHref(id) {
  return '/site/' + session.pages[id].path + '?editor=' + crypto.randomUUID() +
    (id === 'home' ? '#trabajos-reales' : '');
}

function loadFrame(frame, url) {
  return new Promise(resolve => {
    frame.addEventListener('load', resolve, { once: true });
    frame.src = url;
  });
}

function clean(element) {
  const clone = element.cloneNode(true);
  for (const node of [clone, ...clone.querySelectorAll(editorNode + ', details')]) {
    if (node.hasAttribute('data-editor-ui')) {
      node.remove();
      continue;
    }
    for (const attribute of ['data-editor-position', 'data-editor-dragging', 'data-editor-drop']) {
      node.removeAttribute(attribute);
    }
    if (node.hasAttribute('data-editor-target')) {
      node.removeAttribute('data-editor-target');
      if (node.hasAttribute('data-editor-tab')) node.removeAttribute('tabindex');
      node.removeAttribute('data-editor-tab');
    }
    if (node.matches('details')) node.removeAttribute('open');
  }
  return clone.outerHTML;
}

function draft() {
  const items = page === 'home' ? entries(workGrid()) : serviceSections();
  const active = page === 'home' ? workGrid() : main;
  const data = [...active.querySelectorAll('[data-real-work]')]
    .map(node => media.get(node.dataset.realWork)).filter(Boolean);
  const blocks = items.map(node => {
    const html = clean(node);
    return original.get(node)?.html === html ? { index: original.get(node).index } : { html };
  });
  return {
    page, revision, media: data,
    ...(page === 'home' ? { cards: blocks } :
      { sections: blocks, hero: clean(hero) === originalHero ? null : clean(hero) }),
  };
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
    hero = main.querySelector(':scope > .hero');
    page = id;
    revision = state.revision;
    ui.page.value = id;
    const data = JSON.parse(doc.querySelector('#real-works-data').textContent);
    media = new Map(data.map(item => [item.id, item]));
    originalHero = clean(hero);
    const items = id === 'home' ? entries(workGrid()) : serviceSections();
    original = new Map(items.map((node, index) => [node, { html: clean(node), index }]));
    const style = doc.createElement('style');
    style.textContent = editorCss;
    doc.head.append(style);
    doc.addEventListener('click', onCanvasClick, true);
    doc.addEventListener('keydown', onCanvasKey, true);
    if (id !== 'home') main.querySelectorAll('details').forEach(details => { details.open = true; });
    refresh();
    if (id === 'home' && scrollY == null) doc.querySelector('#trabajos-reales').scrollIntoView();
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

const textSelector = 'h1 > span, h2, h3, h4, p, dt, dd, figcaption, summary, .knife-hero-fact strong, .knife-hero-fact span';
function editableText(node) {
  return node.matches(textSelector) && !node.closest('a, button, [data-real-work], .knife-address') &&
    [...node.children].every(child => child.localName === 'svg');
}

const gallerySelector = '[data-content-gallery], .stone-portfolio__grid';
const groupSelector = '[data-content-media-group], .stone-types__photos';

function sectionUnits(section) {
  return [...section.children].filter(node => !node.matches('[data-editor-ui], ' + gallerySelector));
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
    if (doc.defaultView.getComputedStyle(node).position === 'static') node.setAttribute('data-editor-position', '');
    const handle = dragHandle(node, items, label + ' ' + (index + 1), true);
    if (alignEnd) handle.classList.add('editor-drag--end');
    node.append(handle);
  }
}

function refresh() {
  for (const item of doc.querySelectorAll('[data-editor-ui]')) item.remove();
  for (const item of doc.querySelectorAll('[data-editor-position]')) item.removeAttribute('data-editor-position');
  handles = new WeakMap();
  if (page === 'home') {
    const grid = workGrid();
    grid.before(bar(canvasButton('+ Добавить работу', () => editWork(grid))));
    grid.querySelectorAll('[data-real-work]').forEach(mark);
    markSortable(() => entries(grid), 'Переместить работу');
    return;
  }
  const sections = serviceSections();
  const end = main.querySelector(':scope > aside');
  for (const section of sections) {
    const index = sections.indexOf(section);
    section.before(bar(
      canvasButton('+ Добавить блок', () => chooseBlock(section)),
      canvasButton('Редактировать секцию', () => editSection(section), { disabled: !section.childElementCount }),
      ...(sections.length > 1 ? [dragHandle(section, serviceSections, 'Переместить секцию')] : []),
      canvasButton('Вверх', () => moveSection(section, -1), { disabled: !index }),
      canvasButton('Вниз', () => moveSection(section, 1), { disabled: index === sections.length - 1 }),
      canvasButton('Удалить блок', () => removeSection(section)),
    ));
    markSortable(() => sectionUnits(section), 'Переместить содержимое секции', true);
    for (const group of section.querySelectorAll(groupSelector)) {
      markSortable(() => entries(group), 'Переместить фото или видео');
    }
  }
  end.before(bar(canvasButton('+ Добавить блок', () => chooseBlock(end))));
  for (const grid of main.querySelectorAll(gallerySelector)) {
    grid.before(bar(canvasButton('+ Добавить фото или видео', () => editWork(grid))));
    markSortable(() => entries(grid), 'Переместить работу');
  }
  main.querySelectorAll('[data-real-work], img, video').forEach(node => {
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
      if (section.id === 'visita' && section.childElementCount) {
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
  const gallery = section.querySelector(gallerySelector);
  const controls = gallery ? [button('Добавить фото или видео', () => editWork(gallery))] : [
    button('Добавить фото', () => addSectionMedia(section, 'image')),
    button('Добавить видео', () => addSectionMedia(section, 'video')),
  ];
  const units = sectionUnits(section);
  const visual = units.find(node => node.matches('figure.stone-photo, ' + groupSelector));
  const text = units.find(node => node !== visual && !node.matches('figure.stone-photo, ' + groupSelector));
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
    const item = mediaItem(uploaded, page, { title: values.caption || alt, alt });
    if (photo) media.set(item.id, item);
    const figure = element(mediaMarkup(type, item, values.caption, true));
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
      item = mediaItem(uploaded, page, { title: values.caption || values.alt, alt: values.alt });
      media.set(item.id, item);
    }
    const contact = hero.querySelector('.hero-actions .button-brass')?.outerHTML || '';
    const section = element(block(kind, values, item, contact));
    before.before(section);
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
  const home = page === 'home';
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
      const entry = mediaItem(uploaded, page, { ...values, id: item?.id });
      media.set(entry.id, entry);
      const fresh = element(card(entry));
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

function textValue(node) {
  return [...node.childNodes].filter(child => child.nodeType === Node.TEXT_NODE)
    .map(child => child.textContent).join('').trim();
}

function editText(node) {
  showDialog('Редактировать текст', [
    field('copy', 'Текст на странице', { long: true, value: textValue(node), required: true }),
  ], values => {
    const text = values.copy.trim();
    if (!text) throw new Error('Введите текст.');
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) child.remove();
    }
    node.prepend(doc.createTextNode(text));
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
  showDialog('Заменить ' + kind, [
    field('file', 'Выберите файл', { file: accept[type], required: true }),
    field('alt', 'Описание', { value: node.alt || node.getAttribute('aria-label') || '' }),
    ...(figure ? [field('caption', 'Подпись (необязательно)', { value: caption })] : []),
  ], async values => {
    const uploaded = await upload(values.file, type);
    const next = mediaItem(uploaded, page, {
      id: item?.id, title: values.caption || values.alt || (type === 'image' ? 'Foto' : 'Vídeo'), alt: values.alt,
    });
    if (figure) {
      const compact = Boolean(figure.closest('.stone-detail, ' + groupSelector));
      figure.replaceWith(element(mediaMarkup(type, next, values.caption, compact)));
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
