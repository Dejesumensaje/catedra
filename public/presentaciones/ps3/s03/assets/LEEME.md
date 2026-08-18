# Assets — Deck S03

El deck `../index.html` referencia estos archivos. Basta con soltarlos en esta
carpeta con el nombre exacto; no hay que tocar el HTML.

Mientras un archivo no exista, su slide muestra un marcador punteado con el
texto alternativo y la navegación no se rompe.

## La imagen de los tres niveles

- `wmp-domicilios.svg` — la misma pantalla de una app de domicilios («La
  Arepería», ficticia) en tres niveles: wireframe (estructura), mockup
  (apariencia) y prototipo (funcionamiento). Es SVG hecho a mano con los tokens
  del curso —grises, amarillo `#eeff41`, Roboto— a propósito: no depende de
  screenshots de una app real y se proyecta nítida a cualquier tamaño. El
  prototipo se distingue del mockup por dos señales: el botón presionado con el
  indicador de toque y la confirmación «Agregado al pedido ✓» — lo que cambia
  no es cómo se ve sino que responde.

## Los QR — dos en el deck

Las consignas viven en el sitio y el deck solo las apunta. Ningún deck repite
una consigna que ya está publicada.

- `qr-imagen-del-sistema.svg` → `/pensamiento-sensorial/imagen-del-sistema`
  (la actividad en clase: las fichas A y B y los pasos de la investigación)
- `qr-tarea-suponiendo.svg` → `/pensamiento-sensorial/que-estamos-suponiendo`
  (la tarea: supuestos + bitácora)

Generados con la librería `qrcode` de Python, `SvgPathImage`, `box_size=12`,
`border=2` y `error_correction=ERROR_CORRECT_Q` (nivel Q, como los de la
bitácora en s02: aguanta mejor una proyección lavada). Ambos quedaron
**decodificados y verificados** contra su URL antes de publicarse
(rasterizados a PNG y leídos con `cv2.QRCodeDetector`). Para rehacer uno:

```python
import qrcode, qrcode.image.svg
q = qrcode.QRCode(box_size=12, border=2,
                  error_correction=qrcode.constants.ERROR_CORRECT_Q,
                  image_factory=qrcode.image.svg.SvgPathImage)
q.add_data('https://catedra.dejesumensaje.com/pensamiento-sensorial/imagen-del-sistema')
q.make(fit=True)
q.make_image().save('qr-imagen-del-sistema.svg')
```

Si se cambia una URL hay que regenerar el QR **y decodificarlo** antes de
proyectar. Un QR que no resuelve es peor que no tener QR: treinta personas
apuntando el teléfono a una pared.
