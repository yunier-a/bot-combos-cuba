const { Telegraf, Markup, session } = require('telegraf');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// ⚠️ REEMPLAZA AQUÍ TU TOKEN DE TELEGRAM
const bot = new Telegraf('8716309397:AAHO3DtPCWe4OSBjgx39EgP6rlqVF3FOj78');

// ⚠️ REEMPLAZA AQUÍ EL ID DE TU GRUPO DE ADMINISTRADORES (Ej: -1001234567890)
const ADMIN_CHAT_ID = '-1004266293162'; 

bot.use(session());

const TASAS = { USD: 1, RUB: 115, EUR: 0.95, CUP: 820, MLC: 1, USDT: 1 };

const PROVINCIAS = [
  'La Habana', 'Santiago de Cuba', 'Matanzas', 'Villa Clara', 
  'Holguín', 'Camagüey', 'Pinar del Río', 'Artemisa', 
  'Mayabeque', 'Cienfuegos', 'Sancti Spíritus', 'Ciego de Ávila', 
  'Las Tunas', 'Granma', 'Guantánamo', 'Isla de la Juventud'
];

const CATEGORIAS = {
  res: '🥩 Res y Carneros',
  cerdo: '🐖 Cerdo',
  arroz: '🍚 Arroz',
  granos: '🫘 Granos y Frijoles',
  aceite: '🌻 Aceites y Grasas',
  embutidos: '🌭 Embutidos y Chorizos',
  detergente: '🧼 Detergente y Aseo',
  galletas: '🍪 Galletas, Pastas y Aperitivos',
  leche_polvo: '🍼 Leche en Polvo',
  jugos: '🧃 Jugos, Refrescos y Néctares',
  leche_liq: '🥛 Leche Líquida y Sustitutos',
  cafe: '☕ Café',
  equipos: '🔦 Equipos Recargables',
  conservas: '🥫 Conservas y Enlatados'
};

