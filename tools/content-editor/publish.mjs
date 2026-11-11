import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdtemp, realpath, rm } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { promisify } from 'node:util';
import { pages } from './pages.mjs';

const run = promisify(execFile);
const repository = 'Miguel-033/filo-fino-redesign-2026';
const editorBranch = 'codex/local-content-editor';
const previewBranch = 'gh-pages-preview';
const previewRef = 'refs/heads/' + previewBranch;
const preview = 'https://miguel-033.github.io/filo-fino-redesign-2026/';
const previewPath = new URL(preview).pathname;
const api = 'https://api.github.com/repos/' + repository;
const actions = 'https://github.com/' + repository + '/actions';
const tracked = {
  ...Object.fromEntries(Object.entries(pages).map(([id, page]) => [id, page.path])),
  css: 'real-works.css',
  'stones-css': 'servicios/afilado-manual-piedras-de-agua-valencia/water-stones.css',
};
const mediaFile = /\.(?:avif|gif|jpe?g|png|svg|webp|m4v|mov|mp4|ogv|webm)$/i;
const uploadFile = /^assets\/editor-media\/[a-f0-9-]{36}\/(?:photo|preview)\.(?:jpe?g|png|webp)$|^assets\/editor-media\/[a-f0-9-]{36}\/video\.mp4$/;
const allowedRemote = /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)Miguel-033\/filo-fino-redesign-2026(?:\.git)?$/i;
const sha = /^[a-f0-9]{40}$/;

function pageUrl(path) {
  return new URL(path.replace(/index\.html$/, ''), preview).href;
}

