"""Prepare inert production handoff; --apply-preview only edits test metadata.

No network, deployment, production export or production writes are implemented.
"""
import argparse
import csv
import html
import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'seo/routes.json').read_text())


def graphs(page):
    origin = CONFIG['productionOrigin']
    url = origin + page['path']
    business = CONFIG['business']
    graph = [
        {'@type': 'LocalBusiness', '@id': business['id'], 'name': business['name'],
         'url': origin + '/', 'telephone': business['telephone'],
         'address': {'@type': 'PostalAddress', **{k: business[k] for k in
                     ['streetAddress', 'addressLocality', 'addressCountry']}}},
        {'@type': 'WebSite', '@id': origin + '/#website', 'url': origin + '/',
         'name': business['name'], 'inLanguage': 'es-ES', 'publisher': {'@id': business['id']}},
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url,
         'name': page['title'], 'inLanguage': 'es-ES',
         'isPartOf': {'@id': origin + '/#website'}}
    ]
    if page.get('serviceName'):
        graph[2]['mainEntity'] = {'@id': url + '#service'}
        graph[2]['breadcrumb'] = {'@id': url + '#breadcrumb'}
        graph += [
            {'@type': 'Service', '@id': url + '#service', 'url': url,
             'name': page['serviceName'], 'serviceType': page['serviceName'],
             'provider': {'@id': business['id']},
             'areaServed': {'@type': 'City', 'name': 'Valencia'}},
            {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': origin + '/'},
                {'@type': 'ListItem', 'position': 2, 'name': page['serviceName'], 'item': url}]}]
    else:
        graph[2]['about'] = {'@id': business['id']}
    return {'@context': 'https://schema.org', '@graph': graph}


def metadata():
    return {'status': 'INERT HANDOFF — not approved or exported for production',
            'hoursStatus': CONFIG['business']['hoursStatus'],
            'productionGate': ['Owner confirms facts/hours', 'Retain/audit all migration URLs',
                               'Rendered/mobile/Safari and rich-result tests',
                               'Explicit production approval and rollback'],
            'pages': [{'path': p['path'], 'canonical': CONFIG['productionOrigin'] + p['path'],
                       'robots': 'index, follow', 'title': p['title'],
                       'description': p['description'], 'jsonld': graphs(p)}
                      for p in CONFIG['pages'] if p['status'] == 'developed']}


def output(path, value, check):
    serialized = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if check:
        assert path.exists() and path.read_text() == serialized, f'Stale metadata: {path}'
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(serialized)


def apply_preview(page):
    path = ROOT / CONFIG['sourceRoot'] / page['source']
    text = path.read_text()
    assert not re.search(r'rel=["\']canonical["\']|type=["\']application/ld\+json', text), path
    text = re.sub(r'<title>.*?</title>', '<title>' + html.escape(page['title']) + '</title>', text)
    text = re.sub(r'\s*<meta\s+name="description"[^>]*>', '', text)
    text = re.sub(r'\s*<meta\s+property="og:(?:title|description|type|locale|site_name)"[^>]*>', '', text)
    tags = [('name', 'description', page['description']), ('property', 'og:type', 'website'),
            ('property', 'og:locale', 'es_ES'), ('property', 'og:site_name', 'Filo Fino'),
            ('property', 'og:title', page['title']), ('property', 'og:description', page['description'])]
    insertion = '\n'.join(f'<meta {kind}="{key}" content="{html.escape(value, quote=True)}">'
                          for kind, key, value in tags)
    text = text.replace('</title>', '</title>\n' + insertion, 1)
    head, body = text.split('</head>', 1)
    head = '\n'.join(line.rstrip() for line in head.splitlines())
    head = re.sub(r'\n{3,}', '\n\n', head)
    text = head + '</head>' + body
    path.write_text(text)


def sitemap_candidate(check):
    rows = list(csv.DictReader((ROOT / 'seo/migration/url-map.csv').open()))
    urls = [r['new_url'] for r in rows]
    assert len(urls) == len(set(urls)), 'Review many-to-one redirects before generating sitemap'
    namespace = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    ET.register_namespace('', namespace)
    node = ET.Element('{' + namespace + '}urlset')
    for url in urls:
        assert url.startswith(CONFIG['productionOrigin'] + '/')
        ET.SubElement(ET.SubElement(node, '{' + namespace + '}url'), '{' + namespace + '}loc').text = url
    ET.indent(node)
    text = '<?xml version="1.0" encoding="utf-8"?>\n<!-- INERT CANDIDATE: audit every retained legacy URL before production. No fabricated lastmod. -->\n' + ET.tostring(node, encoding='unicode') + '\n'
    path = ROOT / 'seo/production/sitemap.candidate.xml'
    if check:
        assert path.read_text() == text, 'Stale candidate sitemap'
    else:
        path.write_text(text)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--apply-preview', action='store_true')
    args = parser.parse_args()
    assert not (args.check and args.apply_preview)
    frozen = CONFIG.get('productionHandoff')
    if frozen:
        import hashlib
        for name, digest in frozen['files'].items():
            assert hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == digest, 'Protected release file changed: ' + name
        # The owner explicitly froze canonical/schema/robots/sitemap changes.
        # Preview metadata is checked by verify.inspect; release data stays byte-identical.
        if args.apply_preview:
            for page in CONFIG['pages']:
                if page['status'] == 'developed':
                    apply_preview(page)
        print('PASS: frozen release artifacts preserved; preview metadata only')
    else:
        meta = metadata()
        output(ROOT / 'seo/production/metadata.json', meta, args.check)
        # Backward-compatible knife handoff, generated from the same registry.
        knife = next(p for p in meta['pages'] if p['path'] == '/servicios/afilado-cuchillos-valencia/')
        output(ROOT / CONFIG['sourceRoot'] / 'servicios/afilado-cuchillos-valencia/production-seo.json',
               {'status': meta['status'], **{k: v for k, v in knife.items() if k != 'path'}}, args.check)
        sitemap_candidate(args.check)
        if args.apply_preview:
            for page in CONFIG['pages']:
                if page['status'] == 'developed':
                    apply_preview(page)
        print('PASS: metadata and candidate sitemap are consistent; no production export/deploy performed')
