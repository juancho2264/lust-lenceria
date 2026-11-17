// Catálogo: para agregar, sacar o cambiar precios se edita solo este archivo.
// "foto": ruta de la imagen (ej. 'img/bikini-vichy.jpg'). Si está vacía se muestra un fondo de color.
// "agotado": true lo muestra como sin stock.

export const ENVIO = 6000;

export const CATEGORIAS = ['Todo', 'Conjuntos', 'Bikinis', 'Corpiños', 'Bombachas', 'Bodys'];

export const PRODUCTOS = [
  { id: 'conj-encaje-negro', nombre: 'Conjunto Encaje Noir', categoria: 'Conjuntos', precio: 18500, talles: ['S', 'M', 'L'], colores: { Negro: '#1f1a1c', Bordó: '#7a1f35' }, etiqueta: 'Más vendido', foto: '' },
  { id: 'bikini-vichy', nombre: 'Bikini Vichy', categoria: 'Bikinis', precio: 10000, talles: ['S', 'M', 'L'], colores: { Rosa: '#f4a7bd', Celeste: '#a9d4ec' }, etiqueta: 'Nuevo', foto: '' },
  { id: 'conj-rayado', nombre: 'Conjunto Rayas', categoria: 'Conjuntos', precio: 16000, talles: ['S', 'M', 'L', 'XL'], colores: { 'Azul marino': '#1e2a44' }, foto: '' },
  { id: 'body-encaje', nombre: 'Body Encaje Rosé', categoria: 'Bodys', precio: 21000, talles: ['S', 'M', 'L'], colores: { Rosa: '#efb6c4', Negro: '#1f1a1c' }, etiqueta: 'Nuevo', foto: '' },
  { id: 'corpino-flores', nombre: 'Corpiño Flores', categoria: 'Corpiños', precio: 12500, talles: ['85', '90', '95', '100'], colores: { Celeste: '#bcdcf2', Blanco: '#f7f3f1' }, foto: '' },
  { id: 'bikini-triangulo', nombre: 'Bikini Triángulo', categoria: 'Bikinis', precio: 11000, talles: ['S', 'M', 'L'], colores: { Negro: '#1f1a1c', Rojo: '#d23a4a' }, foto: '' },
  { id: 'bombacha-floreada', nombre: 'Bombacha Floreada', categoria: 'Bombachas', precio: 4500, talles: ['S', 'M', 'L', 'XL'], colores: { Lila: '#cdb6ea', Rosa: '#f4a7bd' }, etiqueta: 'Básico', foto: '' },
  { id: 'conj-tul', nombre: 'Conjunto Tul Lila', categoria: 'Conjuntos', precio: 17500, talles: ['S', 'M', 'L'], colores: { Lila: '#cdb6ea' }, agotado: true, foto: '' },
  { id: 'corpino-push', nombre: 'Corpiño Push Up', categoria: 'Corpiños', precio: 14000, talles: ['85', '90', '95'], colores: { Negro: '#1f1a1c', Nude: '#e7c3ad' }, foto: '' },
  { id: 'pack-bombachas', nombre: 'Pack x3 Bombachas Algodón', categoria: 'Bombachas', precio: 11000, talles: ['S', 'M', 'L', 'XL'], colores: { Surtido: 'linear-gradient(135deg,#f4a7bd,#bcdcf2,#cdb6ea)' }, etiqueta: 'Ahorrá', foto: '' },
];
