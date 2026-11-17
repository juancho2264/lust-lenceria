import { CONFIG_INICIAL, PLANILLA, PLANILLA_CONFIG, RESPALDO } from './productos.js';
import { buscar, categoriasDe, configDesdeCSV, ordenar, productosDesdeCSV } from './planilla.js';

let CONFIG = { ...CONFIG_INICIAL };
let PRODUCTOS = [];
let CATEGORIAS = ['Todo'];
let categoria = 'Todo';
let busqueda = '';

const $ = (id) => document.getElementById(id);
const pesos = (n) => `$${Math.round(n).toLocaleString('es-AR')}`;
const conDescuento = (precio) => precio * (1 - CONFIG.descuentoTransferencia / 100);
const linkWhatsapp = (texto) => (CONFIG.whatsapp
  ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`
  : CONFIG.instagram);
const linkProducto = (p) => `${location.origin}${location.pathname}#p/${encodeURIComponent(p.id)}`;

/** Crea un elemento con texto seguro (nunca innerHTML con datos de la planilla). */
function el(tag, clase, texto) {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto != null) nodo.textContent = texto;
  return nodo;
}

/** Foto del producto, o un fondo del color elegido si todavía no tiene foto. */
function imagen(p, indice = 0, color) {
  const caja = el('div', 'imagen');
  const url = p.fotos[indice];
  caja.style.setProperty('--tono', color ?? Object.values(p.colores)[0]);
  if (url) {
    const img = el('img');
    img.src = url;
    img.alt = `${p.nombre}${p.fotos.length > 1 ? ` (foto ${indice + 1})` : ''}`;
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    // Si el link de la foto falla, queda el fondo de color en lugar de una imagen rota
    img.addEventListener('error', () => img.remove());
    caja.append(img);
  } else {
    caja.append(el('span', 'imagen__texto', 'foto'));
  }
  return caja;
}

function precios(p, grande = false) {
  const caja = el('div', `precios${grande ? ' precios--grande' : ''}`);
  if (p.precioAnterior) caja.append(el('s', 'precios__anterior', pesos(p.precioAnterior)));
  caja.append(el('span', 'precios__actual', pesos(p.precio)));
  if (p.precioAnterior) caja.append(el('span', 'precios__off', `-${Math.round((1 - p.precio / p.precioAnterior) * 100)}%`));
  if (CONFIG.descuentoTransferencia > 0) {
    caja.append(el('span', 'precios__transferencia', `${pesos(conDescuento(p.precio))} por transferencia`));
  }
  return caja;
}

// ---------- Bolsa (guardada en el navegador de la clienta) ----------
let bolsa = [];
try { bolsa = JSON.parse(localStorage.getItem('lust-bolsa')) || []; } catch { bolsa = []; }
if (!Array.isArray(bolsa)) bolsa = [];
const guardar = () => { try { localStorage.setItem('lust-bolsa', JSON.stringify(bolsa)); } catch { /* sin almacenamiento */ } };
const producto = (id) => PRODUCTOS.find((p) => p.id === id);

// ---------- Catálogo ----------
function dibujarFiltros() {
  $('filtros').replaceChildren(...CATEGORIAS.map((c) => {
    const b = el('button', 'filtro', c);
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(c === categoria));
    b.addEventListener('click', () => { categoria = c; dibujarFiltros(); dibujarProductos(); });
    return b;
  }));
}