const PRODUCTOS = {
  res_1: { id: 'res_1', cat: 'res', nombre: 'Picadillo de res GYC (250 g)', marca: 'GYC', precioBaseUSD: 2.45, imagen: './images/picadillo.jpg' },
  res_2: { id: 'res_2', cat: 'res', nombre: 'Picadillo de res GYC (400 g)', marca: 'GYC', precioBaseUSD: 3.40, imagen: './images/picadillo.jpg' },
  res_3: { id: 'res_3', cat: 'res', nombre: 'Carne troceada de res GYC (1 kg)', marca: 'GYC', precioBaseUSD: 11.80, imagen: './images/carne_res.jpg' },
  res_4: { id: 'res_4', cat: 'res', nombre: 'Hígado de res Super Yu (1 kg)', marca: 'Super Yu', precioBaseUSD: 10.25, imagen: './images/higado.jpg' },
  res_5: { id: 'res_5', cat: 'res', nombre: 'Bistec de hígado de res Super Yu (1 kg)', marca: 'Super Yu', precioBaseUSD: 10.30, imagen: './images/higado.jpg' },
  res_6: { id: 'res_6', cat: 'res', nombre: 'Hígado de res Super Yu (2 kg)', marca: 'Super Yu', precioBaseUSD: 19.50, imagen: './images/higado.jpg' },
  res_7: { id: 'res_7', cat: 'res', nombre: 'Carne de res de primera La Estelar (1 kg)', marca: 'La Estelar', precioBaseUSD: 22.30, imagen: './images/carne_res.jpg' },
  res_8: { id: 'res_8', cat: 'res', nombre: 'Picadillo mixto res y cerdo Super Yu (1 kg)', marca: 'Super Yu', precioBaseUSD: 13.25, imagen: './images/picadillo.jpg' },
  res_9: { id: 'res_9', cat: 'res', nombre: 'Picadillo mixto sazonado Bravo (1.2 kg)', marca: 'Bravo', precioBaseUSD: 8.55, imagen: './images/picadillo.jpg' },
  res_10: { id: 'res_10', cat: 'res', nombre: 'Picadillo condimentado c/ aceitunas Bravo (400 g)', marca: 'Bravo', precioBaseUSD: 3.10, imagen: './images/picadillo.jpg' },
  car_1: { id: 'car_1', cat: 'res', nombre: 'Costillas troceadas de carnero XLS (1.36 kg)', marca: 'XLS', precioBaseUSD: 12.20, imagen: './images/carne_res.jpg' },
  car_2: { id: 'car_2', cat: 'res', nombre: 'Pierna de carnero fresca XLS (2 kg)', marca: 'XLS', precioBaseUSD: 22.50, imagen: './images/carne_res.jpg' },
  car_3: { id: 'car_3', cat: 'res', nombre: 'Lomo de Carnero Lasqueado XLS (2 kg)', marca: 'XLS', precioBaseUSD: 24.20, imagen: './images/carne_res.jpg' },

  cer_1: { id: 'cer_1', cat: 'cerdo', nombre: 'Picadillo de cerdo Super Yu (1 kg)', marca: 'Super Yu', precioBaseUSD: 7.25, imagen: './images/cerdo.jpg' },
  cer_2: { id: 'cer_2', cat: 'cerdo', nombre: 'Lomo de cerdo en lonjas Y&D Ricos (1 kg)', marca: 'Y&D Ricos', precioBaseUSD: 15.50, imagen: './images/cerdo.jpg' },
  cer_3: { id: 'cer_3', cat: 'cerdo', nombre: 'Bistec de cerdo Y&D Ricos (1 kg)', marca: 'Y&D Ricos', precioBaseUSD: 14.65, imagen: './images/cerdo.jpg' },
  cer_4: { id: 'cer_4', cat: 'cerdo', nombre: 'Chuleta de cerdo con piel XLS (1 kg)', marca: 'XLS', precioBaseUSD: 15.65, imagen: './images/cerdo.jpg' },
  cer_5: { id: 'cer_5', cat: 'cerdo', nombre: 'Masas de cerdo Y&D Ricos (1 kg)', marca: 'Y&D Ricos', precioBaseUSD: 14.30, imagen: './images/cerdo.jpg' },
  ali_10: { id: 'ali_10', cat: 'cerdo', nombre: 'Croquetas de jamón YEYA (363 g)', marca: 'YEYA', precioBaseUSD: 6.30, imagen: './images/croquetas.jpg' },

  arr_1: { id: 'arr_1', cat: 'arroz', nombre: 'Arroz blanco grano extra largo El Rey (1 kg)', marca: 'El Rey del Arroz', precioBaseUSD: 2.20, imagen: './images/arroz.jpg' },
  arr_2: { id: 'arr_2', cat: 'arroz', nombre: 'Arroz blanco grano extra largo El Rey (Pack 10 x 1 kg)', marca: 'El Rey del Arroz', precioBaseUSD: 25.00, imagen: './images/arroz.jpg' },
  arr_3: { id: 'arr_3', cat: 'arroz', nombre: 'Arroz blanco grano extra largo El Rey (Pack 5 x 1 kg)', marca: 'El Rey del Arroz', precioBaseUSD: 12.60, imagen: './images/arroz.jpg' },
  arr_4: { id: 'arr_4', cat: 'arroz', nombre: 'Arroz blanco Alfinete (1 kg)', marca: 'Alfinete', precioBaseUSD: 2.30, imagen: './images/arroz.jpg' },
  arr_5: { id: 'arr_5', cat: 'arroz', nombre: 'Arroz tipo 1 Sebraz (1 kg)', marca: 'Sebraz', precioBaseUSD: 2.00, imagen: './images/arroz.jpg' },
  arr_6: { id: 'arr_6', cat: 'arroz', nombre: 'Arroz blanco grano largo Mr. Paco (2.5 kg)', marca: 'Mr. Paco', precioBaseUSD: 6.75, imagen: './images/arroz.jpg' },
  arr_7: { id: 'arr_7', cat: 'arroz', nombre: 'Arroz blanco grano largo Tatine (5 kg)', marca: 'Tatine', precioBaseUSD: 81.00, imagen: './images/arroz.jpg' },
  arr_8: { id: 'arr_8', cat: 'arroz', nombre: 'Arroz blanco grano largo Mr. Paco (5 kg)', marca: 'Mr. Paco', precioBaseUSD: 12.90, imagen: './images/arroz.jpg' },
  arr_9: { id: 'arr_9', cat: 'arroz', nombre: 'Arroz blanco grano largo Narvin N.V. (Saco 45 kg)', marca: 'Narvin', precioBaseUSD: 64.80, imagen: './images/arroz.jpg' },
  arr_10: { id: 'arr_10', cat: 'arroz', nombre: 'Arroz de grano largo 5% Tatine (Saco 25 kg)', marca: 'Tatine', precioBaseUSD: 54.25, imagen: './images/arroz.jpg' },
  arr_11: { id: 'arr_11', cat: 'arroz', nombre: 'Arroz de grano largo 5% Tatine (Pack 10 kg)', marca: 'Tatine', precioBaseUSD: 27.80, imagen: './images/arroz.jpg' },
  arr_12: { id: 'arr_12', cat: 'arroz', nombre: 'Arroz de grano largo 5% Tatine (Pack 15 kg)', marca: 'Tatine', precioBaseUSD: 41.70, imagen: './images/arroz.jpg' },
  arr_13: { id: 'arr_13', cat: 'arroz', nombre: 'Arroz de grano largo 5% Tatine (Pack 20 kg)', marca: 'Tatine', precioBaseUSD: 28.60, imagen: './images/arroz.jpg' },
  arr_14: { id: 'arr_14', cat: 'arroz', nombre: 'Arroz de grano largo Tatine (1.36 kg)', marca: 'Tatine', precioBaseUSD: 4.40, imagen: './images/arroz.jpg' },
  arr_15: { id: 'arr_15', cat: 'arroz', nombre: 'Arroz de grano largo Tatine (4.54 kg)', marca: 'Tatine', precioBaseUSD: 13.60, imagen: './images/arroz.jpg' },
  arr_16: { id: 'arr_16', cat: 'arroz', nombre: 'Arroz de grano largo 5% Tatine (5 kg)', marca: 'Tatine', precioBaseUSD: 14.75, imagen: './images/arroz.jpg' },
  arr_17: { id: 'arr_17', cat: 'arroz', nombre: 'Arroz blanco de grano largo y fino Saman (1 kg)', marca: 'Saman', precioBaseUSD: 2.90, imagen: './images/arroz.jpg' },
  arr_18: { id: 'arr_18', cat: 'arroz', nombre: 'Arroz blanco pulido tipo 1 Norte (1 kg)', marca: 'Norte', precioBaseUSD: 1.75, imagen: './images/arroz.jpg' },
  arr_19: { id: 'arr_19', cat: 'arroz', nombre: 'Arroz blanco grano largo Mr. Paco (1 kg)', marca: 'Mr. Paco', precioBaseUSD: 2.80, imagen: './images/arroz.jpg' },
  arr_20: { id: 'arr_20', cat: 'arroz', nombre: 'Arroz de grano largo Tatine (2 x 1.36 kg)', marca: 'Tatine', precioBaseUSD: 8.20, imagen: './images/arroz.jpg' },
  arr_21: { id: 'arr_21', cat: 'arroz', nombre: 'Arroz de grano largo Tatine (3 x 4.54 kg)', marca: 'Tatine', precioBaseUSD: 38.40, imagen: './images/arroz.jpg' },
  arr_22: { id: 'arr_22', cat: 'arroz', nombre: 'Arroz de grano largo Tatine (2 x 4.54 kg)', marca: 'Tatine', precioBaseUSD: 25.75, imagen: './images/arroz.jpg' },
  arr_23: { id: 'arr_23', cat: 'arroz', nombre: 'Arroz blanco grano largo Nelson Wendt (1 kg)', marca: 'Nelson Wendt', precioBaseUSD: 2.35, imagen: './images/arroz.jpg' },
  arr_24: { id: 'arr_24', cat: 'arroz', nombre: 'Arroz blanco grano largo y fino Tía Amélia (1 kg)', marca: 'Tía Amélia', precioBaseUSD: 2.00, imagen: './images/arroz.jpg' },
  arr_25: { id: 'arr_25', cat: 'arroz', nombre: 'Arroz Blanco Super Yu (10 Kg)', marca: 'Super Yu', precioBaseUSD: 23.35, imagen: './images/arroz.jpg' },
  arr_26: { id: 'arr_26', cat: 'arroz', nombre: 'Arroz blanco pulido tipo 1 Norte (500 g)', marca: 'Norte', precioBaseUSD: 1.10, imagen: './images/arroz.jpg' },
  ali_4: { id: 'ali_4', cat: 'arroz', nombre: 'Azúcar blanca granulada YEYA (5 kg)', marca: 'YEYA', precioBaseUSD: 12.35, imagen: './images/azucar.jpg' },
  ali_7: { id: 'ali_7', cat: 'arroz', nombre: 'Azúcar blanca granulada YEYA (1 kg)', marca: 'YEYA', precioBaseUSD: 2.70, imagen: './images/azucar.jpg' },
  ali_24: { id: 'ali_24', cat: 'arroz', nombre: 'Arroz blanco de grano largo YEYA (1 kg)', marca: 'YEYA', precioBaseUSD: 2.65, imagen: './images/arroz.jpg' },
  ali_33: { id: 'ali_33', cat: 'arroz', nombre: 'Arroz blanco grano largo tailandés YEYA (1 kg)', marca: 'YEYA', precioBaseUSD: 2.90, imagen: './images/arroz.jpg' },

  gra_1: { id: 'gra_1', cat: 'granos', nombre: 'Frijol blanco Penelas (500 g)', marca: 'Penelas', precioBaseUSD: 3.65, imagen: './images/granos.jpg' },
  gra_2: { id: 'gra_2', cat: 'granos', nombre: 'Arvejas verdes partidas / chícharos (500 g)', marca: 'Los Granos', precioBaseUSD: 2.30, imagen: './images/granos.jpg' },
  gra_3: { id: 'gra_3', cat: 'granos', nombre: 'Garbanzos Ibéricos Iberia (340 g)', marca: 'Iberia', precioBaseUSD: 2.65, imagen: './images/granos.jpg' },
  gra_4: { id: 'gra_4', cat: 'granos', nombre: 'Frijoles negros Iberia (340 g)', marca: 'Iberia', precioBaseUSD: 2.45, imagen: './images/granos.jpg' },
  gra_5: { id: 'gra_5', cat: 'granos', nombre: 'Chícharos verdes partidos Iberia (340 g)', marca: 'Iberia', precioBaseUSD: 2.45, imagen: './images/granos.jpg' },
  gra_6: { id: 'gra_6', cat: 'granos', nombre: 'Chícharos amarillos partidos Iberia (340 g)', marca: 'Iberia', precioBaseUSD: 2.45, imagen: './images/granos.jpg' },

  ace_1: { id: 'ace_1', cat: 'aceite', nombre: 'Aceite de soya Corall (900 ml)', marca: 'Corall', precioBaseUSD: 6.05, imagen: './images/aceite.jpg' },
  ace_2: { id: 'ace_2', cat: 'aceite', nombre: 'Aceite refinado de girasol Vima Foods (700 ml)', marca: 'Vima Foods', precioBaseUSD: 4.95, imagen: './images/aceite.jpg' },
  ace_3: { id: 'ace_3', cat: 'aceite', nombre: 'Aceite de oliva El Caenas (1 L)', marca: 'El Caenas', precioBaseUSD: 18.10, imagen: './images/aceite.jpg' },
  ace_4: { id: 'ace_4', cat: 'aceite', nombre: 'Aceite de soya puro Hysa (1 L)', marca: 'Hysa', precioBaseUSD: 6.25, imagen: './images/aceite.jpg' },
  ace_5: { id: 'ace_5', cat: 'aceite', nombre: 'Aceite de oliva virgen extra ABRIL (1 L)', marca: 'ABRIL', precioBaseUSD: 15.55, imagen: './images/aceite.jpg' },
  ace_6: { id: 'ace_6', cat: 'aceite', nombre: 'Aceite de soya refinado Rubí (900 ml)', marca: 'Rubí', precioBaseUSD: 5.60, imagen: './images/aceite.jpg' },
  ace_7: { id: 'ace_7', cat: 'aceite', nombre: 'Caja de aceite de soya refinado Rubí (12 x 900 ml)', marca: 'Rubí', precioBaseUSD: 63.50, imagen: './images/aceite.jpg' },
  ace_8: { id: 'ace_8', cat: 'aceite', nombre: 'Aceite de oliva extra virgen Marmarabirlik (500 ml)', marca: 'Marmarabirlik', precioBaseUSD: 10.45, imagen: './images/aceite.jpg' },
  ace_9: { id: 'ace_9', cat: 'aceite', nombre: 'Aceite vegetal Alberto (887 ml)', marca: 'Alberto', precioBaseUSD: 6.00, imagen: './images/aceite.jpg' },

  emb_1: { id: 'emb_1', cat: 'embutidos', nombre: 'Chorizo curado tipo vela YEYA (454 g)', marca: 'YEYA', precioBaseUSD: 20.55, imagen: './images/embutidos.jpg' },
  emb_2: { id: 'emb_2', cat: 'embutidos', nombre: 'Masa de chorizo Bravo (400 g)', marca: 'Bravo', precioBaseUSD: 3.35, imagen: './images/embutidos.jpg' },
  emb_3: { id: 'emb_3', cat: 'embutidos', nombre: 'Chorizo tipo vela Y&D Ricos (500 g)', marca: 'Y&D Ricos', precioBaseUSD: 10.30, imagen: './images/embutidos.jpg' },

  det_1: { id: 'det_1', cat: 'detergente', nombre: 'Detergente en polvo multiusos Yamy (900 g)', marca: 'Yamy', precioBaseUSD: 3.25, imagen: './images/detergente.jpg' },
  det_2: { id: 'det_2', cat: 'detergente', nombre: 'Detergente en polvo aroma limón NT (500 g)', marca: 'NT', precioBaseUSD: 2.20, imagen: './images/detergente.jpg' },
  det_3: { id: 'det_3', cat: 'detergente', nombre: 'Detergente STB Rosa (1 bolsa)', marca: 'STB CAPS', precioBaseUSD: 3.05, imagen: './images/detergente.jpg' },
  det_4: { id: 'det_4', cat: 'detergente', nombre: 'Detergente STB Rosa (Pack x2 bolsas)', marca: 'STB', precioBaseUSD: 5.65, imagen: './images/detergente.jpg' },
  det_5: { id: 'det_5', cat: 'detergente', nombre: 'Detergente STB Rosa (Pack x3 bolsas)', marca: 'STB', precioBaseUSD: 8.40, imagen: './images/detergente.jpg' },
  det_6: { id: 'det_6', cat: 'detergente', nombre: 'Detergente STB Rosa (Pack x4 bolsas)', marca: 'STB', precioBaseUSD: 11.15, imagen: './images/detergente.jpg' },
  det_7: { id: 'det_7', cat: 'detergente', nombre: 'Detergente STB Rosa (Pack x5 bolsas)', marca: 'STB', precioBaseUSD: 13.90, imagen: './images/detergente.jpg' },
  det_8: { id: 'det_8', cat: 'detergente', nombre: 'Detergente STB Azul (1 bolsa)', marca: 'STB CAPS', precioBaseUSD: 3.05, imagen: './images/detergente.jpg' },
  det_9: { id: 'det_9', cat: 'detergente', nombre: 'Detergente STB Azul (Pack x2 bolsas)', marca: 'STB', precioBaseUSD: 5.65, imagen: './images/detergente.jpg' },
  det_10: { id: 'det_10', cat: 'detergente', nombre: 'Detergente STB Azul (Pack x3 bolsas)', marca: 'STB', precioBaseUSD: 8.40, imagen: './images/detergente.jpg' },
  det_11: { id: 'det_11', cat: 'detergente', nombre: 'Detergente STB Azul (Pack x4 bolsas)', marca: 'STB', precioBaseUSD: 11.15, imagen: './images/detergente.jpg' },
  det_12: { id: 'det_12', cat: 'detergente', nombre: 'Detergente STB Azul (Pack x5 bolsas)', marca: 'STB', precioBaseUSD: 13.90, imagen: './images/detergente.jpg' },
  det_13: { id: 'det_13', cat: 'detergente', nombre: 'Detergente STB Verde (Pack x2 bolsas)', marca: 'STB', precioBaseUSD: 5.65, imagen: './images/detergente.jpg' },
  det_14: { id: 'det_14', cat: 'detergente', nombre: 'Detergente STB Verde (Pack x3 bolsas)', marca: 'STB', precioBaseUSD: 8.40, imagen: './images/detergente.jpg' },
  det_15: { id: 'det_15', cat: 'detergente', nombre: 'Detergente STB Verde (Pack x4 bolsas)', marca: 'STB', precioBaseUSD: 11.15, imagen: './images/detergente.jpg' },
  det_16: { id: 'det_16', cat: 'detergente', nombre: 'Detergente STB Verde (Pack x5 bolsas)', marca: 'STB', precioBaseUSD: 13.90, imagen: './images/detergente.jpg' },
  det_17: { id: 'det_17', cat: 'detergente', nombre: 'Detergente Lavane Aroma Floral (1 bolsa)', marca: 'Lavane', precioBaseUSD: 2.60, imagen: './images/detergente.jpg' },
  det_18: { id: 'det_18', cat: 'detergente', nombre: 'Detergente Lavane Aroma Floral (Pack x3 bolsas)', marca: 'Lavane', precioBaseUSD: 7.05, imagen: './images/detergente.jpg' },
  det_19: { id: 'det_19', cat: 'detergente', nombre: 'Detergente Lavane Aroma Floral (Pack x6 bolsas)', marca: 'Lavane', precioBaseUSD: 13.90, imagen: './images/detergente.jpg' },
  det_20: { id: 'det_20', cat: 'detergente', nombre: 'Detergente Defá Floral Naranja (1 bolsa)', marca: 'Defá', precioBaseUSD: 4.55, imagen: './images/detergente.jpg' },
  det_21: { id: 'det_21', cat: 'detergente', nombre: 'Detergente Defá Floral Naranja (Pack x2 bolsas)', marca: 'Defá', precioBaseUSD: 8.55, imagen: './images/detergente.jpg' },
  det_22: { id: 'det_22', cat: 'detergente', nombre: 'Detergente Defá Floral Naranja (Pack x3 bolsas)', marca: 'Defá', precioBaseUSD: 12.70, imagen: './images/detergente.jpg' },
  det_23: { id: 'det_23', cat: 'detergente', nombre: 'Detergente Defá Floral Naranja (Pack x4 bolsas)', marca: 'Defá', precioBaseUSD: 16.90, imagen: './images/detergente.jpg' },
  det_24: { id: 'det_24', cat: 'detergente', nombre: 'Detergente Defá Floral Naranja (Pack x5 bolsas)', marca: 'Defá', precioBaseUSD: 21.05, imagen: './images/detergente.jpg' },
  det_25: { id: 'det_25', cat: 'detergente', nombre: 'Detergente Defá Lavanda Morado (1 bolsa)', marca: 'Defá', precioBaseUSD: 4.55, imagen: './images/detergente.jpg' },
  det_26: { id: 'det_26', cat: 'detergente', nombre: 'Detergente Defá Lavanda Morado (Pack x2 bolsas)', marca: 'Defá', precioBaseUSD: 8.55, imagen: './images/detergente.jpg' },
  det_27: { id: 'det_27', cat: 'detergente', nombre: 'Detergente Defá Lavanda Morado (Pack x3 bolsas)', marca: 'Defá', precioBaseUSD: 12.70, imagen: './images/detergente.jpg' },
  det_28: { id: 'det_28', cat: 'detergente', nombre: 'Detergente Defá Lavanda Morado (Pack x4 bolsas)', marca: 'Defá', precioBaseUSD: 16.90, imagen: './images/detergente.jpg' },
  det_29: { id: 'det_29', cat: 'detergente', nombre: 'Detergente Defá Lavanda Morado (Pack x5 bolsas)', marca: 'Defá', precioBaseUSD: 21.05, imagen: './images/detergente.jpg' },
  det_30: { id: 'det_30', cat: 'detergente', nombre: 'Detergente en polvo Omo (450 g)', marca: 'OMO', precioBaseUSD: 4.95, imagen: './images/detergente.jpg' },
  det_31: { id: 'det_31', cat: 'detergente', nombre: 'Detergente STB Verde (1 bolsa)', marca: 'STB', precioBaseUSD: 3.05, imagen: './images/detergente.jpg' },
  det_32: { id: 'det_32', cat: 'detergente', nombre: 'Detergente Lavane Aroma Floral (Pack x4 bolsas)', marca: 'Lavane', precioBaseUSD: 9.30, imagen: './images/detergente.jpg' },
  det_33: { id: 'det_33', cat: 'detergente', nombre: 'Detergente Lavane Aroma Floral (Pack x5 bolsas)', marca: 'Lavane', precioBaseUSD: 11.60, imagen: './images/detergente.jpg' },
  det_34: { id: 'det_34', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (250 g)', marca: 'YEYA', precioBaseUSD: 0.85, imagen: './images/detergente.jpg' },
  det_35: { id: 'det_35', cat: 'detergente', nombre: 'Detergente YEYA Limón (250 g)', marca: 'YEYA', precioBaseUSD: 0.85, imagen: './images/detergente.jpg' },
  det_36: { id: 'det_36', cat: 'detergente', nombre: 'Detergente YEYA Flores (250 g)', marca: 'YEYA', precioBaseUSD: 0.85, imagen: './images/detergente.jpg' },
  det_37: { id: 'det_37', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (1 kg)', marca: 'YEYA', precioBaseUSD: 2.90, imagen: './images/detergente.jpg' },
  det_38: { id: 'det_38', cat: 'detergente', nombre: 'Detergente YEYA Flores (1 kg)', marca: 'YEYA', precioBaseUSD: 2.90, imagen: './images/detergente.jpg' },
  det_39: { id: 'det_39', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (Saco 5 kg)', marca: 'YEYA', precioBaseUSD: 14.60, imagen: './images/detergente.jpg' },
  det_40: { id: 'det_40', cat: 'detergente', nombre: 'Detergente YEYA Limón (Saco 5 kg)', marca: 'YEYA', precioBaseUSD: 14.60, imagen: './images/detergente.jpg' },
  det_41: { id: 'det_41', cat: 'detergente', nombre: 'Detergente YEYA Flores (Saco 5 kg)', marca: 'YEYA', precioBaseUSD: 14.60, imagen: './images/detergente.jpg' },
  det_42: { id: 'det_42', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (Pack 10 x 250 g)', marca: 'YEYA', precioBaseUSD: 6.80, imagen: './images/detergente.jpg' },
  det_43: { id: 'det_43', cat: 'detergente', nombre: 'Detergente YEYA Limón (Pack 10 x 250 g)', marca: 'YEYA', precioBaseUSD: 6.80, imagen: './images/detergente.jpg' },
  det_44: { id: 'det_44', cat: 'detergente', nombre: 'Detergente YEYA Flores (Pack 10 x 250 g)', marca: 'YEYA', precioBaseUSD: 6.80, imagen: './images/detergente.jpg' },
  det_45: { id: 'det_45', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (Pack 30 x 250 g)', marca: 'YEYA', precioBaseUSD: 19.80, imagen: './images/detergente.jpg' },
  det_46: { id: 'det_46', cat: 'detergente', nombre: 'Detergente YEYA Limón (Pack 30 x 250 g)', marca: 'YEYA', precioBaseUSD: 19.80, imagen: './images/detergente.jpg' },
  det_47: { id: 'det_47', cat: 'detergente', nombre: 'Detergente YEYA Flores (Pack 30 x 250 g)', marca: 'YEYA', precioBaseUSD: 19.80, imagen: './images/detergente.jpg' },
  det_48: { id: 'det_48', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (Pack 3 x 500 g)', marca: 'YEYA', precioBaseUSD: 4.10, imagen: './images/detergente.jpg' },
  det_49: { id: 'det_49', cat: 'detergente', nombre: 'Detergente YEYA Limón (Pack 3 x 500 g)', marca: 'YEYA', precioBaseUSD: 4.10, imagen: './images/detergente.jpg' },
  det_50: { id: 'det_50', cat: 'detergente', nombre: 'Detergente YEYA Flores (Pack 3 x 500 g)', marca: 'YEYA', precioBaseUSD: 4.10, imagen: './images/detergente.jpg' },
  det_51: { id: 'det_51', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (Pack 5 x 500 g)', marca: 'YEYA', precioBaseUSD: 6.65, imagen: './images/detergente.jpg' },
  det_52: { id: 'det_52', cat: 'detergente', nombre: 'Detergente YEYA Limón (Pack 5 x 500 g)', marca: 'YEYA', precioBaseUSD: 6.65, imagen: './images/detergente.jpg' },
  det_53: { id: 'det_53', cat: 'detergente', nombre: 'Detergente YEYA Flores (Pack 5 x 500 g)', marca: 'YEYA', precioBaseUSD: 6.65, imagen: './images/detergente.jpg' },
  det_54: { id: 'det_54', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (Pack 10 x 500 g)', marca: 'YEYA', precioBaseUSD: 12.95, imagen: './images/detergente.jpg' },
  det_55: { id: 'det_55', cat: 'detergente', nombre: 'Detergente YEYA Limón (Pack 10 x 500 g)', marca: 'YEYA', precioBaseUSD: 12.95, imagen: './images/detergente.jpg' },
  det_56: { id: 'det_56', cat: 'detergente', nombre: 'Detergente YEYA Flores (Pack 10 x 500 g)', marca: 'YEYA', precioBaseUSD: 12.95, imagen: './images/detergente.jpg' },
  det_57: { id: 'det_57', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (Pack 15 x 500 g)', marca: 'YEYA', precioBaseUSD: 19.15, imagen: './images/detergente.jpg' },
  det_58: { id: 'det_58', cat: 'detergente', nombre: 'Detergente YEYA Limón (Pack 15 x 500 g)', marca: 'YEYA', precioBaseUSD: 19.15, imagen: './images/detergente.jpg' },
  det_59: { id: 'det_59', cat: 'detergente', nombre: 'Detergente YEYA Flores (Pack 15 x 500 g)', marca: 'YEYA', precioBaseUSD: 19.15, imagen: './images/detergente.jpg' },
  det_60: { id: 'det_60', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (Pack 20 x 500 g)', marca: 'YEYA', precioBaseUSD: 25.25, imagen: './images/detergente.jpg' },
  det_61: { id: 'det_61', cat: 'detergente', nombre: 'Detergente YEYA Limón (Pack 20 x 500 g)', marca: 'YEYA', precioBaseUSD: 25.25, imagen: './images/detergente.jpg' },
  det_62: { id: 'det_62', cat: 'detergente', nombre: 'Detergente YEYA Flores (Pack 20 x 500 g)', marca: 'YEYA', precioBaseUSD: 25.25, imagen: './images/detergente.jpg' },
  det_63: { id: 'det_63', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (Pack 3 x 1 kg)', marca: 'YEYA', precioBaseUSD: 7.95, imagen: './images/detergente.jpg' },
  det_64: { id: 'det_64', cat: 'detergente', nombre: 'Detergente YEYA Limón (Pack 3 x 1 kg)', marca: 'YEYA', precioBaseUSD: 7.95, imagen: './images/detergente.jpg' },
  det_65: { id: 'det_65', cat: 'detergente', nombre: 'Detergente YEYA Flores (Pack 3 x 1 kg)', marca: 'YEYA', precioBaseUSD: 7.95, imagen: './images/detergente.jpg' },
  det_66: { id: 'det_66', cat: 'detergente', nombre: 'Detergente YEYA Limón (Pack 5 x 1 kg)', marca: 'YEYA', precioBaseUSD: 13.05, imagen: './images/detergente.jpg' },
  det_67: { id: 'det_67', cat: 'detergente', nombre: 'Detergente YEYA Lavanda (Pack 3 sacos x 5 kg)', marca: 'YEYA', precioBaseUSD: 41.25, imagen: './images/detergente.jpg' },
  det_68: { id: 'det_68', cat: 'detergente', nombre: 'Detergente YEYA Limón (Pack 3 sacos x 5 kg)', marca: 'YEYA', precioBaseUSD: 41.25, imagen: './images/detergente.jpg' },
  det_69: { id: 'det_69', cat: 'detergente', nombre: 'Detergente YEYA Flores (Pack 3 sacos x 5 kg)', marca: 'YEYA', precioBaseUSD: 41.25, imagen: './images/detergente.jpg' },
  ase_1: { id: 'ase_1', cat: 'detergente', nombre: 'Suavizante para ropa rosa YEYA (1 L)', marca: 'YEYA', precioBaseUSD: 3.10, imagen: './images/aseo.jpg' },
  ase_2: { id: 'ase_2', cat: 'detergente', nombre: 'Servilletas YEYA (Paquete de 100 u)', marca: 'YEYA', precioBaseUSD: 1.60, imagen: './images/aseo.jpg' },
  ase_3: { id: 'ase_3', cat: 'detergente', nombre: 'Jabón de lavar aroma floral YEYA (250 g)', marca: 'YEYA', precioBaseUSD: 1.50, imagen: './images/aseo.jpg' },
  ase_4: { id: 'ase_4', cat: 'detergente', nombre: 'Frazada de piso YEYA (60 x 80 cm)', marca: 'YEYA', precioBaseUSD: 3.30, imagen: './images/aseo.jpg' },
  ase_5: { id: 'ase_5', cat: 'detergente', nombre: 'Toallas íntimas YEYA (Pack 8 u)', marca: 'YEYA', precioBaseUSD: 1.20, imagen: './images/aseo.jpg' },
  det_70: { id: 'det_70', cat: 'detergente', nombre: 'Detergente en polvo aroma limón YEYA (1 kg)', marca: 'YEYA', precioBaseUSD: 2.95, imagen: './images/detergente.jpg' },
  det_71: { id: 'det_71', cat: 'detergente', nombre: 'Suavizante para ropa rosa YEYA (1 L)', marca: 'YEYA', precioBaseUSD: 3.10, imagen: './images/aseo.jpg' },

  gal_1: { id: 'gal_1', cat: 'galletas', nombre: 'Papas fritas crujientes Original YEYA (160 g)', marca: 'YEYA', precioBaseUSD: 3.60, imagen: './images/galletas.jpg' },
  gal_2: { id: 'gal_2', cat: 'galletas', nombre: 'Papas fritas crujientes Queso YEYA (160 g)', marca: 'YEYA', precioBaseUSD: 3.60, imagen: './images/galletas.jpg' },
  gal_3: { id: 'gal_3', cat: 'galletas', nombre: 'Papas fritas crujientes Barbacoa YEYA (160 g)', marca: 'YEYA', precioBaseUSD: 3.60, imagen: './images/galletas.jpg' },
  gal_4: { id: 'gal_4', cat: 'galletas', nombre: 'Galletas saladitas Iberia (210 g)', marca: 'Iberia', precioBaseUSD: 3.60, imagen: './images/galletas.jpg' },
  gal_5: { id: 'gal_5', cat: 'galletas', nombre: 'Galletas de soda Aviva (30 g)', marca: 'Aviva', precioBaseUSD: 0.75, imagen: './images/galletas.jpg' },
  gal_6: { id: 'gal_6', cat: 'galletas', nombre: 'Galletas de soda Aviva (540 g)', marca: 'Aviva', precioBaseUSD: 10.55, imagen: './images/galletas.jpg' },
  gal_7: { id: 'gal_7', cat: 'galletas', nombre: 'Galletas de soda Saltibicks Castellum (590 g)', marca: 'Castellum', precioBaseUSD: 6.15, imagen: './images/galletas.jpg' },
  ali_1: { id: 'ali_1', cat: 'galletas', nombre: 'Salsa de queso Gouda YEYA (460 g)', marca: 'YEYA', precioBaseUSD: 5.85, imagen: './images/galletas.jpg' },
  ali_2: { id: 'ali_2', cat: 'galletas', nombre: 'Paquete de sopa instantánea de fideos YEYA', marca: 'YEYA', precioBaseUSD: 0.75, imagen: './images/galletas.jpg' },
  ali_15: { id: 'ali_15', cat: 'galletas', nombre: 'Papas fritas crujientes Original YEYA (160 g)', marca: 'YEYA', precioBaseUSD: 3.60, imagen: './images/galletas.jpg' },
  ali_17: { id: 'ali_17', cat: 'galletas', nombre: 'Vinagre de vino blanco YEYA (1000 ml)', marca: 'YEYA', precioBaseUSD: 3.65, imagen: './images/galletas.jpg' },
  ali_19: { id: 'ali_19', cat: 'galletas', nombre: 'Papas fritas crujientes Queso YEYA (160 g)', marca: 'YEYA', precioBaseUSD: 3.60, imagen: './images/galletas.jpg' },
  ali_20: { id: 'ali_20', cat: 'galletas', nombre: 'Gelatina sabor frambuesa YEYA (20 g)', marca: 'YEYA', precioBaseUSD: 1.00, imagen: './images/galletas.jpg' },
  ali_26: { id: 'ali_26', cat: 'galletas', nombre: 'Gelatina sabor maracuyá YEYA (20 g)', marca: 'YEYA', precioBaseUSD: 1.00, imagen: './images/galletas.jpg' },
  ali_27: { id: 'ali_27', cat: 'galletas', nombre: 'Gelatina sabor cereza YEYA (20 g)', marca: 'YEYA', precioBaseUSD: 1.00, imagen: './images/galletas.jpg' },
  ali_28: { id: 'ali_28', cat: 'galletas', nombre: 'Gelatina sabor uva YEYA (20 g)', marca: 'YEYA', precioBaseUSD: 1.00, imagen: './images/galletas.jpg' },
  ali_29: { id: 'ali_29', cat: 'galletas', nombre: 'Puré de papas YEYA (125 g)', marca: 'YEYA', precioBaseUSD: 2.30, imagen: './images/galletas.jpg' },
  ali_30: { id: 'ali_30', cat: 'galletas', nombre: 'Gelatina sabor piña YEYA (20 g)', marca: 'YEYA', precioBaseUSD: 1.00, imagen: './images/galletas.jpg' },
  ali_32: { id: 'ali_32', cat: 'galletas', nombre: 'Pasta penne YEYA (400 g)', marca: 'YEYA', precioBaseUSD: 1.25, imagen: './images/galletas.jpg' },
  ali_34: { id: 'ali_34', cat: 'galletas', nombre: 'Maicena YEYA (200 g)', marca: 'YEYA', precioBaseUSD: 1.35, imagen: './images/galletas.jpg' },
  ali_35: { id: 'ali_35', cat: 'galletas', nombre: 'Gelatina sabor fresa YEYA (20 g)', marca: 'YEYA', precioBaseUSD: 1.00, imagen: './images/galletas.jpg' },
  ali_36: { id: 'ali_36', cat: 'galletas', nombre: 'Fideos YEYA (400 g)', marca: 'YEYA', precioBaseUSD: 1.30, imagen: './images/galletas.jpg' },
  ali_38: { id: 'ali_38', cat: 'galletas', nombre: 'Espaguetis YEYA (400 g / 14.1 oz)', marca: 'YEYA', precioBaseUSD: 0.95, imagen: './images/galletas.jpg' },
  ali_39: { id: 'ali_39', cat: 'galletas', nombre: 'Coditos YEYA (400 g / 14.1 oz)', marca: 'YEYA', precioBaseUSD: 1.10, imagen: './images/galletas.jpg' },

  lec_1: { id: 'lec_1', cat: 'leche_polvo', nombre: 'Leche entera en polvo YEYA (500 g)', marca: 'YEYA', precioBaseUSD: 5.85, imagen: './images/leche.jpg' },
  lec_2: { id: 'lec_2', cat: 'leche_polvo', nombre: 'Leche en polvo entera YEYA (900 g)', marca: 'YEYA', precioBaseUSD: 14.25, imagen: './images/leche.jpg' },
  lec_3: { id: 'lec_3', cat: 'leche_polvo', nombre: 'Leche entera en polvo YEYA (1 kg)', marca: 'YEYA', precioBaseUSD: 10.80, imagen: './images/leche.jpg' },
  lec_4: { id: 'lec_4', cat: 'leche_polvo', nombre: 'Leche entera en polvo Macro Food (1 kg)', marca: 'Macro Food', precioBaseUSD: 10.60, imagen: './images/leche.jpg' },
  lec_5: { id: 'lec_5', cat: 'leche_polvo', nombre: 'Leche entera en polvo 26% MG Macro Food (1 kg)', marca: 'Macro Food', precioBaseUSD: 11.20, imagen: './images/leche.jpg' },
  lec_6: { id: 'lec_6', cat: 'leche_polvo', nombre: 'Leche entera en polvo Conaprole (Saco 25 kg)', marca: 'Conaprole', precioBaseUSD: 223.00, imagen: './images/leche.jpg' },
  lec_7: { id: 'lec_7', cat: 'leche_polvo', nombre: 'Leche entera en polvo Formidable (Saco 25 kg)', marca: 'Formidable', precioBaseUSD: 226.50, imagen: './images/leche.jpg' },
  lec_8: { id: 'lec_8', cat: 'leche_polvo', nombre: 'Leche en polvo entera Purísima (Saco 25 kg)', marca: 'Purísima', precioBaseUSD: 230.40, imagen: './images/leche.jpg' },
  lec_9: { id: 'lec_9', cat: 'leche_polvo', nombre: 'Leche entera en polvo YEYA (1 kg / 2.2 lb)', marca: 'YEYA', precioBaseUSD: 10.80, imagen: './images/leche.jpg' },
  ali_25: { id: 'ali_25', cat: 'leche_polvo', nombre: 'Mantequilla sin sal YEYA (227 g)', marca: 'YEYA', precioBaseUSD: 3.55, imagen: './images/leche.jpg' },

  jug_1: { id: 'jug_1', cat: 'jugos', nombre: 'Néctar de cóctel La Estancia (200 ml)', marca: 'La Estancia', precioBaseUSD: 0.90, imagen: './images/jugos.jpg' },
  jug_2: { id: 'jug_2', cat: 'jugos', nombre: 'Néctar de cóctel La Estancia (Pack 6 x 200 ml)', marca: 'La Estancia', precioBaseUSD: 4.35, imagen: './images/jugos.jpg' },
  jug_3: { id: 'jug_3', cat: 'jugos', nombre: 'Néctar de cóctel La Estancia (Pack 12 x 200 ml)', marca: 'La Estancia', precioBaseUSD: 8.50, imagen: './images/jugos.jpg' },
  jug_4: { id: 'jug_4', cat: 'jugos', nombre: 'Néctar de melocotón La Estancia (200 ml)', marca: 'La Estancia', precioBaseUSD: 0.95, imagen: './images/jugos.jpg' },
  jug_5: { id: 'jug_5', cat: 'jugos', nombre: 'Néctar de melocotón La Estancia (Pack 6 x 200 ml)', marca: 'La Estancia', precioBaseUSD: 4.75, imagen: './images/jugos.jpg' },
  jug_6: { id: 'jug_6', cat: 'jugos', nombre: 'Néctar de melocotón La Estancia (Pack 12 x 200 ml)', marca: 'La Estancia', precioBaseUSD: 9.25, imagen: './images/jugos.jpg' },
  jug_7: { id: 'jug_7', cat: 'jugos', nombre: 'Néctar de pera La Estancia (200 ml)', marca: 'La Estancia', precioBaseUSD: 0.95, imagen: './images/jugos.jpg' },
  jug_8: { id: 'jug_8', cat: 'jugos', nombre: 'Néctar de pera La Estancia (Pack 6 x 200 ml)', marca: 'La Estancia', precioBaseUSD: 4.75, imagen: './images/jugos.jpg' },
  jug_9: { id: 'jug_9', cat: 'jugos', nombre: 'Néctar de pera La Estancia (Pack 12 x 200 ml)', marca: 'La Estancia', precioBaseUSD: 9.25, imagen: './images/jugos.jpg' },
  jug_10: { id: 'jug_10', cat: 'jugos', nombre: 'Néctar de manzana La Estancia (200 ml)', marca: 'La Estancia', precioBaseUSD: 1.00, imagen: './images/jugos.jpg' },
  jug_11: { id: 'jug_11', cat: 'jugos', nombre: 'Néctar de manzana La Estancia (Pack 6 x 200 ml)', marca: 'La Estancia', precioBaseUSD: 5.15, imagen: './images/jugos.jpg' },
  jug_12: { id: 'jug_12', cat: 'jugos', nombre: 'Néctar de manzana La Estancia (Pack 12 x 200 ml)', marca: 'La Estancia', precioBaseUSD: 10.05, imagen: './images/jugos.jpg' },
  jug_13: { id: 'jug_13', cat: 'jugos', nombre: 'Néctar de piña Zuko (200 ml)', marca: 'Zuko', precioBaseUSD: 1.15, imagen: './images/jugos.jpg' },
  jug_14: { id: 'jug_14', cat: 'jugos', nombre: 'Néctar de piña Zuko (Pack 6 x 200 ml)', marca: 'Zuko', precioBaseUSD: 5.65, imagen: './images/jugos.jpg' },
  jug_15: { id: 'jug_15', cat: 'jugos', nombre: 'Néctar de piña Zuko (Caja 24 x 200 ml)', marca: 'Zuko', precioBaseUSD: 22.10, imagen: './images/jugos.jpg' },
  jug_16: { id: 'jug_16', cat: 'jugos', nombre: 'Néctar de manzana Zuko (Pack 6 x 200 ml)', marca: 'Zuko', precioBaseUSD: 6.25, imagen: './images/jugos.jpg' },
  jug_17: { id: 'jug_17', cat: 'jugos', nombre: 'Néctar de manzana Zuko (Caja 24 x 200 ml)', marca: 'Zuko', precioBaseUSD: 23.15, imagen: './images/jugos.jpg' },
  jug_18: { id: 'jug_18', cat: 'jugos', nombre: 'Jugo de frutas sabor pera YEYA (200 ml)', marca: 'YEYA', precioBaseUSD: 0.85, imagen: './images/jugos.jpg' },
  jug_19: { id: 'jug_19', cat: 'jugos', nombre: 'Néctar de cóctel Santal (200 ml)', marca: 'Santal', precioBaseUSD: 1.00, imagen: './images/jugos.jpg' },
  jug_20: { id: 'jug_20', cat: 'jugos', nombre: 'Néctar mango piña Sunchy lata (334 ml)', marca: 'Sunchy', precioBaseUSD: 1.15, imagen: './images/jugos.jpg' },
  jug_21: { id: 'jug_21', cat: 'jugos', nombre: 'Néctar de melocotón Molinera (1 L)', marca: 'Molinera', precioBaseUSD: 3.50, imagen: './images/jugos.jpg' },
  jug_22: { id: 'jug_22', cat: 'jugos', nombre: 'Néctar de pera Molinera (1 L)', marca: 'Molinera', precioBaseUSD: 3.50, imagen: './images/jugos.jpg' },
  jug_23: { id: 'jug_23', cat: 'jugos', nombre: 'Néctar de manzana Goliath (946 ml)', marca: 'Goliath', precioBaseUSD: 4.15, imagen: './images/jugos.jpg' },
  jug_24: { id: 'jug_24', cat: 'jugos', nombre: 'Jugo de tomate Burcu (700 g)', marca: 'Burcu', precioBaseUSD: 2.90, imagen: './images/jugos.jpg' },
  jug_25: { id: 'jug_25', cat: 'jugos', nombre: 'Jugo de frutas sabor piña YEYA (125 ml)', marca: 'YEYA', precioBaseUSD: 0.50, imagen: './images/jugos.jpg' },
  jug_26: { id: 'jug_26', cat: 'jugos', nombre: 'Jugo de manzana botella YEYA (200 ml)', marca: 'YEYA', precioBaseUSD: 0.85, imagen: './images/jugos.jpg' },
  jug_27: { id: 'jug_27', cat: 'jugos', nombre: 'Jugo de naranja botella YEYA (200 ml)', marca: 'YEYA', precioBaseUSD: 0.85, imagen: './images/jugos.jpg' },
  jug_28: { id: 'jug_28', cat: 'jugos', nombre: 'Jugo de piña botella YEYA (200 ml)', marca: 'YEYA', precioBaseUSD: 0.85, imagen: './images/jugos.jpg' },
  jug_29: { id: 'jug_29', cat: 'jugos', nombre: 'Néctar de melocotón YEYA (1 L)', marca: 'YEYA', precioBaseUSD: 3.15, imagen: './images/jugos.jpg' },
  jug_30: { id: 'jug_30', cat: 'jugos', nombre: 'Néctar de manzana YEYA (1 L)', marca: 'YEYA', precioBaseUSD: 3.15, imagen: './images/jugos.jpg' },
  jug_31: { id: 'jug_31', cat: 'jugos', nombre: 'Néctar de pera YEYA (1 L)', marca: 'YEYA', precioBaseUSD: 3.15, imagen: './images/jugos.jpg' },
  jug_32: { id: 'jug_32', cat: 'jugos', nombre: 'Néctar de mango YEYA (1 L)', marca: 'YEYA', precioBaseUSD: 3.15, imagen: './images/jugos.jpg' },
  ali_3: { id: 'ali_3', cat: 'jugos', nombre: 'Refresco gaseoso de cola YEYA (330 ml)', marca: 'YEYA', precioBaseUSD: 0.95, imagen: './images/jugos.jpg' },
  ali_5: { id: 'ali_5', cat: 'jugos', nombre: 'Malta oscura YEYA (330 ml)', marca: 'YEYA', precioBaseUSD: 1.10, imagen: './images/jugos.jpg' },
  ali_6: { id: 'ali_6', cat: 'jugos', nombre: 'Caja de refresco gaseoso cola YEYA (24 x 330 ml)', marca: 'YEYA', precioBaseUSD: 17.75, imagen: './images/jugos.jpg' },
  ali_8: { id: 'ali_8', cat: 'jugos', nombre: 'Caja de refresco gaseoso piña YEYA (24 x 330 ml)', marca: 'YEYA', precioBaseUSD: 17.75, imagen: './images/jugos.jpg' },
  ali_9: { id: 'ali_9', cat: 'jugos', nombre: 'Caja de refresco gaseoso limón YEYA (24 x 330 ml)', marca: 'YEYA', precioBaseUSD: 17.75, imagen: './images/jugos.jpg' },
  ali_11: { id: 'ali_11', cat: 'jugos', nombre: 'Néctar de mango YEYA (1 L)', marca: 'YEYA', precioBaseUSD: 3.15, imagen: './images/jugos.jpg' },
  ali_12: { id: 'ali_12', cat: 'jugos', nombre: 'Caja de refresco gaseoso naranja YEYA (24 x 330 ml)', marca: 'YEYA', precioBaseUSD: 17.75, imagen: './images/jugos.jpg' },
  ali_13: { id: 'ali_13', cat: 'jugos', nombre: 'Refresco gaseoso de limón YEYA (1.5 L)', marca: 'YEYA', precioBaseUSD: 2.45, imagen: './images/jugos.jpg' },
  ali_14: { id: 'ali_14', cat: 'jugos', nombre: 'Néctar de manzana YEYA (1 L)', marca: 'YEYA', precioBaseUSD: 3.15, imagen: './images/jugos.jpg' },
  ali_21: { id: 'ali_21', cat: 'jugos', nombre: 'Refresco gaseoso de piña YEYA (1.5 L)', marca: 'YEYA', precioBaseUSD: 2.45, imagen: './images/jugos.jpg' },
  ali_22: { id: 'ali_22', cat: 'jugos', nombre: 'Néctar de pera YEYA (1 L)', marca: 'YEYA', precioBaseUSD: 3.15, imagen: './images/jugos.jpg' },
  ali_23: { id: 'ali_23', cat: 'jugos', nombre: 'Refresco gaseoso naranja YEYA (1.5 L)', marca: 'YEYA', precioBaseUSD: 2.45, imagen: './images/jugos.jpg' },
  ali_31: { id: 'ali_31', cat: 'jugos', nombre: 'Jugo de frutas sabor piña YEYA (125 ml)', marca: 'YEYA', precioBaseUSD: 0.50, imagen: './images/jugos.jpg' },

  lsu_1: { id: 'lsu_1', cat: 'leche_liq', nombre: 'Leche condensada azucarada Naya (390 g)', marca: 'Naya', precioBaseUSD: 2.15, imagen: './images/leche.jpg' },
  lsu_2: { id: 'lsu_2', cat: 'leche_liq', nombre: 'Leche evaporada rellenada Sogood (380 g)', marca: 'Sogood', precioBaseUSD: 2.45, imagen: './images/leche.jpg' },
  lsu_3: { id: 'lsu_3', cat: 'leche_liq', nombre: 'Leche condensada La Guajirita (397 g)', marca: 'La Guajirita', precioBaseUSD: 2.85, imagen: './images/leche.jpg' },
  lsu_4: { id: 'lsu_4', cat: 'leche_liq', nombre: 'Leche condensada Castellum (397 g)', marca: 'Castellum', precioBaseUSD: 2.85, imagen: './images/leche.jpg' },
  lsu_5: { id: 'lsu_5', cat: 'leche_liq', nombre: 'Leche condensada Tánamo (390 g)', marca: 'Tánamo', precioBaseUSD: 2.95, imagen: './images/leche.jpg' },
  lsu_6: { id: 'lsu_6', cat: 'leche_liq', nombre: 'Leche evaporada Benestare (Pack 600 ml)', marca: 'Benestare', precioBaseUSD: 5.85, imagen: './images/leche.jpg' },
  lsu_7: { id: 'lsu_7', cat: 'leche_liq', nombre: 'Leche vegetal de soya Asturiana (1 L)', marca: 'Asturiana', precioBaseUSD: 3.45, imagen: './images/leche.jpg' },
  lsu_8: { id: 'lsu_8', cat: 'leche_liq', nombre: 'Leche vegetal de avena Asturiana (1 L)', marca: 'Asturiana', precioBaseUSD: 4.00, imagen: './images/leche.jpg' },
  lsu_9: { id: 'lsu_9', cat: 'leche_liq', nombre: 'Leche vegetal de almendra Asturiana (1 L)', marca: 'Asturiana', precioBaseUSD: 4.45, imagen: './images/leche.jpg' },
  lsu_10: { id: 'lsu_10', cat: 'leche_liq', nombre: 'Leche entera UHT Mlekovita (1 L)', marca: 'Mlekovita', precioBaseUSD: 3.95, imagen: './images/leche.jpg' },
  lsu_11: { id: 'lsu_11', cat: 'leche_liq', nombre: 'Leche semidesnatada UHT President (1 L)', marca: 'President', precioBaseUSD: 4.35, imagen: './images/leche.jpg' },
  lsu_12: { id: 'lsu_12', cat: 'leche_liq', nombre: 'Leche entera UHT Vima Foods (1 L)', marca: 'Vima Foods', precioBaseUSD: 5.40, imagen: './images/leche.jpg' },
  lsu_13: { id: 'lsu_13', cat: 'leche_liq', nombre: 'Polvo de mezcla láctea La Lela (1 kg)', marca: 'La Lela', precioBaseUSD: 9.20, imagen: './images/leche.jpg' },

  caf_1: { id: 'caf_1', cat: 'cafe', nombre: 'Café espresso YEYA (250 g)', marca: 'YEYA', precioBaseUSD: 5.90, imagen: './images/cafe.jpg' },
  caf_2: { id: 'caf_2', cat: 'cafe', nombre: 'Café espresso premium Aroma (250 g)', marca: 'Aroma', precioBaseUSD: 7.30, imagen: './images/cafe.jpg' },
  caf_3: { id: 'caf_3', cat: 'cafe', nombre: 'Café espresso colombiano Sello Rojo (250 g)', marca: 'Sello Rojo', precioBaseUSD: 7.65, imagen: './images/cafe.jpg' },
  caf_4: { id: 'caf_4', cat: 'cafe', nombre: 'Café puro molido YEYA (283.5 g)', marca: 'YEYA', precioBaseUSD: 8.25, imagen: './images/cafe.jpg' },
  caf_5: { id: 'caf_5', cat: 'cafe', nombre: 'Café molido mezcla Pont (250 g)', marca: 'Pont', precioBaseUSD: 9.80, imagen: './images/cafe.jpg' },
  caf_6: { id: 'caf_6', cat: 'cafe', nombre: 'Café tradicional Brasileiro (500 g)', marca: 'Brasileiro', precioBaseUSD: 11.00, imagen: './images/cafe.jpg' },
  caf_7: { id: 'caf_7', cat: 'cafe', nombre: 'Café tostado y molido extra fuerte União (500 g)', marca: 'União', precioBaseUSD: 11.70, imagen: './images/cafe.jpg' },

  eq_1: { id: 'eq_1', cat: 'equipos', nombre: 'Bombillo Led recargable 9 W Wealco WL9', marca: 'Wealco', precioBaseUSD: 2.65, imagen: './images/equipos.jpg' },

  con_1: { id: 'con_1', cat: 'conservas', nombre: 'Pasas sultanas Frit Ravich (150 g)', marca: 'Frit Ravich', precioBaseUSD: 3.35, imagen: './images/conservas.jpg' },
  con_2: { id: 'con_2', cat: 'conservas', nombre: 'Uvas pasas Lite Life (500 g)', marca: 'Life', precioBaseUSD: 8.20, imagen: './images/conservas.jpg' },
  con_3: { id: 'con_3', cat: 'conservas', nombre: 'Carne de res tipo spam Texana (Pack 2 x 400 g)', marca: 'Texana', precioBaseUSD: 6.20, imagen: './images/conservas.jpg' },
  con_4: { id: 'con_4', cat: 'conservas', nombre: 'Carne de res tipo spam Texana (Pack 3 x 400 g)', marca: 'Texana', precioBaseUSD: 9.25, imagen: './images/conservas.jpg' },
  con_5: { id: 'con_5', cat: 'conservas', nombre: 'Atún premium en aceite vegetal Vima Foods (1 kg)', marca: 'Vima Foods', precioBaseUSD: 18.45, imagen: './images/conservas.jpg' },
  con_6: { id: 'con_6', cat: 'conservas', nombre: 'Fritada de atún Valcatá SURL (430 g)', marca: 'Valcatá SURL', precioBaseUSD: 5.00, imagen: './images/conservas.jpg' },
  con_7: { id: 'con_7', cat: 'conservas', nombre: 'Atún en trozos en aceite de girasol Manabí (500 g)', marca: 'Manabí', precioBaseUSD: 7.70, imagen: './images/conservas.jpg' },
  con_8: { id: 'con_8', cat: 'conservas', nombre: 'Granos de elote dulce Corina (425 g)', marca: 'Corina', precioBaseUSD: 3.55, imagen: './images/conservas.jpg' },
  con_9: { id: 'con_9', cat: 'conservas', nombre: 'Maíz dulce en grano Celorrio (300 g)', marca: 'Celorrio', precioBaseUSD: 3.15, imagen: './images/conservas.jpg' },
  con_10: { id: 'con_10', cat: 'conservas', nombre: 'Aceitunas negras en rodajas Burcu (580 g)', marca: 'Burcu', precioBaseUSD: 6.85, imagen: './images/conservas.jpg' },
  con_11: { id: 'con_11', cat: 'conservas', nombre: 'Filete de atún en aceite vegetal Valcatá SURL (400 g)', marca: 'Valcatá SURL', precioBaseUSD: 6.50, imagen: './images/conservas.jpg' },
  con_12: { id: 'con_12', cat: 'conservas', nombre: 'Aceitunas rellenas de anchoa Fragata (200 g)', marca: 'Fragata', precioBaseUSD: 2.15, imagen: './images/conservas.jpg' },
  con_13: { id: 'con_13', cat: 'conservas', nombre: 'Trozos de atún en aceite de girasol Yeli (1 kg)', marca: 'Yeli', precioBaseUSD: 14.25, imagen: './images/conservas.jpg' },
  con_14: { id: 'con_14', cat: 'conservas', nombre: 'Tomate pelado entero en su jugo Mamma Tina (2.5 kg)', marca: 'Mamma Tina', precioBaseUSD: 7.65, imagen: './images/conservas.jpg' },
  con_15: { id: 'con_15', cat: 'conservas', nombre: 'Aceitunas negras naturales en salmuera', marca: 'Marmarabirlik', precioBaseUSD: 8.75, imagen: './images/conservas.jpg' },
  con_16: { id: 'con_16', cat: 'conservas', nombre: 'Trozos de fruta bomba en almíbar Conchita (3.47 kg)', marca: 'Conchita', precioBaseUSD: 13.40, imagen: './images/conservas.jpg' },
  con_17: { id: 'con_17', cat: 'conservas', nombre: 'Atún en aceite vegetal Docanned Star (1 kg)', marca: 'Docanned Star', precioBaseUSD: 15.55, imagen: './images/conservas.jpg' },
  con_18: { id: 'con_18', cat: 'conservas', nombre: 'Combo carne de res tipo spam Texana (Pack 4 x 400 g)', marca: 'Texana', precioBaseUSD: 12.25, imagen: './images/conservas.jpg' },
  con_19: { id: 'con_19', cat: 'conservas', nombre: 'Atún en aceite de girasol Pony (750 g)', marca: 'Pony', precioBaseUSD: 12.20, imagen: './images/conservas.jpg' },
  con_20: { id: 'con_20', cat: 'conservas', nombre: 'Filete de túnidos en salsa de tomate Valcatá SURL', marca: 'Valcatá SURL', precioBaseUSD: 5.25, imagen: './images/conservas.jpg' },
  con_21: { id: 'con_21', cat: 'conservas', nombre: 'Aderezo picante italiano Kurtz (473 ml)', marca: 'Kurtz', precioBaseUSD: 5.75, imagen: './images/conservas.jpg' },
  con_22: { id: 'con_22', cat: 'conservas', nombre: 'Carne de res tipo spam Texana (400 g)', marca: 'Texana', precioBaseUSD: 3.35, imagen: './images/conservas.jpg' },
  con_23: { id: 'con_23', cat: 'conservas', nombre: 'Carne de res en su jugo Texana (400 g)', marca: 'Texana', precioBaseUSD: 3.65, imagen: './images/conservas.jpg' },
  con_24: { id: 'con_24', cat: 'conservas', nombre: 'Carne de res enlatada tipo spam Texana (400 g)', marca: 'Texana', precioBaseUSD: 2.85, imagen: './images/conservas.jpg' },
  con_25: { id: 'con_25', cat: 'conservas', nombre: 'Mortadela de pollo especial Bounissima (340 g)', marca: 'Bounissima', precioBaseUSD: 2.10, imagen: './images/conservas.jpg' },
  con_26: { id: 'con_26', cat: 'conservas', nombre: 'Combo carne de res tipo spam Texana (Pack 6 x 400 g)', marca: 'Texana', precioBaseUSD: 18.25, imagen: './images/conservas.jpg' },
  con_27: { id: 'con_27', cat: 'conservas', nombre: 'Atún en aceite vegetal Docanned Star (140 g)', marca: 'Docanned Star', precioBaseUSD: 1.70, imagen: './images/conservas.jpg' },
  con_28: { id: 'con_28', cat: 'conservas', nombre: 'Pistachos con sabor a pimentón picante Super Yu', marca: 'Super Yu', precioBaseUSD: 5.80, imagen: './images/conservas.jpg' },
  con_29: { id: 'con_29', cat: 'conservas', nombre: 'Avellanas tostadas Super Yu (150 g)', marca: 'Super Yu', precioBaseUSD: 5.90, imagen: './images/conservas.jpg' },
  con_30: { id: 'con_30', cat: 'conservas', nombre: 'Semillas de marañón cebolla caramelizada Super Yu', marca: 'Super Yu', precioBaseUSD: 4.45, imagen: './images/conservas.jpg' },
  con_31: { id: 'con_31', cat: 'conservas', nombre: 'Trozos de fruta bomba en almíbar Conchita (915 g)', marca: 'Conchita', precioBaseUSD: 5.85, imagen: './images/conservas.jpg' },
  con_32: { id: 'con_32', cat: 'conservas', nombre: 'Frijoles negros condimentados YEYA (240 g)', marca: 'YEYA', precioBaseUSD: 33.00, imagen: './images/conservas.jpg' },
  con_33: { id: 'con_33', cat: 'conservas', nombre: 'Caja de carne de res en conserva / spam YEYA', marca: 'YEYA', precioBaseUSD: 107.80, imagen: './images/conservas.jpg' },
  con_34: { id: 'con_34', cat: 'conservas', nombre: 'Tronchos en salsa de tomate YEYA (Pack 24 x 425 g)', marca: 'YEYA', precioBaseUSD: 77.50, imagen: './images/conservas.jpg' },
  con_35: { id: 'con_35', cat: 'conservas', nombre: 'Caja de Fiambre de pollo YEYA (24 x 320 g)', marca: 'YEYA', precioBaseUSD: 82.40, imagen: './images/conservas.jpg' },
  con_36: { id: 'con_36', cat: 'conservas', nombre: 'Tronchos en salsa de tomate YEYA (Pack 5 x 425 g)', marca: 'YEYA', precioBaseUSD: 16.45, imagen: './images/conservas.jpg' },
  con_37: { id: 'con_37', cat: 'conservas', nombre: 'Tronchos en salmuera YEYA (Pack 24 x 425 g)', marca: 'YEYA', precioBaseUSD: 70.00, imagen: './images/conservas.jpg' },
  con_38: { id: 'con_38', cat: 'conservas', nombre: 'Tronchos en salmuera YEYA (Pack 5 x 425 g)', marca: 'YEYA', precioBaseUSD: 14.85, imagen: './images/conservas.jpg' },
  con_39: { id: 'con_39', cat: 'conservas', nombre: 'Caja de fiambre de cerdo spam YEYA (24 x 340 g)', marca: 'YEYA', precioBaseUSD: 99.00, imagen: './images/conservas.jpg' },
  con_40: { id: 'con_40', cat: 'conservas', nombre: 'Carne de res en conserva tipo carne rusa YEYA (340 g)', marca: 'YEYA', precioBaseUSD: 4.70, imagen: './images/conservas.jpg' },
  con_41: { id: 'con_41', cat: 'conservas', nombre: 'Atún en trozos en aceite vegetal YEYA (1 kg)', marca: 'YEYA', precioBaseUSD: 11.75, imagen: './images/conservas.jpg' },
  con_42: { id: 'con_42', cat: 'conservas', nombre: 'Fiambre de cerdo tipo spam YEYA (320 g)', marca: 'YEYA', precioBaseUSD: 4.35, imagen: './images/conservas.jpg' },
  con_43: { id: 'con_43', cat: 'conservas', nombre: 'Compota de manzana YEYA (113 g)', marca: 'YEYA', precioBaseUSD: 1.30, imagen: './images/conservas.jpg' },
  con_44: { id: 'con_44', cat: 'conservas', nombre: 'Frijoles Negros Condimentados YEYA (Pack 4 x 425 g)', marca: 'YEYA', precioBaseUSD: 1.65, imagen: './images/conservas.jpg' },
  con_45: { id: 'con_45', cat: 'conservas', nombre: 'Compota de mango YEYA (113 g)', marca: 'YEYA', precioBaseUSD: 1.30, imagen: './images/conservas.jpg' },
  con_46: { id: 'con_46', cat: 'conservas', nombre: 'Compota de pera YEYA (113 g)', marca: 'YEYA', precioBaseUSD: 1.30, imagen: './images/conservas.jpg' },
  con_47: { id: 'con_47', cat: 'conservas', nombre: 'Atún desmenuzado en aceite vegetal YEYA (140 g)', marca: 'YEYA', precioBaseUSD: 1.35, imagen: './images/conservas.jpg' },
  con_48: { id: 'con_48', cat: 'conservas', nombre: 'Atún desmenuzado en salmuera YEYA (140 g)', marca: 'YEYA', precioBaseUSD: 1.30, imagen: './images/conservas.jpg' },
  con_49: { id: 'con_49', cat: 'conservas', nombre: 'Atún desmenuzado en aceite YEYA (170 g)', marca: 'YEYA', precioBaseUSD: 2.45, imagen: './images/conservas.jpg' },
  con_50: { id: 'con_50', cat: 'conservas', nombre: 'Tronchos en salsa de tomate YEYA (Pack 3 x 425 g)', marca: 'YEYA', precioBaseUSD: 10.05, imagen: './images/conservas.jpg' },
  con_51: { id: 'con_51', cat: 'conservas', nombre: 'Atún en trozos en aceite vegetal YEYA (Pack 10 x 160 g)', marca: 'YEYA', precioBaseUSD: 20.00, imagen: './images/conservas.jpg' },
  con_52: { id: 'con_52', cat: 'conservas', nombre: 'Frijoles negros condimentados YEYA (Pack 3 x 425 g)', marca: 'YEYA', precioBaseUSD: 4.40, imagen: './images/conservas.jpg' },
  con_53: { id: 'con_53', cat: 'conservas', nombre: 'Tronchos en salmuera YEYA (Pack 3 x 425 g)', marca: 'YEYA', precioBaseUSD: 9.10, imagen: './images/conservas.jpg' },
  con_54: { id: 'con_54', cat: 'conservas', nombre: 'Frijoles negros condimentados YEYA (Pack 5 x 425 g)', marca: 'YEYA', precioBaseUSD: 7.15, imagen: './images/conservas.jpg' },
  con_55: { id: 'con_55', cat: 'conservas', nombre: 'Atún en trozos en aceite vegetal YEYA (Pack 5 x 160 g)', marca: 'YEYA', precioBaseUSD: 10.65, imagen: './images/conservas.jpg' },
  con_56: { id: 'con_56', cat: 'conservas', nombre: 'Pasta de guayaba Conchita (500 g)', marca: 'Conchita', precioBaseUSD: 3.90, imagen: './images/conservas.jpg' },
  con_57: { id: 'con_57', cat: 'conservas', nombre: 'Mermelada de guayaba Conchita (440 g)', marca: 'Conchita', precioBaseUSD: 2.65, imagen: './images/conservas.jpg' },
  con_58: { id: 'con_58', cat: 'conservas', nombre: 'Mermelada de guayaba Conchita (3.16 kg)', marca: 'Conchita', precioBaseUSD: 10.75, imagen: './images/conservas.jpg' },
  con_59: { id: 'con_59', cat: 'conservas', nombre: 'Mermelada de mango Conchita (3.16 kg)', marca: 'Conchita', precioBaseUSD: 11.35, imagen: './images/conservas.jpg' },
  con_60: { id: 'con_60', cat: 'conservas', nombre: 'Compota de frutabomba y plátano YEYA (113 g)', marca: 'YEYA', precioBaseUSD: 1.25, imagen: './images/conservas.jpg' },
  con_61: { id: 'con_61', cat: 'conservas', nombre: 'Fiambre-spam- de pollo YEYA (320 g)', marca: 'YEYA', precioBaseUSD: 3.65, imagen: './images/conservas.jpg' },
  con_62: { id: 'con_62', cat: 'conservas', nombre: 'Compota de frutabomba y mango YEYA (113 g)', marca: 'YEYA', precioBaseUSD: 1.25, imagen: './images/conservas.jpg' },
  con_63: { id: 'con_63', cat: 'conservas', nombre: 'Compota de macedonia YEYA (113 g)', marca: 'YEYA', precioBaseUSD: 1.25, imagen: './images/conservas.jpg' },
  con_64: { id: 'con_64', cat: 'conservas', nombre: 'Pasta de guayaba en barra YEYA (400 g)', marca: 'YEYA', precioBaseUSD: 2.45, imagen: './images/conservas.jpg' },
  con_65: { id: 'con_65', cat: 'conservas', nombre: 'Tronchos en salmuera YEYA (425 g)', marca: 'YEYA', precioBaseUSD: 3.35, imagen: './images/conservas.jpg' },
  con_66: { id: 'con_66', cat: 'conservas', nombre: 'Atún desmenuzado en aceite vegetal YEYA (160 g)', marca: 'YEYA', precioBaseUSD: 2.40, imagen: './images/conservas.jpg' },
  con_67: { id: 'con_67', cat: 'conservas', nombre: 'Tronchos en salsa de tomate YEYA (425 g)', marca: 'YEYA', precioBaseUSD: 3.70, imagen: './images/conservas.jpg' },
  ali_16: { id: 'ali_16', cat: 'conservas', nombre: 'Tronchos en salsa de tomate YEYA (425 g)', marca: 'YEYA', precioBaseUSD: 3.70, imagen: './images/conservas.jpg' },
  ali_37: { id: 'ali_37', cat: 'conservas', nombre: 'Pasta de tomate concentrada YEYA (400 g)', marca: 'YEYA', precioBaseUSD: 1.35, imagen: './images/conservas.jpg' },
  ali_40: { id: 'ali_40', cat: 'conservas', nombre: 'Pasta de guayaba en barra YEYA (400 g / 14.11 oz)', marca: 'YEYA', precioBaseUSD: 2.45, imagen: './images/conservas.jpg' },

  hue_1: { id: 'hue_1', cat: 'huevo', nombre: 'Cartón de Huevos Super Yu (30 unidades)', marca: 'Super Yu', precioBaseUSD: 23.35, imagen: './images/huevos.jpg' }
};

const PEDIDOS_USUARIOS = {};

function obtenerPrecio(prod, provincia, moneda) {
  const precioUSD = prod.precioBaseUSD;
  const convertido = precioUSD * TASAS[moneda];
  return moneda === 'RUB' ? Math.round(convertido) : Number(convertido.toFixed(2));
}

function generarFacturaPDF(ordenId, clienteNombre, destino, metodo, total, detalle, callback) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const filename = 'factura_' + ordenId + '.pdf';
  const stream = fs.createWriteStream(filename);

  doc.pipe(stream);

  doc.fontSize(20).text('COMBO-EXPRESS DESDE RUSIA', { align: 'center' });
  doc.fontSize(10).text('Comprobante Oficial de Compra y Entrega', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12).text('Número de Orden: ' + ordenId);
  doc.text('Fecha: ' + new Date().toLocaleDateString());
  doc.text('Cliente: ' + clienteNombre);
  doc.text('Destino en Cuba: ' + destino);
  doc.text('Método de Pago: ' + metodo);
  doc.moveDown(1);

  doc.text('---------------------------------------------------------------------------------------------------------');
  doc.text('DETALLE DEL COMBO:');
  doc.text('---------------------------------------------------------------------------------------------------------');
  
  doc.fontSize(10).text(detalle);
  doc.moveDown(1);

  doc.text('---------------------------------------------------------------------------------------------------------');
  doc.fontSize(12).text('TOTAL ABONADO: ' + total, { align: 'right' });
  doc.moveDown(3);

  doc.fontSize(9).text('Gracias por confiar en nuestros servicios. Su pedido está en proceso de entrega en Cuba.', { align: 'center' });
  doc.text('Soporte General: +79153745462 | Atención en Cuba: +5351849868', { align: 'center' });

  doc.end();

  stream.on('finish', () => {
    callback(filename);
  });
}

bot.use((ctx, next) => {
  if (!ctx.session) {
    ctx.session = { provincia: 'Santiago de Cuba', moneda: 'RUB', carrito: {}, paso: null, datosEntrega: null, metodoSeleccionado: null };
  }
  return next();
});

bot.start(async (ctx) => {
  ctx.session.paso = null;
  const bannerPath = path.join(__dirname, 'images', 'banner.jpg');
  
  const caption = "🇷🇺 ✈️ 🇨🇺 *COMBO-EXPRESS DESDE RUSIA* 🇨🇺\n━━━━━━━━━━━━━━━━━━━━━━━━━\n_Tus productos favoritos, calidad garantizada para tu familia._\n\n📍 *Destino:* `" + ctx.session.provincia + "`\n💱 *Moneda:* `" + ctx.session.moneda + "`\n\n👇 *Elige una opción:*";

  const teclado = Markup.inlineKeyboard([
    [Markup.button.callback('📍 Cambiar Provincia', 'menu_provincias'), Markup.button.callback('🛍️ Ver Catálogo', 'menu_categorias')],
    [Markup.button.callback('💱 Moneda (' + ctx.session.moneda + ')', 'cambiar_moneda'), Markup.button.callback('🛒 Ver Mi Carrito', 'ver_carrito')],
    [Markup.button.callback('📦 Mis Pedidos y Estado', 'mis_pedidos')]
  ]);

  try {
    if (fs.existsSync(bannerPath)) {
      await ctx.replyWithPhoto({ source: fs.createReadStream(bannerPath) }, { caption, parse_mode: 'Markdown', ...teclado });
    } else {
      await ctx.reply(caption, { parse_mode: 'Markdown', ...teclado });
    }
  } catch (err) {
    console.log("Error al enviar banner:", err);
  }
});

bot.action('menu_provincias', (ctx) => {
  const botones = [];
  for (let i = 0; i < PROVINCIAS.length; i += 2) {
    const fila = [Markup.button.callback(PROVINCIAS[i], 'set_prov_' + PROVINCIAS[i])];
    if (PROVINCIAS[i + 1]) fila.push(Markup.button.callback(PROVINCIAS[i + 1], 'set_prov_' + PROVINCIAS[i + 1]));
    botones.push(fila);
  }
  botones.push([Markup.button.callback('⬅️ Menú Principal', 'volver_inicio')]);
  ctx.editMessageCaption('📍 *Selecciona la provincia en Cuba:*', { parse_mode: 'Markdown', ...Markup.inlineKeyboard(botones) }).catch(() => {
    ctx.editMessageText('📍 *Selecciona la provincia en Cuba:*', { parse_mode: 'Markdown', ...Markup.inlineKeyboard(botones) });
  });
});

bot.action(/set_prov_(.+)/, (ctx) => {
  ctx.session.provincia = ctx.match[1];
  ctx.answerCbQuery('Destino: ' + ctx.session.provincia);
  ctx.editMessageText('✅ Destino fijado a: *' + ctx.session.provincia + '*', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([[Markup.button.callback('🛍️ Ir al Catálogo', 'menu_categorias')]])
  });
});

bot.action('cambiar_moneda', (ctx) => {
  ctx.editMessageText('💱 *Selecciona tu moneda de pago:*', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('🇷🇺 Rublos (RUB)', 'set_mon_RUB'), Markup.button.callback('🇺🇸 Dólares (USD)', 'set_mon_USD')],
      [Markup.button.callback('🇪🇺 Euros (EUR)', 'set_mon_EUR'), Markup.button.callback('💵 CUP', 'set_mon_CUP')],
      [Markup.button.callback('💳 MLC', 'set_mon_MLC'), Markup.button.callback('🪙 USDT', 'set_mon_USDT')],
      [Markup.button.callback('⬅️ Volver', 'volver_inicio')]
    ])
  });
});

bot.action(/set_mon_(.+)/, (ctx) => {
  ctx.session.moneda = ctx.match[1];
  ctx.answerCbQuery('Moneda: ' + ctx.session.moneda);
  ctx.editMessageText('✅ Moneda actualizada a *' + ctx.session.moneda + '*.', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([[Markup.button.callback('🛍️ Ir al Catálogo', 'menu_categorias')]])
  });
});

bot.action('menu_categorias', (ctx) => {
  const entradas = Object.entries(CATEGORIAS);
  const filas = [];
  for (let i = 0; i < entradas.length; i += 2) {
    const fila = [Markup.button.callback(entradas[i][1], 'cat_' + entradas[i][0] + '_0')];
    if (entradas[i + 1]) fila.push(Markup.button.callback(entradas[i + 1][1], 'cat_' + entradas[i + 1][0] + '_0'));
    filas.push(fila);
  }
  filas.push([Markup.button.callback('🛒 Ver Carrito', 'ver_carrito'), Markup.button.callback('📦 Mis Pedidos', 'mis_pedidos')]);
  filas.push([Markup.button.callback('🏠 Inicio', 'volver_inicio')]);

  const catText = '🛍️ *SELECCIONA UNA CATEGORÍA*\n━━━━━━━━━━━━━━━━━━━━━━━━━';
  ctx.editMessageText(catText, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(filas) }).catch(() => {
    ctx.reply(catText, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(filas) });
  });
});

bot.action(/cat_(.+)_(.+)/, async (ctx) => {
  const catKey = ctx.match[1];
  const pagina = parseInt(ctx.match[2]);
  const prov = ctx.session.provincia;
  const mon = ctx.session.moneda;
  
  const lista = Object.values(PRODUCTOS).filter(p => p.cat === catKey);
  if (lista.length === 0) {
    return ctx.answerCbQuery('Pronto agregaremos productos en esta categoría.', { show_alert: true });
  }

  const p = lista[pagina];
  const precio = obtenerPrecio(p, prov, mon);
  const cant = ctx.session.carrito[p.id] || 0;

  const caption = '📦 *' + CATEGORIAS[catKey] + '* (' + (pagina + 1) + '/' + lista.length + ')\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🏷️ *' + p.nombre + '*\n🏭 Marca: `' + p.marca + '`\n💰 Precio: `' + precio + ' ' + mon + '`\n' + (cant > 0 ? '🛒 *Tienes ' + cant + ' en tu combo*\n' : '');

  const botones = [
    [
      Markup.button.callback('➖', 'restar_' + p.id + '_' + catKey + '_' + pagina),
      Markup.button.callback('Cantidad: ' + cant, 'noop'),
      Markup.button.callback('➕ Agregar', 'sumar_' + p.id + '_' + catKey + '_' + pagina)
    ]
  ];

  const nav = [];
  if (pagina > 0) nav.push(Markup.button.callback('⬅️ Anterior', 'cat_' + catKey + '_' + (pagina - 1)));
  if (pagina < lista.length - 1) nav.push(Markup.button.callback('Siguiente ➡️', 'cat_' + catKey + '_' + (pagina + 1)));
  if (nav.length > 0) botones.push(nav);

  botones.push([Markup.button.callback('🛒 Ver Carrito', 'ver_carrito'), Markup.button.callback('⬅️ Categorías', 'menu_categorias')]);

  try {
    await ctx.deleteMessage();
  } catch (e) {}

  let imagePath = path.join(__dirname, p.imagen.replace('./', ''));
  if (!fs.existsSync(imagePath)) {
    imagePath = path.join(__dirname, 'images', 'default.jpg');
    if (!fs.existsSync(imagePath)) {
      return ctx.reply(caption, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(botones) });
    }
  }

  await ctx.replyWithPhoto({ source: fs.createReadStream(imagePath) }, {
    caption: caption,
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(botones)
  });
});

bot.action('noop', (ctx) => ctx.answerCbQuery());

bot.action(/sumar_(.+)_(.+)_(.+)/, (ctx) => {
  const [_, prodId, catKey, pag] = ctx.match;
  ctx.session.carrito[prodId] = (ctx.session.carrito[prodId] || 0) + 1;
  ctx.answerCbQuery('➕ Añadido al combo');
  ctx.emitirProducto(ctx, catKey, parseInt(pag));
});

bot.action(/restar_(.+)_(.+)_(.+)/, (ctx) => {
  const [_, prodId, catKey, pag] = ctx.match;
  if (ctx.session.carrito[prodId]) {
    ctx.session.carrito[prodId] -= 1;
    if (ctx.session.carrito[prodId] <= 0) delete ctx.session.carrito[prodId];
    ctx.answerCbQuery('➖ Restado');
  }
  ctx.emitirProducto(ctx, catKey, parseInt(pag));
});

bot.context.emitirProducto = async function(ctx, catKey, pagina) {
  const prov = ctx.session.provincia;
  const mon = ctx.session.moneda;
  const lista = Object.values(PRODUCTOS).filter(p => p.cat === catKey);
  const p = lista[pagina];
  const precio = obtenerPrecio(p, prov, mon);
  const cant = ctx.session.carrito[p.id] || 0;

  const caption = '📦 *' + CATEGORIAS[catKey] + '* (' + (pagina + 1) + '/' + lista.length + ')\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🏷️ *' + p.nombre + '*\n🏭 Marca: `' + p.marca + '`\n💰 Precio: `' + precio + ' ' + mon + '`\n' + (cant > 0 ? '🛒 *Tienes ' + cant + ' en tu combo*\n' : '');

  const botones = [
    [
      Markup.button.callback('➖', 'restar_' + p.id + '_' + catKey + '_' + pagina),
      Markup.button.callback('Cantidad: ' + cant, 'noop'),
      Markup.button.callback('➕ Agregar', 'sumar_' + p.id + '_' + catKey + '_' + pagina)
    ]
  ];

  const nav = [];
  if (pagina > 0) nav.push(Markup.button.callback('⬅️ Anterior', 'cat_' + catKey + '_' + (pagina - 1)));
  if (pagina < lista.length - 1) nav.push(Markup.button.callback('Siguiente ➡️', 'cat_' + catKey + '_' + (pagina + 1)));
  if (nav.length > 0) botones.push(nav);

  botones.push([Markup.button.callback('🛒 Ver Carrito', 'ver_carrito'), Markup.button.callback('⬅️ Categorías', 'menu_categorias')]);

  try {
    let imagePath = path.join(__dirname, p.imagen.replace('./', ''));
    if (!fs.existsSync(imagePath)) imagePath = path.join(__dirname, 'images', 'default.jpg');

    if (fs.existsSync(imagePath)) {
      await ctx.editMessageMedia({
        type: 'photo',
        media: { source: fs.createReadStream(imagePath) },
        caption: caption,
        parse_mode: 'Markdown'
      }, { ...Markup.inlineKeyboard(botones) });
    } else {
      await ctx.editMessageCaption(caption, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(botones) });
    }
  } catch (e) {}
};

