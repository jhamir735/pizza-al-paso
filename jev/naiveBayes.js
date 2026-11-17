/**
 * JEV - COMPONENTE C: CLASIFICADOR NAIVE BAYES (TIPO DE COMPRA)
 * 
 * Estima probabilísticamente el perfil del pedido entre 4 clases:
 * 1. Individual (1 persona)
 * 2. Pareja (2 personas)
 * 3. Familiar (3-4 personas)
 * 4. Grupal (5+ personas)
 * 
 * Variables predictoras:
 * - cantPizzas: '1_pizza' | '2_pizzas' | '3_mas_pizzas'
 * - cantItems: '1_2_items' | '3_4_items' | '5_mas_items'
 * - rangoMonto: 'bajo' (< S/ 35) | 'medio' (S/ 35 - S/ 65) | 'alto' (> S/ 65)
 * - tieneBebidaFamiliar: 'si' | 'no'
 * 
 * Implementa Teorema de Bayes con suavizado de Laplace (+1)
 * y reentrenamiento explícito frente a nuevos pedidos.
 */

const { transaccionesBenchmark } = require('./datasetInicial');

const CLASES = ['Individual', 'Pareja', 'Familiar', 'Grupal'];

// Espacios de estados posibles para las variables discretas (|V|)
const ESPACIOS_VALORES = {
  cantPizzas: ['0_pizzas', '1_pizza', '2_pizzas', '3_mas_pizzas'],
  tieneEntradaCompartir: ['si', 'no'],
  rangoMonto: ['bajo', 'medio', 'alto'],
  tieneBebidaFamiliar: ['si', 'no']
};

// Estructura del modelo entrenado
let modeloEntrenado = null;

/**
 * Extrae el vector de variables discretas a partir de una lista de ítems y catálogo.
 */
function extraerVariables(items = [], catalogoProductos = []) {
  let conteoPizzas = 0;
  let conteoTotal = 0;
  let montoTotal = 0;
  let tieneBebidaFam = 'no';
  let tieneEntradaComp = 'no';

  for (const it of items) {
    const cant = Number(it.cantidad) || 1;
    conteoTotal += cant;

    const prodInfo = catalogoProductos.find(p => p.id === (it.id || it.idProducto)) || {};
    const cat = prodInfo.categoria || it.categoria || '';
    const precio = Number(it.precio || prodInfo.precio) || 0;
    montoTotal += (precio * cant);

    const esPizza = cat === 'pizza' || (it.nombre && it.nombre.toLowerCase().includes('pizza')) || ['clasica', 'pepperoni', 'cuatro-quesos', 'carnivora', 'vegetariana', 'bbq-crunch'].includes(it.id);
    if (esPizza) {
      conteoPizzas += cant;
    }

    if (it.id === 'pan-ajo' || it.id === 'tequenos' || cat === 'entradas') {
      tieneEntradaComp = 'si';
    }

    if (it.id === 'gaseosa-15' || (prodInfo.nombre && prodInfo.nombre.includes('1.5'))) {
      tieneBebidaFam = 'si';
    }
  }

  // Discretizaciones refinadas
  let varPizzas = '0_pizzas';
  if (conteoPizzas === 1) varPizzas = '1_pizza';
  else if (conteoPizzas === 2) varPizzas = '2_pizzas';
  else if (conteoPizzas >= 3) varPizzas = '3_mas_pizzas';

  const varMonto = montoTotal < 30 ? 'bajo' : (montoTotal <= 60 ? 'medio' : 'alto');

  return {
    cantPizzas: varPizzas,
    tieneEntradaCompartir: tieneEntradaComp,
    rangoMonto: varMonto,
    tieneBebidaFamiliar: tieneBebidaFam,
    metricasRaw: { conteoPizzas, conteoTotal, montoTotal }
  };
}

/**
 * Función de inferencia para clasificar un pedido histórico existente según su consumo.
 */
function inferirPerfilHistorico(cantPizzas, cantItems, monto) {
  if (cantPizzas >= 3 || cantItems >= 5 || monto > 75) return 'Grupal';
  if (cantPizzas === 2 || (cantItems >= 3 && monto >= 45)) return 'Familiar';
  if (cantPizzas === 1 && cantItems >= 2 && monto >= 30) return 'Pareja';
  return 'Individual';
}

/**
 * Entrena el modelo probabilístico Naive Bayes con los pedidos de Neon y/o benchmark.
 */
