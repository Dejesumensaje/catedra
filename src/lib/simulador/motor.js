/* ============================================================
   Motor del simulador «Imagen del sistema» — sesión 3, PS 3.0
   Lógica pura de estado, sin DOM. Importable desde Node
   (scripts/prueba-simulador.mjs) y desde la página Astro.
============================================================ */
import { PERSONAS, GRUPOS } from "./contenido.js";

export { PERSONAS, GRUPOS };

export const STORAGE_KEY = "ps3-simulador-v1";

export const blank = {
  screen: "start",
  grupo: "",
  personaId: null,
  beat: 0,
  path: [],            // decisiones como la persona: [{optId}]
  expectations: [],    // expectativas reconocidas (modelo mental)
  supuestoSistema: "", // lo que el grupo escribe que el sistema da por hecho
  supuestoVisto: false, // si ya desplegaron la segunda voz
  dbeat: 0,
  dpath: [],           // decisiones de diseño: [{optId}]
  reframeNot: "",      // «pedir comida no es…»
  reframeIs: ""        // «…es…»
};

export function nuevoEstado() {
  return JSON.parse(JSON.stringify(blank));
}

/* El sorteo del grupo define la persona. Sin grupo: aleatoria. */
export function asignarPersona(grupo) {
  const key = String(grupo || "").trim();
  if (key && GRUPOS[key]) return GRUPOS[key];
  return PERSONAS[Math.floor(Math.random() * PERSONAS.length)].id;
}

export function personaDe(S) {
  return PERSONAS.find(p => p.id === S.personaId) || PERSONAS[0];
}

export function opcionDe(beat, optId) {
  return beat.options.find(o => o.id === optId);
}

/* Consecuencia de una decisión como la persona.
   El beat compartido (3º) trae su propia consecuencia. */
export function consecuenciaDe(beat, opt) {
  if (beat.shared) {
    return { head: beat.head, result: beat.result, plus: beat.plus, minus: beat.minus };
  }
  return { head: "Esto es lo que pasa.", result: opt.result, plus: opt.plus, minus: opt.minus };
}

/* ---- Etiquetas legibles del recorrido ---- */
export function decisionesPersona(S) {
  const p = personaDe(S);
  // El beat compartido no es una decisión: es una pregunta de lectura, y se
  // reporta aparte para que la lista no la cuente como algo que hicieron.
  return S.path
    .map((pk, i) => p.beats[i].shared ? null : (opcionDe(p.beats[i], pk.optId)?.label || "—"))
    .filter(Boolean);
}

/* La pregunta de lectura del beat compartido, con lo que respondieron. */
export function lecturaFinal(S) {
  const p = personaDe(S);
  const i = p.beats.findIndex(b => b.shared);
  if (i < 0 || !S.path[i]) return null;
  return { pregunta: p.beats[i].question, respuesta: opcionDe(p.beats[i], S.path[i].optId)?.label || "—" };
}
export function decisionesDiseno(S) {
  const p = personaDe(S);
  return S.dpath.map((pk, i) => p.design[i].options.find(o => o.id === pk.optId)?.label || "—");
}

/* ================= Exportar recorrido ================= */
export function exportarMarkdown(S) {
  const p = personaDe(S);
  const linea = (k, v) => `- **${k}:** ${v && String(v).trim() ? v : "—"}`;
  const dec = (arr) => arr.length ? arr.map((l, i) => `  ${i + 1}. ${l}`).join("\n") : "  —";
  const lect = lecturaFinal(S);

  return [
    "# Recorrido · Imagen del sistema",
    "",
    linea("Grupo", S.grupo || "(sin número)"),
    linea("Persona", p.name),
    linea("Lo que necesita", p.need),
    "",
    "## 1 · Lo que viví siendo " + p.first,
    dec(decisionesPersona(S)),
    "",
    lect ? `- **${lect.pregunta}** ${lect.respuesta}` : "",
    linea("Lo que sentí al salir", p.frustration),
    "",
    "## 2 · Lo que observé desde afuera",
    linea("Modelo mental (expectativas que reconocí)", S.expectations.join("; ")),
    linea("Modelo conceptual", p.concept.join(" → ")),
    linea("Lo que el sistema da por hecho, según el grupo", S.supuestoSistema),
    linea("Cómo lo dice el simulador", p.tension.supuesto),
    "",
    "## 3 · Lo que diseñé",
    dec(decisionesDiseno(S)),
    "",
    "## 4 · Mi replanteamiento",
    linea(`Para ${p.first}, pedir comida no es`, S.reframeNot),
    linea("Es", S.reframeIs),
    ""
  ].join("\n");
}
