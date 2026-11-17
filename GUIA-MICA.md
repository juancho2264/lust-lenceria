# Cómo manejar tu catálogo 💗

Tu página se maneja **toda desde tu planilla de Google**: productos, precios, fotos, stock, talles, preguntas y avisos. No necesitás saber nada de computación ni depender de nadie.

- Usá la app **Google Sheets** en el celu (o entrá desde la compu).
- Lo que cambies aparece solo en la página. Google tarda **unos 5 minutos** en actualizarlo. Si no lo ves, esperá un poquito y recargá.
- La planilla tiene **4 pestañas** (abajo de todo): **Productos**, **Configuración**, **Talles** y **Preguntas**.

---

## 1. Pestaña "Productos"

Cada fila es un producto.

| Columna | Qué poner | Ejemplo |
|---|---|---|
| **Código** | Un código corto, distinto para cada producto. Las clientas no lo ven: te llega en los pedidos para que sepas cuál es | `LU-12` |
| **Nombre** | El nombre que ven las clientas | `Conjunto Encaje Noir` |
| **Categoría** | Elegila del desplegable | `Bikinis` |
| **Precio** | Solo el número, sin puntos ni $ | `18500` |
| **Precio anterior** | Opcional. Si está en oferta, el precio de antes. Se muestra tachado y el % de descuento se calcula solo | `22000` |
| **Talles** | Elegilos del desplegable o escribilos separados por coma | `S, M, L` |
| **Talles agotados** | Los talles que se terminaron. Se ven tachados y no se pueden pedir | `M` |
| **Colores** | Separados por coma | `Negro, Rosa` |
| **Fotos** | Uno o varios links de Google Drive, separados por coma. La primera es la que se ve en el catálogo | |
| **Descripción** | Tela, si tiene aro, cómo calza… | `Push up con relleno removible. Calza justo.` |
| **Etiqueta** | Opcional. Aparece arriba de la foto y el producto sale primero | `Nuevo`, `Oferta` |
| **Agotado** | `sí` si no queda ningún talle | `no` |
| **Mostrar** | `no` para esconderlo sin borrarlo | `sí` |

### Lo de todos los días

- **Cambiar un precio:** cambiás el número en Precio.
- **Poner en oferta:** pasás el precio viejo a "Precio anterior" y ponés el nuevo en "Precio". Para sacar la oferta, borrás el "Precio anterior".
- **Se terminó un talle:** lo agregás en "Talles agotados". Cuando vuelva, lo sacás de ahí.
- **Se terminó todo:** `sí` en Agotado. Las clientas pueden tocar "Avisame cuando vuelva" y te escriben.
- **Sacar un producto:** `no` en Mostrar (así lo podés volver a usar después).
- **Producto nuevo:** escribís en la fila de abajo de la tabla. **Mientras lo cargás, poné `no` en Mostrar**, y cuando esté completo lo pasás a `sí`.
- **Un producto no aparece:** revisá que tenga **nombre, precio (solo números) y talles**. Sin eso no se publica.

---

## 2. Fotos (desde el iPhone)

**Una sola vez:** creá en Google Drive una carpeta **"Fotos Lust"** → tocá **⋯** → **Compartir** → **Acceso general: "Cualquier usuario con el vínculo" → Lector**. Si la carpeta queda en "Restringido", las fotos no se ven en la página.

**Para cada foto:**

1. Abrí **Google Drive** → carpeta **"Fotos Lust"** → **+** → **Subir** → **Fotos y videos**.
2. En la foto subida: **⋯** → **Compartir** → **Copiar vínculo**.
3. Pegalo en la columna **Fotos** del producto. Para varias fotos, separalas con coma.

**Tips:**

- En el iPhone: **Ajustes → Cámara → Formatos → "Más compatible"** (así saca fotos en JPG, que funcionan en todos lados).
- Mismo fondo y **en vertical**. Ideal: frente, espalda, detalle de la tela y puesta.
- Los links de **Google Fotos o iCloud no sirven**: tienen que ser de Google Drive.

---

## 3. Colores que reconoce la página

Escribilos como quieras: mayúsculas, tildes o plural no importan. Si escribís uno que no está pero empieza con un color conocido (ej. *"verde pino"*), usa el color base (*verde*). Si no reconoce ninguno, el circulito aparece en **rosa neutro** (igual se puede elegir). Avisale a Juan y lo agrega.

