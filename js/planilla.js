// Lee el catálogo desde una planilla de Google Sheets publicada como CSV.
// Funciones puras (sin navegador) para poder testearlas con: node --test js/planilla.test.js

/** Columnas que tiene que tener la planilla (la primera fila). Mayúsculas y tildes no importan. */
export const COLUMNAS = ['codigo', 'nombre', 'categoria', 'precio', 'precio anterior', 'talles', 'talles agotados', 'colores', 'fotos', 'descripcion', 'etiqueta', 'agotado', 'mostrar'];

// Colores que Mica puede escribir con palabras. Si escribe uno que no está, se usa un rosa neutro.
const TONOS = {
  negro: '#1f1a1c', blanco: '#f7f3f1', rosa: '#f4a7bd', 'rosa viejo': '#d9a3ab', fucsia: '#d63384', rojo: '#d23a4a',
  bordo: '#7a1f35', 'bordó': '#7a1f35', vino: '#7a1f35', nude: '#e7c3ad', beige: '#e8d8c4', crema: '#f3e9d8',
  celeste: '#a9d4ec', azul: '#3557a8', 'azul marino': '#1e2a44', verde: '#7fb99a', 'verde agua': '#9fd8cb',
  lila: '#cdb6ea', violeta: '#8a5cc2', amarillo: '#f3d36b', naranja: '#f19a5b', gris: '#a3a3a8', marron: '#7a5643', 'marrón': '#7a5643',
  animal: 'repeating-linear-gradient(45deg,#c79a5b 0 6px,#3a2a1c 6px 10px)', 'animal print': 'repeating-linear-gradient(45deg,#c79a5b 0 6px,#3a2a1c 6px 10px)',
  surtido: 'linear-gradient(135deg,#f4a7bd,#bcdcf2,#cdb6ea)', estampado: 'linear-gradient(135deg,#f4a7bd,#bcdcf2,#cdb6ea)',
};
const TONO_DESCONOCIDO = '#e9c6d0';

const normalizar = (texto) => String(texto ?? '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const esSi = (texto) => ['si', 'sí', 'x', 'true', '1'].includes(normalizar(texto));

/** Separa un CSV en filas y celdas, respetando comillas (las celdas con comas o saltos de línea). */
export function leerCSV(texto) {
  const filas = [];
  let fila = [];
  let celda = '';
  let entreComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (entreComillas) {
      if (c === '"' && texto[i + 1] === '"') { celda += '"'; i++; } else if (c === '"') entreComillas = false;
      else celda += c;
    } else if (c === '"') entreComillas = true;
    else if (c === ',') { fila.push(celda); celda = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(celda); filas.push(fila); fila = []; celda = '';
    } else celda += c;
  }
  if (celda !== '' || fila.length) { fila.push(celda); filas.push(fila); }
  return filas.filter((f) => f.some((x) => x.trim() !== ''));
}

/** "$18.500", "18500", "18.500,00" → 18500. Devuelve null si no es un precio válido. */
export function leerPrecio(texto) {
  const limpio = String(texto ?? '').replace(/[$\s]/g, '').replace(/,\d{1,2}$/, '').replace(/[.,]/g, '');
  const n = Number(limpio);
  return limpio && Number.isFinite(n) && n > 0 ? n : null;
}