bot.action('ver_carrito', async (ctx) => {
  const ids = Object.keys(ctx.session.carrito);
  if (ids.length === 0) {
    return ctx.answerCbQuery('🛒 Tu carrito está vacío.', { show_alert: true });
  }

  const prov = ctx.session.provincia;
  const mon = ctx.session.moneda;
  let total = 0;
  let texto = '🛒 *RESUMEN DE TU COMBO*\n📍 Destino: `' + prov + '`\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  ids.forEach(id => {
    const p = PRODUCTOS[id];
    const cant = ctx.session.carrito[id];
    const sub = Number((obtenerPrecio(p, prov, mon) * cant).toFixed(2));
    total += sub;
    texto += '▫️ *' + cant + 'x* ' + p.nombre + '\n   ↳ Subtotal: `' + sub + ' ' + mon + '`\n\n';
  });

  texto += '━━━━━━━━━━━━━━━━━━━━━━━━━\n💳 *TOTAL A PAGAR:* `' + Number(total.toFixed(2)) + ' ' + mon + '`';

  try { await ctx.deleteMessage(); } catch (e) {}
  ctx.reply(texto, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('✅ Proceder al Pago', 'checkout')],
      [Markup.button.callback('🗑️ Vaciar', 'vaciar'), Markup.button.callback('🛍️ Catálogo', 'menu_categorias')]
    ])
  });
});

