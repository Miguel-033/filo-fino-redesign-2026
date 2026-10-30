from pathlib import Path
import subprocess,re
root=Path(__file__).resolve().parents[2];base='7e13f4e';page='design-premium-preview/servicios/afilar-tijeras-peluqueria-valencia/index.html'
for f in subprocess.check_output(['git','ls-tree','-r','--name-only',base,'design-premium-preview'],cwd=root,text=True).splitlines():
 before=subprocess.check_output(['git','show',base+':'+f],cwd=root);after=(root/f).read_bytes()
 if f==page:
  strip=lambda t:re.sub(r'<section class="hero .*?</section>','HERO',t,count=1,flags=re.S)
  after=strip(after.decode());before=strip(before.decode())
  after=after.replace('<link rel="stylesheet" href="../afilado-cuchillos-valencia/knife-hero.css?v=compact-20261028a"><link rel="stylesheet" href="scissors-hero.css?v=scissors-20261030c">','')
  assert before==after,'Changes outside scissors Hero'
 else:assert before==after,f
print('PASS: accepted knives page/assets/CSS, homepage, other services, menu, shipping and all content outside scissors Hero byte-identical.')
