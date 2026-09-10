"""Renderiza S06/S07 desde sus MDX. Uso: python3 scripts/generar-decks-territorio.py.
Los bloques slide conservan el contenido en la fuente de verdad y permiten regenerar
HTML y outlines sin duplicar la edición. El shell de navegación proviene de S05.
"""
from pathlib import Path
import re, html, base64, sys
from urllib.parse import urlparse
R=Path(__file__).resolve().parents[1]
base=(R/'public/presentaciones/ps3/s05/index.html').read_text()
head=base.split('<div class="slides-container">')[0]
tail='<div class="nav-hint">'+base.split('<div class="nav-hint">',1)[1]
opening=base.split('<div class="slides-container">',1)[1].split('<div class="slide slide--section',1)[0].strip()
# Reutiliza el GIF de apertura como archivo local para que el nuevo HTML sea legible.
match=re.search(r'data:image/gif;base64,([^" ]+)',opening)
asset=R/'public/presentaciones/ps3/shared';asset.mkdir(exist_ok=True)
if match:
 (asset/'espera.gif').write_bytes(base64.b64decode(match[1]))
 opening=opening.replace(match[0],'../shared/espera.gif')
cover='<div class="slide slide--section" style="background:#eeff41"><p class="portada-top" style="color:#333">Pensamiento</p><p class="portada-bottom" style="color:#111">SENSORIAL</p></div>'
def inline(x):
 x=html.escape(x)
 x=re.sub(r'\[([^]]+)\]\(([^)]+)\)',r'<a href="\2" target="_blank" rel="noopener">\1</a>',x)
 return x
