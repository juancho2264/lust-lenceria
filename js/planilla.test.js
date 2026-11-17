// Tests con el runner que trae Node:  node --test js/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { categoriasDe, leerCSV, leerPrecio, linkFoto, productosDesdeCSV } from './planilla.js';

const ENCABEZADO = 'Código,Nombre,Categoría,Precio,Talles,Colores,Foto,Etiqueta,Agotado,Mostrar';

test('lee celdas con comas y comillas', () => {
  assert.deepEqual(leerCSV('a,"b, c","d ""x"""\n1,2,3'), [['a', 'b, c', 'd "x"'], ['1', '2', '3']]);
});

test('entiende precios escritos de distintas formas', () => {
  assert.equal(leerPrecio('$18.500'), 18500);
  assert.equal(leerPrecio('18500'), 18500);
  assert.equal(leerPrecio('18.500,00'), 18500);
  assert.equal(leerPrecio('consultar'), null);
  assert.equal(leerPrecio(''), null);
});

test('convierte links de Google Drive y rechaza links peligrosos', () => {
  assert.equal(linkFoto('https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view?usp=sharing'),
    'https://drive.google.com/thumbnail?id=1AbCdEfGhIjKlMnOpQrStUv&sz=w900');
  assert.equal(linkFoto('https://i.imgur.com/foto.jpg'), 'https://i.imgur.com/foto.jpg');
  assert.equal(linkFoto('javascript:alert(1)'), '');
});

test('arma los productos y separa talles y colores', () => {
  const { productos, avisos } = productosDesdeCSV(`${ENCABEZADO}\nLU-01,Conjunto Noir,Conjuntos,$18.500,"S, M, L","Negro, Bordó",,Nuevo,no,sí`);
  assert.deepEqual(avisos, []);
  assert.equal(productos[0].codigo, 'LU-01');
  assert.deepEqual(productos[0].talles, ['S', 'M', 'L']);
  assert.deepEqual(Object.keys(productos[0].colores), ['Negro', 'Bordó']);
  assert.equal(productos[0].colores['Bordó'], '#7a1f35');
  assert.equal(productos[0].agotado, false);
});

test('"Mostrar: no" oculta el producto sin borrarlo', () => {
  const { productos } = productosDesdeCSV(`${ENCABEZADO}\nLU-01,Body,Bodys,20000,S,Rosa,,,,no`);
  assert.equal(productos.length, 0);
});

test('una fila con errores no rompe el catálogo y se informa', () => {
  const { productos, avisos } = productosDesdeCSV(`${ENCABEZADO}\nLU-01,Body,Bodys,consultar,S,,,,,\nLU-02,Bikini,Bikinis,10000,M,,,,,`);
  assert.equal(productos.length, 1);
  assert.match(avisos[0], /Fila 2 \(Body\): el precio/);
});

test('las columnas no importan en mayúsculas ni con tildes, y faltar una obligatoria avisa', () => {
  assert.equal(productosDesdeCSV('NOMBRE,PRECIO,TALLES\nBikini,10000,S').productos.length, 1);
  assert.match(productosDesdeCSV('Nombre,Precio\nBikini,10000').avisos[0], /talles/);
});

test('códigos repetidos no se pisan y las categorías salen en orden', () => {
  const { productos } = productosDesdeCSV(`${ENCABEZADO}\nA,Uno,Bikinis,1,S,,,,,\nA,Dos,Bodys,1,S,,,,,`);
  assert.notEqual(productos[0].id, productos[1].id);
  assert.deepEqual(categoriasDe(productos), ['Todo', 'Bikinis', 'Bodys']);
});

test('varias fotos, descripción, talles agotados y precio anterior', () => {
  const csv = 'Nombre,Precio,Precio anterior,Talles,Talles agotados,Fotos,Descripción\n'
    + 'Body,14900,18500,"S, M, L",M,"https://a.com/1.jpg https://a.com/2.jpg",Tela suave\n'
    + 'Bikini,10000,9000,"S, M","S, M",,';
  const { productos: [body, bikini] } = productosDesdeCSV(csv);
  assert.deepEqual(body.fotos, ['https://a.com/1.jpg', 'https://a.com/2.jpg']);
  assert.deepEqual(body.tallesAgotados, ['M']);
  assert.equal(body.precioAnterior, 18500);
  assert.equal(body.descripcion, 'Tela suave');
  assert.equal(bikini.precioAnterior, null, 'un precio anterior más bajo no es oferta');
  assert.equal(bikini.agotado, true, 'sin talles disponibles queda agotado');
});

