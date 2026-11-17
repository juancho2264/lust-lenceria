// Configuración del catálogo.
//
// PLANILLA: link de la pestaña de productos publicada como CSV
// (Archivo → Compartir → Publicar en la Web → elegir la pestaña → "Valores separados por comas (.csv)").
// Si está vacío o la planilla no responde, se muestran los productos de data/productos-ejemplo.csv.
export const PLANILLA = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQzLOcUbBUEBv97PWVXJB_Ic7rVe4DNkwJrErivueO27XMZqwOiHSPlWNAbQeh1RkVeieWb2v_1tAXi/pub?gid=0&single=true&output=csv';
export const RESPALDO = 'data/productos-ejemplo.csv';

// PLANILLA_CONFIG: link de la pestaña "Configuración" publicada como CSV (opcional).
// Ahí Mica cambia el WhatsApp, el envío, el descuento por transferencia y los avisos de la cinta.
export const PLANILLA_CONFIG = '';

// Valores por defecto (se usan si la pestaña Configuración no está o le falta algo)
export const CONFIG_INICIAL = {
  whatsapp: '', // con código de país, sin + ni espacios. Ej.: '5491123456789'
  instagram: 'https://www.instagram.com/lust_lenceria2/',
  envio: 6000,
  envioGratisDesde: 0, // 0 = sin envío gratis
  descuentoTransferencia: 0, // % de descuento pagando por transferencia (0 = sin descuento)
  avisos: ['Envíos a todo el país', 'Retiro gratis en Merlo', 'Bikinis desde $10.000', 'Nuevos ingresos todas las semanas'],
};
