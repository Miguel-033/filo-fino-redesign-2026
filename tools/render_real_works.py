"""Render the homepage gallery from content/real-works.json. No network or deployment."""
from pathlib import Path
from html import escape
import json,re,argparse
ROOT=Path(__file__).resolve().parents[1]
def render():
 items=json.loads((ROOT/'content/real-works.json').read_text())['items']
 assert 0<len(items)<=6 and len({x['id']for x in items})==len(items)
 cards=[]
 for x in items:
  assert x['type']in ('image','video')
  for key in ('source','thumbnail','poster'):
   if key in x:assert (ROOT/'site'/x[key]).is_file(),x[key]
  label='Vídeo'if x['type']=='video'else'Foto'
  verb='Reproducir vídeo'if x['type']=='video'else'Ampliar foto'
  cards.append(f'''        <figure class="real-work">
          <a class="real-work__open" data-real-work="{escape(x['id'])}"{(' data-poster="'+escape(x['poster'])+'"')if x.get('poster')else''} href="{escape(x['source'])}" aria-label="{verb}: {escape(x['caption'])}">
            <span class="real-work__preview"><img src="{escape(x['thumbnail'])}" alt="{escape(x['alt'])}" width="360" height="640" loading="lazy" decoding="async"><span class="real-work__type">{label}{(' · '+escape(x['duration']))if x.get('duration')else''}</span></span>
            <span class="real-work__action">{'Ver vídeo'if x['type']=='video'else'Ver foto'}</span>
          </a>
          <figcaption>{escape(x['caption'])}</figcaption>
        </figure>''')
 # Source provenance stays in the editable manifest, not in the public interface.
 data=[{k:v for k,v in x.items()if k!='provenance'}for x in items]
 payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
 return '''<!-- real-works:start -->
    <section id="trabajos-reales" class="real-works section-shell" aria-labelledby="real-works-title">
      <header class="real-works__heading"><h2 id="real-works-title">Trabajos reales.</h2><p>El resultado habla por sí solo.</p></header>
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
