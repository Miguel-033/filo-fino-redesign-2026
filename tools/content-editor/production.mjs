import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { pages } from './pages.mjs';

const domain = 'https://filofino.es';
const routes = Object.values(pages).map(({ path }) => ({
  path,
  url: new URL('/' + path.replace(/(^|\/)index\.html$/, '$1'), domain),
}));
const business = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': domain + '/#filo-fino',
  name: 'Filo Fino',
  url: domain + '/',
  telephone: '+34614005053',
  email: 'filofino.es@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calle Maestro Guerrero, 4',
    addressLocality: 'Valencia',
    addressCountry: 'ES',
  },
};

function publicPath(value, url) {
  if (!value || /^(?:#|[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return value;
  const resolved = new URL(value, url);
  return resolved.pathname + resolved.search + resolved.hash;
}

function breadcrumbs(html, url) {
  const nav = html.match(/<nav class="breadcrumbs"[^>]*>([\s\S]*?)<\/nav>/);
  if (!nav) return null;
  const current = nav[1].match(/<span aria-current="page">([^<]+)<\/span>/);
  if (!current) throw new Error('Falta el elemento actual de la ruta: ' + url.pathname);
  const links = Array.from(nav[1].matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g),
    ([, href, name]) => ({ name, item: new URL(href, url).href }));
  links.push({ name: current[1], item: url.href });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: links.map((link, index) => ({
      '@type': 'ListItem', position: index + 1, ...link,
    })),
  };
}

function structuredData(value) {
  return '<script type="application/ld+json">' + JSON.stringify(value).replaceAll('<', '\\u003c') + '</script>';
}

function productionHtml(html, url) {
  const robots = /<meta name="robots" content="noindex,\s*nofollow">/g;
  if ([...html.matchAll(robots)].length !== 1 || /<link rel="canonical"/i.test(html)) {
    throw new Error('Metadatos de origen inesperados: ' + url.pathname);
  }
  // Keep file references on the current host so this artifact also works on localhost.
  html = html.replace(/<[a-z][^<>]*>/gi, tag => tag.replace(
    /(\s(?:href|src|poster|data-poster)=)(["'])([^"']*)\2/gi,
    (full, attribute, quote, value) => attribute + quote + publicPath(value, url) + quote));
  html = html.replace(/(<script type="application\/json" id="real-works-data">)([\s\S]*?)(<\/script>)/g,
    (full, open, data, close) => {
      const items = JSON.parse(data);
      for (const item of items) {
        for (const field of ['source', 'cover', 'poster']) {
          if (item[field]) item[field] = publicPath(item[field], url);
        }
      }
      return open + JSON.stringify(items).replaceAll('<', '\\u003c') + close;
    });
  html = html.replace(/ <span data-preview-hosting>[\s\S]*?<\/span>/g, '');
  const trail = breadcrumbs(html, url);
  const metadata = [
    '<meta name="robots" content="index, follow">',
    '<link rel="canonical" href="' + url.href + '">',
    '<meta property="og:url" content="' + url.href + '">',
  ];
  if (url.pathname === '/') metadata.push(structuredData(business));
  if (trail) metadata.push(structuredData(trail));
  return html.replace(robots, metadata.join('\n'));
}

export async function prepareProduction(destination) {
  const files = await readdir(destination, { recursive: true });
  const htmlFiles = files.filter(path => path.endsWith('.html')).map(path => path.split(sep).join('/')).sort();
  const expected = routes.map(({ path }) => path).sort();
  if (expected.length !== 11 || JSON.stringify(htmlFiles) !== JSON.stringify(expected)) {
    throw new Error('Состав production-сборки отличается от 11 утверждённых страниц.');
  }
  for (const { path, url } of routes) {
    const file = join(destination, path);
    await writeFile(file, productionHtml(await readFile(file, 'utf8'), url));
  }
  await writeFile(join(destination, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + domain + '/sitemap.xml\n');
  const entries = routes.map(({ url }) => '  <url><loc>' + url.href + '</loc></url>').join('\n');
  await writeFile(join(destination, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries + '\n</urlset>\n');
}