CSS='''
.unit-memory {text-align:left;align-items:stretch;padding:3rem 7vw 4rem;gap:1.2rem;}
.unit-memory .unit-heading {margin-bottom:0;}
.memory-claim {font-size:clamp(1.5rem,2.7vw,2.4rem);font-weight:700;line-height:1.3;max-width:45ch;color:#222;}
.memory-explanation {font-size:clamp(1.15rem,1.8vw,1.55rem);line-height:1.5;max-width:64ch;color:#444;}
.memory-question {font-size:clamp(1.1rem,1.8vw,1.55rem);line-height:1.4;border-top:1px solid #ccc;padding-top:1rem;max-width:65ch;color:#444;}
.memory-source {font-size:1rem;color:#6f6f6f;}
.memory-source a {color:#246b70;border-color:#246b70;}
@media(max-width:700px){.unit-memory{padding:2rem 1.5rem 5rem;overflow-y:auto;justify-content:flex-start;}}
/* S06/S07: consignas autónomas y relaciones editables, sobre el shell de S05. */
.slide--conclusion .tema-central {font-size:clamp(2rem,5.5vw,4.2rem);text-transform:none;max-width:23ch;line-height:1.15;}
.unit-story {display:flex;flex-direction:column;align-items:center;gap:.2rem;}
.unit-story div {border:1px solid #444;padding:.6rem 1rem;max-width:700px;width:100%;}
.unit-story b {font-size:1rem;color:#6f6f6f;}
.unit-story p {font-size:1.4rem;color:#222;line-height:1.3;}
.unit-story span {color:#444;}
.unit-time a {color:#246b70;border-color:#246b70;font-size:.95em;}
.unit-heading {font-size:clamp(1.6rem,3vw,2.6rem);line-height:1.2;color:#222;max-width:1100px;width:100%;margin-bottom:1.3rem;font-weight:900;}
.unit-support {font-size:clamp(1rem,1.6vw,1.35rem);line-height:1.5;color:#6f6f6f;max-width:68ch;margin-top:1.2rem;}
.unit-activity,.unit-compare,.unit-sources {text-align:left;align-items:stretch;padding:3.2rem 6vw 4rem;}
.unit-activity {justify-content:flex-start;}
.unit-time {font-size:clamp(1.1rem,1.65vw,1.4rem);font-weight:700;color:#444;margin-bottom:1rem;}
.unit-activity ol {list-style:none;counter-reset:step;max-width:1120px;width:100%;}
.unit-activity li {counter-increment:step;display:flex;gap:1.2rem;border-top:1px solid #e5e5e5;padding:.85rem 0;font-size:clamp(1.1rem,1.85vw,1.6rem);line-height:1.4;color:#444;}
.unit-activity li:before {content:counter(step,decimal-leading-zero);font-size:1rem;font-weight:700;color:#6f6f6f;padding-top:.25rem;}
.unit-columns {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.6rem 2.8rem;}
.unit-columns.three {grid-template-columns:repeat(3,minmax(0,1fr));}
.unit-column {border-top:3px solid #444;padding-top:1rem;}
.unit-column h3 {font-size:clamp(1.2rem,2vw,1.8rem);color:#222;margin-bottom:.8rem;line-height:1.25;}
.unit-column p {font-size:clamp(1.05rem,1.7vw,1.5rem);line-height:1.5;color:#444;}
.unit-definition {max-width:42ch;font-size:clamp(1.5rem,2.6vw,2.25rem);line-height:1.5;color:#444;text-align:left;}
.unit-sources li {font-size:clamp(1rem,1.6vw,1.35rem);line-height:1.5;margin:.75rem 0;color:#444;list-style:none;}
.unit-sources a,.unit-compare a {color:#246b70;border-color:#246b70;}
.unit-flow svg {width:90%;max-height:60vh;}
.unit-flow .diagram-mobile {max-width:500px;}
.unit-flow .dm-box strong {font-size:1.2rem;}
.unit-table {text-align:left;align-items:stretch;padding:3rem 6vw 4rem;}
.unit-table-scroll {overflow-x:auto;width:100%;}
.unit-table table {border-collapse:collapse;width:100%;color:#444;table-layout:fixed;}
.unit-table th,.unit-table td {text-align:left;vertical-align:top;padding:1rem;border-bottom:1px solid #e5e5e5;font-size:clamp(1.05rem,1.7vw,1.45rem);line-height:1.4;overflow-wrap:anywhere;}
.unit-table th {color:#222;font-weight:900;border-bottom:3px solid #444;}
.unit-table-scroll:focus-visible {outline:3px solid #222;outline-offset:3px;}
@media(max-width:700px) {
 .unit-table {padding:2rem 1.5rem 5rem;overflow-y:auto;justify-content:flex-start;}
 .unit-table table {min-width:640px;}
 .unit-table th,.unit-table td {font-size:1rem;padding:.8rem;}
 .unit-activity,.unit-compare,.unit-sources,.unit-flow {padding:2rem 1.5rem 5rem;justify-content:flex-start;overflow-y:auto;}
 .unit-columns,.unit-columns.three {grid-template-columns:1fr;gap:1.3rem;}
 .unit-definition {font-size:1.25rem;}
 .unit-flow .diagram-mobile {display:flex;}
 .unit-flow svg {display:none;}
 .unit-heading {font-size:1.65rem;}
}
@media(max-height:650px) and (min-width:701px){
 .unit-activity,.unit-compare,.unit-sources {padding-top:1.5rem;padding-bottom:3rem;}
 .unit-heading{font-size:1.9rem;margin-bottom:.7rem;}
 .unit-activity li{font-size:1.15rem;padding:.55rem 0;}
 .unit-column p{font-size:1.1rem;}
 .unit-time{font-size:1rem;}
}
'''
head=head.replace('</style>',CSS+'\n</style>')
def render(kind,title,body):
 H=inline(title);B=inline(body)
 if kind=='resource':
  link=re.fullmatch(r'\[([^]]+)\]\(([^)]+)\)',body)
  if not link: raise ValueError(f'Recurso sin enlace: {title}')
  route=urlparse(link[2]).path.rstrip('/')
  qr={
   '/pensamiento-sensorial/una-pregunta-visible':'qr-clase6.png',
   '/pensamiento-sensorial/defender-el-territorio':'qr-clase7.png',
   '/pensamiento-sensorial/hacer-perceptible-una-intencion':'qr-identidad.png',
  }[route]
  return f'<div class="slide unit-resource"><h2 class="unit-heading">{H}</h2><img src="../shared/{qr}" alt="Código QR: {html.escape(link[1])}" style="width:240px;max-width:60vw;image-rendering:pixelated"><p class="unit-support">{B}</p><p class="unit-support">Abran esta consigna y manténganla a mano.</p></div>'
 if kind=='memory':
  claim,explanation,question,source=body.split('\n\n')
  return f'<div class="slide unit-memory"><h2 class="unit-heading">{H}</h2><p class="memory-claim">{inline(claim)}</p><p class="memory-explanation">{inline(explanation)}</p><p class="memory-question">{inline(question)}</p><p class="memory-source">{inline(source)}</p></div>'
 if kind=='example':
  return f'<div class="slide unit-compare"><h2 class="unit-heading">{H}</h2><div class="unit-story"><div><b>1 · Situación</b><p>Dos relatos del mismo encuentro</p></div><span>↓</span><div><b>2 · Posibilidad</b><p>Conservar uno o conservar ambos</p></div><span>↓</span><div><b>3 · Acción</b><p>Mover las tarjetas</p></div><span>↓</span><div><b>4 · Respuesta y consecuencia</b><p>Un relato elegido o dos versiones que siguen discrepando</p></div></div><p class="unit-support">{B}</p></div>'
 if kind=='section':return f'<div class="slide slide--section" style="background:#eeff41"><p class="section-kicker">{B}</p><p class="section-theme">{H}</p></div>'
 if kind in ('sentence','closing'):
  style=' style="background:#111"' if kind=='closing' else ''
  klass='tema-central' if kind=='closing' else 'slide-title'
  return f'<div class="slide{" slide--conclusion" if kind=="closing" else ""}"{style}><p class="{klass}">{H}</p>'+ (f'<p class="unit-support">{B}</p>' if body else '')+'</div>'
 if kind=='definition':return f'<div class="slide"><h2 class="unit-heading">{H}</h2><p class="unit-definition">{B}</p></div>'
 if kind=='image':
  m=re.fullmatch(r'!\[(.*?)\]\((.*?)\)',body) or re.fullmatch(r'<img alt="([^"]*)" src="([^"]*)" style="max-width:100%;height:auto" />',body)
  return f'<div class="slide"><img class="slide-image" src="{m[2].replace("/presentaciones/ps3/","../")}" alt="{html.escape(m[1])}"></div>'
 if kind=='activity':
  lines=body.splitlines(); items=''.join('<li>'+inline(x[2:])+'</li>' for x in lines if x.startswith('- '))
  return f'<div class="slide unit-activity"><h2 class="unit-heading">{H}</h2><p class="unit-time">{inline(lines[0])}</p><ol>{items}</ol></div>'
 if kind=='compare':
  main,*notes=body.split('\n\n'); rows=main.splitlines()
  cells=''.join('<div class="unit-column"><h3>'+inline(x.split(' | ',1)[0])+'</h3><p>'+inline(x.split(' | ',1)[1])+'</p></div>' for x in rows)
  return f'<div class="slide unit-compare"><h2 class="unit-heading">{H}</h2><div class="unit-columns{" three" if len(rows)==3 else ""}">{cells}</div>'+''.join(f'<p class="unit-support">{inline(n)}</p>' for n in notes)+'</div>'
 if kind=='table':
  main,*notes=body.split('\n\n')
  rows=[r.split(' | ') for r in main.splitlines()]
  if any(len(r)!=len(rows[0]) for r in rows): raise ValueError(f'Tabla irregular: {title}')
  headers=''.join(f'<th scope="col">{inline(v)}</th>' for v in rows[0])
  cells=''.join('<tr>'+''.join(f'<td>{inline(v)}</td>' for v in row)+'</tr>' for row in rows[1:])
  return f'<div class="slide unit-table"><h2 class="unit-heading">{H}</h2><div class="unit-table-scroll" role="region" aria-label="{H}" tabindex="0"><table><thead><tr>{headers}</tr></thead><tbody>{cells}</tbody></table></div>'+''.join(f'<p class="unit-support">{inline(v)}</p>' for v in notes)+'</div>'
 if kind=='questions':
  return f'<div class="slide slide--preguntas-grandes"><p class="pg-titulo">{H}</p><ul class="pg">'+''.join('<li>'+inline(x)+'</li>' for x in body.splitlines())+'</ul></div>'
 if kind=='sources':
  return f'<div class="slide unit-sources"><h2 class="unit-heading">{H}</h2><ul>'+''.join('<li>'+inline(x[2:])+'</li>' for x in body.splitlines() if x.startswith('- '))+'</ul><p class="unit-support">'+inline(body.split('\n\n')[-1])+'</p></div>'
 if kind=='flow':
  nodes=body.split(' → '); svg=[];mobile=[]; count=len(nodes)
  # Secuencia vertical con equivalente HTML para móvil.
  for i,n in enumerate(nodes):
   y=45+i*70; fill='#eeff41' if i==count-1 else '#fff'
   svg.append(f'<rect x="220" y="{y}" width="460" height="50" fill="{fill}" stroke="#444"/>')
   svg.append(f'<text x="450" y="{y+32}" text-anchor="middle" font-family="Roboto, sans-serif" font-size="23" font-weight="700" fill="#222">{inline(n)}</text>')
   if i<count-1:svg.append(f'<path d="M450 {y+50}v17m-5 -5 5 5 5 -5" fill="none" stroke="#444" stroke-width="2"/>')
   mobile.append(f'<div class="dm-box {"accent" if i==count-1 else "neutral"}"><strong>{inline(n)}</strong></div>')
   if i<count-1:mobile.append('<span class="dm-arrow">↓</span>')
  return f'<div class="slide slide--visual unit-flow"><h2 class="unit-heading">{H}</h2><svg viewBox="0 0 900 {count*70+30}" role="img" aria-label="{html.escape(body)}">'+''.join(svg)+'</svg><div class="diagram-mobile">'+''.join(mobile)+'</div></div>'
 raise ValueError(kind)
