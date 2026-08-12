# Assets — Deck S02

El deck `../index.html` referencia estos archivos. Basta con soltarlos en esta
carpeta con el nombre exacto; no hay que tocar el HTML.

Formato: imágenes horizontales o cuadradas, buena resolución (se muestran a ~65%
del ancho de un slide 16:9). Sin captions: la imagen va sola.

Mientras un archivo no exista, su slide muestra un marcador punteado con el
texto alternativo y la navegación no se rompe.

## Imágenes — ya están

- `cafetera-moka.jpg` — cafetera italiana. Va justo después de preguntar por la
  experiencia más frustrante. Se proyecta **muda**: se habla encima.
- `sacacorchos.jpg` — sacacorchos de dos brazos. Es el par de la cafetera: la
  forma pide una secuencia sin decirla. También muda.
- `norman-retrato.jpg` — retrato ilustrado de Don Norman con la tetera imposible.
  Abre el bloque de Norman. **Ilustración de Zachary Monteiro**
  (zacharymonteiro.com); el crédito está en el slide de referencias.
- `portada-doet.jpg` — portada de *The Design of Everyday Things*, edición
  revisada de 2013. Va después del párrafo «Quién es», que acaba de nombrarla.
- `puerta-de-norman.jpg` — puerta de vidrio con manijas verticales idénticas en
  las dos hojas. Va inmediatamente después de la cita: la imagen es la prueba.
  Esta foto no tiene letrero, y funciona mejor por eso: la trampa no es el
  letrero, es la manija que promete jalar donde hay que empujar.
- `cajero-real.jpg` — frente de un cajero automático. **Es una reconstrucción,
  no la foto de una máquina real**, por seguridad; el crédito lo dice.
  Va inmediatamente antes del esquema SVG, y ese orden importa: primero se
  arma el modelo mental con la máquina reconocible, y solo después el esquema
  puede abstraerla sin que nadie se pierda.

## El esquema del cajero

No es un archivo: son seis SVG inline dentro del `index.html`, generados con la
**misma geometría de `cajero-real.jpg`** —pantalla con cuatro botones a cada
lado, lector de tarjeta arriba a la derecha, recibo debajo, teclado abajo a la
izquierda, dispensador ancho al pie—. Esa correspondencia es lo que sostiene
todo el bloque teórico.

Aparecen así: uno sin nada encendido (junto a la foto), cuatro con **una sola
pieza en amarillo** —ranura, botones, pantalla, dispensador— y uno de cierre
sin amarillo, con las seis preguntas colgadas de sus piezas.

Si se cambia la foto por otra máquina, hay que rehacer los seis esquemas para
que sigan calcándola. Si no, el dispositivo pedagógico se cae.

## GIFs — pendientes

Van como archivos locales para no depender de IDs de Giphy sin verificar. El
único GIF de Giphy que el deck trae por URL es el del slide de espera.

- `gif-respiro-mapping.gif` — respiro cómico tras cerrar el bloque de mapping,
  después de «todavía prendemos el bombillo equivocado».
  Búsqueda sugerida: `light switch confused`, `wrong button`, `frustrated`.
- `gif-receso.gif` — pausa de quince minutos.
  Búsqueda sugerida: `coffee break`, `cat coffee`.

## Otros

- `qr-uno.svg` — ya está. Apunta a `/pensamiento-sensorial/uno`, donde vive el
  laboratorio de UNO completo. El deck ya no repite esas reglas.
