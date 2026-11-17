# Cómo manejar tu catálogo 💗

Todo se maneja desde **tu planilla de Google** (con la app de Google Sheets en el celu o desde la compu).
Lo que cambies aparece solo en la página. Google tarda **unos 5 minutos** en actualizarlo.

## Pestaña "Productos"

Cada fila es un producto.

| Columna | Qué poner | Ejemplo |
|---|---|---|
| **Código** | Un código corto, distinto para cada producto | `LU-12` |
| **Nombre** | El nombre que ven las clientas | `Conjunto Encaje Noir` |
| **Categoría** | Elegila del desplegable | `Bikinis` |
| **Precio** | Solo el número | `18500` |
| **Precio anterior** | Opcional: si está en oferta, el precio de antes. Se muestra tachado con el % de descuento | `22000` |
| **Talles** | Separados por coma (o elegilos del desplegable) | `S, M, L` |
| **Talles agotados** | Los talles que se terminaron. Se ven tachados y no se pueden pedir | `M` |
| **Colores** | Separados por coma | `Negro, Rosa` |
| **Fotos** | Uno o varios links de Google Drive, separados por coma | |
| **Descripción** | Tela, si tiene aro, cómo calza… | `Push up con relleno removible. Calza justo.` |
| **Etiqueta** | Opcional: aparece arriba de la foto y el producto sale primero | `Nuevo`, `Oferta` |
| **Agotado** | `sí` si no queda ningún talle | `no` |
| **Mostrar** | `no` para esconderlo sin borrarlo | `sí` |

### Lo de todos los días

- **Cambiar un precio:** cambiás el número en Precio.
- **Poner en oferta:** pasás el precio viejo a "Precio anterior" y ponés el nuevo en "Precio".
- **Se terminó un talle:** lo escribís en "Talles agotados". Cuando vuelva, lo borrás de ahí.
- **Se terminó todo:** `sí` en Agotado (las clientas pueden tocar "Avisame cuando vuelva").
- **Sacar un producto:** `no` en Mostrar.
- **Producto nuevo:** escribís en la fila de abajo de la tabla. **Mientras lo estás cargando, poné `no` en Mostrar**, y cuando esté completo lo pasás a `sí`.
- **Un producto no aparece:** revisá que tenga nombre, precio (solo números) y talles.

## Fotos (desde el iPhone)

1. Instalá **Google Drive** y entrá con tu Gmail.
2. Entrá a la carpeta **"Fotos Lust"** → **+** → **Subir** → **Fotos y videos**.
3. En la foto: **⋯** → **Compartir** → **Copiar vínculo**.
4. Pegalo en la columna **Fotos**. Para varias fotos del mismo producto, pegá los links separados por coma. **La primera es la que se ve en el catálogo.**

Tips:
- En el iPhone: **Ajustes → Cámara → Formatos → "Más compatible"** (así saca fotos en JPG).
- Mismo fondo y **en vertical**. Ideal: frente, espalda, detalle de la tela y puesta.
- Los links de Google Fotos o iCloud **no sirven**: tienen que ser de Google Drive.

## Pestaña "Configuración"

| Clave | Valor | Para qué |
|---|---|---|
| WhatsApp | `5491123456789` | Tu número, adonde llegan los pedidos |
| Envío | `6000` | Costo del envío |
| Envío gratis desde | `50000` | Compras desde ese monto no pagan envío (`0` = nunca) |
| Descuento transferencia | `10` | % de descuento pagando por transferencia (`0` = sin descuento) |
| Fotos portada | 2 links de Drive separados por coma | Las 2 fotos grandes de arriba de todo. Vacío = se usan las de siempre |
| Avisos | `Envíos a todo el país \| Nuevos ingresos` | Los textos de la cinta de arriba, separados por `\|` |

## Compartir un producto

En cada producto hay un botón **Compartir**: te da un link que abre **justo ese producto**. Ideal para mandar por WhatsApp o poner en una historia.

## ⚠️ Importante

- **No cambies los títulos de la primera fila** (Código, Nombre, Precio…).
- **Nunca compartas la planilla como "Cualquier persona puede editar".**
- **No pongas datos de clientas** en la planilla.
- Si te equivocás: **Archivo → Historial de versiones** y volvés a como estaba.
- Cuando te llega un pedido, **chequeá que precio y total coincidan con tu planilla** (cada producto tiene su código) antes de pasar los datos para pagar.
