"""Export approved static files into a LOCAL preview/* worktree. Never deploys."""
import argparse
import json
import posixpath
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'seo/routes.json').read_text())
SOURCE = ROOT / CONFIG['sourceRoot']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    dest = args.output.resolve()
    remote = subprocess.check_output(['git', 'remote', 'get-url', 'origin'], cwd=dest, text=True).strip()
    branch = subprocess.check_output(['git', 'branch', '--show-current'], cwd=dest, text=True).strip()
    assert remote == 'https://github.com/Miguel-033/filo-fino-redesign-2026.git'
    assert branch.startswith('preview/') and dest != ROOT, 'Use a separate preview/* worktree'
    assert (dest / '.nojekyll').exists() and not (dest / 'CNAME').exists()
    developed = {p['path'] for p in CONFIG['pages'] if p['status'] == 'developed'}
    files = list(CONFIG['sharedAssets'])
    for page in CONFIG['pages']:
        if page['status'] != 'developed':
            continue
        relative = page['source']
        content = (SOURCE / relative).read_text()
        assert 'content="noindex, nofollow"' in content
        assert not re.search(r'rel=["\']canonical|application/ld\+json|property=["\']og:url', content)

        def href(match):
            value = match.group(1)
            if value.startswith(CONFIG['productionOrigin'] + '/'):
                route = value[len(CONFIG['productionOrigin']):]
            elif value.startswith('/') and not value.startswith('//'):
                route = value
            else:
                return match.group(0)
            if route in developed:
                start = '/' + posixpath.dirname(relative)
                target = route if route != '/' else '/'
                value = posixpath.relpath(target, start) + '/'
            else:
                value = CONFIG['productionOrigin'] + route
            return 'href="' + value + '"'

        content = re.sub(r'href="([^"]+)"', href, content)
        output = dest / relative
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(content)
        files += [str(Path(relative).parent / name) for name in page.get('assets', [])]
    for name in files:
        shutil.copyfile(SOURCE / name, dest / name)
    # Markdown provenance in the existing publishing tree has GitHub-adapted
    # document links. Keep it rather than reintroduce source-only relative URLs.
    # New media/provenance changes require a separately reviewed export update.
    for asset in (SOURCE / 'assets').rglob('*'):
        if asset.is_file() and asset.suffix != '.md':
            target = dest / 'assets' / asset.relative_to(SOURCE / 'assets')
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(asset, target)
    # No robots, sitemap, production metadata, source-only checks or docs are copied.
    assert not (dest / 'robots.txt').exists() and not (dest / 'sitemap.xml').exists()
    print('PASS: local preview export complete; no git push, ref update or deployment performed')


if __name__ == '__main__':
    main()
