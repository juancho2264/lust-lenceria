// Lee el catálogo desde una planilla de Google Sheets publicada como CSV.
// Funciones puras (sin navegador) para poder testearlas con: node --test js/planilla.test.js

/** Columnas que tiene que tener la planilla (la primera fila). Mayúsculas y tildes no importan. */
export const COLUMNAS = ['codigo', 'nombre', 'categoria', 'precio', 'precio anterior', 'talles', 'talles agotados', 'colores', 'fotos', 'descripcion', 'etiqueta', 'agotado', 'mostrar'];

// Colores que Mica puede escribir con palabras. Si escribe uno que no está, se usa un rosa neutro.
const TONOS = {
  // Básicos
  negro: '#1f1a1c', blanco: '#f7f3f1', 'blanco hueso': '#eee6d8', 'off white': '#eee6d8', crema: '#f3e9d8', marfil: '#f3ecdc',
  gris: '#a3a3a8', 'gris claro': '#cfcfd4', 'gris topo': '#8b8079', topo: '#8b8079', 'gris oscuro': '#55555b', plomo: '#6e6e74',
  nude: '#e7c3ad', piel: '#e7c3ad', beige: '#e8d8c4', camel: '#c19a6b', arena: '#d9c3a0', champagne: '#f1dfc2',
  marron: '#7a5643', chocolate: '#5b3a29', cafe: '#6b4a37', habano: '#8a5a3c', terracota: '#c0674a', ladrillo: '#a2493a',
  // Rosas y rojos
  rosa: '#f4a7bd', 'rosa claro': '#f9cdd8', 'rosa pastel': '#f9cdd8', 'rosa bebe': '#f9cdd8', 'rosa viejo': '#d9a3ab',
  'rosa chicle': '#ff6fa8', 'rosa fuerte': '#e8457e', fucsia: '#d63384', magenta: '#c2186e', coral: '#f47b6b', salmon: '#f59c86',
  durazno: '#f8b98f', rojo: '#d23a4a', bordo: '#7a1f35', vino: '#7a1f35', borravino: '#6b1a2e', cereza: '#a3142f', frambuesa: '#c2265a',
  // Violetas
  lila: '#cdb6ea', lavanda: '#c8b8e8', violeta: '#8a5cc2', morado: '#6c3a9c', purpura: '#6c3a9c', ciruela: '#6a2c55', uva: '#5a2a6e',
  // Azules
  celeste: '#a9d4ec', 'celeste bebe': '#cfe6f5', 'azul claro': '#9ec3ea', azul: '#3557a8', 'azul francia': '#2f4fd1', 'azul rey': '#2a4bb8',
  'azul marino': '#1e2a44', marino: '#1e2a44', jean: '#4f6d93', petroleo: '#1f5a66', turquesa: '#2bb5b8', aqua: '#7fdbd6', 'agua marina': '#7fdbd6',
  // Verdes
  verde: '#5fae7e', 'verde claro': '#a8d8b0', 'verde agua': '#9fd8cb', menta: '#a8e6cf', 'verde menta': '#a8e6cf', 'verde lima': '#b5d334', lima: '#b5d334',
  'verde manzana': '#8cc63f', 'verde oscuro': '#2f5d3a', 'verde ingles': '#1f4d34', 'verde militar': '#5b6236', militar: '#5b6236', oliva: '#7c7a3a',
  'verde oliva': '#7c7a3a', esmeralda: '#1f9d6b', 'verde benetton': '#1f9d4b', salvia: '#9cae95',
  // Amarillos y naranjas
  amarillo: '#f3d36b', 'amarillo pastel': '#f8e7a1', mostaza: '#d4a72c', dorado: '#d4af37', oro: '#d4af37', naranja: '#f19a5b', 'naranja fluo': '#ff7a1a',
  plateado: 'linear-gradient(135deg,#e6e6ea,#a9a9b2,#e6e6ea)', plata: 'linear-gradient(135deg,#e6e6ea,#a9a9b2,#e6e6ea)',
  // Estampados
  animal: 'repeating-linear-gradient(45deg,#c79a5b 0 6px,#3a2a1c 6px 10px)', 'animal print': 'repeating-linear-gradient(45deg,#c79a5b 0 6px,#3a2a1c 6px 10px)',
  leopardo: 'radial-gradient(circle at 30% 30%,#3a2a1c 0 3px,transparent 4px) 0 0/9px 9px,#c79a5b', cebra: 'repeating-linear-gradient(60deg,#f7f3f1 0 4px,#1f1a1c 4px 8px)',
  vichy: 'repeating-linear-gradient(0deg,#f4a7bd55 0 4px,transparent 4px 8px),repeating-linear-gradient(90deg,#f4a7bd 0 4px,#fff 4px 8px)',
  rayado: 'repeating-linear-gradient(90deg,#1e2a44 0 3px,#f7f3f1 3px 7px)', rayas: 'repeating-linear-gradient(90deg,#1e2a44 0 3px,#f7f3f1 3px 7px)',
  floreado: 'radial-gradient(circle,#f4a7bd 0 2px,transparent 3px) 0 0/8px 8px,#f7f3f1', flores: 'radial-gradient(circle,#f4a7bd 0 2px,transparent 3px) 0 0/8px 8px,#f7f3f1',
  lunares: 'radial-gradient(circle,#1f1a1c 0 2px,transparent 3px) 0 0/8px 8px,#f7f3f1', estampado: 'linear-gradient(135deg,#f4a7bd,#bcdcf2,#cdb6ea)',
  surtido: 'linear-gradient(135deg,#f4a7bd,#bcdcf2,#cdb6ea)', multicolor: 'linear-gradient(135deg,#f4a7bd,#f3d36b,#9fd8cb,#cdb6ea)', tie: 'linear-gradient(135deg,#f4a7bd,#cdb6ea,#a9d4ec)',
  'tie dye': 'linear-gradient(135deg,#f4a7bd,#cdb6ea,#a9d4ec)', transparente: 'repeating-linear-gradient(45deg,#ffffff 0 4px,#eee 4px 8px)',
};
const TONO_DESCONOCIDO = '#e9c6d0';

