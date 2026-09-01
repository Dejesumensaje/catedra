# Assets — Deck S05

El deck `../index.html` referencia estos archivos. Mientras un archivo no exista,
su slide muestra un marcador punteado con el texto alternativo y la navegación no
se rompe.

## El QR

- `qr-tres-momentos.svg` → `/pensamiento-sensorial/tres-momentos`
  (la consigna de la tarea para la sesión 6: los tres momentos, la lupa
  persona · sistema · relación y la entrega). Aparece una vez, al cerrar el
  bloque de la tarea, junto al enlace escrito.

Se carga con `data-src`, no con `src`: el deck trae un lazy-loader.

Generado con la librería `qrcode` de Python, `SvgPathImage`, `box_size=12`,
`border=2` y `error_correction=ERROR_CORRECT_Q` — los mismos parámetros de s03 y
s04. Salió en versión 6 y quedó **decodificado y verificado** contra su URL antes
de publicarse (rasterizado a PNG y leído con `cv2.QRCodeDetector`). Para rehacerlo:

```python
import qrcode, qrcode.image.svg
q = qrcode.QRCode(box_size=12, border=2,
                  error_correction=qrcode.constants.ERROR_CORRECT_Q,
                  image_factory=qrcode.image.svg.SvgPathImage)
q.add_data('https://catedra.dejesumensaje.com/pensamiento-sensorial/tres-momentos')
q.make(fit=True)
q.make_image().save('qr-tres-momentos.svg')
```

Si se cambia la URL hay que regenerar el QR **y decodificarlo** antes de
proyectar. Un QR que no resuelve es peor que no tener QR.
