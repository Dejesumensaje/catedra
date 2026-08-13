#!/usr/bin/env node
/**
 * Análisis de los relatos del momento 1. Se corre UNA vez, a mano, en casa,
 * entre la clase 2 y la clase 3.
 *
 *   ANTHROPIC_API_KEY=... CLAVE_DOCENTE=... node scripts/analizar-bitacora.mjs
 *
 * Qué hace y qué no:
 *   - Baja las respuestas del endpoint, con la clave docente.
 *   - Le pide al modelo lo único que un conteo no puede hacer: agrupar texto
 *     libre en 2–3 temas y redactar 2–3 tensiones para discutir.
 *   - Escribe `src/data/analisis-bitacora-s02.json` y para. NO despliega, NO
 *     hace commit, NO toca los conteos del tablero (esos van en vivo).
 *
 * Después de correrlo hay que abrir el JSON, leerlo y editarlo. El campo
 * `revisado` está en false a propósito: ponerlo en true es el acto de decir
 * «esto ya lo leí y me hago responsable de proyectarlo». El tablero lo dice
 * cuando todavía está en false.
 *
 * Privacidad: al modelo le llegan relatos de estudiantes sin ningún nombre
 * —el identificador se descarta antes de armar el prompt— y el system prompt
 * le prohíbe inferir o reportar datos sensibles y nombrar a terceros. Lo que
 * queda escrito en el repositorio es la síntesis, nunca los relatos: el
 * repositorio es público y §7 de AGENTS.md no admite lo contrario.
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const SESION = 'ps3-s02';
const SITIO = process.env.SITIO || 'https://catedra.dejesumensaje.com';
const SALIDA = resolve(process.cwd(), 'src/data/analisis-bitacora-s02.json');
const MODELO = 'claude-opus-5';

const claveDocente = process.env.CLAVE_DOCENTE;
if (!claveDocente) {
  console.error('Falta CLAVE_DOCENTE (la misma que configuraste en Cloudflare Pages).');
  process.exit(1);
}

// ── 1. traer las respuestas ────────────────────────────────────────────────
const url = `${SITIO}/api/bitacora?sesion=${SESION}&todo=1&clave=${encodeURIComponent(claveDocente)}`;
const respuesta = await fetch(url);

if (!respuesta.ok) {
  console.error(`El endpoint respondió ${respuesta.status}. ${await respuesta.text()}`);
  process.exit(1);
}

const datos = await respuesta.json();
const m1 = datos.m1 ?? [];
const m2 = datos.m2 ?? [];

if (m1.length === 0) {
  console.error('No hay respuestas del momento 1. Nada que analizar.');
  process.exit(1);
}

// Se descarta el identificador aquí, antes de armar nada: el modelo nunca ve
// a quién pertenece un relato.
const relatos = m1.flatMap((registro) =>
  (registro.entradas ?? []).map((e) => ({
    tipo: e.tipo,
    etiqueta: e.etiqueta,
    relato: e.relato,
    emocion: e.emocion,
  })),
);

console.log(`${m1.length} bitácoras al llegar, ${m2.length} al salir, ${relatos.length} relatos.`);

// ── 2. una sola llamada ────────────────────────────────────────────────────
const sistema = `Eres asistente de un profesor de diseño de interacción en la Universidad de
Antioquia. Analizas relatos escritos por estudiantes de pregrado sobre
experiencias cotidianas con objetos y sistemas.

Reglas que no se negocian:
- NO infieras ni reportes datos sensibles de ninguna clase: salud, orientación,
  religión, política, situación económica, situación migratoria.
- NO reproduzcas nombres de terceros que aparezcan en los relatos. Tampoco
  marcas, empresas o instituciones si nombrarlas señala a una persona concreta.
- NO cites un relato completo ni de forma que permita reconocer a su autor.
  Cuando necesites una frase de ejemplo, parafraséala.
- NO inventes patrones que no estén en el material. Si solo hay un caso de
  algo, no es un tema.

Voz: español de Colombia, precisa, sin entusiasmo de marketing, sin emojis.
Frases cortas. Primera persona nunca; escribes para que el profesor lea.`;

const instruccion = `Estos son ${relatos.length} relatos de estudiantes sobre tres experiencias de
interacción: una que les dio confianza, una que los hizo dudar y una que los
frustró. Los escribieron ANTES de tener vocabulario técnico, en sus palabras.

${JSON.stringify(relatos, null, 2)}

Haz dos cosas, y solo dos:

1. Agrupa los relatos en 2 o 3 TEMAS. Un tema es un patrón de qué falló o
   funcionó, no una categoría de objeto ("apps" no es un tema; "el sistema no
   dice que ya recibió la orden" sí). Para cada uno: un título de menos de ocho
   palabras, dos o tres frases de cuerpo, y cuántos relatos caben en él.

2. Redacta 2 o 3 TENSIONES para discutir en clase. Una tensión es una pregunta
   incómoda que sale de estos relatos y que no tiene respuesta obvia; se escribe
   como algo que el grupo puede debatir, no como una conclusión. Para cada una:
   un título corto y dos o tres frases.

Responde solo con el JSON del esquema.`;

const esquema = {
  type: 'object',
  properties: {
    temas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          cuerpo: { type: 'string' },
          cuantas: { type: 'integer' },
        },
        required: ['titulo', 'cuerpo', 'cuantas'],
        additionalProperties: false,
      },
    },
    tensiones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          cuerpo: { type: 'string' },
        },
        required: ['titulo', 'cuerpo'],
        additionalProperties: false,
      },
    },
  },
  required: ['temas', 'tensiones'],
  additionalProperties: false,
};

const cliente = new Anthropic();

console.log(`Consultando a ${MODELO}…`);

const mensaje = await cliente.messages.create({
  model: MODELO,
  max_tokens: 8000,
  thinking: { type: 'adaptive' },
  output_config: { effort: 'high', format: { type: 'json_schema', schema: esquema } },
  system: sistema,
  messages: [{ role: 'user', content: instruccion }],
});

if (mensaje.stop_reason === 'refusal') {
  console.error('El modelo declinó la solicitud.', mensaje.stop_details ?? '');
  process.exit(1);
}

const texto = mensaje.content.find((b) => b.type === 'text')?.text;
if (!texto) {
  console.error('El modelo no devolvió texto.');
  process.exit(1);
}

// ── 3. escribir para revisar ───────────────────────────────────────────────
const analisis = JSON.parse(texto);

const salida = {
  sesion: SESION,
  generado: new Date().toISOString(),
  modelo: MODELO,
  // Se queda en false. Lo pone en true una persona, a mano, después de leer.
  revisado: false,
  temas: analisis.temas ?? [],
  tensiones: analisis.tensiones ?? [],
  conteos: {
    bitacorasM1: m1.length,
    bitacorasM2: m2.length,
    relatos: relatos.length,
  },
};

writeFileSync(SALIDA, JSON.stringify(salida, null, 2) + '\n', 'utf8');

console.log(`
Escrito: ${SALIDA}

Falta lo que no hace el modelo:
  1. Léelo completo. Es lo que se va a proyectar.
  2. Edita lo que no suene tuyo, borra lo que no sea cierto.
  3. Cambia "revisado" a true.
  4. Commit y push para que quede publicado.
`);
