"""Build local preview or offline production candidate. No network or deployment."""
import argparse
import html
import json
import re
import shutil
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'seo/routes.json').read_text())
WEB = ROOT / CONFIG['sourceRoot']
PAGES = CONFIG['pages'] + CONFIG['legalPages']


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.resources, self.links = [], []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'a' and d.get('href'):
            self.links.append(d['href'])
        for attr in ('src', 'poster', 'data-poster'):
            if d.get(attr):
                self.resources.append(d[attr])
        if tag == 'link' and d.get('rel') in ('stylesheet', 'preload', 'icon', 'manifest'):
            self.resources.append(d['href'])
        if d.get('srcset'):
            self.resources.extend(x.strip().split()[0] for x in d['srcset'].split(','))


def resolve(base, ref):
    parsed = urlsplit(ref)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return None
    target = ((WEB if parsed.path.startswith('/') else base.parent) / unquote(parsed.path.lstrip('/'))).resolve()
    assert target.is_relative_to(WEB) and target.is_file(), f'Missing/unsafe resource: {base}: {ref}'
    return target


def dependencies():
    pending = [WEB / p['source'] for p in PAGES]
    seen = set()
    while pending:
        file = pending.pop()
        if file in seen:
            continue
        assert file.is_file(), file
        seen.add(file)
        refs = []
        if file.suffix == '.html':
            doc = References()
            doc.feed(file.read_text())
            refs = doc.resources
            # Media download links are dependencies too, including fallback videos.
            refs += [x for x in doc.links if re.search(r'\.(?:mp4|webp|png|jpe?g|svg)(?:[?#]|$)', x)]
        elif file.suffix == '.css':
            refs = re.findall(r'url\([\'"]?([^\)\'"\s]+)', file.read_text())
        elif file.suffix == '.js':
            refs = re.findall(r'[\'"]((?:assets/|\.{1,2}/assets/)[^\'"\s]+)[\'"]', file.read_text())
        for ref in refs:
            target = resolve(file, ref)
            if target:
                pending.append(target)
    # Required font licence notices accompany the local fonts in either build.
    seen.update((WEB / 'assets/fonts').glob('*OFL.txt'))
    return sorted(seen)


def build(mode, output):
    dest = output.resolve()
    assert not dest.exists() or not any(dest.iterdir()), 'Use a new or empty build directory'
    assert dest != ROOT and not dest.is_relative_to(WEB), 'Never overwrite source'
    dest.mkdir(parents=True, exist_ok=True)
    meta = {p['path']: p for p in json.loads((ROOT / 'seo/production/metadata.json').read_text())['pages']}
    page_by_file = {p['source']: p for p in PAGES}
    copied = []
    for source in dependencies():
        relative = source.relative_to(WEB)
        target = dest / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.suffix == '.html':
            text = source.read_text()
            assert 'content="noindex, nofollow"' in text
            assert not re.search(r'rel=["\']canonical|application/ld\+json|property=["\']og:url', text)
            if mode == 'production':
                item = meta[page_by_file[str(relative)]['path']]
                text = text.replace('content="noindex, nofollow"', 'content="index, follow"')
                head = '<link rel="canonical" href="' + item['canonical'] + '">\n'
                head += '<meta property="og:url" content="' + item['canonical'] + '">\n'
                head += '<script type="application/ld+json">' + json.dumps(item['jsonld'], ensure_ascii=False).replace('<', '\\u003c') + '</script>\n'
                text = text.replace('</head>', head + '</head>', 1)
            target.write_text(text)
        else:
            shutil.copyfile(source, target)
        copied.append(str(relative))
    if mode == 'production':
        shutil.copyfile(ROOT / 'seo/production/sitemap.candidate.xml', dest / 'sitemap.xml')
        shutil.copyfile(ROOT / 'seo/production/robots.txt.template', dest / 'robots.txt')
    else:
        (dest / '.nojekyll').touch()
    assert not (dest / 'CNAME').exists()
    print(f'PASS: {mode} local build, 10 HTML pages, {len(copied)} dependency files. No deployment.')
    return dest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mode', choices=('preview', 'production'), required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    build(args.mode, args.output)
