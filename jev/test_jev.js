/**
 * TEST SUITE: MOTOR DE INTELIGENCIA ARTIFICIAL JEV
 * Verifica los 7 escenarios requeridos:
 * 1. Pedido individual
 * 2. Pedido de pareja
 * 3. Pedido familiar
 * 4. Pedido grupal
 * 5. Carrito con bebidas incluidas (no debe recomendar bebida de nuevo)
 * 6. Carrito vacío
 * 7. Transacciones de Neon con cold-start
 */

const { generarRecomendacionJev } = require('./motorJev');

// Catálogo de prueba con los 12 productos del proyecto
const catalogoTest = [
  { id: 'clasica', nombre: 'Pizza Margherita Clásica', categoria: 'pizza', precio: 19.90 },
  { id: 'pepperoni', nombre: 'Pizza Pepperoni Supreme', categoria: 'pizza', precio: 25.90 },
  { id: 'cuatro-quesos', nombre: 'Pizza Quattro Formaggi', categoria: 'pizza', precio: 27.50 },
  { id: 'carnivora', nombre: 'Pizza Carnívora Rústica', categoria: 'pizza', precio: 29.90 },
  { id: 'vegetariana', nombre: 'Pizza Huerta Silvestre', categoria: 'pizza', precio: 23.90 },
  { id: 'bbq-crunch', nombre: 'Pizza Pollo BBQ Ahumado', categoria: 'pizza', precio: 26.50 },
  { id: 'pan-ajo', nombre: 'Pan al Ajo Supremo con Queso', categoria: 'entradas', precio: 10.90 },
  { id: 'tequenos', nombre: 'Tequeños Rellenos de Queso (6 uds)', categoria: 'entradas', precio: 13.50 },
  { id: 'gaseosa-15', nombre: 'Inca Kola / Coca Cola 1.5 L', categoria: 'bebidas', precio: 9.50 },
  { id: 'chicha-jarra', nombre: 'Jarra de Chicha Morada 1 L', categoria: 'bebidas', precio: 11.00 },
  { id: 'cerveza-artesanal', nombre: 'Cerveza Artesanal IPA 330ml', categoria: 'bebidas', precio: 14.00 },
  { id: 'tiramisu', nombre: 'Tiramisú Tradicional de Café', categoria: 'postres', precio: 12.50 }
];

const pedidosNeonTest = []; // 0 pedidos en Neon para validar cold-start híbrido

console.log('===============================================================');
console.log('🧪 EJECUTANDO BATERÍA DE PRUEBAS DEL MOTOR JEV');
console.log('===============================================================\n');

// PRUEBA 1: Pedido Individual
console.log('▶️ TEST 1: Pedido Individual (1 Pizza Margherita Clásica S/ 19.90)');
const r1 = generarRecomendacionJev(
  [{ id: 'clasica', nombre: 'Pizza Margherita Clásica', categoria: 'pizza', precio: 19.90, cantidad: 1 }],
  { hora: 13, diaSemana: 2 },
  pedidosNeonTest,
  catalogoTest
);
console.log('   Perfil detectado:', r1.perfilDetectado.clase, `(${(r1.perfilDetectado.probabilidad * 100).toFixed(1)}%)`);
console.log('   Recomendación:', r1.recomendacionPrincipal?.nombre);
console.log('   Algoritmo:', r1.recomendacionPrincipal?.algoritmo);
console.log('   Motivo:', r1.recomendacionPrincipal?.motivo);
console.log('   ¿OK?:', r1.perfilDetectado.clase === 'Individual' ? '✅ APROBADO' : '❌ FALLÓ');
console.log('');

// PRUEBA 2: Pedido de Pareja
console.log('▶️ TEST 2: Pedido de Pareja (1 Pizza Pepperoni + 1 Pan al Ajo = S/ 36.80)');
const r2 = generarRecomendacionJev(
  [
    { id: 'pepperoni', nombre: 'Pizza Pepperoni Supreme', categoria: 'pizza', precio: 25.90, cantidad: 1 },
    { id: 'pan-ajo', nombre: 'Pan al Ajo Supremo con Queso', categoria: 'entradas', precio: 10.90, cantidad: 1 }
  ],
  { hora: 20, diaSemana: 5 },
  pedidosNeonTest,
  catalogoTest
);
console.log('   Perfil detectado:', r2.perfilDetectado.clase, `(${(r2.perfilDetectado.probabilidad * 100).toFixed(1)}%)`);
console.log('   Recomendación:', r2.recomendacionPrincipal?.nombre);
console.log('   Algoritmo:', r2.recomendacionPrincipal?.algoritmo);
console.log('   Motivo:', r2.recomendacionPrincipal?.motivo);
console.log('   ¿OK?:', r2.perfilDetectado.clase === 'Pareja' ? '✅ APROBADO' : '❌ FALLÓ');
console.log('');