function mediaReferences(html, path) {
  const references = new Set();
  const base = new URL(path, preview);
  function add(raw) {
    let url;
    try {
      url = new URL(raw.replaceAll('&amp;', '&'), base);
    } catch {
      return;
    }
    if (url.origin !== base.origin || !mediaFile.test(url.pathname)) return;
    if (!url.pathname.startsWith(previewPath)) {
      throw new Error('Медиа ссылается за пределы preview: ' + raw);
    }
    references.add(decodeURIComponent(url.pathname.slice(previewPath.length)));
  }
  for (const match of html.matchAll(/\b(srcset|src|poster|href|data-poster)\s*=\s*(["'])([\s\S]*?)\2/gi)) {
    if (match[1].toLowerCase() === 'srcset') {
      for (const item of match[3].split(',')) add(item.trim().split(/\s+/, 1)[0]);
    } else {
      add(match[3]);
    }
  }
  const data = html.match(/<script type="application\/json" id="real-works-data">([\s\S]*?)<\/script>/);
  if (data) {
    for (const item of JSON.parse(data[1])) {
      for (const value of [item.source, item.cover, item.poster]) if (value) add(value);
    }
  }
  return references;
}

async function github(path) {
  const response = await fetch(api + path, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Filo-Fino-Local-Editor' },
    signal: AbortSignal.timeout(12_000), redirect: 'error',
  });
  if (!response.ok) throw new Error('GitHub API вернул HTTP ' + response.status);
  return response.json();
}

function previewAddress(url) {
  return url === preview || url === preview.slice(0, -1);
}

async function checkPreviewDestination() {
  try {
    const deployments = await github('/deployments?environment=github-pages&per_page=5');
    for (const entry of deployments.filter(item => Number.isSafeInteger(item.id))) {
      const [status] = await github('/deployments/' + entry.id + '/statuses?per_page=1');
      if (status?.state !== 'success') continue;
      if (entry.ref === previewBranch && previewAddress(status.environment_url)) {
        const response = await fetch(preview, { method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(12_000) });
        if (response.ok) return;
      }
      break;
    }
  } catch {
    throw new Error('Не удалось проверить адрес GitHub Pages. Проверьте подключение к GitHub и повторите попытку.');
  }
  throw new Error('GitHub не подтвердил, что ветка ' + previewBranch + ' обслуживает ожидаемый адрес preview.');
}

export async function deployment(shaValue) {
  const deployments = await github('/deployments?environment=github-pages&sha=' + shaValue);
  const current = deployments.find(item => item.sha === shaValue && item.ref === previewBranch);
  if (current && Number.isSafeInteger(current.id)) {
    const statuses = await github('/deployments/' + current.id + '/statuses?per_page=1');
    const latest = statuses[0];
    if (latest?.state === 'success' && previewAddress(latest.environment_url)) return 'success';
    if (['failure', 'error', 'inactive'].includes(latest?.state)) return 'failure';
  }
  if (!current) {
    const response = await github('/actions/runs?branch=' + previewBranch + '&head_sha=' + shaValue);
    const build = response.workflow_runs?.find(item => item.name === 'pages build and deployment' && item.head_sha === shaValue);
    if (build?.status === 'completed' && build.conclusion !== 'success') return 'failure';
  }
  return 'building';
}

async function visibleBuild(commit, changes) {
  for (const [path, expected] of changes) {
    const asset = path.startsWith('assets/');
    const url = new URL(pageUrl(path));
    url.searchParams.set('preview', commit);
    const response = await fetch(url, { method: asset ? 'HEAD' : 'GET', redirect: 'error',
      signal: AbortSignal.timeout(12_000) });
    if (!response.ok) return false;
    if (!asset) {
      const body = Buffer.from(await response.arrayBuffer());
      const blob = createHash('sha1').update('blob ' + body.length + '\0').update(body).digest('hex');
      if (blob !== expected) return false;
    }
  }
  return true;
}

export function createPublisher(root, staging) {
  let plan;
  let job;
  let locked = false;
  const receipts = id => 'refs/filo-editor/published/' + id;
  const gitEnv = { ...process.env, GIT_TERMINAL_PROMPT: '0' };

  async function git(args, options = {}) {
    const { stdout } = await run('git', args, {
      cwd: root, env: { ...gitEnv, ...options.env }, maxBuffer: 12 * 1024 * 1024,
      timeout: options.timeout ?? 90_000, encoding: options.encoding ?? 'utf8',
    });
    return typeof stdout === 'string' ? stdout.trimEnd() : stdout;
  }

  async function checkTarget() {
    try {
      const [branch, top, pull, push] = await Promise.all([
        git(['branch', '--show-current']), git(['rev-parse', '--show-toplevel']),
        git(['remote', 'get-url', '--all', 'origin']), git(['remote', 'get-url', '--push', '--all', 'origin']),
      ]);
      if (branch !== editorBranch || await realpath(top) !== await realpath(root) ||
          !allowedRemote.test(pull) || !allowedRemote.test(push)) throw new Error();
    } catch {
      throw new Error('Публикация доступна из корня ' + repository + ' в ветке ' + editorBranch + ' с этим репозиторием в origin.');
    }
  }

  async function fetchPreview() {
    const ref = 'refs/filo-editor/prepare/' + randomUUID();
    try {
      await git(['fetch', '--no-tags', '--no-write-fetch-head', 'origin', previewRef + ':' + ref]);
      return await git(['rev-parse', ref]);
    } catch {
      throw new Error('Не удалось получить ветку ' + previewBranch + '. Проверьте доступ к GitHub и настройку origin.');
    } finally {
      await git(['update-ref', '-d', ref]).catch(() => {});
    }
  }

  async function tree(commit) {
    const records = (await git(['ls-tree', '-r', '-z', commit])).split('\0').filter(Boolean);
    return new Map(records.map(record => {
      const [info, path] = record.split('\t');
      const [mode, type, oid] = info.split(' ');
      return [path, { mode, type, oid }];
    }));
  }

  async function fileHash(path, write) {
    const file = join(root, path);
    const info = await lstat(file).catch(() => null);
    if (!info?.isFile() || !info.size || !(await realpath(file)).startsWith(rootReal + sep)) {
      throw new Error('Файл отсутствует или недоступен: ' + path);
    }
    const sizeLimit = path.startsWith('assets/') ? 100 * 1024 * 1024 : Infinity;
    if (info.size > sizeLimit) throw new Error('Файл превышает лимит GitHub в 100 МБ: ' + path);
    return git(['hash-object', ...(write ? ['-w'] : []), '--no-filters', '--', path]);
  }

  let rootReal;

  async function prepare(activePage) {
    if (locked || job?.state === 'building') throw new Error('Дождитесь завершения текущей публикации.');
    locked = true;
    plan = null;
    try {
      await checkTarget();
      rootReal = await realpath(root);
      const [remote] = await Promise.all([fetchPreview(), checkPreviewDestination()]);
      const [common, files] = await Promise.all([git(['merge-base', 'HEAD', remote]), tree(remote)]);
      if (!files.has('.nojekyll') || files.has('CNAME') ||
          [...files.keys()].some(path => path.startsWith('tools/') || path.toLowerCase() === 'cname')) {
        throw new Error('Ветка preview содержит неожиданные файлы. Проверьте источник публикации GitHub Pages.');
      }
      const baseline = await tree(common);
      const changes = new Map();
      const saved = new Set();
      const observed = new Map();
      for (const [id, path] of Object.entries(tracked)) {
        const local = await fileHash(path, true);
        observed.set(path, local);
        const remoteFile = files.get(path)?.oid;
        const receipt = await git(['rev-parse', '--verify', receipts(id)]).catch(() => null);
        const previous = receipt ? (await tree(receipt)).get(path)?.oid : baseline.get(path)?.oid;
        if (local !== remoteFile && local !== previous) {
          if (remoteFile !== previous) throw new Error('Конфликт с веткой preview: ' + path + '. Сначала согласуйте изменения этого файла.');
          changes.set(path, local);
        }
        if (changes.has(path) || local === remoteFile) {
          saved.add(id);
        }
      }

      // Assemble the complete public tree over the current preview. Only editable files and
      // media referenced by them can enter it, while unrelated preview content is retained.
      for (const path of Object.values(pages).map(page => page.path)) {
        const hash = changes.get(path) || files.get(path)?.oid;
        if (!hash) throw new Error('В preview отсутствует страница: ' + path);
        const html = (await git(['cat-file', 'blob', hash], { encoding: 'buffer' })).toString('utf8');
        for (const asset of mediaReferences(html, path)) {
          const existing = files.get(asset);
          if (!existing && !uploadFile.test(asset)) throw new Error('В сборке отсутствует медиа: ' + asset);
          if (existing && (existing.mode !== '100644' && existing.mode !== '100755')) {
            throw new Error('Недопустимая ссылка на медиа: ' + asset);
          }
          if (uploadFile.test(asset) && (changes.has(path) || !existing)) {
            const local = await fileHash(asset, true);
            if (existing && existing.oid !== local) throw new Error('Конфликт медиа: ' + asset);
            observed.set(asset, local);
            if (!existing) changes.set(asset, local);
          }
        }
      }
      if (!changes.size) return { message: 'Сохранённые файлы уже есть в ветке preview. Новых изменений для публикации нет.' };
      const folder = await mkdtemp(join(staging, 'pages-'));
      let build;
      try {
        const options = { env: { GIT_INDEX_FILE: join(folder, 'index') } };
        await git(['read-tree', remote], options);
        for (const [path, oid] of changes) {
          await git(['update-index', '--add', '--cacheinfo', '100644,' + oid + ',' + path], options);
        }
        build = await git(['write-tree'], options);
      } finally {
        await rm(folder, { recursive: true, force: true });
      }
      const id = randomUUID();
      const changedPages = Object.values(pages).filter(page => changes.has(page.path));
      const urls = (changedPages.length ? changedPages : [pages[activePage] || pages.home])
        .map(page => ({ label: page.label, url: pageUrl(page.path) }));
      plan = { id, remote, build, changes, observed, saved, urls, expires: Date.now() + 10 * 60_000 };
      return { id, files: [...changes.keys()], urls, branch: previewBranch };
    } finally {
      locked = false;
    }
  }

  async function follow(current, changes) {
    const deadline = Date.now() + 5 * 60_000;
    do {
      try {
        const state = await deployment(current.sha);
        if (state === 'failure') {
          Object.assign(current, { state, message: 'GitHub Pages не опубликовал этот коммит. Проверьте журнал сборки.' });
          return;
        }
        if (state === 'success' && await visibleBuild(current.sha, changes)) {
          Object.assign(current, { state, message: 'GitHub Pages подтвердил публикацию.' });
          return;
        }
      } catch {
        // Public API and Pages can briefly be unavailable while a build is starting.
      }
      await delay(15_000, undefined, { ref: false });
    } while (Date.now() < deadline);
    Object.assign(current, { state: 'unverified', message: 'Коммит отправлен. GitHub Pages пока не подтвердил публикацию. Проверьте журнал сборки.' });
  }

  async function push(id) {
    if (locked || job?.state === 'building') throw new Error('Дождитесь завершения текущей публикации.');
    if (!plan || plan.id !== id || plan.expires < Date.now()) throw new Error('Проверка устарела. Начните публикацию заново.');
    locked = true;
    const current = plan;
    plan = null;
    try {
      await checkTarget();
      for (const [path, hash] of current.observed) {
        if (await fileHash(path, false) !== hash) throw new Error('Локальный файл изменился после проверки: ' + path);
      }
      if (await fetchPreview() !== current.remote) {
        throw new Error('Ветка preview обновилась после проверки. Начните публикацию заново.');
      }
      await checkPreviewDestination();
      let commit;
      try {
        commit = await git(['commit-tree', current.build, '-p', current.remote, '-m', 'Publish Filo Fino preview content']);
      } catch {
        throw new Error('Git не создал коммит. Проверьте git config user.name и git config user.email.');
      }
      if (!sha.test(commit)) throw new Error('Git вернул неизвестный идентификатор коммита.');
      try {
        // The commit has exactly the checked preview tip as its parent. The lease also
        // rejects a concurrent branch rewind, which an ordinary fast-forward could miss.
        await git(['push', '--no-follow-tags', '--recurse-submodules=no', '--force-with-lease=' + previewRef + ':' + current.remote,
          'origin', commit + ':' + previewRef], { timeout: 180_000 });
      } catch {
        if (await fetchPreview().catch(() => null) !== commit) {
          throw new Error('GitHub отклонил отправку. Проверьте авторизацию Git, права записи и изменения ветки preview.');
        }
      }
      for (const id of current.saved) {
        await git(['update-ref', receipts(id), commit]).catch(error => console.error('Git: не удалось сохранить отметку публикации ' + id, error.code));
      }
      job = { id, sha: commit, state: 'building', message: 'Коммит отправлен. Ожидаю сборку GitHub Pages…',
        urls: current.urls, actions };
      void follow(job, current.changes);
      return { ...job, urls: [] };
    } finally {
      locked = false;
    }
  }

  return {
    prepare, push,
    invalidate() { plan = null; },
    current() {
      return job ? { ...job, urls: job.state === 'success' ? job.urls : [] } : null;
    },
    status(id) {
      if (!job || job.id !== id) throw new Error('Публикация не найдена. Проверьте журнал GitHub Actions.');
      return this.current();
    },
  };
}
