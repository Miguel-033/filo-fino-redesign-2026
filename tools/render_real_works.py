"""Render the homepage gallery from content/real-works.json. No network or deployment."""
from pathlib import Path
from html import escape
import json,re,argparse
ROOT=Path(__file__).resolve().parents[1]
def render():
 items=json.loads((ROOT/'content/real-works.json').read_text())['items']
 assert 0<len(items)<=6 and len({x['id']for x in items})==len(items)
 categories=('cuchillos','tijeras','manicura')
 cards=[]
 for x in items:
  assert x['type']in ('image','video')
  for key in ('source','cover','poster'):
   if key in x:assert (ROOT/'site'/x[key]).is_file(),x[key]
  category=x.get('category')
  assert category is None or category in categories
  category_attribute=f' data-category="{category}"' if category else ''
  label='Vídeo'if x['type']=='video'else'Foto'
  verb='Reproducir vídeo'if x['type']=='video'else'Ampliar foto'
  icon='<path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none"/>'if x['type']=='video'else'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.75"/>'
  cards.append(f'''        <article class="real-work"{category_attribute} style="--preview-ratio:{escape(x['previewRatio'])};--preview-position:{escape(x['previewPosition'])}">
          <a class="real-work__open" data-real-work="{escape(x['id'])}"{(' data-poster="'+escape(x['poster'])+'"')if x.get('poster')else''} href="{escape(x['source'])}" aria-label="{verb}: {escape(x['caption'])}">
            <span class="real-work__preview"><img src="{escape(x['cover'])}" alt="" width="{x['width']}" height="{x['height']}" loading="lazy" decoding="async"></span>
            <span class="real-work__type"><svg class="real-work__icon" viewBox="0 0 24 24" aria-hidden="true">{icon}</svg><span>{escape(x['duration'])if x.get('duration')else label}</span></span>
            <span class="real-work__content"><span class="real-work__title">{escape(x['coverTitle'])}</span></span>
          </a>
        </article>''')
 # Source provenance stays in the editable manifest, not in the public interface.
 data=[{k:v for k,v in x.items()if k!='provenance'}for x in items]
 payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
 anchors=''.join(f'      <div id="trabajos-reales-{category}" aria-hidden="true"></div>\n' for category in categories)
 return '''<!-- real-works:start -->
    <section id="trabajos-reales" class="real-works section-shell" aria-labelledby="real-works-title">
'''+anchors+'''      <header class="real-works__heading"><h2 id="real-works-title">Trabajos reales.</h2><p>El resultado habla por sí solo.</p></header>
      <div class="real-works__grid">
'''+ '\n'.join(cards)+'''
      </div>
    </section>
    <dialog id="real-works-dialog" class="real-works-dialog" aria-labelledby="real-works-view-title">
      <div class="real-works-dialog__shell">
        <header class="real-works-dialog__header"><h2 id="real-works-view-title"></h2><button class="real-works-dialog__close" type="button" autofocus>Cerrar</button></header>
        <div class="real-works-dialog__media"></div>
      </div>
    </dialog>
    <script type="application/json" id="real-works-data">'''+payload+'''</script>
    <!-- real-works:end -->'''
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
 p=ROOT/'site/index.html';html=p.read_text();new=render()
 if '<!-- real-works:start -->'in html:expected=re.sub(r'<!-- real-works:start -->.*?<!-- real-works:end -->',lambda _:new,html,flags=re.S)
 else:expected=html.replace('    <section id="visita"',new+'\n\n    <section id="visita"',1)
 if args.check:assert expected==html,'Run python tools/render_real_works.py after editing the gallery manifest.'
 else:p.write_text(expected)
if __name__=='__main__':main()