bot.action('vaciar', (ctx) => {
  ctx.session.carrito = {};
  ctx.answerCbQuery('🛒 Carrito vaciado');
  ctx.editMessageText('Tu carrito está vacío.', Markup.inlineKeyboard([[Markup.button.callback('🛍️ Ver Catálogo', 'menu_categorias')]]));
});

bot.action('checkout', (ctx) => {
  ctx.session.paso = 'esperando_datos';
  ctx.editMessageText(
    '📦 *DATOS DE ENTREGA EN CUBA*\n━━━━━━━━━━━━━━━━━━━━━━━━━\nEscribe en un *único mensaje* los datos de tu familiar:\n\n1️⃣ Nombre completo\n2️⃣ Teléfono\n3️⃣ Provincia, Municipio y Dirección',
    { parse_mode: 'Markdown' }
  );
});

bot.on('text', (ctx) => {
  if (ctx.session.paso === 'esperando_datos') {
    ctx.session.datosEntrega = ctx.message.text;
    ctx.session.paso = null;

    const prov = ctx.session.provincia;
    const mon = ctx.session.moneda;
    let total = 0;
    Object.keys(ctx.session.carrito).forEach(id => {
      const p = PRODUCTOS[id];
      const cant = ctx.session.carrito[id];
      total += obtenerPrecio(p, prov, mon) * cant;
    });
    ctx.session.totalCalculado = Number(total.toFixed(2));

    ctx.reply(
      '💳 *SELECCIONA EL MÉTODO DE PAGO*\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '💰 *IMPORTE TOTAL A PAGAR:* `' + ctx.session.totalCalculado + ' ' + mon + '`\n\n' +
      'Elige cómo deseas abonar tu pedido:',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('💵 CUP', 'pago_CUP'), Markup.button.callback('💳 MLC', 'pago_MLC')],
          [Markup.button.callback('💳 Clásica', 'pago_CLASICA'), Markup.button.callback('🪙 USDT', 'pago_USDT')],
          [Markup.button.callback('🇷🇺 Rublos', 'pago_RUB'), Markup.button.callback('🇺🇸 Zelle / USD', 'pago_USD')]
        ])
      }
    );
  }
});

