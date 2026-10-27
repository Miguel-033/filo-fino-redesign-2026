"""Materialize shared header/footer in source HTML; no browser injection or deploy."""
import argparse
import json
import posixpath
import re
from urllib.parse import quote
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'design-premium-preview'
PAGES = [(p['source'], (posixpath.relpath('/', '/' + posixpath.dirname(p['source'])) + '/') if '/' in p['source'] else '') for p in json.loads((ROOT / 'seo/routes.json').read_text())['pages'] if p['status'] == 'developed']


def render(check=False):
    for name, prefix in PAGES:
        path = WEB / name
        before = path.read_text()
        contact = '#visita' if 'id="visita"' in before else prefix + '#visita'
        message = ('Hola, quiero consultar el afilado para mi restaurante o cocina profesional. ¿Puedo enviar fotos, cantidad de cuchillos y dirección para acordar precio, plazo y posible recogida y entrega?' if 'hosteleria' in name else 'Hola, tengo una consulta sobre el afilado de una herramienta. ¿Te puedo enviar una foto?')
        whatsapp = 'https://wa.me/34614005053?text=' + quote('[Filo Fino · Web]\n' + message, safe='')
        result = before
        for component in ['header', 'footer', 'menu']:
            template = (ROOT / 'design-system/components' / (component + '.html')).read_text().strip()
            value = template.replace('{{root}}', prefix).replace('{{home}}', prefix or './').replace('{{contact}}', contact).replace('{{whatsapp}}', whatsapp)
            if component == 'footer' and 'hosteleria' in name:
                value = re.sub(r'href="https://wa.me/[^"]+"', lambda m: 'href="' + whatsapp + '"', value).replace(' data-whatsapp="general"', '')
            tag = {'header': 'header', 'footer': 'footer', 'menu': 'dialog'}[component]
            cls = {'header': 'site-header', 'footer': 'site-footer', 'menu': 'menu-dialog'}[component]
            result, count = re.subn(r'<' + tag + r' (?=[^>]*class="' + cls + r'\b)[^>]*>.*?</' + tag + '>', lambda m: value, result, count=1, flags=re.S)
            assert count == 1, name + ': component not found'
        if check:
            assert result == before, name + ': stale shared components; run python design-system/render_components.py'
        else:
            path.write_text(result)
    print('PASS: shared static header/footer ' + ('match templates' if check else 'rendered into all developed pages'))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    render(parser.parse_args().check)