// PRUEBA 3: Pedido Familiar
console.log('▶️ TEST 3: Pedido Familiar (2 Pizzas = S/ 55.80)');
const r3 = generarRecomendacionJev(
  [
    { id: 'pepperoni', nombre: 'Pizza Pepperoni Supreme', categoria: 'pizza', precio: 25.90, cantidad: 1 },
    { id: 'carnivora', nombre: 'Pizza Carnívora Rústica', categoria: 'pizza', precio: 29.90, cantidad: 1 }
  ],
  { hora: 21, diaSemana: 6 },
  pedidosNeonTest,
  catalogoTest
);
console.log('   Perfil detectado:', r3.perfilDetectado.clase, `(${(r3.perfilDetectado.probabilidad * 100).toFixed(1)}%)`);
console.log('   Recomendación:', r3.recomendacionPrincipal?.nombre);
console.log('   Algoritmo:', r3.recomendacionPrincipal?.algoritmo);
console.log('   Motivo:', r3.recomendacionPrincipal?.motivo);
console.log('   ¿OK?:', (r3.perfilDetectado.clase === 'Familiar' && r3.recomendacionPrincipal?.id === 'gaseosa-15') ? '✅ APROBADO' : '❌ FALLÓ');
console.log('');

// PRUEBA 4: Pedido Grupal
console.log('▶️ TEST 4: Pedido Grupal (3 Pizzas + 2 Entradas = S/ 107.00)');
const r4 = generarRecomendacionJev(
  [
    { id: 'pepperoni', nombre: 'Pizza Pepperoni Supreme', categoria: 'pizza', precio: 25.90, cantidad: 1 },
    { id: 'cuatro-quesos', nombre: 'Pizza Quattro Formaggi', categoria: 'pizza', precio: 27.50, cantidad: 1 },
    { id: 'bbq-crunch', nombre: 'Pizza Pollo BBQ Ahumado', categoria: 'pizza', precio: 26.50, cantidad: 1 },
    { id: 'pan-ajo', nombre: 'Pan al Ajo Supremo con Queso', categoria: 'entradas', precio: 10.90, cantidad: 1 }
  ],
  { hora: 22, diaSemana: 5 },
  pedidosNeonTest,
  catalogoTest
);
console.log('   Perfil detectado:', r4.perfilDetectado.clase, `(${(r4.perfilDetectado.probabilidad * 100).toFixed(1)}%)`);
console.log('   Recomendación:', r4.recomendacionPrincipal?.nombre);
console.log('   Algoritmo:', r4.recomendacionPrincipal?.algoritmo);
console.log('   Motivo:', r4.recomendacionPrincipal?.motivo);
console.log('   ¿OK?:', r4.perfilDetectado.clase === 'Grupal' ? '✅ APROBADO' : '❌ FALLÓ');
console.log('');

// PRUEBA 5: Carrito con bebida ya incluida
console.log('▶️ TEST 5: Carrito con Pizza + Gaseosa 1.5L ya incluida (NO DEBE RECOMENDAR BEBIDA)');
const r5 = generarRecomendacionJev(
  [
    { id: 'pepperoni', nombre: 'Pizza Pepperoni Supreme', categoria: 'pizza', precio: 25.90, cantidad: 1 },
    { id: 'gaseosa-15', nombre: 'Inca Kola / Coca Cola 1.5 L', categoria: 'bebidas', precio: 9.50, cantidad: 1 }
  ],
  { hora: 20, diaSemana: 5 },
  pedidosNeonTest,
  catalogoTest
);
console.log('   Recomendación:', r5.recomendacionPrincipal?.nombre);
console.log('   Categoría de recomendación:', r5.recomendacionPrincipal?.categoria);
console.log('   ¿Excluye bebidas ya seleccionadas?:', r5.recomendacionPrincipal?.categoria !== 'bebidas' ? '✅ APROBADO' : '❌ FALLÓ');
console.log('');

// PRUEBA 6: Carrito Vacío
console.log('▶️ TEST 6: Carrito Vacío');
const r6 = generarRecomendacionJev(
  [],
  { hora: 14, diaSemana: 2 },
  pedidosNeonTest,
  catalogoTest
);
console.log('   Perfil detectado:', r6.perfilDetectado.clase);
console.log('   Recomendación base:', r6.recomendacionPrincipal?.nombre);
console.log('   ¿Maneja carrito vacío sin errores?:', r6.recomendacionPrincipal ? '✅ APROBADO' : '❌ FALLÓ');
console.log('');

// PRUEBA 7: Verificación del conjunto de datos híbrido / cold-start
console.log('▶️ TEST 7: Auditoría de Datos Híbridos (Neon vs Benchmark)');
console.log('   Total transacciones evaluadas:', r1.infoTransaccionesMBA.total);
console.log('   Transacciones reales en Neon:', r1.infoTransaccionesMBA.realesNeon);
console.log('   Transacciones benchmark rotuladas:', r1.infoTransaccionesMBA.benchmark);
console.log('   Modo Híbrido Activo:', r1.infoTransaccionesMBA.modoHibrido ? 'Sí (Garantiza rigor estadístico sin inventar datos)' : 'No (100% Neon)');
console.log('');

console.log('===============================================================');
console.log('🎯 TODAS LAS PRUEBAS COMPLETADAS');
console.log('===============================================================');
