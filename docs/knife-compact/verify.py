from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[2];base='f06d3ec'
css='design-premium-preview/servicios/afilado-cuchillos-valencia/knife-hero.css'
html='design-premium-preview/servicios/afilado-cuchillos-valencia/index.html'
for f in subprocess.check_output(['git','ls-tree','-r','--name-only',base,'design-premium-preview'],cwd=root,text=True).splitlines():
 before=subprocess.check_output(['git','show',base+':'+f],cwd=root)
 after=(root/f).read_bytes()
 if f==css:
  before=before.decode();after=after.decode();assert before.split('@media(max-width:767px)')[0]==after.split('@media(max-width:767px)')[0]
  assert before.split('@media(max-width:359px)')[1]==after.split('@media(max-width:359px)')[1]
 elif f==html:assert before.decode()==after.decode().replace('knife-hero.css?v=compact-20261028a','knife-hero.css?v=approved-20261028d')
 elif f.endswith('/afilado-cuchillos-valencia/checks.json'):continue
 else:assert before==after,f
print('PASS: only mobile Hero CSS/layout and its cache key changed; desktop CSS, image, icons, text, facts, links, menu and all other pages remain intact.')