function tarjeta(p, i) {
  const art = el('a', `producto${p.agotado ? ' producto--agotado' : ''}`);
  art.href = `#p/${encodeURIComponent(p.id)}`;
  art.style.animationDelay = `${Math.min(i, 8) * 50}ms`;
  art.setAttribute('aria-label', `${p.nombre}, ${pesos(p.precio)}${p.agotado ? ', sin stock' : ''}`);

  const foto = el('div', 'producto__foto');
  foto.append(imagen(p));
  if (p.etiqueta) foto.append(el('span', 'producto__etiqueta', p.etiqueta));
  if (p.fotos.length > 1) foto.append(el('span', 'producto__fotos', `📷 ${p.fotos.length}`));
  if (p.agotado) foto.append(el('span', 'producto__agotado', 'Sin stock'));

  const info = el('div', 'producto__info');
  const puntos = el('div', 'producto__colores');
  for (const [nombre, tono] of Object.entries(p.colores)) {
    const punto = el('span', 'punto'); punto.style.background = tono; punto.title = nombre; puntos.append(punto);
  }
  info.append(el('h3', null, p.nombre), precios(p), puntos, el('span', 'producto__ver', p.agotado ? 'Ver producto' : 'Elegir talle y color →'));
  art.append(foto, info);
  return art;
}

function dibujarProductos() {
  const enCategoria = PRODUCTOS.filter((p) => categoria === 'Todo' || p.categoria === categoria);
  const lista = busqueda ? buscar(ordenar(enCategoria), busqueda) : ordenar(enCategoria);
  const caja = $('productos');
  caja.removeAttribute('aria-busy');
  if (!lista.length) {
    caja.replaceChildren(el('p', 'catalogo__vacio', busqueda
      ? `No encontramos "${busqueda}". Probá con otra palabra o escribime y te ayudo.`
      : 'No hay productos en esta categoría por ahora.'));
    return;
  }
  caja.replaceChildren(...lista.map(tarjeta));
}

let esperaBusqueda;
$('buscar').addEventListener('input', (e) => {
  clearTimeout(esperaBusqueda);
  esperaBusqueda = setTimeout(() => { busqueda = e.target.value.trim(); dibujarProductos(); }, 150);
});

// ---------- Ficha de producto ----------
const ficha = $('ficha');
let actual = null;
let elegido = { talle: '', color: '' };
let fotoActual = 0;

function dibujarGaleria(p) {
  const pista = $('galeria-pista');
  const cantidad = Math.max(p.fotos.length, 1);
  pista.replaceChildren(...Array.from({ length: cantidad }, (_, i) => {
    const slide = el('button', 'galeria__foto');
    slide.type = 'button';
    slide.setAttribute('aria-label', p.fotos[i] ? `Ampliar foto ${i + 1}` : 'Sin foto');
    slide.append(imagen(p, i, p.colores[elegido.color]));
    if (p.fotos[i]) slide.addEventListener('click', () => abrirZoom(p.fotos[i], p.nombre));
    return slide;
  }));
  pista.scrollLeft = 0;
  fotoActual = 0;
  $('galeria-puntos').replaceChildren(...(cantidad > 1 ? Array.from({ length: cantidad }, (_, i) => {
    const punto = el('button', 'galeria__punto');
    punto.type = 'button';
    punto.setAttribute('aria-label', `Ver foto ${i + 1}`);
    punto.addEventListener('click', () => irAFoto(i));
    return punto;
  }) : []));
  const galeria = ficha.querySelector('.galeria');
  galeria.classList.toggle('galeria--varias', cantidad > 1);
  galeria.classList.toggle('galeria--con-fotos', p.fotos.length > 0);
  marcarPunto();
}

function irAFoto(i) {
  const pista = $('galeria-pista');
  const total = pista.children.length;
  fotoActual = (i + total) % total;
  pista.scrollTo({ left: fotoActual * pista.clientWidth, behavior: 'smooth' });
  marcarPunto();
}
function marcarPunto() {
  [...$('galeria-puntos').children].forEach((b, i) => b.setAttribute('aria-current', String(i === fotoActual)));
}
$('galeria-pista').addEventListener('scroll', (e) => {
  const i = Math.round(e.target.scrollLeft / e.target.clientWidth);
  if (i !== fotoActual) { fotoActual = i; marcarPunto(); }
}, { passive: true });
$('galeria-anterior').addEventListener('click', () => irAFoto(fotoActual - 1));
$('galeria-siguiente').addEventListener('click', () => irAFoto(fotoActual + 1));

