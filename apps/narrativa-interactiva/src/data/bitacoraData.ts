export type NodeCategory = 'concepto' | 'apuesta' | 'proyecto';

export type SessionId = 'sep23' | 'oct07' | 'oct21' | 'nov04';

export type EdgeKind = 'fundamenta' | 'tensiona' | 'deriva';

export type MicroLabType =
  | 'kite-rhythm'
  | 'agency-levels'
  | 'literal-vs-expressive'
  | 'subtraction-mechanics'
  | 'gesture-to-meaning';

export interface QuoteItem {
  text: string;
  speaker: string;
  sessionLabel: string;
}

export interface ConceptNode {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  category: NodeCategory;
  categoryLabel: string;
  sessions: SessionId[];
  sessionSpan: string;
  subtitle: string;
  x: number;
  y: number;
  summary: string[];
  betOrFinding: string;
  keyTakeaways: string[];
  quotes: QuoteItem[];
  microLab?: MicroLabType;
  linkedProjectId?: string;
}

export interface ConceptEdge {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  label: string;
}

export interface SessionRecord {
  id: SessionId;
  number: string;
  dateLabel: string;
  title: string;
  centralQuestion: string;
  synthesis: string;
  demosAndReferences: {
    name: string;
    detail: string;
    /** Dirección de la demo publicada */
    url?: string;
  }[];
  featuredNodeIds: string[];
}

export interface StudentProject {
  id: string;
  author?: string;
  title: string;
  medium: string;
  nodeId: string;
  centralBet: string;
  evolution: string;
  keyShift: string;
  openTension: string;
  relatedConcepts: string[];
}

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  concepto: 'Fundamento conceptual',
  apuesta: 'Apuesta metodológica',
  proyecto: 'Proyecto / Prototipo',
};

export const EDGE_KIND_LABELS: Record<EdgeKind, string> = {
  fundamenta: 'Fundamenta',
  tensiona: 'Tensiona / cuestiona',
  deriva: 'Deriva en',
};

export const SESSION_FILTERS: { id: SessionId | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas las sesiones' },
  { id: 'sep23', label: '23 Sep' },
  { id: 'oct07', label: '07 Oct' },
  { id: 'oct21', label: '21 Oct' },
  { id: 'nov04', label: '04 Nov' },
];

