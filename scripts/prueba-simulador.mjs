/* Prueba de humo del simulador «Imagen del sistema».
   Recorre las 5 personas de punta a punta con la lógica pura
   del motor y verifica que el Markdown exportado trae las
   secciones clave. Uso: node scripts/prueba-simulador.mjs */
import {
  PERSONAS, GRUPOS, nuevoEstado, asignarPersona,
  personaDe, opcionDe, consecuenciaDe, exportarMarkdown
} from "../src/lib/simulador/motor.js";

let fallas = 0;
const ok = (cond, msg) => {
  if (cond) console.log("  ✓ " + msg);
  else { fallas++; console.error("  ✗ " + msg); }
};

/* --- sorteo --- */
console.log("Sorteo de grupos:");
for (const [g, id] of Object.entries(GRUPOS)) {
  ok(asignarPersona(g) === id, `grupo ${g} → ${id}`);
}
// El sorteo se resuelve una sola vez: dentro de .some() se re-sortearía
// en cada elemento y la prueba saldría distinta cada corrida.
const sinGrupo = asignarPersona("");
const grupoRaro = asignarPersona("99");
ok(PERSONAS.some(p => p.id === sinGrupo), "sin grupo → persona válida");
ok(PERSONAS.some(p => p.id === grupoRaro), "grupo desconocido → persona válida");

/* --- recorrido completo por persona --- */
const SECCIONES = [
  "# Recorrido", "Grupo", "Persona", "Lo que necesita",
  "## 1 · Lo que viví", "## 2 · Lo que observé", "Modelo mental",
  "Modelo conceptual", "Lo que el sistema da por hecho", "## 3 · Lo que diseñé",
  "## 4 · Mi replanteamiento"
];

for (const p of PERSONAS) {
  console.log(`\nPersona: ${p.id} (${p.name})`);
  const S = nuevoEstado();
  S.grupo = "2";
  S.personaId = p.id;

  // estructura mínima de contenido
  ok(p.beats.length === 3, "3 beats experienciales");
  ok(p.beats[2].shared === true, "el 3º beat es compartido");
  ok(p.design.length === 3, "3 rondas de diseño");
  ok(p.expectations.length >= 3, "expectativas del modelo mental");
  ok(!!(p.tension.person && p.tension.system && p.tension.supuesto), "tensión completa");
  ok(/^Que /.test(p.tension.supuesto), "el supuesto del sistema arranca con «Que…»");
  ok(p.beats.every(b => b.phone && b.phone.pantalla), "cada beat tiene teléfono");
  ok(p.design.every(d => d.options.every(o => o.phone && o.phone.pantalla)), "cada opción de diseño tiene teléfono");

  // fase 1: vivir
  p.beats.forEach((b, i) => {
    S.beat = i;
    const opt = b.options[0];
    S.path[i] = { optId: opt.id };
    const c = consecuenciaDe(b, opcionDe(b, opt.id));
    ok(!!(c.head && c.result && c.plus && c.minus), `consecuencia completa en beat ${i + 1}`);
  });

  // fase 2: observar
  S.expectations = p.expectations.slice(0, 2);
  S.supuestoSistema = "Que todo el mundo pide para sí mismo.";
  S.supuestoVisto = true;

  // fase 3: diseñar
  p.design.forEach((d, i) => {
    S.dbeat = i;
    S.dpath[i] = { optId: d.options[0].id };
    ok(!!(d.options[0].result && d.options[0].gain && d.options[0].cost && d.emerge), `ronda de diseño ${i + 1} completa`);
  });

  // cierre
  S.reframeNot = "una prueba";
  S.reframeIs = "otra cosa";

  const md = exportarMarkdown(S);
  for (const s of SECCIONES) {
    if (!md.includes(s)) { fallas++; console.error(`  ✗ export sin «${s}»`); }
  }
  ok(md.includes(p.name), "el export nombra a la persona");
  ok(md.includes(p.beats[0].options[0].label), "el export incluye la 1ª decisión como persona");
  ok(md.includes(p.beats[2].question), "el export separa la pregunta de lectura del 3er momento");
  ok(md.includes(p.design[2].options[0].label), "el export incluye la 3ª decisión de diseño");
  ok(md.includes("una prueba") && md.includes("otra cosa"), "el export incluye el replanteamiento");
  ok(md.includes("Que todo el mundo pide para sí mismo."), "el export trae el supuesto en palabras del grupo");
  ok(md.includes(p.tension.supuesto), "el export trae también cómo lo dice el simulador");

  const vacio = exportarMarkdown(nuevoEstado());
  ok(!vacio.includes("undefined") && !vacio.includes("null"), "export en blanco sin undefined/null");
}

console.log(fallas === 0 ? "\nTodo bien: 5 personas recorridas, exports completos." : `\n${fallas} falla(s).`);
process.exit(fallas === 0 ? 0 : 1);
