export const blockNames = {
  photo: 'Фото', video: 'Видео', feature: 'Фото + текст',
  gallery: 'Галерея', text: 'Текстовый блок', cta: 'CTA',
};

export const categories = ['cuchillos', 'tijeras', 'manicura'];

const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function mediaItem(upload, prefix, fields) {
  const directory = prefix + 'assets/editor-media/' + upload.id + '/';
  const preview = directory + upload.previewFilename;
  return {
    id: fields.id ?? upload.id, type: upload.type, caption: fields.title,
    alt: fields.alt || fields.title, coverTitle: fields.title, source: directory + upload.filename,
    cover: preview, poster: upload.type === 'video' ? preview : undefined,
    width: upload.width, height: upload.height, duration: upload.duration,
    category: fields.category, previewRatio: upload.width + ' / ' + upload.height, previewPosition: '50% 50%',
  };
}

export function card(item) {
  const video = item.type === 'video';
  const icon = video
    ? '<path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none"/>'
    : '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.75"/>';
  return `<article class="real-work"${item.category ? ' data-category="' + escape(item.category) + '"' : ''} style="--preview-ratio:${escape(item.previewRatio)};--preview-position:${escape(item.previewPosition)}">
    <a class="real-work__open" data-real-work="${escape(item.id)}" href="${escape(item.source)}" aria-label="${video ? 'Reproducir vídeo' : 'Ampliar foto'}: ${escape(item.caption)}"${video ? ' data-poster="' + escape(item.poster) + '"' : ''}>
      <span class="real-work__preview"><img src="${escape(item.cover)}" alt="" width="${item.width}" height="${item.height}" loading="lazy" decoding="async"></span>
      <span class="real-work__type"><svg class="real-work__icon" viewBox="0 0 24 24" aria-hidden="true">${icon}</svg><span>${video ? escape(item.duration || 'Vídeo') : 'Foto'}</span></span>
      <span class="real-work__content"><span class="real-work__title">${escape(item.coverTitle || item.caption)}</span></span>
    </a>
  </article>`;
}

function photo(item, caption, compact) {
  const limit = compact ? '' : ` style="max-width:min(100%, calc(70vh * ${item.width / item.height}));margin-inline:auto"`;
  return `<figure class="stone-photo"${limit}>
    <a href="${escape(item.source)}" data-real-work="${escape(item.id)}" aria-label="Ampliar foto: ${escape(item.alt)}">
      <img src="${escape(item.cover)}" alt="${escape(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async">
      <span class="stone-zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#plus"></use></svg></span>
    </a>
    ${caption ? '<figcaption>' + escape(caption) + '</figcaption>' : ''}
  </figure>`;
}

function video(item, caption) {
  return `<figure class="stone-photo" style="max-width:min(100%, calc(75vh * ${item.width / item.height}));margin-inline:auto">
    <video data-content-media="video" aria-label="${escape(item.alt)}" width="${item.width}" height="${item.height}" controls playsinline preload="metadata" poster="${escape(item.poster)}" src="${escape(item.source)}" style="display:block;width:100%;height:auto"></video>
    ${caption ? '<figcaption>' + escape(caption) + '</figcaption>' : ''}
  </figure>`;
}

export function block(kind, values, item, contact) {
  const id = 'contenido-' + crypto.randomUUID();
  const heading = '<h2 id="' + id + '">' + escape(values.title) + '</h2>';
  const subtitle = values.subtitle ? '<p class="eyebrow">' + escape(values.subtitle) + '</p>' : '';
  const description = values.description ? '<p>' + escape(values.description) + '</p>' : '';
  const shell = (classes, html, labelled = false) =>
    `<section class="${classes} section-shell"${labelled ? ' aria-labelledby="' + id + '"' : ''}>${html}</section>`;

  switch (kind) {
    case 'photo': return shell('stone-section', photo(item, values.caption, false));
    case 'video': return shell('stone-section', video(item, values.caption));
    case 'feature': return shell('stone-section stone-detail',
      `<div class="stone-intro">${subtitle}${heading}${description}</div>${photo(item, values.caption, true)}`, true);
    case 'gallery': return shell('stone-section real-works',
      `<header class="real-works__heading">${heading}</header><div class="real-works__grid" data-content-gallery></div>`, true);
    case 'text': return shell('stone-section', `<div class="stone-intro">${subtitle}${heading}${description}</div>`, true);
    case 'cta': return shell('stone-section',
      `<div class="stone-intro">${subtitle}${heading}${description}<div class="knife-actions">${contact}</div></div>`, true);
    default: throw new Error('Неизвестный тип блока.');
  }
}

export function mediaMarkup(kind, item, caption, compact) {
  return kind === 'image' ? photo(item, caption, compact) : video(item, caption);
}