export const CONCEPT_NODES: ConceptNode[] = [
  /* ── NÚCLEO: FUNDAMENTOS CONCEPTUALES ── */
  {
    id: 'n1',
    order: 1,
    title: 'El gesto dotado de sentido',
    shortTitle: 'El gesto con sentido',
    category: 'concepto',
    categoryLabel: 'Fundamento',
    sessions: ['sep23', 'oct07', 'nov04'],
    sessionSpan: '23 Sep – 04 Nov',
    subtitle: 'Núcleo vertebral del laboratorio',
    x: 620,
    y: 415,
    summary: [
      'A lo largo de las cuatro sesiones, la pregunta técnica ("qué motor usar o cómo programar") fue desplazada por una pregunta fundacional: ¿qué gesto concreto le pedimos al cuerpo o a la mano del participante y cómo logramos que ese gesto signifique algo dentro de la obra?',
      'Un clic, sostener dos dedos frente a la cámara, cruzar una cortina o hacer scroll valen por la coherencia entre la acción física, la respuesta del sistema y la metáfora que construyen.',
    ],
    betOrFinding:
      'Volver a lo básico para desbloquear proyectos complejos: antes de diseñar pantallas o sensores, definir cuál es la acción mínima del participante y qué transformación desencadena.',
    keyTakeaways: [
      'Un gesto sencillo (un clic rítmico, el silencio del cuerpo, sostener la mirada) adquiere densidad narrativa cuando está atado a reglas claras.',
      'El soporte —web, VR, instalación física o Kinect— delimita un repertorio distinto de gestos disponibles.',
      'En los demos de laboratorio, subvertir gestos cotidianos (como usar el scroll para regular la lluvia) demostró cómo la mecánica ya es relato.',
    ],
    quotes: [
      {
        text: 'Un gesto sencillo, que en este caso es el clic, se llena de significado porque ustedes definen unas reglas, y esas reglas determinan la manera en la que la persona interpreta el resultado.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión de cierre · 04 Nov',
      },
      {
        text: 'Lo que nos hace falta es el gesto: qué le vamos a pedir al usuario que haga y cómo eso va a modificar el sistema que estás creando.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión 3 · 21 Oct',
      },
    ],
    microLab: 'gesture-to-meaning',
  },
  {
    id: 'n2',
    order: 2,
    title: 'Mundos posibles con reglas internas',
    shortTitle: 'Mundos con reglas',
    category: 'concepto',
    categoryLabel: 'Fundamento',
    sessions: ['oct07', 'oct21', 'nov04'],
    sessionSpan: '07 Oct – 04 Nov',
    subtitle: 'De piezas aisladas a sistemas coherentes',
    x: 355,
    y: 315,
    summary: [
      'Una obra interactiva funciona como un mundo con lógica propia. Cuando el participante entiende sus reglas internas —qué responde a qué y con qué consecuencias—, entra en diálogo con el sentido de la pieza.',
      'Apoyado en el diseño especulativo (Speculative Everything) y en la noción de la interfaz como dramaturgia temporal (Computers as Theatre), el laboratorio insistió en imaginar mundos alternos para hacer visibles tensiones del mundo real.',
    ],
    betOrFinding:
      'Pensar las reglas no como restricciones burocráticas o límites técnicos, sino como la gramática que hace legible la intención autoral.',
    keyTakeaways: [
      'Estado inicial, acciones posibles y efectos visibles componen la arquitectura mínima de un mundo interactivo.',
      'El diseño especulativo permite escapar de la literalidad para crear escenarios donde se ensayan otras formas de cohabitar o percibir.',
      'En el documento de principios del proyecto de la flora nativa, las reglas definen la ética de la relación entre humanos y no humanos.',
    ],
    quotes: [
      {
        text: 'Nosotros estamos creando mundos o sistemas. Lo que ustedes crean es una serie de reglas que, al momento en que la persona las asimila, empiezan a construir un significado.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión 2 · 07 Oct',
      },
    ],
  },
  {
    id: 'n3',
    order: 3,
    title: 'Del arco dramático a la tríada interactiva',
    shortTitle: 'Tríada interactiva',
    category: 'concepto',
    categoryLabel: 'Fundamento',
    sessions: ['sep23', 'oct07'],
    sessionSpan: '23 Sep – 07 Oct',
    subtitle: 'Cómo cambia la narrativa frente al audiovisual lineal',
    x: 455,
    y: 575,
    summary: [
      'Al analizar el cortometraje The Blue Umbrella (Pixar) en la primera sesión, quedó en evidencia la brecha entre narrar en cine y diseñar una experiencia interactiva. En lo audiovisual tradicional, el autor controla el plano, la duración y el clímax de un arco cerrado.',
      'En lo interactivo, la historia se articula a partir de una pregunta abierta: ¿qué hace la persona participante, qué respuesta le devuelve el sistema y qué sentido construye a partir de esa fricción?',
    ],
    betOrFinding:
      'Desplazar el centro de gravedad desde el guion lineal ("qué pasa primero y qué después") hacia la coreografía entre acción, respuesta e interpretación.',
    keyTakeaways: [
      'Un mismo referente audiovisual (The Blue Umbrella) genera experiencias web opuestas según el punto de partida interactivo: saltar entre puntos de vista, graduar la lluvia con el scroll o revelar personalidades ocultas.',
      'La incertidumbre sobre cómo actuará quien participa exige pensar en condiciones de exploración y no en un único camino rígido.',
    ],
    quotes: [
      {
        text: 'Mientras que en lo audiovisual hay un principio y un final con un pico, en lo interactivo casi que se construye la historia en torno a qué hace el usuario, qué le responde el sistema y qué interpreta.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión 1 · 23 Sep',
      },
    ],
  },
  {
    id: 'n4',
    order: 4,
    title: 'Tres niveles de agencia y participación',
    shortTitle: 'Niveles de agencia',
    category: 'concepto',
    categoryLabel: 'Fundamento',
    sessions: ['sep23'],
    sessionSpan: '23 Sep',
    subtitle: 'Revelar, experimentar y construir significado',
    x: 775,
    y: 540,
    summary: [
      '¿Por qué hacer una obra interactiva en lugar de un documental, un pódcast o un video? La respuesta del laboratorio se organizó en tres niveles de agencia que no son excluyentes, pero ayudan a calibrar cuánto poder de transformación se le entrega al participante.',
      'Van desde recorrer capas informativas ya dispuestas (revelar), pasan por encarnar físicamente una metáfora (experimentar) y llegan a convertirse en un actor que altera el sistema y produce sentido propio (construir significado).',
    ],
    betOrFinding:
      'Definir conscientemente el rol del participante (espectador de un performance, explorador de mundo abierto o co-creador) evita que la interactividad sea decorativa.',
    keyTakeaways: [
      'Nivel 1 · Revelar: el clic o desplazamiento destapa capas ocultas de una historia existente.',
      'Nivel 2 · Experimentar: la mecánica traduce una condición corporal o emocional (como el peso del duelo o la desorientación lumínica).',
      'Nivel 3 · Construir significado: alta agencia y evocación abierta, donde la acción del usuario transforma el entorno y siembra preguntas.',
    ],
    quotes: [
      {
        text: 'El papel que le damos al usuario, qué tanto poder le entregamos, es lo que determina el tipo de interacción que estamos proponiendo.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión 1 · 23 Sep',
      },
    ],
    microLab: 'agency-levels',
  },

  /* ── APUESTAS METODOLÓGICAS (agrupadas junto a los conceptos con los que dialogan) ── */
  {
    id: 'n5',
    order: 5,
    title: 'Lo literal frente a lo expresivo',
    shortTitle: 'Literal vs. expresivo',
    category: 'apuesta',
    categoryLabel: 'Apuesta',
    sessions: ['oct07', 'oct21', 'nov04'],
    sessionSpan: '07 Oct – 04 Nov',
    subtitle: 'Traducir la experiencia en metáfora perceptual',
    x: 790,
    y: 235,
    summary: [
      'Varios proyectos partieron de investigaciones rigurosas —frecuencias de ecolocalización de murciélagos, visión ultravioleta de abejas, cartografía urbana— y enfrentaron la trampa de querer reproducir el fenómeno al pie de la letra.',
      'La apuesta metodológica del laboratorio fue defender la licencia autoral del diseñador: no se trata de simular biológicamente un sensor animal ni de poner barras de vida de videojuego clásico, sino de construir metáforas sensibles que hagan comprensible e incómoda esa experiencia para un cuerpo humano.',
    ],
    betOrFinding:
      'Abandonar la literalidad técnica (ecos de colores literales o barras de energía superpuestas) en favor de metáforas perceptuales como la visión granulosa, el cono de nitidez o el sonido filtrado.',
    keyTakeaways: [
      'Un chillido real o un tráfico literal pueden resultar simplemente estridentes; explorar librerías sonoras y mezclas expresivas vuelve tolerable la incomodidad sin quitarle fuerza.',
      'La abstracción visual (como un mapa orográfico en lugar de un mapa político literal de Ibagué) universaliza la lectura sin perder el arraigo territorial.',
    ],
    quotes: [
      {
        text: 'No estamos buscando crear exactamente lo que es, estamos buscando crear una representación de cómo se siente habitar el mundo desde la perspectiva del murciélago.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión 3 · 21 Oct',
      },
      {
        text: 'Implementé como una especie de visión granulosa... siento que esa metáfora me ha gustado más que la de los ecos, porque estoy de acuerdo con que era algo muy literal.',
        speaker: 'Estudiante, sesión de cierre',
        sessionLabel: 'Sesión de cierre · 04 Nov',
      },
    ],
    microLab: 'literal-vs-expressive',
  },
  {
    id: 'n6',
    order: 6,
    title: 'Diseñar por sustracción y convergencia',
    shortTitle: 'Diseño por sustracción',
    category: 'apuesta',
    categoryLabel: 'Apuesta',
    sessions: ['oct07', 'nov04'],
    sessionSpan: '07 Oct – 04 Nov',
    subtitle: 'Depurar la dispersión hasta la mecánica esencial',
    x: 975,
    y: 420,
    summary: [
      'En etapas iniciales, los proyectos transmedia o de investigación-creación tienden a acumular formatos, personajes, subtramas y sensores. El laboratorio identificó ese punto de divergencia como fértil, pero peligroso si paraliza el prototipado.',
      'La respuesta fue el diseño por sustracción: quitar capas hasta quedarse con una sola relación nuclear que sostenga la obra, probar cómo se siente esa mecánica mínima y, solo entonces, volver a expandir.',
    ],
    betOrFinding:
      'Una sola regla expresiva bien calibrada vale más que diez interacciones medias, cuando cada gesto tiene peso narrativo.',
    keyTakeaways: [
      'En el proyecto de la entidad espejo, todo un universo transmedia podía condensarse inicialmente en una oposición clara de controles (clic sostenido vs. toques rápidos o clic izquierdo vs. derecho).',
      'En el cierre, la apuesta de Alborada demostró que una sola acción preventiva basta para detonar una reflexión ética.',
    ],
    quotes: [
      {
        text: 'Podemos hacer un primer ejercicio de diseñar por sustracción: dejar lo básico, y a partir de lo básico sí construir la complejidad un poquito.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión 2 · 07 Oct',
      },
    ],
    microLab: 'subtraction-mechanics',
  },
  {
    id: 'n7',
    order: 7,
    title: 'Inversión de roles y co-asesoría colectiva',
    shortTitle: 'Co-asesoría Sísifo',
    category: 'apuesta',
    categoryLabel: 'Apuesta',
    sessions: ['oct21', 'nov04'],
    sessionSpan: '21 Oct – 04 Nov',
    subtitle: 'El reto Sísifo: pensar juntos libera la creatividad',
    x: 235,
    y: 675,
    summary: [
      'En la tercera sesión, el docente invirtió la dinámica habitual: presentó un proyecto inconcluso inspirado en el mito de Sísifo —una mecánica frenética e imposible de ganar en solitario— y pidió a los estudiantes que lo asesoraran para transformarlo en una experiencia cooperativa.',
      'El ejercicio reveló un hallazgo pedagógico clave: al asesorar el proyecto de otro, desaparece el bloqueo de la responsabilidad individual y la presión académica. De inmediato emergieron ideas de coordinación rítmica (moáis de Rapa Nui), equilibrio compartido (Trash Day), aliento colectivo y vuelo de cometa.',
    ],
    betOrFinding:
      'Convertir el laboratorio en un espacio de inteligencia colectiva horizontal donde el docente también prototipa, expone sus bloqueos y recibe retroalimentación real.',
    keyTakeaways: [
      'La co-asesoría demostró que todos tienen repertorios y sensibilidades valiosas para desbloquear proyectos ajenos.',
      'De las ideas de los estudiantes nació directamente el prototipo La Cometa Compartida presentado en el cierre.',
      'La colaboración dejó de ser solo tema del ejercicio para convertirse en método de trabajo del grupo.',
    ],
    quotes: [
      {
        text: 'Cuando uno está trabajando solo asume que la responsabilidad es totalmente de uno; cuando uno está asesorando, la responsabilidad no es mía y eso libera la capacidad creativa.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión 3 · 21 Oct',
      },
    ],
  },
  {
    id: 'n8',
    order: 8,
    title: 'Tecnología inútil y recuperación de agencia',
    shortTitle: 'Tecnología inútil',
    category: 'apuesta',
    categoryLabel: 'Apuesta',
    sessions: ['oct21'],
    sessionSpan: '21 Oct',
    subtitle: 'Desmitificar la "caja negra" técnica y disfrutar el crear',
    x: 185,
    y: 470,
    summary: [
      'Frente a la ansiedad técnica —sentir que TouchDesigner, Unreal, Arduino o los shaders son barreras insalvables— el laboratorio propuso mirar la tecnología como creación humana al servicio de la expresión.',
      'Inspirado en la idea de las "máquinas inútiles" (como Blendie, la licuadora de Kelly Dobson que se enciende cuando alguien imita con la voz el sonido de su motor), se reivindicó el valor de crear artefactos sin utilidad productiva, capaces de cuestionar nuestra relación automática con las herramientas y recordar el privilegio de experimentar en la universidad.',
    ],
    betOrFinding:
      'Perderle el miedo a la complejidad técnica: con herramientas simples y código accesible hoy es posible enfocarse en lo verdaderamente difícil: decidir qué experiencia vale la pena construir.',
    keyTakeaways: [
      'Desacralizar la herramienta: un recurso visual simple de Arduino (perillas, sensores de luz, LEDs) basta para pensar respuestas corporales.',
      'Reivindicar el disfrute del proceso y la duda frente a la angustia por la calificación.',
      'La intención autoral manda sobre la espectacularidad tecnológica ("no hay que descrestar").',
    ],
    quotes: [
      {
        text: 'Dejemos de tratar la tecnología como algo súper complicado y lejano, y empecemos a verla como una herramienta para expresar una idea o lograr que el usuario viva una experiencia.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión 3 · 21 Oct',
      },
    ],
  },
  {
    id: 'n9',
    order: 9,
    title: 'Edición, Mago de Oz y prototipado ligero',
    shortTitle: 'Prototipado ligero',
    category: 'apuesta',
    categoryLabel: 'Apuesta',
    sessions: ['oct21', 'nov04'],
    sessionSpan: '21 Oct – 04 Nov',
    subtitle: 'Probar la sensación antes de programar el sistema final',
    x: 865,
    y: 705,
    summary: [
      'A lo largo de las asesorías surgieron dudas imposibles de resolver en abstracto sobre el papel: ¿funciona el contraste entre ironía y reconstrucción? ¿Es tolerable el sonido estridente mezclado? ¿Se percibe el paso de un umbral?',
      'El laboratorio apostó por validar estas preguntas mediante experimentos rápidos: mezclas de audio descargadas en minutos, storyboards, flujos tipo "Mago de Oz" (simular la respuesta del sistema manualmente) y edición crítica para saber qué piezas sobran.',
    ],
    betOrFinding:
      'No esperar a tener el montaje completo o el viaje resuelto para probar una hipótesis sensible: prototipar rápido permite descartar a tiempo lo que se siente forzado.',
    keyTakeaways: [
      'Así como en el montaje audiovisual, en narrativa interactiva también se edita: una idea que funciona en papel puede sobrar en la experiencia.',
      'Preparar planes B viables (ej. recrear paisajes sonoros en fincas cercanas si falla un desplazamiento) protege la autenticidad del proceso.',
      'Aceptar el error y los fallos técnicos en vivo ("sin drama no hay proyecto") como parte natural del trabajo interactivo.',
    ],
    quotes: [
      {
        text: 'Hay un espacio para editar y decir: esta imagen que me parecía tan potente me sobra. La única manera de saber si funciona es experimentarlo.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión 3 · 21 Oct',
      },
    ],
  },

  /* ── PROYECTOS Y PROTOTIPOS (cerca de las ideas que los originaron) ── */
  {
    id: 'n10',
    order: 10,
    title: 'Ecolocalización e incomodidad en VR',
    shortTitle: 'Murciélago en VR',
    category: 'proyecto',
    categoryLabel: 'Proyecto',
    sessions: ['sep23', 'oct07', 'oct21', 'nov04'],
    sessionSpan: 'Todas las sesiones',
    subtitle: 'Ruido vehicular en el Valle de Aburrá y gasto energético',
    x: 1035,
    y: 135,
    summary: [
      'El proyecto investiga cómo el ruido vehicular del Valle de Aburrá interfiere en la ecolocalización de una especie específica de murciélago insectívoro. La apuesta emocional busca un equilibrio deliberado entre el asombro del vuelo y la incomodidad de la desorientación.',
      'Durante el laboratorio, el proyecto dio un salto decisivo: abandonó la representación literal de los ecos como ondas de colores para pasar a una visión granulosa producida por el ruido del tráfico, contrarrestada por un cono de nitidez al emitir el chillido para cazar polillas.',
    ],
    betOrFinding:
      'Traducir la fatiga energética del murciélago —obligado a emitir chillidos de mayor frecuencia y amplitud— en pérdida de nitidez perceptual sin caer en barras de juego convencionales.',
    keyTakeaways: [
      'Giro clave: de shaders de ecos coloridos → visión granulosa + cono de nitidez direccional en VR (quad mesh para doble cámara).',
      'Tensión en diseño sonoro: cómo hacer perceptible el choque entre biosonar y tráfico sin agredir auditivamente.',
      'Realidad material del prototipado: manejo del mareo en VR (meta de 3–5 min de recorrido) y limitaciones de hardware.',
    ],
    quotes: [
      {
        text: 'El objetivo no es que simplemente sea algo súper bacano, sino que también en serio incomode un poco para generar conciencia de esa interferencia.',
        speaker: 'Estudiante, proyecto del murciélago',
        sessionLabel: 'Sesión 1 · 23 Sep',
      },
    ],
    linkedProjectId: 'p-murcielago',
  },
  {
    id: 'n11',
    order: 11,
    title: 'Agencia vegetal y cuidado urbano',
    shortTitle: 'Flora nativa',
    category: 'proyecto',
    categoryLabel: 'Proyecto',
    sessions: ['sep23', 'oct07', 'oct21', 'nov04'],
    sessionSpan: 'Todas las sesiones',
    subtitle: 'Relación horizontal y no invasiva con árboles cotidianos',
    x: 255,
    y: 130,
    summary: [
      'El proyecto parte de una inquietud por la apropiación del espacio público urbano a través de la flora nativa que sobrevive entre el concreto de las aceras y los parques de Medellín, evitando desplazar la experiencia hacia bosques lejanos.',
      'La búsqueda evolucionó desde mecánicas iniciales (proyección tipo "raspa y gana", emparejar hojas recogidas del suelo o cerrar con un abrazo al árbol) hacia una postura ética exigente: redactar principios donde la planta tenga agencia y la interacción no sea nociva (cuestionando incluso cómo el pisoteo repetido al abrazar compacta las raíces).',
    ],
    betOrFinding:
      'Diseñar desde la observación etnográfica (recorridos con guías culturales en la UdeA, Arví y Jardín Botánico) y elegir un espécimen concreto —el árbol pata de vaca— como punto de anclaje.',
    keyTakeaways: [
      'Principio rector: horizontalidad y codependencia humano-planta sin instrumentalizar el ser vivo.',
      'Pregunta abierta: cómo hacer que la acción individual junto al árbol transforme la percepción colectiva en el espacio.',
      'Metodología de campo: entrevistar a quienes guían recorridos para entender cómo cambia la mirada de las personas frente a la flora.',
    ],
    quotes: [
      {
        text: 'La primera consigna es que humanos y plantas viven una relación horizontal de coexistencia; idealmente la planta debe tener agencia para ser cocreadora de la instalación.',
        speaker: 'Estudiante, proyecto de la flora nativa',
        sessionLabel: 'Sesión 3 · 21 Oct',
      },
    ],
    linkedProjectId: 'p-flora',
  },
  {
    id: 'n12',
    order: 12,
    title: 'El umbral y la trampa lumínica',
    shortTitle: 'Trampa lumínica',
    category: 'proyecto',
    categoryLabel: 'Proyecto',
    sessions: ['sep23', 'oct21', 'nov04'],
    sessionSpan: '23 Sep – 04 Nov',
    subtitle: 'Arquitectura hostil y luz artificial desde la abeja',
    x: 540,
    y: 165,
    summary: [
      'El proyecto trasladó una investigación previa sobre abejas nativas del Valle de Aburrá a una instalación espacial en cuatro paredes, centrada en la hostilidad de la arquitectura urbana (ventanales, rejillas, luz artificial nocturna) y la percepción ultravioleta.',
      'Aunque al principio no estaba claro qué acción pedirle al visitante usando sensores de movimiento, el punto de inflexión llegó al identificar el gesto arquitectónico del "umbral": cruzar una cortina morada/ultravioleta que hace evidente la transición corporal de humano a abeja.',
    ],
    betOrFinding:
      'Mantener la interacción minimalista pero sensorialmente inequívoca: el tránsito por el umbral dispara el cambio de mundo y desorienta mediante luz titilante.',
    keyTakeaways: [
      'El umbral físico funciona como regla clara de entrada a otra realidad perceptual.',
      'De la duda técnica (Kinect vs. TouchDesigner) hacia soluciones pragmáticas (webcam con MediaPipe o sensores de proximidad sencillos).',
      'Próximo paso: concretar en storyboard el contraste antes/después del cruce.',
    ],
    quotes: [
      {
        text: 'Hacer como una especie de umbral representado por cortinas moradas relacionadas con el ultravioleta... cuando pasas ese umbral ya sabes que te conviertes en abeja.',
        speaker: 'Estudiante, proyecto de la abeja',
        sessionLabel: 'Sesión 3 · 21 Oct',
      },
    ],
    linkedProjectId: 'p-abeja',
  },
  {
    id: 'n13',
    order: 13,
    title: 'Lo háptico y la huella territorial',
    shortTitle: 'Huella territorial',
    category: 'proyecto',
    categoryLabel: 'Proyecto',
    sessions: ['oct07', 'oct21', 'nov04'],
    sessionSpan: '07 Oct – 04 Nov',
    subtitle: 'Gentrificación, memoria urbana de Ibagué y artefacto táctil',
    x: 1215,
    y: 295,
    summary: [
      'El proyecto parte de la transformación acelerada y la gentrificación de Ibagué. Pasó por recorridos en Google Street View y collages hasta redactar un guion museográfico que traduce el concepto en una experiencia espacial y táctil.',
      'La propuesta combina un mapa en el piso con luz que muta de fría/uniforme a cálida/variada y sonido envolvente que pasa de la construcción a la vida cotidiana, activado mediante un objeto físico que cada visitante manipula dejando una huella distinta.',
    ],
    betOrFinding:
      'Convertir un dispositivo técnico simple (como un apuntador) en un artefacto metafórico coherente con el relato y abrir el mapa literal hacia un relieve orográfico legible para cualquier visitante.',
    keyTakeaways: [
      'Separación de canales: la luz territorial en el piso y el sonido cotidiano envolvente operan desde fuentes distintas.',
      'Variable colaborativa: la interacción cambia según cómo actúa cada persona, acumulando huellas únicas en la atmósfera.',
      'Desafío en curso: diseñar la metáfora física del objeto táctil para que el gesto se entienda sin instrucciones largas.',
    ],
    quotes: [
      {
        text: 'Me interesa poder tocar algo, que esa experiencia sea relevante en términos de textura, y que la interacción tenga una variable para que el resultado sea distinto entre una persona y otra.',
        speaker: 'Estudiante, proyecto del territorio',
        sessionLabel: 'Sesión de cierre · 04 Nov',
      },
    ],
    linkedProjectId: 'p-territorio',
  },
  {
    id: 'n14',
    order: 14,
    title: 'Cuerpo sonoro y reconstrucción',
    shortTitle: 'Memoria sonora',
    category: 'proyecto',
    categoryLabel: 'Proyecto',
    sessions: ['sep23', 'oct07', 'oct21'],
    sessionSpan: '23 Sep – 21 Oct',
    subtitle: 'Desplazamiento forzado en Córdoba y tensión del cierre',
    x: 1125,
    y: 745,
    summary: [
      'A partir de entrevistas familiares sobre el desplazamiento de los años 70 en el sur de Córdoba, el proyecto construye una instalación sonora performática con Kinect donde la posición del cuerpo en el espacio delimitado activa el antes rural y el choque de la irrupción militar.',
      'El debate más profundo del proyecto giró en torno al cierre: frente a la sugerencia externa de terminar en "resiliencia" o en "ironía", el laboratorio cuestionó la idea de resiliencia como "volver a como estábamos" y propuso pensar en la reconstrucción personal y cotidiana.',
    ],
    betOrFinding:
      'Priorizar la autenticidad expresiva y el gesto performático del cuerpo por encima de cerrar perfectamente un ciclo de software; usar la edición experimental para decidir si la ironía o la reconstrucción pertenecen a la pieza.',
    keyTakeaways: [
      'Tres tiempos posibles: cotidianidad rural previa → gesto/choque de ruptura → vida transformada después (el café de la mañana, reconstruir la cinta en el piso).',
      'Debate ético sobre el uso de voz en off familiar o actores de voz frente a la fuerza del gesto corporal silencioso.',
      'Gestión de contingencias: si el viaje a Córdoba se retrasa, recrear el registro en una finca antioqueña como Plan B sin perder la memoria audiovisual.',
    ],
    quotes: [
      {
        text: 'Tal vez la resiliencia, en este caso, no es un retorno a la normalidad, sino un: transformamos nuestras vidas y seguimos adelante.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión 2 · 07 Oct',
      },
    ],
    linkedProjectId: 'p-cuerpo-sonoro',
  },
  {
    id: 'n15',
    order: 15,
    title: 'Mecánica del mouse como dualidad',
    shortTitle: 'Entidad espejo',
    category: 'proyecto',
    categoryLabel: 'Proyecto',
    sessions: ['oct07'],
    sessionSpan: '07 Oct',
    subtitle: 'Síndrome del impostor y reglas web de contraste',
    x: 1210,
    y: 540,
    summary: [
      'El proyecto llegó como un universo transmedia complejo en un tablero de Miro. Gira en torno a Mateo, un joven artista vigilado que es reemplazado por su versión idealizada ("la entidad espejo"), y explora la autoexigencia y el síndrome del impostor entre cortometraje, videojuego web y cierre sonoro.',
      'Ante la multiplicidad de formatos y mecánicas (arrastrar, teclado, clics, cámara), el laboratorio trabajó la convergencia: usar el mouse en web como traducción directa de la pugna psicológica entre los dos personajes.',
    ],
    betOrFinding:
      'Asignar identidades narrativas a micro-acciones del mouse: por ejemplo, clic sostenido frente a toques rápidos, o scroll ascendente frente a descendente, para encarnar la dualidad.',
    keyTakeaways: [
      'Pasar de un mapa narrativo expansivo (divergencia) a una regla jugable mínima en 2D/web (convergencia).',
      'La identidad del personaje se expresa en cómo se siente controlar el puntero, no solo en los diálogos.',
    ],
    quotes: [
      {
        text: '¿Qué tal si Mateo se controla con el clic sostenido y la entidad con toques rápidos? Crear reglas que representen la identidad de los personajes.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión 2 · 07 Oct',
      },
    ],
    linkedProjectId: 'p-entidad-espejo',
  },
  {
    id: 'n16',
    order: 16,
    title: 'La Cometa y Alborada · Prototipos del cierre',
    shortTitle: 'Cometa y Alborada',
    category: 'proyecto',
    categoryLabel: 'Prototipos',
    sessions: ['oct21', 'nov04'],
    sessionSpan: '21 Oct – 04 Nov',
    subtitle: 'Síntesis práctica de colaboración, ritmo y sentido',
    x: 495,
    y: 780,
    summary: [
      'En la sesión de cierre, el docente presentó dos prototipos minimalistas que condensaron las apuestas del laboratorio. El primero, La Cometa Compartida, nació directamente de las ideas estudiantiles sobre Sísifo: sostener con ritmo una cometa hasta lograr que quede suspendida en un cielo colectivo.',
      'El segundo, Alborada, utilizó una estética arcade sencilla para proteger del estallido de pólvora a un gatito dormido: un gesto elemental con reglas claras para suscitar reflexión sobre nuestro impacto en otras especies.',
    ],
    betOrFinding:
      'Demostrar con código en vivo —incluidos errores reales en pantalla— que una narrativa interactiva funciona por la coherencia entre gesto, regla y mundo compartido.',
    keyTakeaways: [
      'La Cometa materializó la colaboración y la permanencia: el cielo acumula las cometas de quienes lograron sostenerlas antes.',
      'Alborada probó que lo lúdico ("vieja escuela") puede albergar una postura ética crítica sin ser sermón.',
      'El error en vivo funcionó como recordatorio honesto de cierre: iterar y fallar hace parte del oficio.',
    ],
    quotes: [
      {
        text: 'Si logramos sostenerla durante un tiempo, esa cometa empieza a elevarse y termina volando en este cielo compartido... es para hablar de colaboración y permanencia.',
        speaker: 'William Montoya',
        sessionLabel: 'Sesión de cierre · 04 Nov',
      },
    ],
    microLab: 'kite-rhythm',
    linkedProjectId: 'p-docente',
  },
];

