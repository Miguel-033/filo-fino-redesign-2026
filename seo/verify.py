"""Offline source SEO gates, not a browser, Lighthouse or indexing test."""
import csv
import hashlib
import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'seo/routes.json').read_text())
WEB = ROOT / CONFIG['sourceRoot']


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta, self.ids, self.links, self.resources, self.images = {}, [], [], [], []
        self.h1, self.heading, self.h1s, self.titles = False, None, [], []
        self.canonical, self.jsonld, self.lang, self.headings = [], False, None, []
        self.in_head = False

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'head':
            self.in_head = True
        if d.get('id'):
            self.ids.append(d['id'])
        if tag == 'html':
            self.lang = d.get('lang')
        if tag == 'meta':
            key = d.get('name') or d.get('property')
            assert key not in self.meta, 'Duplicate metadata: ' + str(key)
            self.meta[key] = d.get('content')
        if tag in ['h1', 'h2', 'h3'] or (tag == 'title' and self.in_head):
            self.heading = [tag, []]
        if tag == 'a':
            assert d.get('href'), 'Anchor missing href'
            self.links.append(d['href'])
        if tag == 'img':
            assert 'alt' in d and int(d.get('width', 0)) > 0 and int(d.get('height', 0)) > 0
            self.images.append(d)
        if tag == 'link' and d.get('rel') == 'canonical':
            self.canonical.append(d.get('href'))
        if tag == 'script' and d.get('type') == 'application/ld+json':
            self.jsonld = True
        if tag in ['img', 'script'] and d.get('src'):
            self.resources.append(d['src'])
        if tag == 'link' and d.get('rel') in ['stylesheet', 'preload']:
            self.resources.append(d['href'])

    def handle_data(self, data):
        if self.heading:
            self.heading[1].append(data)

    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False
        if self.heading and self.heading[0] == tag:
            text = ' '.join(' '.join(self.heading[1]).split())
            if tag == 'h1':
                self.h1s.append(text)
            if tag == 'title':
                self.titles.append(text)
            else:
                self.headings.append((tag, text))
            self.heading = None


def inspect(page):
    file = WEB / page['source']
    text = file.read_text()
    doc = Document()
    doc.feed(text)
    assert doc.lang == 'es'
    assert doc.titles == [page['title']]
    assert len(doc.h1s) == 1 and page['h1Contains'] in doc.h1s[0]
    assert doc.meta['description'] == page['description']
    assert doc.meta['og:title'] == page['title'] and doc.meta['og:description'] == page['description']
    assert doc.meta['robots'] == 'noindex, nofollow'
    assert not doc.canonical and not doc.jsonld and 'og:url' not in doc.meta
    assert 'user-scalable=no' not in text and 'maximum-scale=1' not in text
    assert len(doc.ids) == len(set(doc.ids))
    level = 0
    for tag, name in doc.headings:
        new_level = int(tag[1])
        assert not level or new_level <= level + 1, (file, tag, name)
        level = new_level
    for href in doc.links:
        if href.startswith('#') and href != '#':
            assert href[1:] in doc.ids, (file, href)
        assert 'sg-host' not in href and 'localhost' not in href
    urls = [urljoin(CONFIG['productionOrigin'] + page['path'], x) for x in doc.links]
    for path in page['mustLink']:
        assert CONFIG['productionOrigin'] + path in urls, (file, 'missing link', path)
    css, resources = [], set()
    for ref in doc.resources:
        assert not ref.startswith(('https:', 'http:', '//')), 'External automatic resource: ' + ref
        target = (file.parent / ref).resolve()
        assert target.is_relative_to(WEB) and target.is_file(), (file, ref)
        resources.add(target)
        if target.suffix == '.css':
            css.append(target)
    for file_css in css:
        value = file_css.read_text()
        assert 'transition:all' not in value.replace(' ', '')
        for ref in re.findall(r'url\([\'"]?([^\)\'"\s]+)', value):
            target = (file_css.parent / ref).resolve()
            assert target.is_file(), target
            resources.add(target)
    assert file.stat().st_size < 100_000, 'Project HTML budget, not a Google limit'
    return {'path': page['path'], 'title': page['title'], 'h1': doc.h1s[0],
            'htmlBytes': file.stat().st_size,
            'directAndCSSResourceBytes': sum(p.stat().st_size for p in resources),
            'images': len(doc.images), 'links': len(doc.links), 'noindex': True,
            'productionSignalsAbsent': True, 'headings': doc.headings}


