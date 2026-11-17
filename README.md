# Lust Lencería · Catálogo con pedido por WhatsApp

Catálogo para una tienda de lencería de Merlo (Bs. As.): la clienta elige talle y color, arma su bolsa y el pedido le llega armado a la dueña por WhatsApp. Sin pasarela de pago ni comisiones.

## Cómo funciona

- **Catálogo desde Google Sheets:** la dueña edita precios, stock y productos en una planilla desde el celular; la página la lee al abrirse (CSV publicado). Guía para ella: [GUIA-MICA.md](GUIA-MICA.md).
- **Respaldo:** si no hay planilla configurada o Google no responde, se usa `data/productos-ejemplo.csv`.
- **Filas con errores** (sin precio, sin talles) se saltean sin romper el catálogo y se avisan en la consola.
- **Bolsa** guardada en el navegador de cada clienta; nada se guarda en ningún servidor.
- **Pedido por WhatsApp** con código de producto, talle, color, entrega y total.

## Configurar

- `js/productos.js` → `PLANILLA` (link CSV publicado) y `ENVIO` (costo de envío).
- `js/app.js` → `CONFIG.whatsapp` (número con código de país, sin `+`).

### Publicar la planilla

1. Crear una planilla con las columnas de `data/productos-ejemplo.csv` (Archivo → Importar sirve).
2. **Archivo → Compartir → Publicar en la Web** → Hoja 1 → *Valores separados por comas (.csv)* → Publicar.
3. Pegar ese link en `PLANILLA`.

## Seguridad

- Sitio estático: no hay base de datos ni datos de clientas guardados.
- Todo el texto de la planilla se muestra con `textContent` (no se ejecuta código); las fotos solo aceptan links `https`.
- La planilla es de solo lectura para la página: editar requiere permisos en la cuenta de Google de la dueña.
- Los precios del mensaje se confirman contra la planilla antes de cobrar.

## Tests

```bash
node --test js/planilla.test.js
```

---

Hecho por [Juan Cruz Ferrandini](https://juancho2264.github.io/Portafolio/).