/* Validated semantic edges grounded strictly in transcript evidence */
export const CONCEPT_EDGES: ConceptEdge[] = [
  // Core structure
  { id: 'e1', from: 'n2', to: 'n1', kind: 'fundamenta', label: 'cobra vida en' },
  { id: 'e2', from: 'n3', to: 'n1', kind: 'fundamenta', label: 'sitúa en el centro' },
  { id: 'e3', from: 'n1', to: 'n4', kind: 'fundamenta', label: 'calibra el grado de' },
  { id: 'e4', from: 'n3', to: 'n4', kind: 'fundamenta', label: 'define el rol en' },

  // Concepts ↔ Methodological Bets
  { id: 'e5', from: 'n1', to: 'n5', kind: 'tensiona', label: 'evita lo obvio vía' },
  { id: 'e6', from: 'n4', to: 'n6', kind: 'tensiona', label: 'depura dispersión con' },
  { id: 'e7', from: 'n5', to: 'n6', kind: 'fundamenta', label: 'se afina mediante' },
  { id: 'e8', from: 'n2', to: 'n8', kind: 'tensiona', label: 'cuestiona lo utilitario' },
  { id: 'e9', from: 'n8', to: 'n7', kind: 'deriva', label: 'libera juego hacia' },
  { id: 'e10', from: 'n6', to: 'n9', kind: 'deriva', label: 'se valida rápido con' },

  // Concepts & Bets → Student/Lab Projects
  { id: 'e11', from: 'n5', to: 'n10', kind: 'tensiona', label: 'cambia ecos por grano' },
  { id: 'e12', from: 'n4', to: 'n10', kind: 'fundamenta', label: 'provoca incomodidad' },

  { id: 'e13', from: 'n2', to: 'n11', kind: 'fundamenta', label: 'funda reglas éticas' },
  { id: 'e14', from: 'n1', to: 'n11', kind: 'tensiona', label: 'cuestiona el abrazo' },

  { id: 'e15', from: 'n1', to: 'n12', kind: 'deriva', label: 'encuentra umbral en' },
  { id: 'e16', from: 'n4', to: 'n12', kind: 'fundamenta', label: 'busca desorientar' },

  { id: 'e17', from: 'n1', to: 'n13', kind: 'deriva', label: 'busca artefacto táctil' },
  { id: 'e18', from: 'n5', to: 'n13', kind: 'tensiona', label: 'abre mapa a relieve' },

  { id: 'e19', from: 'n9', to: 'n14', kind: 'tensiona', label: 'edita el cierre de' },
  { id: 'e20', from: 'n3', to: 'n14', kind: 'fundamenta', label: 'estructura pre/choque' },

  { id: 'e21', from: 'n6', to: 'n15', kind: 'deriva', label: 'condensa mecánicas' },
  { id: 'e22', from: 'n3', to: 'n15', kind: 'fundamenta', label: 'vuelve regla la dualidad' },

  { id: 'e23', from: 'n7', to: 'n16', kind: 'deriva', label: 'origina La Cometa' },
  { id: 'e24', from: 'n1', to: 'n16', kind: 'deriva', label: 'encarna regla simple' },
];

