/**
 * JEV - MOTOR DE INTELIGENCIA ARTIFICIAL PRINCIPAL
 * Orquesta los tres componentes:
 * 1. Reglas Contextuales (Hora, Día, Categorías Faltantes)
 * 2. Market Basket Analysis (Support, Confidence, Lift)
 * 3. Clasificador Probabilístico Naive Bayes (Perfil de Compra)
 * 
 * Garantiza:
 * - Recomendaciones explicables (con motivo claro para el comensal).
 * - Exclusión estricta de productos ya presentes en el carrito.
 * - Alta velocidad de respuesta (< 15 ms).
 */

const { evaluarReglasContextuales } = require('./contextual');
const { recomendarPorMBA } = require('./marketBasket');
const { clasificarPerfilCompra, entrenarNaiveBayes } = require('./naiveBayes');

/**
 * Genera la recomendación principal para el carrito actual.
 */
function generarRecomendacionJev(carritoItems = [], contexto = {}, pedidosNeon = [], catalogoProductos = []) {
  // Asegurar que Naive Bayes esté entrenado
  entrenarNaiveBayes(pedidosNeon, catalogoProductos);

  const idsEnCarrito = new Set((carritoItems || []).map(it => it.id));

  // 1. Clasificación Naive Bayes
  const resultadoBayes = clasificarPerfilCompra(carritoItems, catalogoProductos, pedidosNeon);
  const perfil = resultadoBayes.perfilGanador;

  // 2. Market Basket Analysis
  const resultadoMBA = recomendarPorMBA(carritoItems, pedidosNeon, catalogoProductos);

  // 3. Reglas Contextuales
  const resultadoContextual = evaluarReglasContextuales(carritoItems, contexto, catalogoProductos);

  // 4. Mapeo de sugerencias específicas del perfil Naive Bayes
  const sugerenciasBayes = [];
  if (perfil === 'Familiar') {
    if (!idsEnCarrito.has('gaseosa-15')) {
      sugerenciasBayes.push({
        idProducto: 'gaseosa-15',
        score: 0.90,
        motivo: `IA JEV estimó un pedido Familiar (${(resultadoBayes.probabilidad * 100).toFixed(0)}% prob.). La bebida de 1.5 L es perfecta para la mesa.`
      });
    }
  } else if (perfil === 'Grupal') {
    if (!idsEnCarrito.has('tequenos')) {
      sugerenciasBayes.push({
        idProducto: 'tequenos',
        score: 0.92,
        motivo: `IA JEV estimó un pedido Grupal (${(resultadoBayes.probabilidad * 100).toFixed(0)}% prob.). Una porción de tequeños x 6 rinde perfecto mientras llega la pizza.`
      });
    }
  } else if (perfil === 'Pareja') {
    if (!idsEnCarrito.has('pan-ajo')) {
      sugerenciasBayes.push({
        idProducto: 'pan-ajo',
        score: 0.88,
        motivo: `IA JEV estimó un pedido en Pareja (${(resultadoBayes.probabilidad * 100).toFixed(0)}% prob.). El Pan al Ajo con mozzarella gratinada es ideal para dos.`
      });
    }
  } else if (perfil === 'Individual') {
    if (!idsEnCarrito.has('chicha-jarra')) {
      sugerenciasBayes.push({
        idProducto: 'chicha-jarra',
        score: 0.82,
        motivo: `IA JEV estimó un consumo Individual (${(resultadoBayes.probabilidad * 100).toFixed(0)}% prob.). Marida tu pedido con nuestra chicha morada tradicional.`
      });
    }
  }

  // 5. Tabla de puntuación ponderada para candidatos
  const candidatosMap = new Map();

  function agregarCandidato(id, score, motivo, algoritmo, extras = {}) {
    if (idsEnCarrito.has(id)) return; // Nunca recomendar lo que ya está en el carrito
    const prod = catalogoProductos.find(p => p.id === id);
    if (!prod) return;

    if (!candidatosMap.has(id)) {
      candidatosMap.set(id, {
        id,
        producto: prod,
        scoreFinal: 0,
        motivos: [],
        algoritmos: new Set(),
        detallesMBA: null
      });
    }

    const cand = candidatosMap.get(id);
    cand.scoreFinal += score;
    cand.motivos.push(motivo);
    cand.algoritmos.add(algoritmo);
    if (extras.metadatosMBA) cand.detallesMBA = extras.metadatosMBA;
  }

  // Integrar MBA (peso 40%)
  for (const r of resultadoMBA.recomendaciones) {
    agregarCandidato(r.idProducto, r.score * 0.40, r.motivo, 'Market Basket Analysis (MBA)', {
      metadatosMBA: r.metadatosMBA
    });
  }

  // Integrar Contextual (peso 35%)
  for (const r of resultadoContextual) {
    agregarCandidato(r.idProducto, r.score * 0.35, r.motivo, 'Reglas Contextuales');
  }

  // Integrar Naive Bayes (peso 25%)
  for (const r of sugerenciasBayes) {
    agregarCandidato(r.idProducto, r.score * 0.25, r.motivo, 'Clasificador Naive Bayes');
  }

  // Si no hay candidatos o carrito está vacío, sugerir el producto más aclamado no presente
  if (candidatosMap.size === 0) {
    const defaultId = !idsEnCarrito.has('pepperoni') ? 'pepperoni' : 'clasica';
    const prodDef = catalogoProductos.find(p => p.id === defaultId) || catalogoProductos[0];
    if (prodDef && !idsEnCarrito.has(prodDef.id)) {
      agregarCandidato(
        prodDef.id,
        0.75,
        'La pizza insignia de Pizza al Paso, horneada en leña a 450°C.',
        'Recomendación Base'
      );
    }
  }

  // Ordenar candidatos por score ponderado
  const ordenados = Array.from(candidatosMap.values()).sort((a, b) => b.scoreFinal - a.scoreFinal);

  const mejorCandidato = ordenados[0] || null;

  return {
    perfilDetectado: {
      clase: perfil,
      probabilidad: resultadoBayes.probabilidad,
      distribucion: resultadoBayes.distribucion,
      explicacion: resultadoBayes.explicacion
    },
    recomendacionPrincipal: mejorCandidato ? {
      id: mejorCandidato.id,
      nombre: mejorCandidato.producto.nombre,
      precio: Number(mejorCandidato.producto.precio),
      imagen: mejorCandidato.producto.imagen,
      categoria: mejorCandidato.producto.categoria,
      motivo: mejorCandidato.motivos[0],
      algoritmo: Array.from(mejorCandidato.algoritmos).join(' + '),
      detallesMBA: mejorCandidato.detallesMBA,
      score: Number(mejorCandidato.scoreFinal.toFixed(3))
    } : null,
    totalCandidatosEvaluados: ordenados.length,
    infoTransaccionesMBA: resultadoMBA.infoTransacciones
  };
}

module.exports = {
  generarRecomendacionJev
};