/** Convierte un link de Google Drive ("compartir") en un link de imagen que se puede mostrar. */
export function linkFoto(texto) {
  const url = String(texto ?? '').trim();
  if (!url) return '';
  const id = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/)?.[1];
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w900`;
  // Solo se aceptan links https (nunca javascript: ni otras cosas raras)
  return /^https:\/\//i.test(url) ? url : '';
}

const lista = (texto) => String(texto ?? '').split(/[,/;]/).map((x) => x.trim()).filter(Boolean);

/**
 * Convierte el CSV de la planilla en la lista de productos de la página.
 * Las filas con errores (sin nombre, sin precio, sin talles) se saltean y se informan en "avisos".
 */
export function productosDesdeCSV(texto) {
  const [encabezado, ...filas] = leerCSV(texto);
  if (!encabezado) return { productos: [], avisos: ['La planilla está vacía.'] };
  const posicion = Object.fromEntries(encabezado.map((nombre, i) => [normalizar(nombre), i]));
  const faltantes = ['nombre', 'precio', 'talles'].filter((c) => !(c in posicion));
  if (faltantes.length) return { productos: [], avisos: [`Faltan las columnas: ${faltantes.join(', ')}.`] };

  const productos = [];
  const avisos = [];
  const usados = new Set();
  filas.forEach((celdas, i) => {
    const valor = (col) => (col in posicion ? (celdas[posicion[col]] ?? '').trim() : '');
    const numeroFila = i + 2; // como la ve Mica en la planilla
    if (valor('mostrar') && !esSi(valor('mostrar'))) return; // "no" = oculto, sin borrar la fila

    const nombre = valor('nombre');
    const precio = leerPrecio(valor('precio'));
    const talles = lista(valor('talles'));
    if (!nombre) return avisos.push(`Fila ${numeroFila}: falta el nombre.`);
    if (!precio) return avisos.push(`Fila ${numeroFila} (${nombre}): el precio no es válido.`);
    if (!talles.length) return avisos.push(`Fila ${numeroFila} (${nombre}): faltan los talles.`);

    const precioAnterior = leerPrecio(valor('precio anterior'));
    const agotados = new Set(lista(valor('talles agotados')).map(normalizar));
    // "Fotos" (o "Foto"): uno o varios links separados por coma, espacio o enter
    const fotos = (valor('fotos') || valor('foto')).split(/[\s,]+/).map(linkFoto).filter(Boolean);

    let codigo = valor('codigo') || `P${numeroFila}`;
    if (usados.has(codigo)) codigo = `${codigo}-${numeroFila}`;
    usados.add(codigo);

    const nombresColores = lista(valor('colores'));
    const colores = Object.fromEntries((nombresColores.length ? nombresColores : ['Único'])
      .map((c) => [c.charAt(0).toUpperCase() + c.slice(1), TONOS[normalizar(c)] ?? TONOS[c.toLowerCase()] ?? TONO_DESCONOCIDO]));

    productos.push({
      id: codigo,
      codigo,
      nombre,
      categoria: valor('categoria') || 'Otros',
      precio,
      precioAnterior: precioAnterior && precioAnterior > precio ? precioAnterior : null,
      talles,
      tallesAgotados: talles.filter((t) => agotados.has(normalizar(t))),
      colores,
      descripcion: valor('descripcion').slice(0, 1200),
      etiqueta: valor('etiqueta'),
      // Agotado si se marca así o si se agotaron todos sus talles
      agotado: esSi(valor('agotado')) || talles.every((t) => agotados.has(normalizar(t))),
      fotos,
    });
  });
  return { productos, avisos };
}

/** Las categorías en el orden en que aparecen en la planilla, con "Todo" primero. */
export const categoriasDe = (productos) => ['Todo', ...new Set(productos.map((p) => p.categoria))];

/** Ordena: primero los que tienen etiqueta (Nuevo, Oferta…), después el resto, y los agotados al final. */
export const ordenar = (productos) => productos
  .map((p, i) => ({ p, i }))
  .sort((a, b) => (a.p.agotado - b.p.agotado) || (!a.p.etiqueta - !b.p.etiqueta) || (a.i - b.i))
  .map(({ p }) => p);

/** Busca por nombre, categoría, color o descripción, sin importar mayúsculas ni tildes. */
export function buscar(productos, texto) {
  const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
  if (!palabras.length) return productos;
  const enNombre = (p) => palabras.every((w) => normalizar(`${p.nombre} ${p.categoria}`).includes(w));
  return productos
    .filter((p) => {
      const todo = normalizar([p.nombre, p.categoria, p.codigo, p.descripcion, ...Object.keys(p.colores)].join(' '));
      return palabras.every((w) => todo.includes(w));
    })
    // Primero los que coinciden en el nombre o la categoría; después los que solo lo mencionan en la descripción
    .sort((a, b) => enNombre(b) - enNombre(a));
}

/**
 * Lee la pestaña "Configuración" (dos columnas: Clave | Valor).
 * Solo toma valores válidos; lo que falte o esté mal queda con el valor por defecto.
 */
export function configDesdeCSV(texto, porDefecto) {
  const config = { ...porDefecto };
  for (const [clave, valor = ''] of leerCSV(texto)) {
    const v = valor.trim();
    switch (normalizar(clave)) {
      case 'whatsapp': {
        const numero = v.replace(/\D/g, '');
        if (numero.length >= 10 && numero.length <= 15) config.whatsapp = numero;
        break;
      }
      case 'envio':
        if (/^(0|gratis)$/i.test(v)) config.envio = 0;
        else if (leerPrecio(v)) config.envio = leerPrecio(v);
        break;
      case 'envio gratis desde':
        config.envioGratisDesde = leerPrecio(v) || 0;
        break;
      case 'descuento transferencia': {
        const n = Number(v.replace(/[%\s]/g, '').replace(',', '.'));
        if (Number.isFinite(n) && n >= 0 && n <= 50) config.descuentoTransferencia = n;
        break;
      }
      case 'avisos':
        if (v) config.avisos = v.split('|').map((x) => x.trim()).filter(Boolean).slice(0, 8);
        break;
      default:
    }
  }
  return config;
}
