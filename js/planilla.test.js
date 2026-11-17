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
