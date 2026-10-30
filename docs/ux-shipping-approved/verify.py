"""Narrow scope guard for the approved shipping composition."""
from pathlib import Path
import re
import subprocess

BASE = '5accdddf29897baa72db760903b11bafc2a98fc4'
ROOT = Path(__file__).resolve().parents[2]
def before(path):
    return subprocess.check_output(['git', 'show', f'{BASE}:{path}'], cwd=ROOT)
def outside_shipping(text):
    text = re.sub(r'    <section id="trabajos"[\s\S]*?    </section>', 'SHIPPING', text, count=1)
    return re.sub(r'shipping.css\?v=[^" ]+', 'shipping.css?v=VERSION', text)
page = ROOT / 'design-premium-preview/index.html'
assert outside_shipping(before(str(page.relative_to(ROOT))).decode()) == outside_shipping(page.read_text())
for path in ['design-premium-preview/shipping.js', 'design-premium-preview/assets/illustrations/envios.webp']:
    assert before(path) == (ROOT / path).read_bytes(), path
css_path = 'design-premium-preview/shipping.css'
modal_rules = lambda s: re.findall(r'#shipping-dialog[^{}]*\{[^{}]*\}', s)
assert modal_rules(before(css_path).decode()) == modal_rules((ROOT / css_path).read_text())
assert 'noindex, nofollow' in page.read_text()
print('PASS: only shipping markup and scoped CSS changed; modal, media and preview noindex preserved')