const metodosPagoValidos = ['CUP', 'MLC', 'CLASICA', 'USDT', 'RUB', 'USD'];
metodosPagoValidos.forEach(metodo => {
  bot.action('pago_' + metodo, async (ctx) => {
    ctx.session.metodoSeleccionado = metodo;
    ctx.session.paso = 'esperando_comprobante';

    const totalPagar = ctx.session.totalCalculado || 0;
    const mon = ctx.session.moneda;

    let instrucciones = '';
    if (metodo === 'RUB') {
      instrucciones = '🇷🇺 *Instrucciones de Pago en Rublos (RUB):*\n• Importe exacto a transferir: `' + totalPagar + ' RUB`\n• SBP al número: `+79252481911` (Bancos: *T-Bank* o *VTB*)\n• Transferencia directa a tarjeta: `2200 7010 4388 5190`';
    } else if (metodo === 'CUP' || metodo === 'MLC') {
      instrucciones = '🇨🇺 *Instrucciones de Pago en Cuba (' + metodo + '):*\n• Importe exacto a transferir: `' + totalPagar + ' ' + mon + '`\n• Transferencia a tarjeta CUP: `9204 1299 7694 7558`\n• Confirmar pago al número en Cuba: *+5351849868*';
    } else {
      instrucciones = '💳 *Método ' + metodo + ':* Importe a pagar: `' + totalPagar + ' ' + mon + '`. Contáctenos a nuestro WhatsApp para coordinar.';
    }

    await ctx.editMessageText(
      '📸 *PASO FINAL: COMPROBANTE DE PAGO*\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      instrucciones + '\n\n' +
      '⚠️ *IMPORTANTE:* Por favor, toma una captura de pantalla de tu transferencia exitosa por el monto exacto de `' + totalPagar + ' ' + mon + '` y *envíala aquí como foto* al chat.',
      { parse_mode: 'Markdown' }
    );
  });
});

