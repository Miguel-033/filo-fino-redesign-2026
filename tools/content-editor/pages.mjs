import { createHash } from 'node:crypto';
import { applyPhotos, pagePrefix, photoStyles } from './photos.mjs';

export const pages = {
  home: { path: 'index.html', label: 'Главная' },
  stones: {
    path: 'servicios/afilado-manual-piedras-de-agua-valencia/index.html',
    label: 'Ручная заточка на водных камнях',
  },
  services: { path: 'servicios/index.html', label: 'Все услуги' },
  knives: { path: 'servicios/afilado-cuchillos-valencia/index.html', label: 'Заточка ножей' },
  scissors: { path: 'servicios/afilar-tijeras-peluqueria-valencia/index.html', label: 'Заточка ножниц' },
  manicure: { path: 'servicios/herramientas-manicura-pedicura-valencia/index.html', label: 'Маникюр и педикюр' },
  blades: { path: 'servicios/afilado-cuchillas-maquinas-valencia/index.html', label: 'Ножевые блоки' },
  horeca: { path: 'servicios/afilado-cuchillos-hosteleria-valencia/index.html', label: 'Заточка для ресторанов' },
  legal: { path: 'legal/aviso-legal.html', label: 'Правовая информация' },
  cookies: { path: 'legal/politica-cookies.html', label: 'Политика cookie' },
  privacy: { path: 'legal/politica-privacidad.html', label: 'Политика конфиденциальности' },
};

const data = /(<script type="application\/json" id="real-works-data">)[\s\S]*?(<\/script>)/;
const main = /(<main\b[^>]*>)([\s\S]*?)(<\/main>)/i;
const tags = /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<\/?[a-z][\w:-]*(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
const voidTags = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const editableTags = new Set(['section', 'article', 'aside']);
const safeId = /^[a-z0-9-]+$/;
const fragmentLimit = 300_000;

export const revision = html => createHash('sha256').update(html).digest('hex');

function fragment(html, root) {
  if (typeof html !== 'string' || html.length > fragmentLimit ||
      !new RegExp('^<' + root + '\\b[\\s\\S]*<\\/' + root + '>$').test(html) ||
      /<\/?(?:script|iframe|object|embed|style|base|main|html|body|link|meta)\b|\son[a-z]+\s*=|javascript\s*:/i.test(html)) {
    throw new Error('Редактор получил неподдерживаемый блок.');
  }
  return html;
}

// Find direct children without reserializing untouched HTML, including raw JSON scripts.
function mainChildren(body) {
  const children = [];
  const stack = [];
  let start;
  let cursor = 0;
  for (const match of body.matchAll(tags)) {
    const raw = match[0];
    if (raw.startsWith('<!--')) continue;
    const [, closing, tag] = raw.match(/^<(\/?)([\w:-]+)/);
    const name = tag.toLowerCase();
    if (closing) {
      if (stack.pop() !== name) throw new Error('Не удалось разобрать структуру страницы.');
    } else {
      if (stack.length === 0) start = { name, index: match.index };
      if (!voidTags.has(name) && !raw.endsWith('/>') && !(name === 'script' && /<\/script\s*>$/i.test(raw))) stack.push(name);
    }
    if (stack.length === 0 && start) {
      const end = match.index + raw.length;
      children.push({ tag: start.name, before: body.slice(cursor, start.index), html: body.slice(start.index, end) });
      cursor = end;
      start = null;
    }
  }
  if (stack.length) throw new Error('Не удалось разобрать структуру страницы.');
  return { children, after: body.slice(cursor) };
}

function editable(part) {
  return editableTags.has(part.tag);
}

function applyBlocks(html, sequence) {
  if (!Array.isArray(sequence) || sequence.length > 300) throw new Error('Слишком много блоков страницы.');
  if (!main.test(html)) throw new Error('Не найден основной контент страницы.');
  return html.replace(main, (_, opening, body, closing) => {
    const { children, after } = mainChildren(body);
    const used = new Set();
    let lastFixed = -1;
    const parts = sequence.map(part => {
      if (part.index === undefined) return '\n    ' + fragment(part.html, 'section');
      const saved = children[part.index];
      if (!Number.isInteger(part.index) || !saved || used.has(part.index)) throw new Error('Исходный порядок блоков изменился.');
      used.add(part.index);
      if (!editable(saved)) {
        if (part.html !== undefined || part.index <= lastFixed) throw new Error('Служебный блок страницы защищён.');
        lastFixed = part.index;
      }
      return saved.before + (part.html === undefined ? saved.html : fragment(part.html, saved.tag));
    });
    if (children.some((part, index) => (!editable(part) || /\bclass="hero(?:\s|")/.test(part.html.slice(0, part.html.indexOf('>')))) && !used.has(index))) {
      throw new Error('Служебный блок страницы защищён.');
    }
    return opening + parts.join('') + after + closing;
  });
}

function addResource(html, name, tag) {
  const existing = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)]
    .some(match => match[1].split('?')[0].endsWith('/' + name) || match[1].split('?')[0] === name);
  if (existing) return html;
  return html.replace('</head>', tag + '\n</head>');
}

export function contentStyles(html, path) {
  if (!/\b(?:stone-section|stone-photo|content-media-group)\b|\bdata-content-media-width=/.test(html)) return html;
  return addResource(html, 'water-stones.css',
    '<link rel="stylesheet" href="' + pagePrefix(path) + 'servicios/afilado-manual-piedras-de-agua-valencia/water-stones.css?v=editor">');
}

function galleryResources(html, path, entries) {
  const content = JSON.stringify(entries).replaceAll('<', '\\u003c');
  if (data.test(html)) return html.replace(data, (_, start, end) => start + content + end);
  if (!entries.length) return html;
  const prefix = pagePrefix(path);
  html = addResource(html, 'real-works.css', '<link rel="stylesheet" href="' + prefix + 'real-works.css?v=editor">');
  html = addResource(html, 'real-works.js', '<script src="' + prefix + 'real-works.js" defer></script>');
  return html.replace('</body>', () => '<dialog id="real-works-dialog" class="real-works-dialog" aria-labelledby="real-works-view-title">' +
    '<div class="real-works-dialog__shell"><header class="real-works-dialog__header"><h2 id="real-works-view-title"></h2>' +
    '<button type="button" class="real-works-dialog__close">Cerrar</button></header>' +
    '<div class="real-works-dialog__media"></div></div></dialog>\n' +
    '<script type="application/json" id="real-works-data">' + content + '</script>\n</body>');
}

export function renderPage(page, html, draft) {
  const entries = draft.media;
  if (!Array.isArray(entries) || entries.length > 300 || new Set(entries.map(item => item.id)).size !== entries.length ||
      entries.some(item => !safeId.test(item.id) || !['image', 'video'].includes(item.type) ||
        typeof item.source !== 'string' || !/^(?:\.\.\/){0,2}assets\/[a-z0-9_./-]+$/i.test(item.source) ||
        item.source.includes('..', item.source.indexOf('assets/')))) {
    throw new Error('Не удалось проверить список медиа.');
  }
  const edited = applyPhotos(html, draft.photos);
  const rendered = applyBlocks(edited, draft.blocks);
  return contentStyles(photoStyles(galleryResources(rendered, page.path, entries), page.path), page.path);
}

export function referencedMedia(html) {
  return new Set([...html.matchAll(/assets\/editor-media\/([a-f0-9-]{36})\//g)].map(match => match[1]));
}
