/**
 * JEV - COMPONENTE B: MARKET BASKET ANALYSIS (ANÁLISIS DE LA CESTA DE COMPRA)
 * Implementa minería de reglas de asociación calculando:
 * - Soporte (Support)
 * - Confianza (Confidence)
 * - Elevación (Lift)
 * 
 * Lee las comandas reales desde la columna `items` (JSONB) de Neon PostgreSQL.
 * En caso de frío de arranque (<15 pedidos reales), complementa con el conjunto benchmark
 * debidamente identificado.
 */

const { transaccionesBenchmark, ORIGEN_BENCHMARK } = require('./datasetInicial');

/**
 * Normaliza las transacciones a listas de IDs de productos.
 */
function prepararTransacciones(pedidosNeon = []) {
  const transaccionesReales = [];

  for (const ped of pedidosNeon) {
    let items = ped.items;
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (e) { items = []; }
    }
    if (Array.isArray(items) && items.length > 0) {
      const idsUnicos = [...new Set(items.map(it => it.id || it.nombre).filter(Boolean))];
      if (idsUnicos.length > 0) {
        transaccionesReales.push({
          id: ped.codigo || `PED-${ped.id}`,
          items: idsUnicos,
          tipo: 'Real Neon PostgreSQL'
        });
      }
    }
  }

  // Fusión con benchmark si hay menos de 15 pedidos reales
  const usarBenchmark = transaccionesReales.length < 15;
  const transaccionesFinales = usarBenchmark
    ? [
        ...transaccionesReales,
        ...transaccionesBenchmark.map(t => ({ id: t.id, items: t.items, tipo: ORIGEN_BENCHMARK }))
      ]
    : transaccionesReales;

  return {
    transacciones: transaccionesFinales,
    totalTransacciones: transaccionesFinales.length,
    conteoReales: transaccionesReales.length,
    conteoBenchmark: usarBenchmark ? transaccionesBenchmark.length : 0,
    modoHibrido: usarBenchmark
  };
}

/**
 * Calcula métricas de Support, Confidence y Lift para reglas de asociación.
 */
function calcularReglasAsociacion(transacciones) {
  const N = transacciones.length;
  if (N === 0) return [];

  // 1. Frecuencias individuales
  const freqIndiv = {};
  // 2. Frecuencias de pares
  const freqPares = {};

  for (const t of transacciones) {
    const items = t.items;
    // Frecuencias individuales
    for (const item of items) {
      freqIndiv[item] = (freqIndiv[item] || 0) + 1;
    }

    // Frecuencias de pares (sin orden)
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        const key = a < b ? `${a}|${b}` : `${b}|${a}`;
        freqPares[key] = (freqPares[key] || 0) + 1;
      }
    }
  }

  const reglas = [];

  // 3. Cálculo de métricas
  for (const [key, conteoJunto] of Object.entries(freqPares)) {
    const [itemA, itemB] = key.split('|');
    const countA = freqIndiv[itemA] || 0;
    const countB = freqIndiv[itemB] || 0;

    const supportAB = conteoJunto / N;
    const supportA = countA / N;
    const supportB = countB / N;

    // Regla: A -> B
    if (supportA > 0) {
      const confidenceA_B = supportAB / supportA;
      const liftA_B = supportB > 0 ? (confidenceA_B / supportB) : 1;

      reglas.push({
        antecedente: itemA,
        consecuente: itemB,
        support: Number(supportAB.toFixed(4)),
        confidence: Number(confidenceA_B.toFixed(4)),
        lift: Number(liftA_B.toFixed(4)),
        frecuenciaJunta: conteoJunto
      });
    }

    // Regla simétrica: B -> A
    if (supportB > 0) {
      const confidenceB_A = supportAB / supportB;
      const liftB_A = supportA > 0 ? (confidenceB_A / supportA) : 1;

      reglas.push({
        antecedente: itemB,
        consecuente: itemA,
        support: Number(supportAB.toFixed(4)),
        confidence: Number(confidenceB_A.toFixed(4)),
        lift: Number(liftB_A.toFixed(4)),
        frecuenciaJunta: conteoJunto
      });
    }
  }

  return reglas;
}

/**
 * Genera recomendaciones a partir del carrito actual usando las reglas de asociación calculadas.
 */
function recomendarPorMBA(carritoItems, pedidosNeon = [], catalogoProductos = []) {
  const dataset = prepararTransacciones(pedidosNeon);
  const reglas = calcularReglasAsociacion(dataset.transacciones);

  const idsEnCarrito = new Set(carritoItems.map(it => it.id));
  const candidatos = [];

  for (const idItem of idsEnCarrito) {
    // Buscar reglas donde el antecedente esté en el carrito y consecuente NO esté en el carrito
    const reglasAplicables = reglas.filter(r => r.antecedente === idItem && !idsEnCarrito.has(r.consecuente));

    for (const r of reglasAplicables) {
      // Filtrar solo asociaciones positivas (Lift > 1.0)
      if (r.lift > 1.0 && r.confidence >= 0.20) {
        const prodInfo = catalogoProductos.find(p => p.id === r.consecuente) || { nombre: r.consecuente };
        const prodOrigen = catalogoProductos.find(p => p.id === r.antecedente) || { nombre: r.antecedente };

        candidatos.push({
          idProducto: r.consecuente,
          score: Math.min(1, (r.lift / 3) * 0.5 + r.confidence * 0.5),
          support: r.support,
          confidence: r.confidence,
          lift: r.lift,
          origen: 'Market Basket Analysis (MBA)',
          antecedenteNombre: prodOrigen.nombre,
          consecuenteNombre: prodInfo.nombre,
          motivo: `Asociación de compra detectada: Quienes eligen ${prodOrigen.nombre} agregan también ${prodInfo.nombre} (Confianza: ${(r.confidence * 100).toFixed(0)}%, Lift: ${r.lift.toFixed(2)}x).`,
          metadatosMBA: {
            soporte: (r.support * 100).toFixed(1) + '%',
            confianza: (r.confidence * 100).toFixed(1) + '%',
            lift: r.lift.toFixed(2)
          }
        });
      }
    }
  }

  // Ordenar por mayor Lift y luego Confidence
  candidatos.sort((a, b) => (b.lift - a.lift) || (b.confidence - a.confidence));

  return {
    recomendaciones: candidatos,
    infoTransacciones: {
      total: dataset.totalTransacciones,
      realesNeon: dataset.conteoReales,
      benchmark: dataset.conteoBenchmark,
      modoHibrido: dataset.modoHibrido
    }
  };
}

module.exports = {
  prepararTransacciones,
  calcularReglasAsociacion,
  recomendarPorMBA
};