bot.on('photo', async (ctx) => {
  if (ctx.session.paso === 'esperando_comprobante') {
    const fotoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const clienteId = ctx.from.id;
    const prov = ctx.session.provincia;
    const metodo = ctx.session.metodoSeleccionado;
    const moneda = ctx.session.moneda;
    const totalPagar = ctx.session.totalCalculado || 0;

    let detalle = '';
    Object.keys(ctx.session.carrito).forEach(id => {
      const p = PRODUCTOS[id];
      const cant = ctx.session.carrito[id];
      const sub = Number((obtenerPrecio(p, prov, moneda) * cant).toFixed(2));
      detalle += '- ' + cant + 'x ' + p.nombre + ' (' + sub + ' ' + moneda + ')\n';
    });

    const ordenId = 'PED-' + Math.floor(1000 + Math.random() * 9000);
    if (!PEDIDOS_USUARIOS[clienteId]) {
      PEDIDOS_USUARIOS[clienteId] = [];
    }
    
    const nuevoPedido = {
      id: ordenId,
      estado: '⏳ En espera (Verificando pago)',
      total: totalPagar + ' ' + moneda,
      fecha: new Date().toLocaleDateString(),
      detalle: detalle,
      provincia: prov,
      metodo: metodo,
      nombreCliente: ctx.from.first_name
    };
    PEDIDOS_USUARIOS[clienteId].push(nuevoPedido);

    ctx.session.paso = null;
    ctx.session.carrito = {};

    await bot.telegram.sendPhoto(ADMIN_CHAT_ID, fotoId, {
      caption: 
        '🚨 *NUEVO COMPROBANTE DE PAGO (' + ordenId + ')*\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        '👤 Cliente: @' + (ctx.from.username || ctx.from.first_name) + ' (ID: `' + clienteId + '`)\n' +
        '📍 Destino: ' + prov + '\n' +
        '💳 Método: ' + metodo + ' | 💰 *Total:* `' + totalPagar + ' ' + moneda + '`\n\n' +
        '🏠 *Entrega:*\n' + ctx.session.datosEntrega + '\n\n' +
        '¿Aprobar este pago y registrar pedido?',
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Aprobar Pago', 'aprobar_' + clienteId + '_' + ordenId),
          Markup.button.callback('❌ Rechazar', 'rechazar_' + clienteId + '_' + ordenId)
        ]
      ])
    });

    await ctx.reply(
      '⏳ *¡Pedido ' + ordenId + ' registrado y comprobante enviado!*\n\n' +
      'Puedes revisar el estado actual de tu compra en cualquier momento haciendo clic en el botón *📦 Mis Pedidos* en el menú principal.',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📦 Ver Mis Pedidos', 'mis_pedidos')],
          [Markup.button.callback('🏠 Menú Principal', 'volver_inicio')]
        ])
      }
    );
  }
});