for n in ([int(v) for v in sys.argv[1:]] or (6,7)):
 src=(R/f'src/content/sesiones/ps3-s{n:02}.mdx').read_text()
 deck_source=src.split('\n# Consigna ampliada')[0]
 blocks=re.findall(r'^## (.*?)\n\n\{/\* slide:(\w+) \*/\}\n\n(.*?)(?=^## |\Z)',deck_source,re.S|re.M)
 title=blocks[0][0]; slides=[opening,cover]+[render(t,h,b.strip()) for h,t,b in blocks]
 if n==6:
  for i,(h,t,b) in enumerate(blocks,2):
   if t=='activity' or h=='Pausa':
    minutes=re.match(r'(\d+) min',b.strip())
    if minutes: slides[i]=slides[i].replace('class="slide',f'data-minutes="{minutes[1]}" class="slide',1)
 dest=R/f'public/presentaciones/ps3/s{n:02}/index.html';dest.parent.mkdir(exist_ok=True)
 localhead=re.sub(r'<title>.*?</title>',f'<title>Clase {n} — {title} | Pensamiento Sensorial</title>',head)
 if n==6:
  localhead=localhead.replace('</style>',"""
.workshop-timer {position:fixed;bottom:1rem;left:1.5rem;display:flex;align-items:center;gap:.7rem;color:#222;background:#fff;padding:.35rem .5rem;z-index:20;font-family:Roboto,sans-serif;}
.workshop-timer[hidden] {display:none;}
.workshop-timer output {font-size:1.8rem;font-weight:900;font-variant-numeric:tabular-nums;}
.workshop-timer button {border:0;border-bottom:1px solid #444;background:transparent;color:#444;padding:.3rem;font:inherit;cursor:pointer;}
.workshop-timer button:focus-visible {outline:3px solid #222;outline-offset:3px;}
.workshop-timer button:disabled {border:0;cursor:default;}
@media(max-width:700px) {.workshop-timer {left:.6rem;bottom:.5rem;gap:.4rem;font-size:.8rem;}.workshop-timer output{font-size:1.3rem;}}
@media print {.workshop-timer{display:none!important;}}
</style>""")
 localtail=tail.replace('</body>','<script src="taller.js"></script></body>') if n==6 else tail
 if n==6:
  localtail=localtail.replace("t.matches('input, textarea, select')", "t.matches('input, textarea, select, .unit-table-scroll')")
  localtail=localtail.replace("'.deck-nav, a, button, .demo, video, iframe'", "'.deck-nav, a, button, .demo, video, iframe, .unit-table-scroll'")
  localtail=localtail.replace("if (target.closest('a') || target.closest('.deck-nav')) return;", "if (target.closest('a, .deck-nav, .unit-table-scroll')) return;")
 dest.write_text(localhead+'<div class="slides-container">\n'+ '\n\n'.join(slides)+'\n</div>\n'+localtail)
 dest.write_text('\n'.join(line.rstrip() for line in dest.read_text().splitlines())+'\n')
 outline=f'# Clase {n} · {title}\n\nFuente de verdad: `src/content/sesiones/ps3-s{n:02}.mdx`.\n\n1. Espera · Gracias por la puntualidad.\n2. Apertura · Pensamiento SENSORIAL.\n'
 outline+=''.join(f'{i}. {t} · {h}\n' for i,(h,t,b) in enumerate(blocks,3))
 (R/f'outlines/ps3-s{n:02}.outline.md').write_text(outline)
 print(f'S{n:02}: {len(slides)} diapositivas')

 guide_sections=src.split('\n# Consigna ampliada\n\n',1)[1].split('\n# Consigna de identidad\n\n')
 if n==6 and len(guide_sections)!=2: raise ValueError('La clase 6 requiere las dos consignas')
 guide=guide_sections[0].strip()
 slug='una-pregunta-visible' if n==6 else 'defender-el-territorio'
 guide_title='El lugar que ya no está' if n==6 else 'Defender el territorio'
 intro='Clase 6 · Jueves 10 de septiembre de 2026' if n==6 else 'Clase 7 · Jueves 17 de septiembre de 2026'
 page="---\nimport Base from '../../layouts/Base.astro';\n---\n"
 description='Taller común para examinar cómo las decisiones de interacción proponen una relación.' if n==6 else 'Consigna paso a paso de la clase 7 para preparar el anteproyecto del viernes 18.'
 page+=f'<Base titulo="{guide_title} · Pensamiento Sensorial" descripcion="{description}" volverHref="/pensamiento-sensorial/s{n:02}" volverTexto="Clase {n}"><section class="hero-clase"><p class="mono">{intro}</p><h1>{guide_title}</h1></section>'+guide+'</Base>'
 page+="""<style>
 .pieza{border-top:1px solid var(--regla);padding:1.5rem 0;} .pieza h3{font-family:var(--sans);font-size:1.6rem;} .pieza .mono{font-size:.8rem;} .bloque{scroll-margin-top:2rem;} .paso-guia h2{font-family:var(--sans);font-size:clamp(1.5rem,3vw,2.1rem);line-height:1.2;margin-bottom:.7rem;}
 .tiempo{font-family:var(--sans);color:var(--tinta);margin-bottom:1rem;} .paso-guia ol{padding-left:1.5rem;max-width:56rem;}
 li{padding:.45rem 0;line-height:1.65;} .salida{border-left:7px solid var(--amarillo);padding:.8rem 1.2rem;margin:1.4rem 0;}
 .salida p{margin:0;} details{border-top:1px solid var(--regla);padding:.9rem 0;max-width:56rem;} summary{cursor:pointer;font-family:var(--sans);font-weight:700;color:var(--tinta);}
 details p{margin-top:.8rem;} summary:focus-visible{outline:3px solid var(--tinta);outline-offset:4px;}
 .indice-guia{display:flex;flex-wrap:wrap;gap:.7rem 1.5rem;border-block:1px solid var(--regla);padding:1.5rem 0;font-family:var(--sans);}
 .tabla-scroll{overflow-x:auto;} table{border-collapse:collapse;min-width:500px;max-width:65rem;} th,td{padding:.8rem;border-bottom:1px solid var(--regla);text-align:left;vertical-align:top;}th{font-family:var(--sans);}
 @media(max-width:600px){.indice-guia{display:grid;grid-template-columns:1fr;}}
 @media print{details{display:block;}details>p{display:block;} .indice-guia{display:none;}section{break-inside:auto;}h2{break-after:avoid;}}
 </style>"""
 (R/f'src/pages/pensamiento-sensorial/{slug}.astro').write_text(page)
 if n==6:
  identity_title='Hacer perceptible una intención'
  identity_page="---\nimport Base from '../../layouts/Base.astro';\n---\n"
  identity_page+=f'<Base titulo="{identity_title} · Pensamiento Sensorial" descripcion="Una consigna sobre el proyecto propio: empieza en clase 6 y continúa en casa para el jueves 17 de septiembre." volverHref="/pensamiento-sensorial/s06" volverTexto="Clase 6"><section class="hero-clase"><p class="mono">Proyecto propio · En clase y en casa · Para el jueves 17</p><h1>{identity_title}</h1></section>'+guide_sections[1].strip()+'</Base>'
  identity_page+='<style>'+page.split('<style>',1)[1]
  (R/'src/pages/pensamiento-sensorial/hacer-perceptible-una-intencion.astro').write_text(identity_page)