/** Busca el tono de un color escrito a mano: "Verde Lima", "verdes", "rosa chicle fluo"… */
export function tonoDe(nombre) {
  const limpio = normalizar(nombre).replace(/\s+/g, ' ');
  const candidatos = [limpio, limpio.replace(/(es|s)$/, '')];
  for (const c of candidatos) if (TONOS[c]) return TONOS[c];
  // Si no está entero, prueba de a pedazos: primero las dos primeras palabras, después cada palabra
  const palabras = limpio.split(' ');
  for (let largo = palabras.length - 1; largo >= 1; largo--) {
    for (let i = 0; i + largo <= palabras.length; i++) {
      const parte = palabras.slice(i, i + largo).join(' ');
      if (TONOS[parte]) return TONOS[parte];
      if (TONOS[parte.replace(/(es|s)$/, '')]) return TONOS[parte.replace(/(es|s)$/, '')];
    }
  }
  return TONO_DESCONOCIDO;
}

/** La lista de colores que la página reconoce (para la guía). */
export const COLORES_CONOCIDOS = () => Object.keys(TONOS);

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
      .map((c) => [c.charAt(0).toUpperCase() + c.slice(1), tonoDe(c)]));

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
      case 'fotos portada': {
        const fotos = v.split(/[\s,]+/).map(linkFoto).filter(Boolean);
        if (fotos.length) config.fotosPortada = fotos.slice(0, 2);
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

/**
 * Pestaña "Talles": una tabla libre (la primera fila son los títulos: Talle, Busto, Cintura…).
 * Devuelve null si está vacía. Limita el tamaño para que nunca rompa el diseño.
 */
export function tablaDesdeCSV(texto) {
  const filas = leerCSV(texto).map((f) => f.map((c) => c.trim().slice(0, 40)));
  if (filas.length < 2) return null;
  const columnas = Math.min(6, Math.max(...filas.map((f) => f.filter(Boolean).length)));
  const [encabezado, ...resto] = filas.map((f) => f.slice(0, columnas));
  const cuerpo = resto.filter((f) => f.some(Boolean)).slice(0, 30);
  return cuerpo.length ? { encabezado, filas: cuerpo } : null;
}

/** Pestaña "Preguntas": dos columnas, Pregunta | Respuesta. Saltea las filas incompletas. */
export function preguntasDesdeCSV(texto) {
  const [, ...filas] = leerCSV(texto);
  return filas
    .map(([pregunta = '', respuesta = '']) => ({ pregunta: pregunta.trim().slice(0, 200), respuesta: respuesta.trim().slice(0, 1200) }))
    .filter((p) => p.pregunta && p.respuesta)
    .slice(0, 20);
}