function abrirFicha(p) {
  actual = p;
  elegido = { talle: '', color: Object.keys(p.colores)[0] };
  $('ficha-meta').textContent = `${p.categoria} · Cód. ${p.codigo}`;
  $('ficha-nombre').textContent = p.nombre;
  $('ficha-precios').replaceChildren(precios(p, true));
  $('ficha-descripcion').textContent = p.descripcion;
  $('ficha-descripcion').hidden = !p.descripcion;
  $('ficha-error').textContent = '';
  $('ficha-color').textContent = elegido.color;

  $('ficha-colores').replaceChildren(...Object.entries(p.colores).map(([nombre, tono]) => {
    const b = el('button', 'color');
    b.type = 'button'; b.title = nombre; b.setAttribute('aria-label', `Color ${nombre}`);
    b.style.background = tono;
    b.setAttribute('aria-pressed', String(nombre === elegido.color));
    b.addEventListener('click', () => {
      elegido.color = nombre;
      $('ficha-color').textContent = nombre;
      $('ficha-colores').querySelectorAll('.color').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      if (!p.fotos.length) dibujarGaleria(p); // sin fotos, el fondo muestra el color elegido
    });
    return b;
  }));

  $('ficha-talles').replaceChildren(...p.talles.map((t) => {
    const agotado = p.agotado || p.tallesAgotados.includes(t);
    const b = el('button', 'talle', t);
    b.type = 'button';
    b.disabled = agotado;
    b.title = agotado ? 'Agotado' : `Talle ${t}`;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      elegido.talle = t;
      $('ficha-error').textContent = '';
      $('ficha-talles').querySelectorAll('.talle').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    });
    return b;
  }));

  const agregar = $('ficha-agregar');
  agregar.disabled = p.agotado;
  agregar.textContent = p.agotado ? 'Sin stock por ahora' : 'Agregar a la bolsa';
  const consultar = $('ficha-consultar');
  consultar.href = linkWhatsapp(p.agotado
    ? `Hola Mica! Avisame cuando vuelva: ${p.nombre} (cód. ${p.codigo})\n${linkProducto(p)}`
    : `Hola Mica! Te consulto por este producto: ${p.nombre} (cód. ${p.codigo})\n${linkProducto(p)}`);
  consultar.target = '_blank';
  consultar.rel = 'noopener';
  consultar.textContent = p.agotado ? 'Avisame cuando vuelva' : 'Consultar por este producto';

  if (!ficha.open) ficha.showModal();
  dibujarGaleria(p); // después de abrir, para que la galería sepa su tamaño
  ficha.querySelector('.ficha__info').scrollTop = 0;
  document.title = `${p.nombre} · Lust Lencería`;
}

$('ficha-agregar').addEventListener('click', () => {
  if (!elegido.talle) {
    $('ficha-error').textContent = 'Elegí un talle para agregarlo.';
    const talles = $('ficha-talles');
    talles.classList.remove('temblar'); void talles.offsetWidth; talles.classList.add('temblar');
    return;
  }
  sumar(actual.id, elegido.talle, elegido.color);
  cerrarFicha();
});

$('ficha-compartir').addEventListener('click', async () => {
  const datos = { title: actual.nombre, text: `${actual.nombre} en Lust Lencería`, url: linkProducto(actual) };
  try {
    if (navigator.share) await navigator.share(datos);
    else { await navigator.clipboard.writeText(datos.url); avisar('Link copiado ♡'); }
  } catch { /* la persona canceló */ }
});