export const SESSIONS: SessionRecord[] = [
  {
    id: 'sep23',
    number: 'Sesión 01',
    dateLabel: '23 de septiembre',
    title: 'Intención autoral, niveles de agencia y el giro interactivo',
    centralQuestion:
      '¿Qué queremos hacer perceptible y qué diferencia a una experiencia interactiva de una obra audiovisual lineal?',
    synthesis:
      'La apertura puso sobre la mesa la intención autoral de cada proyecto antes de entrar en detalles de software. Frente al arco dramático tradicional del cortometraje The Blue Umbrella, se formuló el paso hacia una narrativa basada en la acción del usuario, la respuesta del sistema y la interpretación resultante, clasificando la agencia en tres niveles: revelar, experimentar y construir significado.',
    demosAndReferences: [
      {
        name: 'The Blue Umbrella (Pixar)',
        detail:
          'Análisis de cómo cambiar el punto de vista sobre objetos urbanos cotidianos y ejercicio de traducción a mecánicas web.',
      },
      {
        name: 'Experiencia del duelo (referente compartido en clase)',
        detail:
          'Ejemplo de interacción para experimentar: recoger objetos que suman peso y limitan el movimiento como metáfora del luto.',
      },
      {
        name: 'Escala del Sistema Solar con scroll',
        detail:
          'Cómo asociar la unidad de desplazamiento del scroll con la distancia espacial vuelve tangible la inmensidad.',
      },
    ],
    featuredNodeIds: ['n3', 'n4', 'n1'],
  },
  {
    id: 'oct07',
    number: 'Sesión 02',
    dateLabel: '7 de octubre',
    title: 'Mundos posibles, demos gestuales y diseño por sustracción',
    centralQuestion:
      '¿Cómo un gesto cotidiano o incómodo del cuerpo construye reglas de mundo y comunica sentido?',
    synthesis:
      'El docente presentó tres prototipos web breves para demostrar el poder expresivo de gestos simples: controlar lluvia con el scroll, hacer reverdecer un paisaje sosteniendo una pinza de dedos frente a la webcam (MediaPipe) y saltar entre perspectivas urbanas (gatito, charco, semáforo). Con el proyecto de la entidad espejo se introdujo el diseño por sustracción, y con el del cuerpo sonoro se abrió el debate entre resiliencia y reconstrucción.',
    demosAndReferences: [
      {
        name: 'Demo · Scroll como lluvia',
        detail: 'Desvío de un control estándar de navegación para regular intensidad atmosférica.',
        url: '/demos/lluvia/',
      },
      {
        name: 'Demo · Reverdecer con MediaPipe',
        detail:
          'Gesto físico sostenido e incómodo frente a la webcam que asocia espera y cuidado con restauración visual.',
        url: '/demos/reverdecer/',
      },
      {
        name: 'Demo · El cruce',
        detail:
          'Saltar entre perspectivas urbanas (gatito, charco, semáforo) sobre una misma escena.',
        url: '/demos/cruce/',
      },
      {
        name: 'Computers as Theatre (Brenda Laurel)',
        detail:
          'La interacción pensada como teatro: la interfaz como una escena que ocurre en el tiempo.',
      },
      {
        name: 'Speculative Everything (Anthony Dunne y Fiona Raby)',
        detail:
          'Crear desde mundos posibles para expresar ideas y tensiones, no solo para resolver problemas funcionales.',
      },
    ],
    featuredNodeIds: ['n2', 'n5', 'n6', 'n15'],
  },
  {
    id: 'oct21',
    number: 'Sesión 03',
    dateLabel: '21 de octubre',
    title: 'Inversión de roles: el reto Sísifo y la tecnología inútil',
    centralQuestion:
      '¿Cómo pasar de un esfuerzo solitario imposible a una mecánica cooperativa y cómo perderle el miedo a la técnica?',
    synthesis:
      'Se invirtió la relación de asesoría: los estudiantes propusieron salidas cooperativas al mito de Sísifo (empujar una piedra con clics imposibles), y asesorar a otros destrabó la creatividad propia. La sesión cerró con una defensa humanista de la "tecnología inútil" —crear artefactos sin fin utilitario para recuperar agencia frente a la caja negra técnica— y una muestra simple de componentes Arduino.',
    demosAndReferences: [
      {
        name: "Let's Play: Ancient Greek Punishment (Pippin Barr, 2011)",
        detail:
          'Detonante del taller: una pulsación frenética que siempre fracasa, como metáfora del peso y el castigo.',
      },
      {
        name: 'Demo · Sísifo, cuatro reglas para una roca',
        detail: 'El prototipo del docente sobre el que trabajó la co-asesoría: el mismo gesto con reglas distintas.',
        url: '/demos/sisifo/',
      },
      {
        name: 'Blendie (Kelly Dobson, 2004)',
        detail:
          'Una licuadora que gira cuando se le imita el sonido del motor con la voz: creación expresiva sin utilidad práctica para replantear nuestra relación con la tecnología.',
      },
      {
        name: 'Referentes de cooperación propuestos',
        detail:
          'Trash Day (Off by One Games, 2026: mapaches que arrastran juntos un carro de basura), moáis de Rapa Nui (coordinación rítmica), barra de apoyo y volar cometa.',
      },
      {
        name: 'Guía visual de componentes Arduino',
        detail:
          'Botones, perillas, LEDs y sensores de proximidad presentados como vocabulario accesible, no obstáculo.',
      },
    ],
    featuredNodeIds: ['n7', 'n8', 'n9'],
  },
  {
    id: 'nov04',
    number: 'Sesión 04 · Cierre',
    dateLabel: '4 de noviembre',
    title: 'Prototipos en juego, la cometa compartida y balance de avances',
    centralQuestion:
      '¿Cómo se materializa en prototipos reales la relación entre gesto, regla y experiencia?',
    synthesis:
      'En el cierre del espacio grupal, el docente compartió dos prototipos funcionales —La Cometa (resultado directo de la co-asesoría anterior) y Alborada— demostrando incluso con un fallo técnico en vivo que iterar con gestos simples es el corazón del oficio. En el balance de cierre se revisaron cuatro procesos: la visión granulosa en VR del murciélago, el guion museográfico del territorio, el trabajo de campo con la flora nativa y la instalación sobre las abejas.',
    demosAndReferences: [
      {
        name: 'La Cometa Compartida (en desarrollo)',
        detail:
          'Sostener el ritmo con clic para elevar una cometa que permanece luego en un cielo colectivo.',
      },
      {
        name: 'Alborada',
        detail:
          'Minijuego arcade para evitar el estallido de pólvora y cuidar el sueño de un gato: gesto simple con postura ética.',
        url: 'https://alborada-pico.netlify.app/',
      },
    ],
    featuredNodeIds: ['n16', 'n10', 'n11', 'n12', 'n13'],
  },
];

