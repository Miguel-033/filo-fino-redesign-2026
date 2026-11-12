import { createHash } from 'node:crypto';
import { applyPhotos, photoStyles } from './photos.mjs';

export const pages = {
  home: { path: 'index.html', label: 'Главная', type: 'gallery' },
  stones: {
    path: 'servicios/afilado-manual-piedras-de-agua-valencia/index.html',
    label: 'Ручная заточка на водных камнях',
    type: 'sections',
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

const gallery = /(<div class="real-works__grid">)[\s\S]*?(<\/div>\s*<\/section>)/;
const data = /(<script type="application\/json" id="real-works-data">)[\s\S]*?(<\/script>)/;
const main = /(<main id="main">)([\s\S]*?)(<\/main>)/;
const sections = /<section\b[^>]*>[\s\S]*?<\/section>/g;
const safeId = /^[a-z0-9-]+$/;
const fragmentLimit = 300_000;

export const revision = html => createHash('sha256').update(html).digest('hex');

function requireMatch(html, pattern) {
  const match = html.match(pattern);
  if (!match) throw new Error('Разметка страницы изменилась. Откройте поддерживаемую версию сайта.');
  return match;
}

function fragment(html, root) {
  if (typeof html !== 'string' || html.length > fragmentLimit ||
      !new RegExp('^<' + root + '\\b[\\s\\S]*<\\/' + root + '>$').test(html) ||
      /<\/?(?:script|iframe|object|embed|style|base|main|html|body|link|meta)\b|\son[a-z]+\s*=|javascript\s*:/i.test(html)) {
    throw new Error('Редактор получил неподдерживаемый блок.');
  }
  return html;
}

function useOriginals(incoming, originals, tag) {
  if (!Array.isArray(incoming) || incoming.length > 300) throw new Error('Слишком много блоков.');
  const used = new Set();
  return incoming.map(block => {
    if (block.index !== undefined) {
      if (!Number.isInteger(block.index) || !originals[block.index] || used.has(block.index)) {
        throw new Error('Исходный порядок блоков изменился.');
      }
      used.add(block.index);
      return originals[block.index];
    }
    return fragment(block.html, tag);
  });
}

function applyGallery(html, cards) {
  const grid = requireMatch(html, gallery)[0];
  const originals = [...grid.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(match => match[0]);
  const entries = useOriginals(cards, originals, 'article');
  return html.replace(gallery, (_, start, end) => start + '\n' +
    entries.map(entry => '        ' + entry).join('\n') + '\n      ' + end);
}

function applySections(html, draft) {
  const [, , body] = requireMatch(html, main);
  const matches = [...body.matchAll(sections)];
  if (matches.length === 0 || !matches[0][0].startsWith('<section class="hero ')) {
    throw new Error('Не найдена структура страницы услуги.');
  }
  const [hero, ...editable] = matches;
  const afterHero = hero.index + hero[0].length;
  const first = editable[0]?.index ?? body.indexOf('<aside');
  const last = editable.at(-1);
  const end = last ? last.index + last[0].length : first;
  if (first < afterHero) throw new Error('Не найдена область редактирования услуги.');
  const entries = useOriginals(draft.sections, editable.map(match => match[0]), 'section');
  const savedHero = draft.hero == null ? hero[0] : fragment(draft.hero, 'section');
  if (!savedHero.startsWith('<section class="hero ')) throw new Error('Структура первого экрана защищена.');
  return html.replace(main, (_, open, content, close) => open + content.slice(0, hero.index) + savedHero +
    content.slice(afterHero, first) + entries.join('\n\n    ') + content.slice(end) + close);
}

export function renderPage(page, html, draft) {
  const edited = applyPhotos(html, draft.photos);
  if (!page.type) return photoStyles(edited, page.path);
  const entries = draft.media;
  if (!Array.isArray(entries) || entries.length > 300 || new Set(entries.map(item => item.id)).size !== entries.length ||
      entries.some(item => !safeId.test(item.id) || !['image', 'video'].includes(item.type) ||
        typeof item.source !== 'string' || !/^(?:\.\.\/\.\.\/)?assets\/[a-z0-9_./-]+$/i.test(item.source) ||
        item.source.includes('..', item.source.indexOf('assets/')))) {
    throw new Error('Не удалось проверить список медиа.');
  }
  requireMatch(edited, data);
  const rendered = page.type === 'gallery' ? applyGallery(edited, draft.cards) : applySections(edited, draft);
  const media = JSON.stringify(entries).replaceAll('<', '\\u003c');
  return photoStyles(rendered.replace(data, (_, start, end) => start + media + end), page.path);
}

export function referencedMedia(html) {
  return new Set([...html.matchAll(/assets\/editor-media\/([a-f0-9-]{36})\//g)].map(match => match[1]));
}
