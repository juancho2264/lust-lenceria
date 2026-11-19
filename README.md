# Lust Lencería · Catálogo con pedido por WhatsApp

Catálogo para una tienda de lencería de Merlo (Bs. As.): la clienta elige talle y color, arma su bolsa y el pedido le llega armado a la dueña por WhatsApp. Sin pasarela de pago ni comisiones.

## Cómo funciona

- **Catálogo desde Google Sheets:** la dueña edita precios, stock y productos en una planilla desde el celular; la página la lee al abrirse (CSV publicado). Guía para ella: [GUIA-MICA.md](GUIA-MICA.md).
- **Respaldo:** si no hay planilla configurada o Google no responde, se usa `data/productos-ejemplo.csv`.
- **Filas con errores** (sin precio, sin talles) se saltean sin romper el catálogo y se avisan en la consola.
- **Bolsa** guardada en el navegador de cada clienta; nada se guarda en ningún servidor.
- **Ficha de producto** (se abre con el link `#p/CODIGO`, compartible): galería deslizable, zoom, descripción, talles agotados tachados, "Consultar" y "Avisame cuando vuelva" por WhatsApp.
- **Ofertas** (precio anterior tachado y % off) y **precio por transferencia**.
- **Buscador** sin tildes; orden: etiquetados primero, agotados al final.
- **Pestañas Talles y Preguntas** en la planilla: tabla de medidas (también dentro de cada producto, con consulta de talle por WhatsApp) y preguntas frecuentes.
- **Pestaña Configuración** en la planilla: WhatsApp, envío, envío gratis desde, % por transferencia y avisos de la cinta.
- **Pedido por WhatsApp** con código de producto, talle, color, entrega, medio de pago y total.

## Configurar

- `js/productos.js` → `PLANILLA` y `PLANILLA_CONFIG` (links CSV publicados) y `CONFIG_INICIAL` (valores por defecto).
- Ejemplos de las dos pestañas: `data/productos-ejemplo.csv` y `data/configuracion-ejemplo.csv`.

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

Hecho por [Juan Cruz Ferrandini](https://juancruzferrandini.com.ar).
