"""Materialize shared header/footer in source HTML; no browser injection or deploy."""
import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'design-premium-preview'
PAGES = [('index.html', ''), ('servicios/afilado-cuchillos-valencia/index.html', '../../')]


def render(check=False):
    for name, prefix in PAGES:
        path = WEB / name
        before = path.read_text()
        header = re.search(r'<header class="site-header".*?</header>', before, re.S).group()
        nav = re.search(r'<nav class="desktop-nav".*?</nav>', header, re.S).group()
        result = before
        for component in ['header', 'footer']:
            template = (ROOT / 'design-system/components' / (component + '.html')).read_text().strip()
            value = template.replace('{{root}}', prefix).replace('{{home}}', prefix or './').replace('{{desktop_nav}}', nav)
            tag = 'header' if component == 'header' else 'footer'
            cls = 'site-header' if component == 'header' else 'site-footer'
            result, count = re.subn(r'<' + tag + r' class="' + cls + r'\b.*?</' + tag + '>', lambda m: value, result, count=1, flags=re.S)
            assert count == 1, name + ': component not found'
        if check:
            assert result == before, name + ': stale shared components; run python design-system/render_components.py'
        else:
            path.write_text(result)
    print('PASS: shared static header/footer ' + ('match templates' if check else 'rendered into both pages'))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    render(parser.parse_args().check)
