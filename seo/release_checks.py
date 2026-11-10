"""Strict release checks for the approved route architecture; entirely offline."""
import csv
import hashlib
import json
import re
import tempfile
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
from xml.etree import ElementTree as ET
from build import ROOT, WEB, PAGES, CONFIG, References, dependencies, build

RETIRED = re.compile(r'/(?:zonas|blog|articulos)/')


def digest(value):
    return hashlib.sha256(value).hexdigest()


def verify_release():
    expected = {p['path'] for p in PAGES}
    assert len(expected) == len(PAGES) == 11 and len(CONFIG['pages']) == 8 and len(CONFIG['legalPages']) == 3
    assert {p['path'] for p in CONFIG['legalPages']} == {
        '/legal/aviso-legal.html', '/legal/politica-privacidad.html', '/legal/politica-cookies.html'}
    assert not any(RETIRED.search(p) for p in expected)
    assert {p.relative_to(WEB).as_posix() for p in WEB.rglob('*.html')} == {p['source'] for p in PAGES}
    baseline = json.loads((ROOT / 'seo/accepted-design.json').read_text())
    for name, old in baseline['pages'].items():
        text = (WEB / name).read_text()
        hero = re.search(r'<section\b[^>]*class="[^"]*\bhero\b.*?</section>', text, re.S).group()
        assert digest(hero.encode()) == old['heroSha256'], f'Accepted Hero changed: {name}'
        main = re.search(r'<main\b.*?</main>', text, re.S).group()
        assert digest(main.encode()) == old['mainWithRetiredLinksRemovedSha256'], f'Unapproved main-content change: {name}'
    checked = 0
    for file in dependencies():
        if file.suffix != '.html':
            name = file.relative_to(WEB).as_posix()
            if name == 'legal/legal.css':
                continue
            assert name in baseline['assets'], f'Unregistered active resource: {name}'
            assert digest(file.read_bytes()) == baseline['assets'][name], f'Approved CSS/JS/media changed: {name}'
            checked += 1
    rows = list(csv.DictReader((ROOT / 'seo/migration/url-map.csv').open()))
    assert len(rows) == len({r['old_url'] for r in rows}) == 65
    assert sum(r['source'].startswith('sitemap-42') for r in rows) == 42
    assert sum(r['observed_status'] == '200' for r in rows) == 9
    assert sum(r['observed_status'] == '404' for r in rows) == 14
    for row in rows:
        assert row['implemented'] == 'no'
        if row['new_url']:
            assert urlsplit(row['new_url']).path in expected
        if '/zonas/' in row['old_url'] or '/blog/' in row['old_url']:
            assert row['new_url'] == '', 'No wholesale area/editorial redirect'
        if row['proposed_action'] != 'keep-200':
            assert row['owner_decision'] == 'owner-approval-required'
    meta = json.loads((ROOT / 'seo/production/metadata.json').read_text())
    assert len(meta['pages']) == len(expected) and {p['path'] for p in meta['pages']} == expected
    main_meta = [p for p in meta['pages'] if p['path'] in {x['path'] for x in CONFIG['pages']}]
    assert len(main_meta) == len(CONFIG['pages'])
    work = ROOT / '.build'
    work.mkdir(exist_ok=True)
    results = []
    with tempfile.TemporaryDirectory(dir=work) as temporary:
        for mode in ('preview', 'production'):
            dest = build(mode, Path(temporary) / mode)
            pages = list(dest.rglob('*.html'))
            assert len(pages) == len(expected)
            assert not any((dest / name).exists() for name in ('seo', 'docs', 'source-materials', 'CNAME', 'qa', 'zonas', 'blog', 'articulos'))
            for p in PAGES:
                file = dest / p['source']
                text = file.read_text()
                doc = References()
                doc.feed(text)
                assert not RETIRED.search(text), f'Retired path in {mode}: {p["path"]}'
                robots = re.findall(r'<meta\s+name="robots"\s+content="([^"]+)"', text)
                if mode == 'preview':
                    assert robots == ['noindex, nofollow']
                    assert not re.search(r'rel=["\']canonical|application/ld\+json|property=["\']og:url', text)
                else:
                    assert robots == ['index, follow'] and 'noindex' not in text.lower()
                    canonical = CONFIG['productionOrigin'] + p['path']
                    assert re.findall(r'<link rel="canonical" href="([^"]+)">', text) == [canonical]
                    data = re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S)
                    assert len(data) == 1
                    graph = json.loads(data[0])['@graph']
                    assert 'github.io' not in data[0] and len({n['@id'] for n in graph}) == len(graph)
                for link in doc.links:
                    url = urlsplit(urljoin('https://build.test' + p['path'], link))
                    if url.netloc == 'build.test':
                        target = dest / unquote(url.path).lstrip('/')
                        if url.path.endswith('/'):
                            target /= 'index.html'
                        assert target.is_file(), f'Missing link {mode} {p["path"]}: {link}'
                        if url.fragment and target.suffix == '.html':
                            assert re.search(r'\bid=["\']' + re.escape(unquote(url.fragment)) + r'["\']', target.read_text()), (p['path'], link)
                for ref in doc.resources:
                    url = urlsplit(ref)
                    if url.scheme == 'data':
                        continue
                    assert not url.scheme and not url.netloc, f'External auto-loaded resource: {ref}'
                    target = (file.parent / unquote(url.path)).resolve()
                    assert target.is_relative_to(dest) and target.is_file(), (file, ref)
            if mode == 'production':
                urls = [n.text for n in ET.parse(dest / 'sitemap.xml').findall('.//{*}loc')]
                assert len(urls) == len(expected) and set(urls) == {CONFIG['productionOrigin'] + p for p in expected}
                assert (dest / 'robots.txt').read_text() == (ROOT / 'seo/production/robots.txt.template').read_text()
            else:
                assert not (dest / 'sitemap.xml').exists() and not (dest / 'robots.txt').exists()
            results.append({'mode': mode, 'pages': len(pages), 'status': 'PASS'})
    return {'migrationURLs': 65, 'productionMetadataMainPages': f'{len(main_meta)}/{len(CONFIG["pages"])}',
            'productionMetadataAllPages': f'{len(meta["pages"])}/{len(expected)}',
            'sitemapURLs': len(expected), 'acceptedHeroAndMainPages': len(baseline['pages']), 'acceptedAssetHashesChecked': checked,
            'builds': results, 'redirectsInstalled': False, 'networkOrDeploy': False}


if __name__ == '__main__':
    print(json.dumps(verify_release(), ensure_ascii=False, indent=2))
