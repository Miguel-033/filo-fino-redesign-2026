import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { createReadStream, rmSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { processUpload } from './media.mjs';
import { pages, referencedMedia, renderPage, revision } from './pages.mjs';
import { createPublisher } from './publish.mjs';

const editor = dirname(fileURLToPath(import.meta.url));
const root = resolve(editor, '../..');
const port = Number(process.env.FILO_EDITOR_PORT || 4173);
const host = '127.0.0.1';
const origin = 'http://' + host + ':' + port;
const key = randomUUID();
const staging = await mkdtemp(join(tmpdir(), 'filo-fino-editor-'));
const publisher = createPublisher(root, staging);
const assets = join(root, 'assets/editor-media');
const drafts = new Map();
const uploads = new Map();
let saving = false;
let processing = false;
let publishing = false;

const contentTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.mov': 'video/quicktime',
  '.webm': 'video/webm', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
};

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function failure(message, status) {
  return Object.assign(new Error(message), { status });
}

async function readDraft(request) {
  const pieces = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 2_000_000) throw failure('Черновик слишком большой.', 413);
    pieces.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(pieces).toString());
  } catch {
    throw failure('Не удалось прочитать черновик.', 400);
  }
}

async function publishFiles(path, rendered) {
  const missing = [];
  for (const id of referencedMedia(rendered)) {
    const target = join(assets, id);
    if (await stat(target).catch(() => null)) continue;
    if (!uploads.has(id)) throw failure('Исходник из черновика недоступен. Загрузите файл повторно.', 409);
    missing.push(id);
  }

  const temporaryPage = path + '.' + randomUUID() + '.tmp';
  const promoted = [];
  const partial = [];
  try {
    if (missing.length) await mkdir(assets, { recursive: true });
    for (const id of missing) {
      const temporary = join(assets, '.' + id + '-' + randomUUID());
      partial.push(temporary);
      await cp(join(staging, id), temporary, { recursive: true, errorOnExist: true, force: false });
      await rename(temporary, join(assets, id));
      promoted.push(id);
    }
    await writeFile(temporaryPage, rendered, { flag: 'wx' });
    await rename(temporaryPage, path);
  } catch (error) {
    await Promise.allSettled([
      ...promoted.map(id => rm(join(assets, id), { recursive: true, force: true })),
      ...partial.map(path => rm(path, { recursive: true, force: true })),
      rm(temporaryPage, { force: true }),
    ]);
    throw error;
  }
}

async function api(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/session') {
    return json(response, 200, { key, pages, publication: publisher.current() });
  }
  if (request.method === 'GET' && url.pathname === '/api/page') {
    const page = pages[url.searchParams.get('id')];
    if (!page?.path) throw failure('Страница не поддерживается.', 404);
    const html = await readFile(join(root, page.path), 'utf8');
    return json(response, 200, { revision: revision(html) });
  }
  if (request.method !== 'POST') throw failure('Метод недоступен.', 405);
  const requestOrigin = request.headers.origin;
  const fetchSite = request.headers['sec-fetch-site'];
  if ((requestOrigin && requestOrigin !== origin) ||
      (fetchSite && fetchSite !== 'same-origin') ||
      request.headers['x-filo-editor'] !== key) {
    throw failure('Откройте редактор по адресу ' + origin, 403);
  }
  if (url.pathname === '/api/upload') {
    if (processing) throw failure('Дождитесь обработки текущего файла.', 409);
    processing = true;
    try {
      const media = await processUpload(request, staging);
      uploads.set(media.id, media);
      return json(response, 201, media);
    } finally {
      processing = false;
    }
  }
  if (url.pathname === '/api/publish/status') {
    const requestBody = await readDraft(request);
    return json(response, 200, publisher.status(requestBody?.id));
  }
  if (['/api/publish/prepare', '/api/publish/confirm'].includes(url.pathname)) {
    if (saving || publishing) throw failure('Дождитесь завершения текущей операции.', 409);
    publishing = true;
    try {
      const requestBody = await readDraft(request);
      const result = url.pathname.endsWith('/prepare')
        ? await publisher.prepare(requestBody?.page)
        : await publisher.push(requestBody?.id);
      return json(response, 200, result);
    } finally {
      publishing = false;
    }
  }
  if (!['/api/preview', '/api/save'].includes(url.pathname)) throw failure('Маршрут недоступен.', 404);

  const draft = await readDraft(request);
  const page = pages[draft?.page];
  if (!page?.path) throw failure('Страница не поддерживается.', 404);
  if (saving) throw failure('Подождите завершения сохранения.', 409);
  const save = url.pathname === '/api/save';
  if (save && publishing) throw failure('Дождитесь завершения отправки в GitHub.', 409);
  if (save) saving = true;
  try {
    const path = join(root, page.path);
    const original = await readFile(path, 'utf8');
    if (revision(original) !== draft.revision) throw failure('Файл изменился на диске. Откройте страницу заново.', 409);
    const html = renderPage(page, original, draft);
    if (!save) {
      const id = randomUUID();
      if (drafts.size >= 12) drafts.delete(drafts.keys().next().value);
      drafts.set(id, { html, path: page.path });
      return json(response, 200, { url: '/site/' + page.path + '?draft=' + id });
    }
    await publishFiles(path, html);
    publisher.invalidate();
    drafts.clear();
    return json(response, 200, { revision: revision(html) });
  } finally {
    if (save) saving = false;
  }
}