def main():
    subprocess.run([sys.executable, str(ROOT / 'seo/prepare_metadata.py'), '--check'], check=True)
    pages = [p for p in CONFIG['pages'] if p['status'] == 'developed']
    assert len(pages) >= 2, 'Register additional developed pages explicitly'
    assert len({p['path'] for p in CONFIG['pages']}) == len(CONFIG['pages'])
    assert len({p['title'] for p in CONFIG['pages']}) == len(CONFIG['pages'])
    results = [inspect(p) for p in pages]
    assert len({r['h1'] for r in results}) == len(results)
    meta = json.loads((ROOT / 'seo/production/metadata.json').read_text())
    for item in meta['pages']:
        assert item['canonical'] == CONFIG['productionOrigin'] + item['path']
        assert 'github.io' not in json.dumps(item)
        graph = item['jsonld']['@graph']
        ids = {n['@id'] for n in graph}
        assert len(ids) == len(graph)
        for node in graph:
            assert not any(k in node for k in ['aggregateRating', 'review', 'offers', 'openingHoursSpecification'])
            for prop in ['provider', 'publisher', 'isPartOf', 'mainEntity', 'breadcrumb', 'about']:
                if prop in node:
                    assert node[prop]['@id'] in ids
    rows = list(csv.DictReader((ROOT / 'seo/migration/url-map.csv').open()))
    assert len(rows) >= 42 and all(r['old_url'] == r['new_url'] for r in rows)
    urls = [x.text for x in ET.parse(ROOT / 'seo/production/sitemap.candidate.xml').findall('.//{*}loc')]
    assert set(urls) == {r['new_url'] for r in rows}
    assert not (WEB / 'robots.txt').exists() and not (WEB / 'sitemap.xml').exists()
    assert 'SEO_ARCHITECTURE_2026.md' in (ROOT / 'AGENTS.md').read_text()
    # All images / core scripts preserved relative to the accepted PR9 source baseline.
    # PR9 source tree (same immutable tree for local and GitHub commits).
    base = '3eeaaf0f850e42a4f990415c62472274e1a7a10f'
    protected = ['design-premium-preview/premium.css', 'design-premium-preview/refinement.css',
                 'design-premium-preview/premium.js',
                 'design-premium-preview/servicios/afilado-cuchillos-valencia/knives.css',
                 'design-premium-preview/servicios/afilado-cuchillos-valencia/knives.js']
    protected += subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', base,
                                        'design-premium-preview/assets'], cwd=ROOT, text=True).splitlines()
    # Owner-authorized knife-only UX revision, 16.10.2026. Shared/home/media
    # remain at PR9; page-level CSS/JS have explicit reviewed hashes, not exemptions.
    knife_ui_baselines = {'design-premium-preview/servicios/afilado-cuchillos-valencia/knives.css': '3c8d419dd315bcafdfa760a088b0c20292ca4c98df34a39e889f7189e4929751', 'design-premium-preview/servicios/afilado-cuchillos-valencia/knives.js': 'cad7e0b8fe271b8416960e8f741cea99750870475c0a73a41363baba8d78f514'}
    for path in protected:
        before = subprocess.check_output(['git', 'show', base + ':' + path], cwd=ROOT)
        expected = knife_ui_baselines.get(path, hashlib.sha256(before).hexdigest())
        assert expected == hashlib.sha256((ROOT / path).read_bytes()).hexdigest(), path
    report = {'status': 'PASS', 'method': 'offline HTML/config/CSS/graph/file checks',
              'pages': results, 'retainedMigrationURLs': len(rows),
              'protectedAssetAndInteractionFiles': len(protected),
              'limitations': ['No rendered/mobile/Safari verification', 'No Lighthouse/CWV measurement',
                              'No Google Rich Results Test or guarantee of indexing/rankings']}
    (ROOT / 'seo/checks.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'pages'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