bot.action('mis_pedidos', async (ctx) => {
  const clienteId = ctx.from.id;
  const pedidos = PEDIDOS_USUARIOS[clienteId] || [];

  if (pedidos.length === 0) {
    return ctx.answerCbQuery('📦 No tienes ningún pedido registrado todavía.', { show_alert: true });
  }

  let texto = '📦 *TUS PEDIDOS REALIZADOS*\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  pedidos.forEach(ped => {
    texto += '🔹 *Pedido:* `' + ped.id + '`\n' +
             '💰 *Total:* `' + ped.total + '`\n' +
             '📊 *Estado:* ' + ped.estado + '\n' +
             '📅 *Fecha:* ' + ped.fecha + '\n' +
             '-----------------------------------\n';
  });

  try { await ctx.deleteMessage(); } catch (e) {}
  ctx.reply(texto, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Actualizar Estado', 'mis_pedidos')],
      [Markup.button.callback('🏠 Menú Principal', 'volver_inicio')]
    ])
  });
});

bot.action(/aprobar_(.+)_(.+)/, async (ctx) => {
  const clienteId = ctx.match[1];
  const ordenId = ctx.match[2];

  let pedidoInfo = null;
  if (PEDIDOS_USUARIOS[clienteId]) {
    const ped = PEDIDOS_USUARIOS[clienteId].find(p => p.id === ordenId);
    if (ped) {
      ped.estado = '🔄 Procesando / En preparación';
      pedidoInfo = ped;
    }
  }

  try {
    await bot.telegram.sendMessage(
      clienteId,
      '🎉 *¡PAGO VERIFICADO Y PEDIDO APROBADO!* 🎉\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Tu pedido *' + ordenId + '* ha sido confirmado por administración.\n\n' +
      '📊 Estado actual: *En preparación / Procesando envío*.\n' +
      'A continuación te enviamos tu **Factura Oficial en PDF**.',
      { parse_mode: 'Markdown' }
    );

    if (pedidoInfo) {
      generarFacturaPDF(ordenId, pedidoInfo.nombreCliente || 'Cliente', pedidoInfo.provincia, pedidoInfo.metodo, pedidoInfo.total, pedidoInfo.detalle, async (pdfPath) => {
        await bot.telegram.sendDocument(clienteId, { source: pdfPath, filename: 'Factura_' + ordenId + '.pdf' }, {
          caption: '📄 Aquí tienes tu comprobante y factura digital oficial de compra.'
        });
        try { fs.unlinkSync(pdfPath); } catch (err) {}
      });
    }

    await ctx.editMessageCaption(
      '✅ *Orden ' + ordenId + ' Aprobada con Factura PDF enviada.*\nSelecciona el siguiente avance para notificar al cliente:',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🚚 Marcar En Camino', 'camino_' + clienteId + '_' + ordenId)],
          [Markup.button.callback('✅ Marcar Entregado', 'entregado_' + clienteId + '_' + ordenId)]
        ])
      }
    );
  } catch (e) {
    await ctx.reply('⚠️ Error al procesar la aprobación o generar el PDF.');
  }
});

