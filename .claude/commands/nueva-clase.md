---
description: Convierte el guión de una clase en sesión .mdx, referentes y outline del deck
argument-hint: <numero-de-sesion> [curso-slug]
---

Modelo recomendado: **alto** (hay juicio pedagógico). No usar modelo barato aquí.

Sesión: **$1** · Curso: **${2:-pensamiento-sensorial-3}**

## Antes de escribir nada

1. Lee `AGENTS.md`.
2. Lee `src/content.config.ts` para conocer el schema exacto.
3. Lee la sesión anterior (`src/content/sesiones/{curso}-s{N-1}.mdx`) para mantener el hilo.
4. Si ya existe el archivo de esta sesión, **actualízalo, no lo sobrescribas**.

Si William no ha pegado el guión todavía, pídeselo y detente. No inventes contenido.

## Qué produces

### 1. `src/content/sesiones/{curso}-s{NN}.mdx`

Frontmatter válido contra el schema. Reglas:

- `preguntaCentral` sale del guión, no la reformules "para que suene mejor".
- `tension` debe referenciar una tensión que ya exista en `src/content/tensiones/`.
  Si el guión menciona una que no existe, créala y avísale.
- `momentos` refleja la estructura real de la clase, no una plantilla fija. Si la clase
  no tiene apertura sensorial, no la inventes.
- `estado: programada` salvo que la clase ya se haya dictado.
- No llenes campos opcionales con relleno. Vacío es mejor que decorativo.

El cuerpo del `.mdx` lleva el desarrollo en prosa: lo que va a leer un estudiante que se
perdió la clase. Voz del §8 de `AGENTS.md`.

### 2. Referentes

Por cada link del guión, un archivo en `src/content/referentes/`.

`porQue` es obligatorio y tiene que explicar la función pedagógica del referente en esta
sesión — no una descripción de qué es. Si el guión no lo dice y no es obvio, **pregunta**.
Un referente sin razón no entra al repo.

Si un link ya existe como referente, añade el número de sesión a su array `sesiones`.

### 3. `outlines/{curso}-s{NN}.outline.md`

Este es el artefacto que William revisa. **Una línea por slide**, en orden, así:

```
01 [espera]      gif de gato + "Gracias por la puntualidad"
02 [portada]     Pensamiento / SENSORIAL
03 [seccion]     CLASE 07 / LA INTERACCIÓN COMO CICLO
04 [repaso]      La clase pasada hablamos de cómo las convenciones...
05 [oracion]     Una secuencia audiovisual decide de antemano qué viene después
06 [oracion]     En una interacción, esa decisión se reparte           ← énfasis
07 [visual]      SVG: percibir → interpretar → actuar → responder
...
28 [actividad]   ACTIVIDAD
29 [pregunta]    ¿Cuál es el loop fundamental de su experiencia?
```

Tipos: `espera`, `portada`, `seccion`, `repaso`, `oracion`, `concepto`, `imagen`, `gif`,
`visual`, `actividad`, `pregunta`, `cierre`.

Marca con `← énfasis` los slides donde iría el resaltado amarillo. Máximo uno por bloque.

No generes el HTML todavía. Termina aquí y dile a William que revise el outline.

## Al terminar

- Verifica que `npm run build` pasa la validación del schema.
- Commit con mensaje `sesión NN: {título}`. **Sin push.**
- Resume en 3 líneas: qué creaste, qué referentes nuevos, qué te faltó del guión.