// La ficha se abre con el link #p/CODIGO: así se puede compartir un producto y "atrás" la cierra
function cerrarFicha() {
  if (location.hash.startsWith('#p/')) history.back();
  else if (ficha.open) ficha.close();
}
function segunLink() {
  const id = location.hash.startsWith('#p/') ? decodeURIComponent(location.hash.slice(3)) : null;
  const p = id && producto(id);
  if (p) abrirFicha(p);
  else if (ficha.open) ficha.close();
}
addEventListener('hashchange', segunLink);
ficha.addEventListener('close', () => {
  document.title = 'Lust Lencería · Merlo';
  if (location.hash.startsWith('#p/')) history.replaceState(null, '', location.pathname + location.search);
});
ficha.addEventListener('click', (e) => {
  if (e.target === ficha) { cerrarFicha(); return; }
  const cierre = e.target.closest('[data-cerrar-ficha]');
  if (!cierre) return;
  if (cierre.getAttribute('href') === '#talles') {
    e.preventDefault();
    ficha.close();
    $('talles').scrollIntoView({ behavior: 'smooth' });
  } else cerrarFicha();
});
ficha.addEventListener('cancel', (e) => { e.preventDefault(); cerrarFicha(); });

// ---------- Zoom ----------
const zoom = $('zoom');
const marco = $('zoom-marco');
function abrirZoom(url, nombre) {
  $('zoom-imagen').src = url;
  $('zoom-imagen').alt = nombre;
  marco.classList.remove('ampliada');
  zoom.showModal();
}
marco.addEventListener('click', (e) => {
  const caja = marco.getBoundingClientRect();
  const x = (e.clientX - caja.left) / caja.width;
  const y = (e.clientY - caja.top) / caja.height;
  const ampliada = marco.classList.toggle('ampliada');
  // Acerca justo donde se tocó
  if (ampliada) requestAnimationFrame(() => marco.scrollTo(x * (marco.scrollWidth - caja.width), y * (marco.scrollHeight - caja.height)));
});
$('cerrar-zoom').addEventListener('click', () => zoom.close());
zoom.addEventListener('click', (e) => { if (e.target === zoom) zoom.close(); });

// ---------- Bolsa ----------
function sumar(id, talle, color) {
  const existente = bolsa.find((i) => i.id === id && i.talle === talle && i.color === color);
  if (existente) existente.cantidad = Math.min(existente.cantidad + 1, 20);
  else bolsa.push({ id, talle, color, cantidad: 1 });
  guardar();
  dibujarBolsa();
  avisar(`${producto(id).nombre} (${talle}) en tu bolsa ♡`);
  const icono = $('abrir-bolsa');
  icono.classList.remove('salto'); void icono.offsetWidth; icono.classList.add('salto');
}

function cambiarCantidad(indice, delta) {
  bolsa[indice].cantidad = Math.min(bolsa[indice].cantidad + delta, 20);
  if (bolsa[indice].cantidad <= 0) bolsa.splice(indice, 1);
  guardar();
  dibujarBolsa();
}

const form = $('form-pedido');
const conEnvio = () => form.entrega.value === 'envio';
const pagaTransferencia = () => form.pago.value === 'Transferencia';
const subtotal = () => bolsa.reduce((s, i) => s + producto(i.id).precio * i.cantidad, 0);

function calcular() {
  const productos = subtotal();
  const descuento = pagaTransferencia() ? productos * (CONFIG.descuentoTransferencia / 100) : 0;
  const envioGratis = CONFIG.envioGratisDesde > 0 && productos >= CONFIG.envioGratisDesde;
  const envio = conEnvio() && !envioGratis ? CONFIG.envio : 0;
  return { productos, descuento, envio, envioGratis, total: productos - descuento + envio };
}