export const STUDENT_PROJECTS: StudentProject[] = [
  {
    id: 'p-murcielago',
    title: 'Ecolocalización urbana del murciélago insectívoro',
    medium: 'Realidad Virtual (Unreal / SteamVR) · Diseño sonoro',
    nodeId: 'n10',
    centralBet:
      'Hacer sentir la interferencia del ruido vehicular del Valle de Aburrá y el sobrecosto energético que sufre el murciélago al cazar, equilibrando asombro e incomodidad.',
    evolution:
      'Inició definiendo la especie específica y el hábitat en el Valle de Aburrá, exploró mecánicas de caza de polillas y gasto de energía y construyó un primer prototipo con cajas grises y shaders.',
    keyShift:
      'Abandonó los ecos de colores literales (y la idea de una barra de energía convencional) para diseñar una visión granulosa inducida por el tráfico frente a un cono de nitidez activado por el chillido.',
    openTension:
      'Calibrar el diseño sonoro sin agredir al oyente, resolver el quad mesh estereoscópico en VR, evitar el mareo en recorridos de 3–5 minutos y asegurar el hardware para las pruebas.',
    relatedConcepts: ['n5', 'n1', 'n4'],
  },
  {
    id: 'p-flora',
    title: 'Cohabitación horizontal con la flora nativa urbana',
    medium: 'Instalación urbana / Proyección no invasiva · Trabajo de campo',
    nodeId: 'n11',
    centralBet:
      'Visibilizar los árboles nativos de las aceras y espacios cotidianos de la ciudad (sin irse al bosque lejano) bajo una relación horizontal donde la planta tenga agencia y no sufra daño.',
    evolution:
      'Pasó de propuestas de interacción directa (raspa y gana proyectado, clasificar hojas caídas, abrazar el árbol) a redactar un documento guía de principios éticos y realizar recorridos culturales con guías (UdeA, Arví, Jardín Botánico).',
    keyShift:
      'Cuestionar incluso gestos aparentemente amorosos como el abrazo repetido (que deteriora raíces) y focalizar la exploración en un espécimen concreto —el árbol pata de vaca— observando primero cómo lo habita la gente.',
    openTension:
      'Traducir el manifiesto ético en un gesto no invasivo pero claro y resolver si la interacción individual frente al árbol transforma el entorno percibido por otros espectadores.',
    relatedConcepts: ['n2', 'n4', 'n1'],
  },
  {
    id: 'p-territorio',
    title: 'Territorio en transformación, gentrificación y huella háptica',
    medium: 'Instalación espacial · Luz, sonido envolvente y objeto táctil',
    nodeId: 'n13',
    centralBet:
      'Contrastar la pérdida de lo cotidiano frente a la transformación urbana acelerada de Ibagué mediante un tránsito sensorial: de luz fría/sonido de construcción a tonos cálidos/atmósfera cotidiana.',
    evolution:
      'Comenzó con recorridos en Google Street View y collages para superar un bloqueo metodológico inicial, hasta redactar un guion museográfico con mapa en el piso y fuentes separadas de luz y sonido.',
    keyShift:
      'Introducir una variable colaborativa para que cada visitante deje una huella propia en la atmósfera y abrir el mapa literal de Ibagué hacia un posible relieve orográfico comprensible para cualquiera.',
    openTension:
      'Definir el artefacto físico táctil (como transformar un apuntador en una "varita" o instrumento de dibujo territorial) para que el gesto sea intuitivo dentro del mundo propuesto.',
    relatedConcepts: ['n1', 'n5', 'n9'],
  },
  {
    id: 'p-cuerpo-sonoro',
    title: 'Cuerpo sonoro: memoria del desplazamiento en el sur de Córdoba',
    medium: 'Instalación sonora performática (Kinect / Cuadrantes espaciales)',
    nodeId: 'n14',
    centralBet:
      'Narrar a través del paisaje sonoro rural y la colocación del cuerpo en cuadrantes simbólicos el antes, el choque de la irrupción militar (años 70) y el después de una familia desplazada.',
    evolution:
      'Partiendo de una investigación familiar previa y un prototipo sonoro, centró la instalación en el acto performativo propio antes de abrirla a otros usuarios, depurando el movimiento hacia la postura corporal en ejes.',
    keyShift:
      'Debate crítico sobre el cierre: frente a la dicotomía entre terminar en ironía o en "resiliencia", el laboratorio replanteó la resiliencia no como retorno al pasado sino como reconstrucción cotidiana y personal.',
    openTension:
      'Evaluar éticamente el uso de voces familiares o actores frente a la fuerza de un gesto performativo silencioso y ejecutar el viaje de registro sonoro a Córdoba (o su Plan B en una finca cercana en Antioquia).',
    relatedConcepts: ['n9', 'n4', 'n3'],
  },
  {
    id: 'p-abeja',
    title: 'Trampa lumínica y arquitectura hostil desde la abeja',
    medium: 'Instalación inmersiva en cuatro paredes · Luz UV y sensores',
    nodeId: 'n12',
    centralBet:
      'Hacer experimentar en el cuerpo la desorientación que provocan los ventanales, las rejillas y la luz artificial nocturna en una abeja nativa del Valle de Aburrá.',
    evolution:
      'Migró de la realidad virtual a una instalación espacial de proyecciones en cuatro paredes con paleta ultravioleta/violeta, enfrentando la duda de qué acción pedir al visitante.',
    keyShift:
      'Identificar el "umbral" físico (una cortina morada/UV en la entrada) como el dispositivo que marca inequívocamente el paso del cuerpo humano al mundo perceptual de la abeja.',
    openTension:
      'Simplificar la captura sensorial (evaluando webcam con MediaPipe o sensores básicos en lugar de Kinect) y bocetar en storyboard el contraste exacto antes y después de cruzar el umbral.',
    relatedConcepts: ['n1', 'n5', 'n2'],
  },
  {
    id: 'p-entidad-espejo',
    title: 'Mateo y la entidad espejo: síndrome del impostor en la web',
    medium: 'Transmedia (Cortometraje + Videojuego web 2D + Cierre sonoro)',
    nodeId: 'n15',
    centralBet:
      'Explorar la autoexigencia y la comparación social mediante el enfrentamiento entre un joven artista y su versión idealizada ("la entidad espejo") que lo reemplaza.',
    evolution:
      'Desarrolló un universo narrativo extenso en Miro con sinopsis detallada, bifurcaciones, juego de persecución en perspectiva compartida y contenido educativo de cierre.',
    keyShift:
      'Aplicar el diseño por sustracción: condensar la lucha psicológica entre Mateo y la entidad en reglas elementales del mouse (clic izquierdo vs. derecho, o clic sostenido vs. toques rápidos).',
    openTension:
      'Converger desde la amplitud transmedia hacia un prototipo web acotado que permita sentir la dualidad sin abrumar al jugador.',
    relatedConcepts: ['n6', 'n3', 'n1'],
  },
  {
    id: 'p-docente',
    author: 'William Montoya · prototipos del docente',
    title: 'La Cometa Compartida & Alborada',
    medium: 'Experiencias web interactivas (Prototipos de demostración)',
    nodeId: 'n16',
    centralBet:
      'Demostrar en la práctica que un gesto elemental (clic rítmico o clic preventivo) basta para crear mundos sobre colaboración, permanencia y cuidado multiespecie.',
    evolution:
      'La Cometa surgió en 15 días directamente de la sesión de co-asesoría sobre Sísifo; Alborada nació como ejercicio paralelo de estética retro frente al impacto de la pólvora en animales.',
    keyShift:
      'Mostrar un prototipo con un fallo real en vivo en el cielo compartido sirvió para validar que el valor del laboratorio reside en la coherencia de las reglas.',
    openTension:
      'Corregir el error de flotación en La Cometa y recoger una última ronda de evaluación con el grupo.',
    relatedConcepts: ['n7', 'n1', 'n8'],
  },
];