function inside(directory, relative) {
  const path = resolve(directory, relative);
  if (!path.startsWith(directory + sep)) throw failure('Файл недоступен.', 404);
  return path;
}

async function serve(request, response, file, type) {
  const info = await stat(file);
  if (!info.isFile()) throw failure('Файл не найден.', 404);
  const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes' };
  const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
  let start = 0;
  let end = info.size - 1;
  if (range && (range[1] || range[2])) {
    start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
    if (range[1] && range[2]) end = Math.min(end, Number(range[2]));
    if (start > end || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
      response.writeHead(416, { 'Content-Range': 'bytes */' + info.size });
      return response.end();
    }
    headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + info.size;
  }
  headers['Content-Length'] = Math.max(0, end - start + 1);
  response.writeHead(headers['Content-Range'] ? 206 : 200, headers);
  if (request.method === 'HEAD' || !info.size) return response.end();
  await pipeline(createReadStream(file, { start, end }), response);
}

const server = createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  response.setHeader('X-Frame-Options', 'SAMEORIGIN');
  try {
    if (request.headers.host !== host + ':' + port) throw failure('Откройте ' + origin, 403);
    const url = new URL(request.url, origin);
    if (url.pathname.startsWith('/api/')) return await api(request, response, url);
    if (!['GET', 'HEAD'].includes(request.method)) throw failure('Метод недоступен.', 405);

    const path = decodeURIComponent(url.pathname);
    let file;
    if (path.startsWith('/site/')) {
      let relative = path.slice(6);
      if (!relative || relative.endsWith('/')) relative += 'index.html';
      if (relative.split('/').some(part => part.startsWith('.')) ||
        !/^(?:assets\/|servicios\/|legal\/|[^/]+$)/.test(relative)) throw failure('Файл недоступен.', 404);
      const draft = drafts.get(url.searchParams.get('draft'));
      if (draft?.path === relative) {
        response.writeHead(200, { 'Content-Type': contentTypes['.html'] });
        return response.end(request.method === 'HEAD' ? undefined : draft.html);
      }
      const pending = relative.match(/^assets\/editor-media\/([a-f0-9-]{36})\/([^/]+)$/);
      const upload = pending && uploads.get(pending[1]);
      const staged = upload && [upload.filename, upload.previewFilename].includes(pending[2]);
      file = staged ? inside(staging, pending[1] + '/' + pending[2]) : inside(root, relative);
    } else {
      const name = path === '/' ? 'editor.html' : path.slice(1);
      if (!['editor.html', 'editor.css', 'editor.mjs', 'templates.mjs'].includes(name)) {
        throw failure('Файл не найден.', 404);
      }
      response.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self'; frame-src 'self'; frame-ancestors 'none'");
      file = join(editor, name);
    }
    await serve(request, response, file, contentTypes[extname(file)] || 'application/octet-stream');
  } catch (error) {
    if (response.headersSent || response.destroyed) return;
    const missing = error.code === 'ENOENT';
    json(response, error.status ?? (missing ? 404 : 400), { error: missing ? 'Файл не найден.' : error.message });
  }
});

process.on('exit', () => rmSync(staging, { recursive: true, force: true }));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => process.exit(0));
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'Редактор уже запущен на ' + origin : error.message);
  process.exitCode = 1;
});
server.listen(port, host, () => {
  console.log('Filo Fino · редактор: ' + origin);
  if (process.platform === 'darwin' && process.argv.includes('--open')) {
    execFile('open', [origin], error => {
      if (error) console.log('Откройте адрес вручную: ' + origin);
    });
  }
});