function dibujarBolsa() {
  const cantidad = bolsa.reduce((s, i) => s + i.cantidad, 0);
  $('cantidad-bolsa').textContent = cantidad;
  $('cantidad-bolsa').classList.toggle('visible', cantidad > 0);
  $('bolsa-vacia').hidden = cantidad > 0;
  form.hidden = cantidad === 0;

  $('lista-bolsa').replaceChildren(...bolsa.map((item, i) => {
    const p = producto(item.id);
    const li = el('li', 'item');
    const muestra = imagen(p, 0, p.colores[item.color]);
    muestra.classList.add('item__muestra');
    const texto = el('div', 'item__texto');
    texto.append(el('strong', null, p.nombre), el('span', null, `Talle ${item.talle} · ${item.color} · Cód. ${p.codigo}`), el('span', 'item__precio', pesos(p.precio * item.cantidad)));
    const ctrl = el('div', 'item__cantidad');
    const menos = el('button', null, '−'); menos.type = 'button'; menos.setAttribute('aria-label', 'Quitar uno');
    const mas = el('button', null, '+'); mas.type = 'button'; mas.setAttribute('aria-label', 'Sumar uno');
    menos.addEventListener('click', () => cambiarCantidad(i, -1));
    mas.addEventListener('click', () => cambiarCantidad(i, 1));
    ctrl.append(menos, el('span', null, item.cantidad), mas);
    li.append(muestra, texto, ctrl);
    return li;
  }));
  if (!cantidad) return;

  // "Efectivo" solo tiene sentido si retira en persona
  $('opcion-efectivo').hidden = conEnvio();
  if (conEnvio() && form.pago.value === 'Efectivo al retirar') form.pago.value = 'Transferencia';

  const c = calcular();
  $('subtotal').textContent = pesos(c.productos);
  $('fila-descuento').hidden = !c.descuento;
  $('descuento').textContent = `-${pesos(c.descuento)}`;
  $('fila-envio').hidden = !conEnvio();
  $('costo-envio').textContent = c.envioGratis ? 'Gratis 🎉' : pesos(CONFIG.envio);
  $('total').textContent = pesos(c.total);
  $('campo-localidad').hidden = !conEnvio();

  const aviso = $('envio-gratis');
  aviso.hidden = !CONFIG.envioGratisDesde;
  if (CONFIG.envioGratisDesde) {
    const falta = CONFIG.envioGratisDesde - c.productos;
    aviso.textContent = falta > 0 ? `Te faltan ${pesos(falta)} para el envío gratis 🚚` : '¡Tenés envío gratis! 🎉';
    aviso.style.setProperty('--avance', `${Math.min(100, (c.productos / CONFIG.envioGratisDesde) * 100)}%`);
  }
}

function mensajePedido() {
  const c = calcular();
  const lineas = bolsa.map((i) => {
    const p = producto(i.id);
    return `• ${i.cantidad} x ${p.nombre} [${p.codigo}] — Talle ${i.talle}, ${i.color} — ${pesos(p.precio * i.cantidad)}`;
  });
  const entrega = conEnvio()
    ? `Envío a ${form.localidad.value.trim()} (${c.envioGratis ? 'gratis' : pesos(CONFIG.envio)})`
    : 'Retiro en Merlo';
  return [
    `Hola Mica! Soy ${form.nombre.value.trim()} y quiero hacer este pedido:`,
    '',
    ...lineas,
    '',
    `Entrega: ${entrega}`,
    `Pago: ${form.pago.value}${c.descuento ? ` (-${CONFIG.descuentoTransferencia}%: -${pesos(c.descuento)})` : ''}`,
    `Total: ${pesos(c.total)}`,
    '',
    '¿Me confirmás si hay stock? Gracias!',
  ].join('\n');
}

form.addEventListener('change', dibujarBolsa);
form.addEventListener('input', () => { $('error-pedido').textContent = ''; });
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const faltan = [];
  if (!form.nombre.value.trim()) faltan.push('tu nombre');
  if (conEnvio() && !form.localidad.value.trim()) faltan.push('tu localidad');
  if (faltan.length) {
    $('error-pedido').textContent = `Falta completar ${faltan.join(' y ')}.`;
    return;
  }
  window.open(linkWhatsapp(mensajePedido()), '_blank', 'noopener');
});