bot.action(/camino_(.+)_(.+)/, async (ctx) => {
  const clienteId = ctx.match[1];
  const ordenId = ctx.match[2];

  if (PEDIDOS_USUARIOS[clienteId]) {
    const ped = PEDIDOS_USUARIOS[clienteId].find(p => p.id === ordenId);
    if (ped) ped.estado = '🚚 En camino / Transportando';
  }

  await bot.telegram.sendMessage(clienteId, '🚚 *¡Actualización de Envío!*\nTu pedido *' + ordenId + '* ya va en camino hacia el destino en Cuba.', { parse_mode: 'Markdown' });
  await ctx.editMessageCaption('🚚 *Orden ' + ordenId + ' marcada como "En camino".*', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('✅ Marcar Entregado ahora', 'entregado_' + clienteId + '_' + ordenId)]
    ])
  });
});

bot.action(/entregado_(.+)_(.+)/, async (ctx) => {
  const clienteId = ctx.match[1];
  const ordenId = ctx.match[2];

  if (PEDIDOS_USUARIOS[clienteId]) {
    const ped = PEDIDOS_USUARIOS[clienteId].find(p => p.id === ordenId);
    if (ped) ped.estado = '✅ Entregado con éxito';
  }

  await bot.telegram.sendMessage(
    clienteId, 
    '✅ *¡PEDIDO ENTREGADO!* ✅\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    'Te informamos que tu pedido *' + ordenId + '* ha sido entregado exitosamente a tu familiar en Cuba.\n\n' +
    '¡Gracias por confiar en nosotros! Puedes ver el historial completo en *📦 Mis Pedidos*.\n\n' +
    '🇷🇺 ✈️ 🇨🇺 *¡Esperamos tu próxima compra!*',
    { parse_mode: 'Markdown' }
  );

  await ctx.editMessageCaption('✅ *Orden ' + ordenId + ' marcada como "Entregada". Proceso finalizado.*', { parse_mode: 'Markdown' });
});

bot.action(/rechazar_(.+)_(.+)/, async (ctx) => {
  const clienteId = ctx.match[1];
  const ordenId = ctx.match[2];

  if (PEDIDOS_USUARIOS[clienteId]) {
    const ped = PEDIDOS_USUARIOS[clienteId].find(p => p.id === ordenId);
    if (ped) ped.estado = '❌ Pago rechazado';
  }

  await bot.telegram.sendMessage(clienteId, '❌ *Tu comprobante del pedido ' + ordenId + ' fue rechazado.* Contacta a soporte.', { parse_mode: 'Markdown' });
  await ctx.editMessageCaption('❌ *Pago rechazado para la orden ' + ordenId + '.*', { parse_mode: 'Markdown' });
});

bot.action('volver_inicio', (ctx) => {
  ctx.session.paso = null;
  ctx.reply('Menú Principal:', Markup.inlineKeyboard([
    [Markup.button.callback('🛍️ Ver Catálogo', 'menu_categorias'), Markup.button.callback('🛒 Ver Carrito', 'ver_carrito')],
    [Markup.button.callback('📦 Mis Pedidos', 'mis_pedidos')]
  ]));
});

bot.launch();
console.log('🤖 ¡Bot empresarial con Facturas PDF y Grupo de Admin iniciado con éxito!');
