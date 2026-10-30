"""Scope/media/content regression for the owner-selected knife Hero."""
from pathlib import Path
import re,subprocess,hashlib,json
root=Path(__file__).resolve().parents[2]
base='f1643fc'
file='design-premium-preview/servicios/afilado-cuchillos-valencia/index.html'
before=subprocess.check_output(['git','show',base+':'+file],cwd=root).decode()
after=(root/file).read_text()
pattern=r' <section class="hero .*?</section>'
strip=lambda s:re.sub(pattern,'HERO',s,count=1,flags=re.S)
assert strip(before)==re.sub(r'<link rel="stylesheet" href="knife-hero.css\?v=[^"]+">','',strip(after))
for p in subprocess.check_output(['git','ls-tree','-r','--name-only',base,'design-premium-preview'],cwd=root,text=True).splitlines():
 if p in {file,'design-premium-preview/servicios/afilado-cuchillos-valencia/verify.cjs','design-premium-preview/servicios/afilado-cuchillos-valencia/checks.json'}:continue
 assert (root/p).read_bytes()==subprocess.check_output(['git','show',base+':'+p],cwd=root),p
# The supplied JPEG is copied intact, not retouched, regenerated or re-encoded.
assert hashlib.sha256((root/'design-premium-preview/assets/images/knife-approved-hero.jpeg').read_bytes()).hexdigest()=='89d245159058b70a9c6c3840d66dffde030282554278ebafd1749696956bab73'
hero=re.search(pattern,after,re.S).group()
assert '<span>Afilado de</span> <span>cuchillos</span> <span>en Valencia</span>' in hero
assert '4 €' in hero and '15 minutos' in hero and 'carga del taller' in hero
old_href=re.search(r'href="(https://wa.me/[^"]+)"',re.search(pattern,before,re.S).group()).group(1)
assert old_href in hero and hero.count('https://maps.app.goo.gl/Z4WQeCUKKeDbx8Qt7')==2
old_registry=json.loads(subprocess.check_output(['git','show',base+':seo/routes.json'],cwd=root))
registry=json.loads((root/'seo/routes.json').read_text())
for page in old_registry['pages']:
 if page['path']=='/servicios/afilado-cuchillos-valencia/':page['h1Contains']='Afilado de cuchillos en Valencia'
assert registry==old_registry,'Only the expected visible H1 may change in the test registry'
print('PASS: other pages/media/CSS/JS and page outside Hero byte-identical; supplied JPEG intact; price/conditions/CTA/metadata/URL preserved.')
