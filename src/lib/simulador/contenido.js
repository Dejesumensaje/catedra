/* ============================================================
   Simulador · Imagen del sistema — contenido
   ------------------------------------------------------------
   Cada persona recorre tres capas:
   1) VIVE    → beats experienciales (acciones de la persona) → frustración
   2) OBSERVA → modelo mental (expectativas) · modelo conceptual · el
               supuesto que el sistema necesita dar por cierto
   3) DISEÑA  → decisiones de interfaz específicas del problema, con
               ganancia y costo, iterando hasta el punto de quiebre.
   Necesidad ≠ modelo mental. Modelo conceptual ≠ feature ≠ interfaz.

   Cada beat y cada opción de diseño puede declarar `phone`: la spec de
   lo que muestra el teléfono mockup en ese momento.
   pantalla: 'inicio' | 'plato' | 'pago' | 'rastro' | 'estado'
   · titulo  — encabezado o mensaje central
   · filas   — renglones de la pantalla (restaurantes, datos, etc.)
   · aviso   — nota pequeña del sistema (ej. «438 restaurantes»)
   · resalta — texto exacto de una fila/aviso que se marca en amarillo
============================================================ */

export const GRUPOS = {
  1: 'valentina',
  2: 'sofia',
  3: 'camila',
  4: 'andres',
  5: 'ernesto',
};