const panel = $('bolsa');
const fondo = $('fondo-bolsa');
function abrirBolsa(abrir) {
  panel.classList.toggle('abierta', abrir);
  panel.setAttribute('aria-hidden', String(!abrir));
  fondo.hidden = !abrir;
  document.body.classList.toggle('sin-scroll', abrir);
}
$('abrir-bolsa').addEventListener('click', () => abrirBolsa(true));
$('cerrar-bolsa').addEventListener('click', () => abrirBolsa(false));
fondo.addEventListener('click', () => abrirBolsa(false));
document.querySelector('[data-cerrar-bolsa]').addEventListener('click', () => abrirBolsa(false));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('abierta')) abrirBolsa(false); });

// ---------- Aviso flotante ----------
let temporizador;
function avisar(texto) {
  const aviso = $('aviso-agregado');
  aviso.textContent = texto;
  aviso.classList.add('visible');
  clearTimeout(temporizador);
  temporizador = setTimeout(() => aviso.classList.remove('visible'), 2200);
}

// ---------- Datos que vienen de la configuración ----------
function aplicarConfig() {
  const avisos = CONFIG.avisos.length ? CONFIG.avisos : CONFIG_INICIAL.avisos;
  $('avisos').replaceChildren(...[...avisos, ...avisos].map((a) => el('span', null, a)));
  $('precio-envio').textContent = pesos(CONFIG.envio);
  const descuento = CONFIG.descuentoTransferencia > 0 ? `${CONFIG.descuentoTransferencia}% off` : '';
  $('etiqueta-descuento').textContent = descuento;
  $('pagos-descuento').textContent = descuento ? `(${descuento})` : '';
  document.querySelectorAll('[data-whatsapp]').forEach((b) => {
    b.href = linkWhatsapp(b.dataset.whatsapp);
    b.target = '_blank';
    b.rel = 'noopener';
  });
}

// ---------- Arranque ----------
async function leerTexto(url) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

async function cargarConfig() {
  if (!PLANILLA_CONFIG) return;
  try { CONFIG = configDesdeCSV(await leerTexto(PLANILLA_CONFIG), CONFIG_INICIAL); } catch (error) {
    console.warn('No se pudo leer la configuración, uso la de siempre:', error.message);
  }
}

async function cargarCatalogo() {
  let datos;
  try {
    if (!PLANILLA) throw new Error('sin planilla');
    datos = productosDesdeCSV(await leerTexto(PLANILLA));
    if (!datos.productos.length) throw new Error('planilla sin productos');
  } catch (error) {
    if (PLANILLA) console.warn('No se pudo leer la planilla, uso el respaldo:', error.message);
    datos = productosDesdeCSV(await leerTexto(RESPALDO));
  }
  // Los avisos ayudan a encontrar una fila mal cargada (se ven en la consola del navegador)
  datos.avisos.forEach((a) => console.warn('Planilla:', a));
  PRODUCTOS = datos.productos;
  CATEGORIAS = categoriasDe(PRODUCTOS);
  // Saca de la bolsa lo que ya no existe o se agotó
  bolsa = bolsa.filter((i) => {
    const p = i && producto(i.id);
    return p && !p.agotado && p.talles.includes(i.talle) && !p.tallesAgotados.includes(i.talle) && i.color in p.colores;
  });
  guardar();
}

aplicarConfig();
Promise.all([cargarConfig(), cargarCatalogo()])
  .then(() => {
    aplicarConfig();
    dibujarFiltros();
    dibujarProductos();
    dibujarBolsa();
    segunLink(); // si entraron con el link de un producto, se abre su ficha
  })
  .catch(() => {
    $('productos').replaceChildren(el('p', 'catalogo__vacio', 'No pudimos cargar el catálogo. Escribime por WhatsApp y te lo paso.'));
  })
  .finally(() => $('productos').classList.remove('cargando'));
