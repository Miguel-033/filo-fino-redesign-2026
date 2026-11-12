const imageTags = /<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
const allowedSource = /^(?:\.\.\/){0,2}assets\/editor-media\/[a-f0-9-]{36}\/photo\.(?:jpe?g|png|webp)$/;
const escape = value => String(value).replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function pagePrefix(path) {
  return '../'.repeat(path.split('/').length - 1);
}

function findAttribute(tag, name) {
  return [...tag.matchAll(/\s+([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)]
    .find(match => match[1].toLowerCase() === name);
}

function attribute(tag, name, value) {
  const match = findAttribute(tag, name);
  const addition = value == null ? '' : ' ' + name + '="' + escape(value) + '"';
  if (match) return tag.slice(0, match.index) + addition + tag.slice(match.index + match[0].length);
  return tag.replace(/\s*\/?>$/, end => addition + end);
}

export function labelPhotos(html) {
  let index = 0;
  return html.replace(imageTags, tag => attribute(tag, 'data-editor-photo-index', index++));
}

function integer(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

export function applyPhotos(html, photos = []) {
  if (!Array.isArray(photos) || photos.length > 300) throw new Error('Слишком много изменений фотографий.');
  const edits = new Map();
  for (const edit of photos) {
    if (!integer(edit?.index, 0, 10000) || edits.has(edit.index)) throw new Error('Не удалось сопоставить фото со страницей.');
    const image = edit.replacement;
    if (image && (!allowedSource.test(image.src) || !integer(image.width, 1, 2000) ||
        !integer(image.height, 1, 2000) || typeof image.alt !== 'string' || image.alt.length > 180)) {
      throw new Error('Не удалось проверить файл фотографии.');
    }
    const frame = edit.frame;
    if (frame && (!['cover', 'contain'].includes(frame.fit) || !integer(frame.x, 0, 100) ||
        !integer(frame.y, 0, 100) || !integer(frame.scale, 50, 200) ||
        (frame.width != null && !integer(frame.width, 80, 2000)))) throw new Error('Некорректные параметры фотографии.');
    edits.set(edit.index, edit);
  }

  let index = 0;
  const rendered = html.replace(imageTags, tag => {
    const edit = edits.get(index++);
    if (!edit) return tag;
    edits.delete(edit.index);
    if (edit.replacement) {
      for (const name of ['src', 'width', 'height', 'alt']) tag = attribute(tag, name, edit.replacement[name]);
      for (const name of ['srcset', 'sizes']) tag = attribute(tag, name, null);
    }
    if ('frame' in edit) {
      for (const key of ['fit', 'x', 'y', 'scale', 'width']) {
        tag = attribute(tag, 'data-photo-' + key, edit.frame?.[key]);
      }
      const style = findAttribute(tag, 'style');
      const old = (style?.[2] ?? style?.[3] ?? style?.[4] ?? '')
        .replace(/&(?:quot|apos|amp|lt|gt|#39);/g, entity =>
          ({ '&quot;': '"', '&apos;': "'", '&#39;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>' })[entity])
        .replace(/(?:^|;)\s*--photo-(?:x|y|scale|width):[^;]*/g, '');
      const parts = old.trim() ? [old.replace(/;$/, '')] : [];
      const frame = edit.frame;
      if (frame) {
        parts.push('--photo-x:' + frame.x + '%', '--photo-y:' + frame.y + '%', '--photo-scale:' + frame.scale / 100);
        if (frame.width != null) parts.push('--photo-width:' + frame.width + 'px');
      }
      tag = attribute(tag, 'style', parts.length ? parts.join(';') : null);
    }
    return tag;
  });
  if (edits.size) throw new Error('Не удалось найти фотографию на странице.');
  return rendered;
}

export function photoStyles(html, path) {
  if (!/\sdata-photo-fit=/.test(html) || /href=["'][^"']*\bphoto-framing\.css(?:[?"'])/.test(html)) return html;
  return html.replace('</head>', '  <link rel="stylesheet" href="' + pagePrefix(path) + 'photo-framing.css?v=1">\n</head>');
}