export const PERSONAS = [
  {
    id: 'sofia', emoji: '💐', name: 'Sofía, 29', first: 'Sofía',
    scene: ['Lunes, 12:10 p. m.', 'Sofía vive en Bogotá. Abre la app de domicilios.', 'Su mamá está enferma, en Medellín.'],
    need: 'Que su mamá, enferma y sola en Medellín, almuerce hoy.',
    hint: 'Para Sofía esto no es una compra: es la manera de cuidar a alguien que no está con ella. Piensa en qué necesitaba saber para quedarse tranquila.',
    /* --- FASE 1: beats experienciales --- */
    beats: [
      { tag: 'Momento 1',
        situation: ['Su mamá no tiene ánimo de cocinar ni de pedir. Sofía quiere resolverlo desde Bogotá.'],
        question: '¿Por dónde empieza?',
        phone: { pantalla: 'inicio', aviso: 'Tu ubicación: Bogotá', filas: ['438 restaurantes cerca de ti', 'El Sabor de Siempre · 20–30 min', 'Doña Ella · 25–35 min', 'La Casa Verde · 30–40 min'], resalta: 'Tu ubicación: Bogotá' },
        options: [
          { id: 'cerca', label: 'Buscar restaurantes cerca de la casa de su mamá', plus: 'Encuentra opciones que sí pueden llegarle.', minus: 'No conoce ninguno de esos sitios.', result: 'Sofía encuentra 12 restaurantes en esa zona. Dos parecen buenos. Pero no conoce ninguno: no sabe cuál elegiría su mamá.',
            phone: { pantalla: 'inicio', aviso: 'Laureles, Medellín', filas: ['12 restaurantes en esta zona', 'El Fogón Paisa · 20–30 min', 'Arroz y Punto · 25–35 min', 'La Esquina · 15–25 min'], resalta: 'Laureles, Medellín' } },
          { id: 'preguntar', label: 'Llamar a su mamá para preguntarle qué quiere', plus: 'Sabría qué le provoca comer.', minus: 'Su mamá está enferma y sin energía para decidir.', result: 'Su mamá contesta con voz cansada: «lo que tú quieras, mija». La decisión vuelve a Sofía.',
            phone: { pantalla: 'estado', titulo: '📞 «Lo que tú quieras, mija»' } },
          { id: 'conoce', label: 'Pedir algo que Sofía ya conoce y le gusta', plus: 'Decide rápido, sin dudar.', minus: 'Puede no ser lo que su mamá necesita hoy.', result: 'Elige su plato favorito. Es rápido. Pero es lo que come ella en Bogotá, no lo que le caería bien a su mamá enferma.',
            phone: { pantalla: 'plato', titulo: 'Bandeja paisa', filas: ['El favorito de Sofía', '$22.000', 'Agregar al pedido →'], resalta: 'El favorito de Sofía' } }
        ] },
      { tag: 'Momento 2',
        situation: ['Sofía elige un restaurante y arma el pedido.', 'Llega a la pantalla de datos de entrega.'],
        question: '¿Qué hace?',
        phone: { pantalla: 'pago', aviso: 'Datos de entrega', filas: ['Dirección: Cra 7 #45-10, Bogotá', 'Recibe: Sofía · 300 123 4567', 'Total: $28.500', 'Confirmar pedido →'], resalta: 'Dirección: Cra 7 #45-10, Bogotá' },
        options: [
          { id: 'direccion', label: 'Poner la dirección de su mamá en Medellín', plus: 'El pedido irá al lugar correcto.', minus: 'Su nombre y teléfono siguen como contacto.', result: 'Cambia la dirección. Pero la app la pone a ella como quien recibe: notificaciones, timbre e instrucciones le hablan a Sofía, a 400 km.',
            phone: { pantalla: 'pago', aviso: 'Datos de entrega', filas: ['Dirección: Cl 33 #70-22, Medellín', 'Recibe: Sofía · 300 123 4567', 'Total: $28.500', 'Confirmar pedido →'], resalta: 'Recibe: Sofía · 300 123 4567' } },
          { id: 'nota', label: 'Escribir una nota al repartidor explicando la situación', plus: 'Intenta que entiendan que es para alguien enfermo.', minus: 'Depende de que alguien la lea.', result: 'Escribe: «es para una persona enferma, por favor toque y espere». No tiene forma de saber si la leerán.',
            phone: { pantalla: 'pago', aviso: 'Datos de entrega', filas: ['Dirección: Cl 33 #70-22, Medellín', 'Nota: «persona enferma, toque y espere»', 'Total: $28.500', 'Confirmar pedido →'], resalta: 'Nota: «persona enferma, toque y espere»' } },
          { id: 'contacto', label: 'Poner la dirección de su mamá, pero dejar su propio teléfono', plus: 'Controla la entrega desde Bogotá.', minus: 'El repartidor la llamará a ella cuando esté abajo.', result: 'El pedido apunta a Medellín, pero el contacto sigue siendo ella. Cuando el repartidor llegue, llamará a Bogotá a preguntar cómo entrar.',
            phone: { pantalla: 'pago', aviso: 'Datos de entrega', filas: ['Dirección: Cl 33 #70-22, Medellín', 'Contacto: Sofía (Bogotá) · 300 123 4567', 'Total: $28.500', 'Confirmar pedido →'], resalta: 'Contacto: Sofía (Bogotá) · 300 123 4567' } }
        ] },
      { tag: 'Momento 3', shared: true,
        situation: ['Sofía confirma y paga. Espera.', 'Unos minutos después, la app le muestra:'],
        system: 'Pedido entregado ✓',
        phone: { pantalla: 'estado', titulo: 'Pedido entregado ✓' },
        question: '¿Qué sabe Sofía ahora?',
        options: [{ id: 'a', label: 'Que el restaurante cumplió' }, { id: 'b', label: 'Que la operación terminó' }, { id: 'c', label: 'Que su mamá recibió la comida' }, { id: 'd', label: 'Que su mamá está comiendo' }],
        head: 'Para el sistema, esto ya terminó.',
        result: 'La app da el pedido por entregado y cierra la operación. Pero Sofía se queda con la duda que la trajo aquí: ¿mi mamá se levantó, abrió, está comiendo? El sistema cerró un pedido. Sofía sigue con una relación abierta.',
        plus: 'El sistema cumplió su parte: la comida llegó a la dirección.',
        minus: 'Pero eso no le dice a Sofía lo único que necesitaba saber.' }
    ],
    /* --- FASE 2 --- */
    frustration: '«Pude pedir comida… pero el sistema nunca entendió que no era para mí, ni que yo necesitaba saber qué le pasó a mi mamá.»',
    expectations: [
      'Pedir desde Bogotá para su mamá, que está en Medellín',
      'Decir a nombre de quién va el pedido',
      'Saber qué pasó después de que la comida llegara',
      'Contar con que el sistema sabe que ella no es quien come'
    ],
    concept: ['Usuario', 'Pedido', 'Productos', 'Dirección', 'Entrega'],
    doneWhen: 'el pedido se entrega en la dirección.',
    tension: {
      person: '«Quiero pedir para mi mamá, en otra ciudad, y saber que está bien.»',
      system: '«Un usuario hace un pedido para una dirección. Termina cuando se entrega.»',
      supuesto: 'Que quien pide es quien come, y que todo termina cuando la comida llega a la puerta.'
    },
    /* --- FASE 3: diseño --- */
    design: [
      { problem: 'Sofía está en Bogotá y necesita que el pedido llegue a Medellín.',
        options: [
          { id: 'o1', label: 'Permitir añadir otra dirección de entrega', result: 'Ahora Sofía puede escribir la dirección de su mamá.', gain: 'El pedido puede llegar a otra ciudad.', cost: 'El sistema sigue viendo a Sofía como quien recibe.',
            phone: { pantalla: 'pago', aviso: 'Datos de entrega', filas: ['Dirección: Cra 7 #45-10, Bogotá', '＋ Agregar otra dirección', 'Total: $28.500', 'Confirmar pedido →'], resalta: '＋ Agregar otra dirección' } },
          { id: 'o2', label: 'Elegir la dirección de destino al iniciar el pedido', result: 'El pedido arranca apuntando a Medellín.', gain: 'Desde el arranque queda claro a dónde va.', cost: 'Sigue sin distinguir quién recibe de quién paga.',
            phone: { pantalla: 'inicio', aviso: 'Antes de empezar', filas: ['¿A dónde va este pedido?', 'Mi casa · Bogotá', 'Otra dirección →'], resalta: '¿A dónde va este pedido?' } },
          { id: 'o3', label: 'Indicar desde el inicio que el pedido es para otra persona', result: 'La app marca el pedido como «para alguien más».', gain: 'El sistema empieza a saber que hay alguien más.', cost: 'Sofía tiene que gestionar a una segunda persona.',
            phone: { pantalla: 'inicio', aviso: 'Antes de empezar', filas: ['¿Para quién es?', 'Para mí', 'Para alguien más →'], resalta: 'Para alguien más →' } }
        ],
        emerge: 'La dirección cambió, pero el sistema sigue tratando a Sofía como quien recibe: las notificaciones y el contacto le llegan a ella.' },
      { problem: 'El sistema aún trata a Sofía como la receptora. Su mamá es quien recibe.',
        options: [
          { id: 'o1', label: 'Crear un perfil para quien recibe (su mamá)', result: 'Aparece un «destinatario»: su mamá.', gain: 'Hace visible que otra persona recibirá.', cost: 'Su mamá queda dentro del sistema: hay que crearla y mantenerla.',
            phone: { pantalla: 'pago', aviso: 'Datos de entrega', filas: ['Destinatario: Mamá · Cl 33 #70-22', 'Paga: Sofía', 'Total: $28.500', 'Confirmar pedido →'], resalta: 'Destinatario: Mamá · Cl 33 #70-22' } },
          { id: 'o2', label: 'Enviar las notificaciones de entrega a su mamá', result: 'Las alertas van al teléfono de su mamá.', gain: 'Quien recibe se entera de que llega.', cost: 'Su mamá no usa apps; puede no verlas.',
            phone: { pantalla: 'rastro', titulo: 'Va en camino · 12 min', aviso: 'Notificaciones → teléfono de tu mamá', filas: [], resalta: 'Notificaciones → teléfono de tu mamá' } },
          { id: 'o3', label: 'Dejar que Sofía escriba instrucciones para el receptor', result: 'Puede explicarle la situación al repartidor.', gain: 'Comunica el contexto (persona enferma).', cost: 'Depende de que alguien las lea y actúe.',
            phone: { pantalla: 'pago', aviso: 'Datos de entrega', filas: ['Para: Mamá · Cl 33 #70-22', 'Instrucciones: «tocar y esperar»', 'Total: $28.500', 'Confirmar pedido →'], resalta: 'Instrucciones: «tocar y esperar»' } }
        ],
        emerge: 'Ahora el pedido llega y avisa a su mamá. Pero para el sistema todo termina en «entregado»; Sofía todavía no sabe si su mamá comió.' },
      { problem: 'Para el sistema el pedido termina en «entregado». Para Sofía, no.',
        options: [
          { id: 'o1', label: 'Pedir confirmación de que el receptor recibió', result: 'Alguien confirma que la comida llegó a manos de su mamá.', gain: 'Cierra el paso de la entrega física.', cost: 'Confirmar recibido no es saber que comió.',
            phone: { pantalla: 'estado', titulo: 'Entregado ✓ · Recibido ✓', aviso: 'Confirmó: el receptor' } },
          { id: 'o2', label: 'Permitir un mensaje de vuelta del receptor', result: 'Se abre un canal para que su mamá le avise «ya comí».', gain: 'Su mamá puede responder.', cost: 'Depende de que ella pueda y quiera hacerlo.',
            phone: { pantalla: 'estado', titulo: '💬 «Ya comí, mi amor»', aviso: 'Mensaje del receptor' } },
          { id: 'o3', label: 'Extender el estado del pedido más allá de la entrega', result: 'El pedido ya no se cierra en el instante de entregar.', gain: 'El sistema deja de dar el caso por cerrado tan pronto.', cost: 'Complica un flujo pensado para terminar en «entregado».',
            phone: { pantalla: 'rastro', titulo: 'Entregado → Recibido → A salvo', aviso: 'El pedido sigue abierto', filas: [], resalta: 'El pedido sigue abierto' } }
        ],
        emerge: 'Cada arreglo acercó el sistema a lo que Sofía quería. Pero seguiste agregando piezas a la misma idea: «un pedido que termina cuando se entrega».' }
    ]
  },

  {
    id: 'camila', emoji: '⏰', name: 'Camila, 27', first: 'Camila',
    scene: ['Martes, 12:20 p. m.', 'Camila tiene 40 minutos para almorzar. Abre la app.', 'A la 1:00 entra a una reunión que no puede moverse.'],
    need: 'Almorzar antes de la 1:00 p. m. Sin excusas.',
    hint: 'Para Camila esto no es elegir restaurante: es apostar la única hora libre que tiene. Piensa en qué le estaba pidiendo al sistema que le garantizara.',
    beats: [
      { tag: 'Momento 1',
        situation: ['Tiene 40 minutos. Diez se le irán en comer.', 'Todo depende de que el pedido llegue cuando dice.'],
        question: '¿Por dónde empieza?',
        phone: { pantalla: 'inicio', aviso: '438 restaurantes', filas: ['El Wok · 15–20 min', 'La Nonna · 25–35 min', 'El de Siempre · 30–40 min', 'Green Bowl · 20–30 min'], resalta: 'El Wok · 15–20 min' },
        options: [
          { id: 'rapido', label: 'Pedir en el que promete menos tiempo («15–20 min»)', plus: 'Sale lo antes posible, sobre el papel.', minus: 'Ese número no se lo garantiza nadie.', result: 'Elige el que dice «15–20 min». No es el que más le provoca, pero es el que llegaría a tiempo. Si el número es cierto.',
            phone: { pantalla: 'plato', titulo: 'El Wok', filas: ['Entrega: 15–20 min', 'Arroz tres delicias · $18.000', 'Agregar al pedido →'], resalta: 'Entrega: 15–20 min' } },
          { id: 'conocido', label: 'Pedir en un sitio conocido, aunque diga «30–40 min»', plus: 'Sabe qué esperar de ese restaurante.', minus: 'Si tarda lo que dice, no alcanza.', result: 'El conocido dice «30–40 min». No le alcanza. Descartado: hoy el que manda es el reloj.',
            phone: { pantalla: 'plato', titulo: 'El de Siempre', filas: ['Entrega: 30–40 min', 'Llegaría ≈ 1:10 p. m.', '✕ No alcanza'], resalta: '✕ No alcanza' } },
          { id: 'resenas', label: 'Buscar reseñas sobre si cumplen los tiempos', plus: 'Sabría si el estimado es real.', minus: 'Las reseñas hablan del sabor, no del reloj.', result: 'Lee reseñas: «muy rico», «buena porción». Nadie habla de la hora. El dato que necesita no está.',
            phone: { pantalla: 'plato', titulo: 'Reseñas', filas: ['«Muy rico» ★★★★★', '«Buena porción» ★★★★', 'Sobre la hora: nada'], resalta: 'Sobre la hora: nada' } }
        ] },
      { tag: 'Momento 2',
        situation: ['12:38. Faltan 22 minutos para su reunión.'],
        question: '¿Qué hace?',
        system: 'Va en camino 🛵 · 10–15 min',
        phone: { pantalla: 'rastro', titulo: 'Va en camino · 10–15 min', aviso: '12:38', filas: [], resalta: 'Va en camino · 10–15 min' },
        options: [
          { id: 'esperar', label: 'Esperar mirando el mapa', plus: 'Si llega en 10, alcanza justo.', minus: 'Si se estira, perdió el almuerzo.', result: 'El puntito avanza lento. 12:44. El estimado cambia a «15–20 min». Nadie le avisó; el número simplemente cambió.',
            phone: { pantalla: 'rastro', titulo: 'Va en camino · 15–20 min', aviso: '12:44 · el estimado cambió', filas: [], resalta: '12:44 · el estimado cambió' } },
          { id: 'cancelar', label: 'Cancelar y buscar algo más cerca', plus: 'Recupera el control.', minus: 'Cancelar hoy significa no almorzar.', result: 'Calcula: cancelar, pedir de nuevo, esperar de nuevo. No hay tiempo. Cancelar es quedarse sin almuerzo.',
            phone: { pantalla: 'estado', titulo: '¿Cancelar pedido?', aviso: 'Pedir de nuevo: +25 min' } },
          { id: 'escribir', label: 'Escribir al restaurante a preguntar', plus: 'Quizás alguien le diga la verdad.', minus: 'La respuesta puede llegar tarde o no llegar.', result: 'Escribe «¿va a tiempo?». Nadie responde. El chat tiene un mensaje automático: «tu pedido va en camino».',
            phone: { pantalla: 'estado', titulo: '💬 «¿Va a tiempo?»', aviso: 'Respuesta automática: tu pedido va en camino' } }
        ] },
      { tag: 'Momento 3', shared: true,
        situation: ['12:52. El timbre suena. La app confirma:'],
        system: 'Pedido entregado ✓ · 12:52',
        phone: { pantalla: 'estado', titulo: 'Pedido entregado ✓ · 12:52' },
        question: '¿Qué pasó con el almuerzo de Camila?',
        options: [{ id: 'a', label: 'Llegó a tiempo y almorzó tranquila' }, { id: 'b', label: 'Llegó, pero ya sin tiempo de comer' }, { id: 'c', label: 'El sistema cumplió su estimado' }, { id: 'd', label: 'Ella perdió el almuerzo mirando un mapa' }],
        head: 'El sistema cumplió su número. Camila perdió su hora.',
        result: 'La comida llegó dentro del estimado final. Pero el estimado cambió tres veces sin aviso, y ella pasó veinte minutos mirando un mapa en vez de comer. El sistema nunca le debió nada: sus números no eran promesas.',
        plus: 'La app mostró el pedido en todo momento.',
        minus: 'Pero ningún número le dijo lo único que importaba: si iba a alcanzar.' }
    ],
    frustration: '«Pude ver mi pedido en todo momento… pero ningún número me dijo si iba a alcanzar, y nadie respondía por la hora.»',
    expectations: [
      'Confiar en que el tiempo prometido se cumple',
      'Saber si alcanza a comer, no solo dónde va el pedido',
      'Tener a alguien que responda por la hora',
      'Enterarse cuando el tiempo cambia, en vez de descubrirlo sola'
    ],
    concept: ['Pedido', 'Estimado', 'Reparto', 'Entrega'],
    doneWhen: 'el pedido se entrega dentro del estimado — cualquiera que sea el estimado de ese momento.',
    tension: {
      person: '«Necesito saber si alcanzo a comer antes de la 1:00. Que alguien responda por esa hora.»',
      system: '«Muestro un estimado que se recalcula solo. Nadie promete nada.»',
      supuesto: 'Que mostrar un número es lo mismo que prometer una hora.'
    },
    design: [
      { problem: 'Camila necesita saber si alcanza. La app muestra un estimado que cambia sin avisar.',
        options: [
          { id: 'o1', label: 'Ordenar los restaurantes por «más rápido»', result: 'Los de menor tiempo prometido aparecen primero.', gain: 'Elige rápido entre los más rápidos.', cost: 'El estimado sigue sin ser un compromiso.',
            phone: { pantalla: 'inicio', aviso: 'Ordenado por: más rápido', filas: ['El Wok · 15–20 min', 'Green Bowl · 20–30 min', 'La Nonna · 25–35 min'], resalta: 'Ordenado por: más rápido' } },
          { id: 'o2', label: 'Mostrar el estimado como hora («llega ≈ 12:45»)', result: 'El tiempo se muestra como hora concreta.', gain: 'Puede comparar contra su reunión.', cost: 'La hora también se recalcula en silencio.',
            phone: { pantalla: 'plato', titulo: 'El Wok', filas: ['Llega ≈ 12:45 p. m.', 'Tu reunión: 1:00 p. m.', 'Agregar al pedido →'], resalta: 'Llega ≈ 12:45 p. m.' } },
          { id: 'o3', label: 'Avisar cuando el estimado cambie', result: 'Cada cambio llega como notificación.', gain: 'El cambio ya no pasa en silencio.', cost: 'Más avisos, misma incertidumbre: nadie responde por la hora.',
            phone: { pantalla: 'estado', titulo: '🔔 Tu pedido se retrasó', aviso: 'Nuevo estimado: 15–20 min' } }
        ],
        emerge: 'Ahora Camila ve los cambios. Pero verlos no la salva: el número puede seguir cambiando y nadie responde por él.' },
      { problem: 'Los estimados se ven, pero no comprometen a nadie.',
        options: [
          { id: 'o1', label: 'Mostrar qué tan confiable es cada estimado', result: 'Cada tiempo muestra su historial de cumplimiento.', gain: 'Distingue promesas serias de adornos.', cost: 'Sigue siendo estadística, no compromiso.',
            phone: { pantalla: 'inicio', aviso: '438 restaurantes', filas: ['El Wok · 15–20 min · cumple 6 de 10', 'Green Bowl · 20–30 min · cumple 9 de 10'], resalta: 'El Wok · 15–20 min · cumple 6 de 10' } },
          { id: 'o2', label: 'Dejar que Camila fije su hora límite', result: 'Ella dice «antes de la 12:55» y la app responde qué opciones caben.', gain: 'La pregunta pasa a ser la de ella, no la del sistema.', cost: 'Las opciones que caben se reducen mucho.',
            phone: { pantalla: 'inicio', aviso: 'Lo necesito antes de la 12:55', filas: ['Caben en tu hora: 2 restaurantes', 'El Wok · llega ≈ 12:45', 'Green Bowl · llega ≈ 12:50'], resalta: 'Lo necesito antes de la 12:55' } },
          { id: 'o3', label: 'Penalizar a los restaurantes que no cumplen', result: 'Los que se pasan bajan en la lista.', gain: 'Presión real sobre el estimado.', cost: 'El castigo llega después; el almuerzo de hoy ya se perdió.',
            phone: { pantalla: 'inicio', aviso: 'Menos confiables, más abajo', filas: ['Green Bowl · cumple 9 de 10', 'El Wok · cumple 6 de 10'], resalta: 'Menos confiables, más abajo' } }
        ],
        emerge: 'El estimado ahora dice más. Pero sigue siendo un número que el sistema corrige; la hora de Camila no está dentro del sistema.' },
      { problem: 'La hora límite de Camila no existe para el sistema.',
        options: [
          { id: 'o1', label: 'Que el pedido se cancele solo si se pasa de la hora', result: 'Si no llega a tiempo, no paga.', gain: 'El riesgo deja de ser solo de ella.', cost: 'Se queda sin almuerzo igual; solo que gratis.',
            phone: { pantalla: 'estado', titulo: '12:55 · Pedido cancelado', aviso: 'No se te cobró nada' } },
          { id: 'o2', label: 'Que el sistema confirme la hora antes de pagar', result: 'Antes de cobrar, la app dice «llega antes de las 12:55 o te avisamos».', gain: 'Alguien responde por la hora por primera vez.', cost: 'El sistema tiene que comprometerse de verdad — y eso cambia lo que es.',
            phone: { pantalla: 'pago', aviso: 'Compromiso', filas: ['Llega antes de la 12:55', 'Si no, te avisamos y decides', 'Total: $18.000', 'Confirmar pedido →'], resalta: 'Llega antes de la 12:55' } },
          { id: 'o3', label: 'Diseñar el pedido alrededor de su hora, no del restaurante', result: 'La experiencia arranca con «¿para cuándo lo necesitas?».', gain: 'El tiempo pasa a ser el eje, no un dato más.', cost: 'Se aleja del modelo de catálogo por completo.',
            phone: { pantalla: 'inicio', aviso: 'Antes de empezar', filas: ['¿Para cuándo lo necesitas?', '12:55 →', 'Lo que haya →'], resalta: '¿Para cuándo lo necesitas?' } }
        ],
        emerge: 'Cada arreglo acercó la hora de Camila al sistema. Pero seguiste construyendo sobre «un estimado que se muestra», cuando ella necesita «una hora que se cumpla».' }
    ]
  },

  {
    id: 'ernesto', emoji: '☕', name: 'Ernesto, 68', first: 'Ernesto',
    scene: ['Domingo, 12:42 p. m.', 'Ernesto abre la app para pedir el almuerzo del domingo.', 'Es para él y su esposa: el mismo de siempre.'],
    need: 'Pedir el almuerzo de siempre, del restaurante del barrio.',
    hint: 'Para Ernesto esto no es escoger entre opciones: es repetir algo que ya sabe que funciona. Piensa en qué le daba confianza antes de que existiera la app.',
    beats: [
      { tag: 'Momento 1',
        situation: ['Al abrir, lo primero que ve son 438 restaurantes.', 'Él solo quiere el de siempre.'],
        question: '¿Qué hace?',
        phone: { pantalla: 'inicio', aviso: '438 restaurantes', filas: ['Restaurante La 70 · 25–35 min', 'Sabor Casero · 20–30 min', 'La Setenta · 30–40 min', 'Casa de Comidas · 20–35 min'], resalta: '438 restaurantes' },
        options: [
          { id: 'buscar', label: 'Buscar su restaurante de siempre en la lista', plus: 'Es el que conoce y en el que confía.', minus: 'Tiene que reconocerlo entre cientos.', result: 'Baja por la lista. Hay decenas de nombres parecidos. No está seguro de cuál es el suyo.',
            phone: { pantalla: 'inicio', aviso: '438 restaurantes', filas: ['La Setentaita · 25–35 min', 'La 70 Express · 20–30 min', 'La Setenta · 30–40 min', 'Setenta y Dos · 20–35 min'], resalta: 'La Setenta · 30–40 min' } },
          { id: 'explorar', label: 'Explorar a ver si hay algo nuevo', plus: 'Podría descubrir algo mejor.', minus: 'Él no quería descubrir nada hoy.', result: 'Mira opciones nuevas. Se ven bien, pero no las conoce, y no quiere arriesgarse un domingo.',
            phone: { pantalla: 'inicio', aviso: 'Novedades para ti', filas: ['Fusión Nikkei · NUEVO', 'Bowls de autor · NUEVO', 'Cocina experimental · NUEVO'], resalta: 'Novedades para ti' } },
          { id: 'esposa', label: 'Pedirle a su esposa que le ayude a encontrarlo', plus: 'Dos cabezas piensan mejor.', minus: 'Ella tampoco se maneja con la app.', result: 'Su esposa se acerca. Entre los dos tampoco están seguros de cuál es el de siempre.',
            phone: { pantalla: 'estado', titulo: '«¿Será este?»', aviso: 'Los dos miran la misma lista' } }
        ] },
      { tag: 'Momento 2',
        situation: ['Cree haber encontrado el restaurante. Entra al menú para armar el pedido.'],
        question: '¿Qué hace?',
        phone: { pantalla: 'plato', titulo: 'La Setenta', filas: ['Entrada del día · $9.000', 'Pescado nuevo · $24.000', 'Especial de la casa · $19.000'], resalta: 'La Setenta' },
        options: [
          { id: 'iguales', label: 'Buscar exactamente los dos platos de siempre', plus: 'Es justo lo que quiere.', minus: 'El menú cambió de orden y no los ubica.', result: 'Los platos siguen ahí, pero en otro lugar. Ernesto duda si son los mismos de antes.',
            phone: { pantalla: 'plato', titulo: 'La Setenta', filas: ['Pescado nuevo · $24.000', '¿El almuerzo de siempre?', 'Especial de la casa · $19.000'], resalta: '¿El almuerzo de siempre?' } },
          { id: 'parecido', label: 'Elegir algo que se parezca, por si acaso', plus: 'Avanza sin trabarse.', minus: 'Puede no ser lo que quería.', result: 'Elige algo parecido. Pero no está seguro de que sea igual a lo de siempre.',
            phone: { pantalla: 'plato', titulo: 'La Setenta', filas: ['Especial de la casa · $19.000', '«Se parece al de siempre»', 'Agregar al pedido →'], resalta: '«Se parece al de siempre»' } },
          { id: 'llamar', label: 'Pensar en llamar al restaurante, como antes', plus: 'Es lo que sabe hacer con confianza.', minus: 'Entonces la app no le sirvió de nada.', result: 'Se le ocurre llamar, como toda la vida. Y se pregunta para qué abrió la app.',
            phone: { pantalla: 'estado', titulo: '📞 «¿Aló, La Setenta?»', aviso: 'Como toda la vida' } }
        ] },
      { tag: 'Momento 3', shared: true,
        situation: ['Ernesto llega al pago. La app le pide confirmar la tarjeta y hacer el pedido.'],
        system: '¿Confirmar pedido?',
        phone: { pantalla: 'pago', aviso: 'Pago', filas: ['2 platos · $38.000', 'Tarjeta terminada en 4417', 'Confirmar pedido →'], resalta: 'Confirmar pedido →' },
        question: '¿Qué siente Ernesto en este momento?',
        options: [{ id: 'a', label: 'Seguridad de que pidió bien' }, { id: 'b', label: 'Duda de si eligió lo correcto' }, { id: 'c', label: 'Miedo de haberse equivocado' }, { id: 'd', label: 'Ganas de que ya se acabe' }],
        head: 'Va a lograr pedir. Pero no era esto lo que quería.',
        result: 'La app lo hizo buscar, explorar, comparar y decidir. Ernesto no quería nada de eso: solo quería repetir, con confianza, algo que ya sabía que funcionaba. Llegó hasta aquí lleno de dudas.',
        plus: 'El pedido está a un toque de completarse.',
        minus: 'Pero lo logró desconfiando de cada paso, no repitiendo con tranquilidad.' }
    ],
    frustration: '«Pude pedir… pero el sistema me hizo explorar y decidir todo de nuevo, cuando yo solo quería repetir lo de siempre.»',
    expectations: [
      'Encontrar rápido lo que ya conoce',
      'Repetir un pedido anterior sin volver a decidir',
      'Confirmar sin miedo a equivocarse',
      'Llegar a lo suyo sin recorrer cientos de opciones'
    ],
    concept: ['Explorar', 'Comparar', 'Elegir', 'Confirmar'],
    doneWhen: 'el pedido queda confirmado.',
    tension: {
      person: '«Quiero repetir rápido y con confianza algo que ya conozco.»',
      system: '«Explorar, comparar, elegir y confirmar cada pedido.»',
      supuesto: 'Que abrir la app es querer escoger.'
    },
    design: [
      { problem: 'El sistema abre con 438 restaurantes para explorar. Ernesto solo quiere lo de siempre.',
        options: [
          { id: 'o1', label: 'Poner «Pedir de nuevo» al inicio', result: 'Su último pedido aparece de primero.', gain: 'Vuelve directo a lo conocido.', cost: 'Solo sirve si ya pidió antes por la app.',
            phone: { pantalla: 'inicio', aviso: 'Hola, Ernesto', filas: ['↻ Pedir de nuevo: La Setenta', '2 platos de siempre · $38.000', '438 restaurantes más abajo'], resalta: '↻ Pedir de nuevo: La Setenta' } },
          { id: 'o2', label: 'Fijar su restaurante favorito arriba', result: 'El restaurante del barrio queda fijo arriba.', gain: 'Encuentra el suyo sin buscar.', cost: 'Hay que configurarlo una vez — y esa vez ya cuesta.',
            phone: { pantalla: 'inicio', aviso: 'Tu favorito', filas: ['★ La Setenta · 25–35 min', '437 restaurantes más abajo'], resalta: '★ La Setenta · 25–35 min' } },
          { id: 'o3', label: 'Reducir la exploración inicial', result: 'La app abre mostrando poco, no 438 sitios.', gain: 'Menos ruido al abrir.', cost: 'Puede ocultar opciones que alguien más sí busca.',
            phone: { pantalla: 'inicio', aviso: '3 sugerencias', filas: ['La Setenta · 25–35 min', 'Sabor Casero · 20–30 min', 'Ver más →'], resalta: '3 sugerencias' } }
        ],
        emerge: 'Ernesto llega más rápido a algo conocido. Pero el sistema todavía le pide elegir y confirmar cada plato desde cero.' },
      { problem: 'Aunque encuentre el restaurante, tiene que rearmar el pedido plato por plato.',
        options: [
          { id: 'o1', label: 'Recuperar el pedido anterior completo', result: 'Aparece el pedido de la otra vez, listo.', gain: 'Repite sin rearmar nada.', cost: 'Si algo cambió, hay que avisarle bien.',
            phone: { pantalla: 'plato', titulo: 'Tu pedido del domingo pasado', filas: ['2 × almuerzo de siempre · $38.000', 'Repetir pedido →'], resalta: 'Repetir pedido →' } },
          { id: 'o2', label: 'Guardar sus platos habituales', result: 'Sus platos frecuentes quedan guardados.', gain: 'Sus dos platos de siempre, a un toque.', cost: 'Si un domingo quiere variar, lo guardado le estorba.',
            phone: { pantalla: 'plato', titulo: 'Tus platos de siempre', filas: ['Almuerzo para dos · $38.000', 'Agregar →'], resalta: 'Tus platos de siempre' } },
          { id: 'o3', label: 'Confirmar el pedido en un solo paso', result: 'Puede confirmar de una.', gain: 'Menos pasos, menos miedo.', cost: 'Menos oportunidades de revisar antes de pagar.',
            phone: { pantalla: 'pago', aviso: 'Un solo paso', filas: ['La Setenta · 2 platos · $38.000', 'Confirmar y pagar →'], resalta: 'Confirmar y pagar →' } }
        ],
        emerge: 'Ernesto casi no decide ya. Pero cada vez que algo cambia, el sistema lo devuelve a explorar y elegir, y regresa el miedo a equivocarse.' },
      { problem: 'Cualquier cambio lo devuelve al modo «explorar y decidir».',
        options: [
          { id: 'o1', label: 'Avisar los cambios sin obligar a re-elegir todo', result: 'Si sube el precio, se lo dice sin reiniciar el pedido.', gain: 'Le muestra solo lo que cambió.', cost: 'Si el aviso llega tarde o confuso, pierde la confianza que acababa de recuperar.',
            phone: { pantalla: 'plato', titulo: 'Tu pedido de siempre', filas: ['Solo cambió esto:', 'Precio: $38.000 → $40.500', 'Confirmar igual →'], resalta: 'Solo cambió esto:' } },
          { id: 'o2', label: 'Tratar «lo de siempre» como el estado por defecto', result: 'La app arranca en «tu pedido de siempre».', gain: 'El sistema asume continuidad, no exploración.', cost: 'Se aleja del modelo de catálogo.',
            phone: { pantalla: 'inicio', aviso: 'Domingo', filas: ['Tu pedido de siempre está listo', 'La Setenta · 2 platos · $38.000', 'Confirmar → · Cambiar →'], resalta: 'Tu pedido de siempre está listo' } },
          { id: 'o3', label: 'Permitir confirmar por voz o llamada', result: 'Puede confirmar hablando, como antes.', gain: 'Usa lo que él ya sabe hacer.', cost: 'Sale del flujo digital estándar.',
            phone: { pantalla: 'estado', titulo: '📞 «El de siempre, por favor»', aviso: 'Confirmado por llamada' } }
        ],
        emerge: 'Cada arreglo lo acercó a repetir tranquilo. Pero seguiste construyendo sobre un sistema pensado para explorar y comparar.' }
    ]
  },

  {
    id: 'valentina', emoji: '🌾', name: 'Valentina, 22', first: 'Valentina',
    scene: ['Jueves, 1:30 p. m.', 'Valentina tiene hambre entre clases y abre la app.', 'Es celíaca: un plato con gluten la enferma de verdad.'],
    need: 'Almorzar sin exponerse al gluten.',
    hint: 'Para Valentina esto no es elegir un plato: es decidir si se arriesga. Piensa en qué necesitaba para poder comer sin miedo.',
    beats: [
      { tag: 'Momento 1',
        situation: ['Tiene poco tiempo y hambre. Un error hoy le arruina la tarde.'],
        question: '¿Por dónde empieza?',
        phone: { pantalla: 'inicio', aviso: '438 restaurantes', filas: ['Green Bowl · sin gluten 🌾', 'La Nonna · 20–30 min', 'Wok House · sin gluten 🌾'], resalta: 'Green Bowl · sin gluten 🌾' },
        options: [
          { id: 'etiqueta', label: 'Buscar platos que digan «sin gluten»', plus: 'Encuentra opciones marcadas al instante.', minus: 'No sabe si la etiqueta es confiable.', result: 'Aparecen platos marcados «sin gluten». Pero ha visto etiquetas mal puestas; no sabe si fiarse.',
            phone: { pantalla: 'inicio', aviso: 'Con la etiqueta 🌾', filas: ['Green Bowl · sin gluten 🌾', 'Wok House · sin gluten 🌾', '¿Quién verifica estas etiquetas?'], resalta: '¿Quién verifica estas etiquetas?' } },
          { id: 'conocido', label: 'Ir a un restaurante que ya sabe que es seguro', plus: 'Confía en lo conocido.', minus: 'Hoy puede no entregar donde ella está.', result: 'Piensa en el sitio donde nunca le ha pasado nada. Pero hoy no entrega en la universidad.',
            phone: { pantalla: 'plato', titulo: 'Su sitio seguro', filas: ['✕ No entrega en esta zona', 'Buscar alternativas →'], resalta: '✕ No entrega en esta zona' } },
          { id: 'rico', label: 'Elegir lo que se vea más rico y revisar después', plus: 'Decide rápido.', minus: 'Deja el riesgo para el final.', result: 'Elige algo apetitoso. Pero ahora tiene que averiguar si puede comerlo sin enfermarse.',
            phone: { pantalla: 'plato', titulo: 'Pasta Alfredo', filas: ['Se ve deliciosa', '¿Lleva gluten? Sin información', 'Agregar al pedido →'], resalta: '¿Lleva gluten? Sin información' } }
        ] },
      { tag: 'Momento 2',
        situation: ['Entra al plato que le interesa. Quiere estar segura antes de pedir.'],
        question: '¿Qué hace?',
        phone: { pantalla: 'plato', titulo: 'Bowl de quinoa 🌾', filas: ['Ingredientes: quinoa, aguacate, pollo…', 'Preparación: sin información', 'Agregar al pedido →'], resalta: 'Preparación: sin información' },
        options: [
          { id: 'ingredientes', label: 'Leer la lista de ingredientes', plus: 'Ve qué lleva el plato.', minus: 'No dice cómo se prepara.', result: 'La lista no menciona harina. Pero no dice si lo fríen en el mismo aceite que el pan apanado.',
            phone: { pantalla: 'plato', titulo: 'Bowl de quinoa 🌾', filas: ['Ingredientes: sin harina ✓', 'Aceite compartido: sin información', 'Agregar al pedido →'], resalta: 'Aceite compartido: sin información' } },
          { id: 'resenas', label: 'Buscar reseñas de otras personas celíacas', plus: 'Confianza de gente como ella.', minus: 'Puede no haber ninguna.', result: 'Encuentra una reseña, de hace un año, que no aclara gran cosa.',
            phone: { pantalla: 'plato', titulo: 'Reseñas', filas: ['«Rico» ★★★★ · hace 1 año', 'Sobre gluten: nada claro'], resalta: 'Sobre gluten: nada claro' } },
          { id: 'preguntar', label: 'Escribir al restaurante para preguntar', plus: 'Podría tener respuesta directa.', minus: 'Puede no contestar a tiempo.', result: 'Manda la pregunta. Nadie responde de inmediato, y su hora de almuerzo corre.',
            phone: { pantalla: 'estado', titulo: '💬 «¿El bowl tiene gluten?»', aviso: 'Sin respuesta · hace 12 min' } }
        ] },
      { tag: 'Momento 3', shared: true,
        situation: ['Tiene el dedo sobre el botón. Todo indica que el plato está bien… casi todo.'],
        system: '¿Confirmar pedido?',
        phone: { pantalla: 'pago', aviso: 'Pago', filas: ['Bowl de quinoa 🌾 · $21.000', '«Sin gluten» — sin verificar', 'Confirmar pedido →'], resalta: '«Sin gluten» — sin verificar' },
        question: '¿Con qué se queda Valentina?',
        options: [{ id: 'a', label: 'La certeza de que el plato es seguro' }, { id: 'b', label: 'La esperanza de que esté bien etiquetado' }, { id: 'c', label: 'El riesgo de que la cocina se equivoque' }, { id: 'd', label: 'Las ganas de comer sin miedo, por una vez' }],
        head: 'El sistema le ofrece platos. Valentina necesita confiar.',
        result: 'La app le mostró opciones, etiquetas y datos. Pero ninguno le da lo único que necesita: la certeza de que no la van a enfermar. Confirma con un nudo en el estómago.',
        plus: 'La app le dio información para elegir.',
        minus: 'Pero información no es lo mismo que confianza, y su cuerpo no perdona un error.' }
    ],
    frustration: '«Tenía toda la información… pero seguía sin poder confiar en que no me iba a enfermar.»',
    expectations: [
      'Saber con certeza si un plato es seguro para ella',
      'Fiarse de la información que muestra la app',
      'Saber cómo se prepara el plato, no solo qué lleva',
      'Pedir sin miedo a enfermarse'
    ],
    concept: ['Platos', 'Información', 'Selección', 'Pedido'],
    doneWhen: 'el plato queda seleccionado y pedido.',
    tension: {
      person: '«Necesito confiar en que esta opción no me va a enfermar.»',
      system: '«Muestro platos con información para que elijas uno.»',
      supuesto: 'Que con suficiente información cualquiera puede decidir.'
    },
    design: [
      { problem: 'El sistema ofrece platos con información. Valentina necesita confiar en que es seguro.',
        options: [
          { id: 'o1', label: 'Mostrar los ingredientes de cada plato', result: 'Aparecen los ingredientes.', gain: 'Ve qué lleva.', cost: 'No dice cómo se prepara.',
            phone: { pantalla: 'plato', titulo: 'Bowl de quinoa', filas: ['Ingredientes: quinoa, aguacate…', 'Preparación: sin información', 'Agregar al pedido →'], resalta: 'Ingredientes: quinoa, aguacate…' } },
          { id: 'o2', label: 'Mostrar cómo se prepara el plato', result: 'Se ve el proceso de preparación.', gain: 'Revela riesgo de contaminación cruzada.', cost: 'Pocos restaurantes lo informan.',
            phone: { pantalla: 'plato', titulo: 'Bowl de quinoa', filas: ['Se prepara en superficie aparte ✓', 'Aceite exclusivo ✓', 'Agregar al pedido →'], resalta: 'Se prepara en superficie aparte ✓' } },
          { id: 'o3', label: 'Destacar restaurantes 100% sin gluten', result: 'La app resalta cocinas especializadas.', gain: 'Reduce el riesgo de raíz.', cost: 'Limita mucho las opciones.',
            phone: { pantalla: 'inicio', aviso: 'Cocinas 100% sin gluten', filas: ['Free Gluten · 25–35 min', 'La Celíaca · 30–40 min', 'Solo 2 en tu zona'], resalta: 'Solo 2 en tu zona' } }
        ],
        emerge: 'Valentina tiene más datos. Pero más información no es confianza: sigue sin poder estar segura.' },
      { problem: 'Tiene información, pero no confianza suficiente para actuar.',
        options: [
          { id: 'o1', label: 'Mostrar evidencia de otras personas celíacas', result: 'Ve experiencias de gente como ella.', gain: 'Confianza basada en pares.', cost: 'No siempre hay reseñas.',
            phone: { pantalla: 'plato', titulo: 'Bowl de quinoa', filas: ['«Celíaca y no me pasó nada» ★★★★★', '3 reseñas de celíacos'], resalta: '3 reseñas de celíacos' } },
          { id: 'o2', label: 'Mostrar una verificación del restaurante', result: 'Aparece un sello verificado.', gain: 'Un respaldo más fuerte que una etiqueta.', cost: 'Requiere que alguien lo certifique.',
            phone: { pantalla: 'plato', titulo: 'Bowl de quinoa', filas: ['✓ Cocina verificada sin gluten', 'Verificado hace 3 meses', 'Agregar al pedido →'], resalta: '✓ Cocina verificada sin gluten' } },
          { id: 'o3', label: 'Permitir preguntar al restaurante antes de pedir', result: 'Puede escribirle a la cocina.', gain: 'Respuesta directa a su duda.', cost: 'Puede no llegar a tiempo.',
            phone: { pantalla: 'estado', titulo: '💬 «¿Hay riesgo de contaminación?»', aviso: 'El restaurante suele responder en 20 min' } }
        ],
        emerge: 'Valentina confía un poco más. Pero el sistema sigue tratando su decisión como «seleccionar un plato», no como «asumir un riesgo».' },
      { problem: 'Para el sistema es elegir un plato; para Valentina es decidir si se arriesga.',
        options: [
          { id: 'o1', label: 'Marcar el nivel de riesgo, no solo «apto/no apto»', result: 'Cada opción muestra qué tan seguro es.', gain: 'Reconoce que la certeza no es total.', cost: 'Introduce matices que hay que explicar.',
            phone: { pantalla: 'inicio', aviso: 'Nivel de riesgo', filas: ['Bowl · riesgo bajo ●', 'Pasta · riesgo alto ●', 'Sándwich · riesgo medio ●'], resalta: 'Nivel de riesgo' } },
          { id: 'o2', label: 'Recordar los lugares donde nunca le ha pasado nada', result: 'El sistema recuerda sus sitios seguros.', gain: 'Construye confianza en el tiempo.', cost: 'Requiere historial personal.',
            phone: { pantalla: 'inicio', aviso: 'Tus sitios seguros', filas: ['★ Free Gluten · 12 pedidos sin problema', '★ Green Bowl · 4 pedidos sin problema'], resalta: 'Tus sitios seguros' } },
          { id: 'o3', label: 'Poner la seguridad como eje, no como filtro', result: 'La app se organiza alrededor de «qué puedes comer sin riesgo».', gain: 'Entiende que su prioridad es no enfermarse.', cost: 'Reorganiza toda la experiencia.',
            phone: { pantalla: 'inicio', aviso: 'Qué puedes comer sin riesgo hoy', filas: ['Verificado: 3 opciones', 'Riesgo bajo: 6 opciones', 'Sin datos: el resto'], resalta: 'Qué puedes comer sin riesgo hoy' } }
        ],
        emerge: 'Cada arreglo le dio más seguridad. Pero seguiste construyendo sobre «elegir un plato con información», no sobre «poder confiar».' }
    ]
  },

  {
    id: 'andres', emoji: '🧑‍💼', name: 'Andrés, 41', first: 'Andrés',
    scene: ['Miércoles, 11:50 a. m.', 'Andrés abre la app en la oficina.', 'Le toca resolver el almuerzo de las 8 personas del equipo.'],
    need: 'Coordinar el almuerzo de las 8 personas de su equipo.',
    hint: 'Para Andrés esto no es hacer un pedido: es quedar bien con ocho personas. Piensa en todo el trabajo que hacía él y que la app no veía.',
    beats: [
      { tag: 'Momento 1',
        situation: ['Ocho personas esperan que él resuelva el almuerzo.'],
        question: '¿Por dónde empieza?',
        phone: { pantalla: 'estado', titulo: '💬 8 mensajes sin leer', aviso: '«¿qué pedimos?»' },
        options: [
          { id: 'preguntar', label: 'Preguntarle a cada quien qué quiere', plus: 'Todos comerían lo suyo.', minus: 'Ocho respuestas distintas y algunas alergias.', result: 'Llegan ocho mensajes: gustos distintos, dos alergias, y alguien que dice «lo que sea».',
            phone: { pantalla: 'estado', titulo: '💬 «Lo que sea»', aviso: '8 respuestas · 2 alergias · 0 acuerdos' } },
          { id: 'mismo', label: 'Elegir un restaurante y pedir lo mismo para todos', plus: 'Una sola decisión.', minus: 'No le gusta a todos.', result: 'Elige un sitio. De una vez alguien no come de ahí, y otro resulta ser alérgico.',
            phone: { pantalla: 'plato', titulo: '8 × el mismo plato', filas: ['«Yo no como de ahí»', '«Soy alérgico»', 'Confirmar →'], resalta: '«Soy alérgico»' } },
          { id: 'separado', label: 'Pedir cada almuerzo por separado', plus: 'Cada quien elige lo suyo.', minus: 'Ocho pedidos, ocho pagos, ocho entregas.', result: 'Empieza a pedir uno por uno. Son ocho procesos completos, y le tocan todos a él.',
            phone: { pantalla: 'inicio', aviso: 'Pedido 3 de 8…', filas: ['Pedido 1 ✓ · Pedido 2 ✓', 'Pedido 3: armando', 'Faltan 5'], resalta: 'Faltan 5' } }
        ] },
      { tag: 'Momento 2',
        situation: ['Ya tiene, más o menos, lo que quiere cada quien.', 'Ahora debe volverlo un pedido en la app, pensada para una persona.'],
        question: '¿Qué hace?',
        phone: { pantalla: 'pago', aviso: 'Tu pedido', filas: ['8 platos · $142.000', 'Una dirección · Un pago', 'Confirmar pedido →'], resalta: '8 platos · $142.000' },
        options: [
          { id: 'carrito', label: 'Meter los 8 platos en un mismo carrito', plus: 'Una sola entrega.', minus: 'La app no distingue de quién es cada plato.', result: 'Logra meter los 8 platos. Pero al llegar no sabrá cuál es de quién, ni cómo cobrar a cada uno.',
            phone: { pantalla: 'pago', aviso: 'Tu pedido', filas: ['8 platos · sin nombre', '¿Cuál es de quién?', 'Confirmar pedido →'], resalta: '¿Cuál es de quién?' } },
          { id: 'cuenta', label: 'Llevar por aparte quién debe cuánto', plus: 'Cuadra el dinero.', minus: 'Lo hace por fuera de la app, a mano.', result: 'Abre una nota aparte para anotar quién pidió qué. La app no le ayuda con eso.',
            phone: { pantalla: 'estado', titulo: '📝 Nota aparte', aviso: '«Laura: 18.000 · Pedro: 22.000…»' } },
          { id: 'despues', label: 'Pedir que cada quien le pague después', plus: 'No adelanta toda la plata.', minus: 'Tendrá que perseguir a ocho personas.', result: 'Decide cobrar después. Ya se imagina persiguiendo a todos toda la semana.',
            phone: { pantalla: 'estado', titulo: '💸 «Después les cobro»', aviso: '8 deudas pendientes' } }
        ] },
      { tag: 'Momento 3', shared: true,
        situation: ['Andrés confirma el pedido para las 8 personas.', 'La app le responde:'],
        system: 'Pedido confirmado ✓ · 1 entrega',
        phone: { pantalla: 'estado', titulo: 'Pedido confirmado ✓', aviso: '1 entrega · 1 pago · 8 personas' },
        question: '¿Qué le queda por resolver que la app ya da por resuelto?',
        options: [{ id: 'a', label: 'Que la comida llegue caliente' }, { id: 'b', label: 'Que cada quien reciba su plato correcto' }, { id: 'c', label: 'Que todos le paguen lo que les toca' }, { id: 'd', label: 'Que nadie se moleste con la elección' }],
        head: 'El sistema cerró un pedido. Andrés sigue coordinando personas.',
        result: 'La app hizo un pedido y programó una entrega. Pero trató a Andrés como un solo comensal, cuando su trabajo era coordinar a ocho: repartir cada plato, cobrar a cada quien y quedar bien con todos.',
        plus: 'La app resolvió la compra y la entrega.',
        minus: 'Pero dejó en manos de Andrés todo lo que hace difícil pedir para un grupo.' }
    ],
    frustration: '«Pude hacer el pedido… pero el sistema entendió que era de una persona, cuando yo estaba coordinando a ocho.»',
    expectations: [
      'Reunir en un solo pedido lo que quieren ocho personas',
      'Dejar claro que está pidiendo para un grupo',
      'Repartir y cobrar a cada quien lo suyo',
      'Coordinar una sola entrega para todos'
    ],
    concept: ['Usuario', 'Pedido', 'Productos', 'Dirección', 'Pago'],
    doneWhen: 'el pedido se entrega y el pago queda completo.',
    tension: {
      person: '«Estoy reuniendo las decisiones de ocho personas y resolviéndolas como una.»',
      system: '«Un comprador hace un pedido, para una dirección, con un pago.»',
      supuesto: 'Que quien paga decide solo, y por una sola persona.'
    },
    design: [
      { problem: 'El sistema entiende un usuario y un pedido. Andrés pide para ocho.',
        options: [
          { id: 'o1', label: 'Reunir varios platos en un mismo pedido', result: 'Los 8 platos caben en un pedido.', gain: 'Una sola entrega para todos.', cost: 'No distingue de quién es cada plato.',
            phone: { pantalla: 'pago', aviso: 'Pedido único', filas: ['8 platos · $142.000', '1 entrega', 'Confirmar pedido →'], resalta: '8 platos · $142.000' } },
          { id: 'o2', label: 'Permitir que cada persona agregue su plato', result: 'El equipo puede sumar sus platos.', gain: 'Cada quien elige lo suyo.', cost: 'Andrés pierde el control del total.',
            phone: { pantalla: 'pago', aviso: 'Pedido del equipo', filas: ['Laura agregó 1 plato', 'Pedro agregó 1 plato', 'Faltan 6 por agregar'], resalta: 'Pedido del equipo' } },
          { id: 'o3', label: 'Armar el pedido desde una lista del equipo', result: 'Se arma desde lo que pidió cada uno.', gain: 'Ordena los pedidos individuales.', cost: 'Hay que mantener la lista al día.',
            phone: { pantalla: 'pago', aviso: 'Lista del equipo', filas: ['Laura: bowl · $18.000', 'Pedro: pasta · $22.000', '…6 más'], resalta: 'Lista del equipo' } }
        ],
        emerge: 'Ya cabe todo en un pedido. Pero el sistema no sabe de quién es cada plato ni cómo cobrar a cada quien.' },
      { problem: 'Un solo pedido, pero ocho personas que deben pagar y recibir lo suyo.',
        options: [
          { id: 'o1', label: 'Separar el pago por persona', result: 'El total se divide por persona.', gain: 'Cada quien paga lo suyo.', cost: 'Andrés debe gestionar 8 pagos.',
            phone: { pantalla: 'pago', aviso: 'Pago dividido', filas: ['8 pagos de $17.750', 'Andrés coordina los 8', 'Confirmar →'], resalta: 'Andrés coordina los 8' } },
          { id: 'o2', label: 'Etiquetar cada plato con su dueño', result: 'Cada plato queda marcado con un nombre.', gain: 'Se sabe qué es de quién al llegar.', cost: 'Requiere que cada quien se identifique.',
            phone: { pantalla: 'pago', aviso: 'Tu pedido', filas: ['Bowl → Laura', 'Pasta → Pedro', '6 platos sin dueño'], resalta: '6 platos sin dueño' } },
          { id: 'o3', label: 'Dejar que cada persona pague su parte', result: 'Cada quien cubre lo suyo en la app.', gain: 'Andrés no adelanta toda la plata.', cost: 'Depende de que todos paguen.',
            phone: { pantalla: 'pago', aviso: 'Cada quien paga', filas: ['Pagaron: 5 de 8', 'Faltan 3 · el pedido espera', 'Confirmar →'], resalta: 'Faltan 3 · el pedido espera' } }
        ],
        emerge: 'El dinero y los platos casi cuadran. Pero para el sistema sigue habiendo «un comprador»: Andrés carga con todo.' },
      { problem: 'El sistema ve un comprador; Andrés está coordinando a un grupo.',
        options: [
          { id: 'o1', label: 'Hacer visible que el pedido es de un grupo', result: 'El pedido queda marcado como grupal.', gain: 'El sistema deja de asumir un solo comensal.', cost: 'Introduce la idea de «grupo», nueva de gestionar.',
            phone: { pantalla: 'pago', aviso: 'Pedido grupal · 8 personas', filas: ['8 platos con dueño', '8 pagos', '1 entrega coordinada'], resalta: 'Pedido grupal · 8 personas' } },
          { id: 'o2', label: 'Repartir la coordinación entre el equipo', result: 'Varios pueden gestionar el pedido.', gain: 'No todo recae en Andrés.', cost: 'Requiere que otros participen.',
            phone: { pantalla: 'pago', aviso: 'Coordinadores: Andrés + Laura', filas: ['Cada quien agrega y paga lo suyo', 'Andrés solo confirma'], resalta: 'Andrés solo confirma' } },
          { id: 'o3', label: 'Tratarlo como «un almuerzo de equipo», no un pedido', result: 'La app modela un almuerzo de grupo, no una compra.', gain: 'Refleja lo que Andrés hace de verdad.', cost: 'Se aleja del modelo de «un pedido, un comprador».',
            phone: { pantalla: 'inicio', aviso: 'Almuerzo del equipo', filas: ['¿Quiénes comen hoy? →', 'Cada quien elige y paga', 'Llega todo junto'], resalta: 'Almuerzo del equipo' } }
        ],
        emerge: 'Cada arreglo ayudó. Pero seguiste construyendo sobre «un comprador que hace un pedido», cuando Andrés coordina a ocho.' }
    ]
  }
];

