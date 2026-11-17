import { CATEGORIAS, ENVIO, PRODUCTOS } from './productos.js';

const CONFIG = {
  // Número de WhatsApp de Mica con código de país, sin + ni espacios. Ej.: '5491123456789'
  whatsapp: '',
  // Mientras no haya número, los pedidos abren el Instagram
  instagram: 'https://www.instagram.com/lust_lenceria2/',
};

const pesos = (n) => `$${n.toLocaleString('es-AR')}`;
const linkWhatsapp = (texto) => (CONFIG.whatsapp
  ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`
  : CONFIG.instagram);

function el(tag, clase, texto) {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto != null) nodo.textContent = texto;
  return nodo;
}

// ---------- Bolsa (se guarda en el navegador para no perderla al recargar) ----------
let bolsa = [];
try { bolsa = JSON.parse(localStorage.getItem('lust-bolsa')) || []; } catch { bolsa = []; }
const guardar = () => { try { localStorage.setItem('lust-bolsa', JSON.stringify(bolsa)); } catch { /* sin almacenamiento */ } };
const producto = (id) => PRODUCTOS.find((p) => p.id === id);
bolsa = bolsa.filter((i) => producto(i.id)); // por si se borró un producto del catálogo

// ---------- Catálogo ----------
let categoria = 'Todo';

function dibujarFiltros() {
  const caja = document.getElementById('filtros');
  caja.replaceChildren(...CATEGORIAS.map((c) => {
    const b = el('button', 'filtro', c);
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(c === categoria));
    b.addEventListener('click', () => { categoria = c; dibujarFiltros(); dibujarProductos(); });
    return b;
  }));
}

function tarjeta(p, i) {
  const art = el('article', `producto${p.agotado ? ' producto--agotado' : ''}`);
  art.style.animationDelay = `${i * 60}ms`;
  const elegido = { talle: '', color: Object.keys(p.colores)[0] };

  const foto = el('div', 'producto__foto');
  if (p.foto) {
    const img = el('img'); img.src = p.foto; img.alt = p.nombre; img.loading = 'lazy'; foto.append(img);
  } else {
    foto.style.setProperty('--tono', p.colores[elegido.color]);
    foto.append(el('span', 'producto__foto-texto', 'foto'));
  }
  if (p.etiqueta) foto.append(el('span', 'producto__etiqueta', p.etiqueta));
  if (p.agotado) foto.append(el('span', 'producto__agotado', 'Sin stock'));

  const info = el('div', 'producto__info');
  info.append(el('h3', null, p.nombre), el('p', 'producto__precio', pesos(p.precio)));

  // Colores
  const colores = el('div', 'opciones opciones--color');
  colores.setAttribute('aria-label', 'Color');
  for (const [nombre, tono] of Object.entries(p.colores)) {
    const b = el('button', 'color');
    b.type = 'button'; b.title = nombre; b.setAttribute('aria-label', `Color ${nombre}`);
    b.style.background = tono;
    b.setAttribute('aria-pressed', String(nombre === elegido.color));
    b.addEventListener('click', () => {
      elegido.color = nombre;
      colores.querySelectorAll('.color').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      nombreColor.textContent = nombre;
      if (!p.foto) foto.style.setProperty('--tono', tono);
    });
    colores.append(b);
  }
  const nombreColor = el('span', 'opciones__nombre', elegido.color);
  colores.append(nombreColor);

  // Talles
  const talles = el('div', 'opciones');
  talles.setAttribute('aria-label', 'Talle');
  for (const t of p.talles) {
    const b = el('button', 'talle', t);
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      elegido.talle = t;
      talles.querySelectorAll('.talle').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      art.classList.remove('producto--falta-talle');
    });
    talles.append(b);
  }

  const agregar = el('button', 'boton boton--chico', p.agotado ? 'Sin stock' : 'Agregar a la bolsa');
  agregar.type = 'button';
  agregar.disabled = !!p.agotado;
  agregar.addEventListener('click', () => {
    if (!elegido.talle) {
      art.classList.remove('producto--falta-talle');
      void art.offsetWidth; // reinicia la animación
      art.classList.add('producto--falta-talle');
      avisar('Elegí un talle primero');
      return;
    }
    sumar(p.id, elegido.talle, elegido.color);
    agregar.textContent = '¡Agregado! ♡';
    setTimeout(() => { agregar.textContent = 'Agregar a la bolsa'; }, 1400);
  });

  info.append(colores, talles, agregar);
  art.append(foto, info);
  return art;
}

function dibujarProductos() {
  const lista = PRODUCTOS.filter((p) => categoria === 'Todo' || p.categoria === categoria);
  document.getElementById('productos').replaceChildren(...lista.map(tarjeta));
}

// ---------- Acciones de la bolsa ----------
function sumar(id, talle, color) {
  const existente = bolsa.find((i) => i.id === id && i.talle === talle && i.color === color);
  if (existente) existente.cantidad += 1;
  else bolsa.push({ id, talle, color, cantidad: 1 });
  guardar();
  dibujarBolsa();
  avisar(`${producto(id).nombre} (${talle}) en tu bolsa`);
  const icono = document.getElementById('abrir-bolsa');
  icono.classList.remove('salto'); void icono.offsetWidth; icono.classList.add('salto');
}

function cambiarCantidad(indice, delta) {
  bolsa[indice].cantidad += delta;
  if (bolsa[indice].cantidad <= 0) bolsa.splice(indice, 1);
  guardar();
  dibujarBolsa();
}

const form = document.getElementById('form-pedido');
const conEnvio = () => form.entrega.value === 'envio';
const subtotal = () => bolsa.reduce((s, i) => s + producto(i.id).precio * i.cantidad, 0);

function dibujarBolsa() {
  const cantidad = bolsa.reduce((s, i) => s + i.cantidad, 0);
  document.getElementById('cantidad-bolsa').textContent = cantidad;
  document.getElementById('cantidad-bolsa').classList.toggle('visible', cantidad > 0);
  document.getElementById('bolsa-vacia').hidden = cantidad > 0;
  form.hidden = cantidad === 0;

  document.getElementById('lista-bolsa').replaceChildren(...bolsa.map((item, i) => {
    const p = producto(item.id);
    const li = el('li', 'item');
    const muestra = el('span', 'item__muestra');
    muestra.style.background = p.colores[item.color];
    const texto = el('div', 'item__texto');
    texto.append(el('strong', null, p.nombre), el('span', null, `Talle ${item.talle} · ${item.color}`), el('span', 'item__precio', pesos(p.precio * item.cantidad)));
    const ctrl = el('div', 'item__cantidad');
    const menos = el('button', null, '−'); menos.type = 'button'; menos.setAttribute('aria-label', 'Quitar uno');
    const mas = el('button', null, '+'); mas.type = 'button'; mas.setAttribute('aria-label', 'Sumar uno');
    menos.addEventListener('click', () => cambiarCantidad(i, -1));
    mas.addEventListener('click', () => cambiarCantidad(i, 1));
    ctrl.append(menos, el('span', null, item.cantidad), mas);
    li.append(muestra, texto, ctrl);
    return li;
  }));

  const envio = conEnvio() ? ENVIO : 0;
  document.getElementById('subtotal').textContent = pesos(subtotal());
  document.getElementById('fila-envio').hidden = !conEnvio();
  document.getElementById('costo-envio').textContent = pesos(ENVIO);
  document.getElementById('total').textContent = pesos(subtotal() + envio);
  document.getElementById('campo-localidad').hidden = !conEnvio();
}

function mensajePedido() {
  const lineas = bolsa.map((i) => {
    const p = producto(i.id);
    return `• ${i.cantidad} x ${p.nombre} — Talle ${i.talle}, ${i.color} — ${pesos(p.precio * i.cantidad)}`;
  });
  const entrega = conEnvio()
    ? `Envío a ${form.localidad.value.trim()} (${pesos(ENVIO)})`
    : 'Retiro en Merlo';
  return [
    `Hola Mica! Soy ${form.nombre.value.trim()} y quiero hacer este pedido:`,
    '',
    ...lineas,
    '',
    `Entrega: ${entrega}`,
    `Total: ${pesos(subtotal() + (conEnvio() ? ENVIO : 0))}`,
    '',
    '¿Me confirmás si hay stock? Gracias!',
  ].join('\n');
}

form.addEventListener('change', dibujarBolsa);
form.addEventListener('input', () => { document.getElementById('error-pedido').textContent = ''; });
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const faltan = [];
  if (!form.nombre.value.trim()) faltan.push('tu nombre');
  if (conEnvio() && !form.localidad.value.trim()) faltan.push('tu localidad');
  if (faltan.length) {
    document.getElementById('error-pedido').textContent = `Falta completar ${faltan.join(' y ')}.`;
    return;
  }
  window.open(linkWhatsapp(mensajePedido()), '_blank', 'noopener');
});

// ---------- Abrir y cerrar la bolsa ----------
const panel = document.getElementById('bolsa');
const fondo = document.getElementById('fondo-bolsa');
function abrirBolsa(abrir) {
  panel.classList.toggle('abierta', abrir);
  panel.setAttribute('aria-hidden', String(!abrir));
  fondo.hidden = !abrir;
  document.body.classList.toggle('sin-scroll', abrir);
}
document.getElementById('abrir-bolsa').addEventListener('click', () => abrirBolsa(true));
document.getElementById('cerrar-bolsa').addEventListener('click', () => abrirBolsa(false));
fondo.addEventListener('click', () => abrirBolsa(false));
document.querySelector('[data-cerrar-bolsa]').addEventListener('click', () => abrirBolsa(false));
addEventListener('keydown', (e) => { if (e.key === 'Escape') abrirBolsa(false); });

// ---------- Aviso flotante ----------
let temporizador;
function avisar(texto) {
  const aviso = document.getElementById('aviso-agregado');
  aviso.textContent = texto;
  aviso.classList.add('visible');
  clearTimeout(temporizador);
  temporizador = setTimeout(() => aviso.classList.remove('visible'), 2200);
}

// ---------- Botones sueltos de WhatsApp ----------
document.querySelectorAll('[data-whatsapp]').forEach((b) => {
  b.href = linkWhatsapp(b.dataset.whatsapp);
  b.target = '_blank';
  b.rel = 'noopener';
});

document.getElementById('precio-envio').textContent = pesos(ENVIO);
dibujarFiltros();
dibujarProductos();
dibujarBolsa();