- **Básicos:** negro, blanco, blanco hueso, off white, crema, marfil, gris, gris claro, gris oscuro, gris topo, plomo, nude, piel, beige, camel, arena, champagne
- **Marrones:** marrón, chocolate, café, habano, terracota, ladrillo
- **Rosas y rojos:** rosa, rosa claro, rosa pastel, rosa bebé, rosa viejo, rosa chicle, rosa fuerte, fucsia, magenta, coral, salmón, durazno, rojo, bordó, vino, borravino, cereza, frambuesa
- **Violetas:** lila, lavanda, violeta, morado, púrpura, ciruela, uva
- **Azules:** celeste, celeste bebé, azul claro, azul, azul francia, azul rey, azul marino, jean, petróleo, turquesa, aqua, agua marina
- **Verdes:** verde, verde claro, verde agua, menta, verde lima, verde manzana, verde oscuro, verde inglés, verde militar, oliva, esmeralda, verde benetton, salvia
- **Amarillos y naranjas:** amarillo, amarillo pastel, mostaza, dorado, plateado, naranja, naranja flúo
- **Estampados:** animal print, leopardo, cebra, vichy, rayado, floreado, lunares, estampado, surtido, multicolor, tie dye, transparente

---

## 4. Pestaña "Configuración"

Acá se cambian las cosas generales de la página. **Solo tocá la columna Valor**: la columna Clave no se cambia nunca.

| Clave | Valor | Para qué sirve |
|---|---|---|
| **WhatsApp** | `5491123456789` | Tu número, adonde llegan los pedidos. Va con **549** adelante, sin el 0 ni el 15. Si la celda lo muestra raro, escribilo con un apóstrofo adelante: `'5491123456789` |
| **Envío** | `6000` | Costo del envío a domicilio (`0` = siempre gratis) |
| **Envío gratis desde** | `50000` | Compras desde ese monto no pagan envío. Se anuncia solo en toda la página (`0` = apagado) |
| **Descuento transferencia** | `10` | % de descuento pagando por transferencia (`0` = apagado) |
| **Fotos portada** | 2 links de Drive separados por coma | Las 2 fotos grandes de arriba de todo (mejor verticales). Vacío = quedan las de siempre |
| **Avisos** | `Envíos a todo el país \| Nuevos ingresos` | Los textos de la cinta rosa de arriba, separados por una barra `\|` (hasta 8). Ideal para promos |

> La barra `|` en el celu está en el teclado de símbolos (#+=).

---

## 5. Pestaña "Talles"

Tu tabla de medidas. La primera fila son los títulos (ej.: Talle, Contorno de busto, Cintura, Cadera) y abajo una fila por talle. Podés usar las columnas que quieras (hasta 6).

Se ve en la sección "Guía de talles" y **dentro de cada producto**, con un botón para que la clienta te consulte su talle por WhatsApp.

> **Importante:** poné tus medidas reales. Como la ropa interior no tiene cambio, la clienta se guía por esta tabla.

---

## 6. Pestaña "Preguntas"

Dos columnas: **Pregunta** y **Respuesta**. Cada fila es una pregunta frecuente de la página (hasta 20).

Revisá que las respuestas sean como trabajás vos (sobre todo envío discreto, tiempos y retiro). Para sacar una, borrá la fila. Si dejás la pestaña sin preguntas, la sección desaparece.

---

## 7. Mensajes que te llegan por WhatsApp

- **Pedido:** productos (con código), talle, color, entrega, forma de pago y total.
- **Consulta por un producto** o **"Avisame cuando vuelva":** con el nombre, el código y el link al producto. Tocás el link y ves cuál es.
- **Consulta de talle:** con el producto (si la hizo desde ahí) y las medidas de la clienta.

**Antes de pasar los datos para pagar**, chequeá que el precio y el total coincidan con tu planilla (buscá el código). Así evitás errores.

---

## 8. Compartir un producto

En cada producto hay un botón **Compartir**: te da un link que abre **justo ese producto**. Ideal para mandar por WhatsApp o poner en una historia de Instagram.

---

## ⚠️ Importante

- **No cambies los títulos de la primera fila** de ninguna pestaña (Código, Nombre, Precio…, Clave, Valor…, Pregunta, Respuesta).
- **No cambies los nombres de las pestañas** ni las borres.
- **No toques "Archivo → Compartir → Publicar en la Web".** Eso es lo que conecta la planilla con la página.
- **Nunca compartas la planilla como "Cualquier persona puede editar".** Si sumás a alguien, que sea con su Gmail.
- **No pongas datos de clientas** en la planilla.
- **Si te equivocás:** **Archivo → Historial de versiones** y volvés a como estaba.
- ¿Algo no funciona? Escribile a Juan 😊