test('ordena etiquetados primero y agotados al final; busca sin tildes', async () => {
  const { ordenar, buscar } = await import('./planilla.js');
  const lista = [
    { nombre: 'A', etiqueta: '', agotado: false }, { nombre: 'B', etiqueta: '', agotado: true },
    { nombre: 'C', etiqueta: 'Nuevo', agotado: false },
  ];
  assert.deepEqual(ordenar(lista).map((p) => p.nombre), ['C', 'A', 'B']);
  const { productos } = productosDesdeCSV('Nombre,Precio,Talles,Colores\nCorpiño Flores,1,S,Celeste\nBody,1,S,Negro');
  assert.equal(buscar(productos, 'corpino celeste').length, 1);
  assert.equal(buscar(productos, '').length, 2);
});

test('la configuración solo acepta valores válidos', async () => {
  const { configDesdeCSV } = await import('./planilla.js');
  const base = { whatsapp: '', envio: 6000, envioGratisDesde: 0, descuentoTransferencia: 0, avisos: ['x'] };
  const c = configDesdeCSV('Clave,Valor\nWhatsApp,+54 9 11 2345-6789\nEnvío,$7.000\nEnvío gratis desde,50000\nDescuento transferencia,10%\nAvisos,Uno | Dos', base);
  assert.equal(c.whatsapp, '5491123456789');
  assert.equal(c.envio, 7000);
  assert.equal(c.envioGratisDesde, 50000);
  assert.equal(c.descuentoTransferencia, 10);
  assert.deepEqual(c.avisos, ['Uno', 'Dos']);
  const mala = configDesdeCSV('WhatsApp,llamame\nDescuento transferencia,90', base);
  assert.equal(mala.whatsapp, '');
  assert.equal(mala.descuentoTransferencia, 0);
});

test('fotos de portada desde Configuración (máximo 2, solo links válidos)', async () => {
  const { configDesdeCSV } = await import('./planilla.js');
  const c = configDesdeCSV('Fotos portada,"https://drive.google.com/file/d/1-j-eJH_hHh41aQtZ74C1J1zvk6srJ2DE/view, javascript:x, https://a.com/2.jpg, https://a.com/3.jpg"', { fotosPortada: [] });
  assert.deepEqual(c.fotosPortada, ['https://drive.google.com/thumbnail?id=1-j-eJH_hHh41aQtZ74C1J1zvk6srJ2DE&sz=w900', 'https://a.com/2.jpg']);
  assert.deepEqual(configDesdeCSV('Fotos portada,', { fotosPortada: ['x'] }).fotosPortada, ['x'], 'vacío deja las de siempre');
});

test('colores escritos de muchas formas encuentran su tono', async () => {
  const { tonoDe } = await import('./planilla.js');
  assert.equal(tonoDe('Verde lima'), '#b5d334');
  assert.equal(tonoDe('VERDE LIMA'), '#b5d334');
  assert.equal(tonoDe('Bordó'), tonoDe('bordo'));
  assert.equal(tonoDe('Negros'), '#1f1a1c', 'plural');
  assert.equal(tonoDe('Verde pino'), '#5fae7e', 'si no conoce el tono exacto usa el color base');
  assert.equal(tonoDe('Rosa chicle flúo'), '#ff6fa8');
  assert.equal(tonoDe('Xyz'), '#e9c6d0', 'desconocido = rosa neutro');
});

test('la tabla de talles acepta cualquier columna y se limita', async () => {
  const { tablaDesdeCSV } = await import('./planilla.js');
  const t = tablaDesdeCSV('Talle,Busto,Cintura,Cadera\nS,80-85,62-66,88-92\nM,85-90,66-70,92-96\n,,,');
  assert.deepEqual(t.encabezado, ['Talle', 'Busto', 'Cintura', 'Cadera']);
  assert.equal(t.filas.length, 2, 'las filas vacías no cuentan');
  assert.equal(tablaDesdeCSV('Talle,Busto'), null, 'solo títulos = sin tabla');
});

test('preguntas: saltea las incompletas', async () => {
  const { preguntasDesdeCSV } = await import('./planilla.js');
  const p = preguntasDesdeCSV('Pregunta,Respuesta\n¿El envío es discreto?,"Sí, sin marca"\n¿Sin respuesta?,\n,Sin pregunta');
  assert.deepEqual(p, [{ pregunta: '¿El envío es discreto?', respuesta: 'Sí, sin marca' }]);
});