function entrenarNaiveBayes(pedidosNeon = [], catalogoProductos = []) {
  // 1. Inicializar contadores
  const conteoClases = { Individual: 0, Pareja: 0, Familiar: 0, Grupal: 0 };
  const conteoCondicional = {};

  for (const c of CLASES) {
    conteoCondicional[c] = {};
    for (const [variable, valores] of Object.entries(ESPACIOS_VALORES)) {
      conteoCondicional[c][variable] = {};
      for (const val of valores) {
        conteoCondicional[c][variable][val] = 0;
      }
    }
  }

  // 2. Preparar datos de entrenamiento
  const muestrasEntrenamiento = [];

  // Muestras del benchmark inicial
  for (const b of transaccionesBenchmark) {
    const itemsCompletos = b.items.map(id => ({ id, cantidad: 1 }));
    const vars = extraerVariables(itemsCompletos, catalogoProductos);
    muestrasEntrenamiento.push({
      perfil: b.perfil,
      features: vars,
      origen: 'Benchmark'
    });
  }

  // Muestras reales desde Neon PostgreSQL
  for (const ped of pedidosNeon) {
    let items = ped.items;
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (e) { items = []; }
    }
    if (Array.isArray(items) && items.length > 0) {
      const vars = extraerVariables(items, catalogoProductos);
      const perfilReal = inferirPerfilHistorico(
        vars.metricasRaw.conteoPizzas,
        vars.metricasRaw.conteoTotal,
        vars.metricasRaw.montoTotal
      );
      muestrasEntrenamiento.push({
        perfil: perfilReal,
        features: vars,
        origen: 'Neon PostgreSQL'
      });
    }
  }

  const N = muestrasEntrenamiento.length;

  // 3. Acumulación de frecuencias
  for (const muestra of muestrasEntrenamiento) {
    const c = muestra.perfil;
    if (conteoClases[c] !== undefined) {
      conteoClases[c]++;
      const feats = muestra.features;
      for (const [variable, valor] of Object.entries(feats)) {
        if (conteoCondicional[c][variable] && conteoCondicional[c][variable][valor] !== undefined) {
          conteoCondicional[c][variable][valor]++;
        }
      }
    }
  }

  // 4. Calcular probabilidades a priori y verosimilitudes con Laplace (+1)
  const prioris = {};
  const verosimilitudes = {};

  for (const c of CLASES) {
    prioris[c] = (conteoClases[c] + 1) / (N + CLASES.length);
    verosimilitudes[c] = {};

    for (const [variable, valores] of Object.entries(ESPACIOS_VALORES)) {
      verosimilitudes[c][variable] = {};
      const totalEnClase = conteoClases[c];
      const tamanoVocabulario = valores.length;

      for (const val of valores) {
        const conteo = conteoCondicional[c][variable][val] || 0;
        // Suavizado de Laplace: (conteo + 1) / (total + |V|)
        verosimilitudes[c][variable][val] = (conteo + 1) / (totalEnClase + tamanoVocabulario);
      }
    }
  }

  modeloEntrenado = {
    totalMuestras: N,
    conteoRealesNeon: pedidosNeon.length,
    conteoBenchmark: transaccionesBenchmark.length,
    fechaEntrenamiento: new Date().toISOString(),
    prioris,
    verosimilitudes
  };

  return modeloEntrenado;
}

/**
 * Clasifica probabilísticamente un carrito usando el Teorema de Bayes.
 */
function clasificarPerfilCompra(carritoItems = [], catalogoProductos = [], pedidosNeon = []) {
  if (!modeloEntrenado) {
    entrenarNaiveBayes(pedidosNeon, catalogoProductos);
  }

  if (!carritoItems || carritoItems.length === 0) {
    return {
      perfilGanador: 'Individual',
      probabilidad: 1.0,
      distribucion: { Individual: 1.0, Pareja: 0, Familiar: 0, Grupal: 0 },
      explicacion: 'Carrito vacío: perfil inicial individual predeterminado.'
    };
  }

  const features = extraerVariables(carritoItems, catalogoProductos);
  const logScores = {};

  for (const c of CLASES) {
    // log P(C)
    let logProb = Math.log(modeloEntrenado.prioris[c]);

    // sum log P(X_i | C)
    for (const [variable, valor] of Object.entries(features)) {
      if (modeloEntrenado.verosimilitudes[c][variable] && modeloEntrenado.verosimilitudes[c][variable][valor]) {
        const pCond = modeloEntrenado.verosimilitudes[c][variable][valor];
        logProb += Math.log(pCond);
      }
    }

    logScores[c] = logProb;
  }

  // Softmax estable
  const maxLog = Math.max(...Object.values(logScores));
  let sumaExp = 0;
  const expScores = {};

  for (const c of CLASES) {
    expScores[c] = Math.exp(logScores[c] - maxLog);
    sumaExp += expScores[c];
  }

  const distribucion = {};
  let perfilGanador = CLASES[0];
  let maxProb = -1;

  for (const c of CLASES) {
    const prob = expScores[c] / sumaExp;
    distribucion[c] = Number(prob.toFixed(4));
    if (prob > maxProb) {
      maxProb = prob;
      perfilGanador = c;
    }
  }

  return {
    perfilGanador,
    probabilidad: Number(maxProb.toFixed(4)),
    distribucion,
    featuresExtraidas: features,
    explicacion: `Clasificador Naive Bayes determinó perfil "${perfilGanador}" con ${(maxProb * 100).toFixed(1)}% de probabilidad calculada.`
  };
}

module.exports = {
  entrenarNaiveBayes,
  clasificarPerfilCompra,
  extraerVariables
};
