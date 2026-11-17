/**
 * JEV - DATASET INICIAL DE CALIBRACIÓN (COLD-START BENCHMARK)
 * Proporciona transacciones de referencia gastronómica basadas en los 12 productos reales
 * del catálogo de Pizza al Paso.
 * 
 * Se utiliza para calibrar el Market Basket Analysis y entrenar el clasificador Naive Bayes
 * mientras la base de datos de Neon acumula nuevas comandas reales.
 */

const ORIGEN_BENCHMARK = 'Benchmark Histórico de Referencia Gastronómica (Pizzería al Paso)';

const transaccionesBenchmark = [
  // 1-7: Perfiles Individuales (1 persona: 1 pizza o 1 pizza + bebida personal, < S/ 30)
  {
    id: 'TRX-B01',
    perfil: 'Individual',
    items: ['clasica'],
    hora: 13,
    diaSemana: 2
  },
  {
    id: 'TRX-B02',
    perfil: 'Individual',
    items: ['pepperoni'],
    hora: 14,
    diaSemana: 3
  },
  {
    id: 'TRX-B03',
    perfil: 'Individual',
    items: ['vegetariana'],
    hora: 13,
    diaSemana: 1
  },
  {
    id: 'TRX-B04',
    perfil: 'Individual',
    items: ['clasica', 'chicha-jarra'],
    hora: 14,
    diaSemana: 2
  },
  {
    id: 'TRX-B05',
    perfil: 'Individual',
    items: ['pepperoni', 'cerveza-artesanal'],
    hora: 21,
    diaSemana: 5
  },
  {
    id: 'TRX-B06',
    perfil: 'Individual',
    items: ['bbq-crunch'],
    hora: 14,
    diaSemana: 2
  },
  {
    id: 'TRX-B07',
    perfil: 'Individual',
    items: ['clasica', 'tiramisu'],
    hora: 20,
    diaSemana: 3
  },

  // 8-14: Perfiles Pareja (2 personas: 1 pizza + entrada para compartir / bebida, S/ 30 - S/ 55)
  {
    id: 'TRX-B08',
    perfil: 'Pareja',
    items: ['pepperoni', 'pan-ajo'],
    hora: 20,
    diaSemana: 5
  },
  {
    id: 'TRX-B09',
    perfil: 'Pareja',
    items: ['cuatro-quesos', 'tequenos'],
    hora: 21,
    diaSemana: 6
  },
  {
    id: 'TRX-B10',
    perfil: 'Pareja',
    items: ['carnivora', 'pan-ajo', 'cerveza-artesanal'],
    hora: 22,
    diaSemana: 6
  },
  {
    id: 'TRX-B11',
    perfil: 'Pareja',
    items: ['clasica', 'tequenos', 'chicha-jarra'],
    hora: 14,
    diaSemana: 0
  },
  {
    id: 'TRX-B12',
    perfil: 'Pareja',
    items: ['bbq-crunch', 'pan-ajo'],
    hora: 20,
    diaSemana: 4
  },
  {
    id: 'TRX-B13',
    perfil: 'Pareja',
    items: ['vegetariana', 'pan-ajo', 'chicha-jarra'],
    hora: 13,
    diaSemana: 3
  },
  {
    id: 'TRX-B14',
    perfil: 'Pareja',
    items: ['cuatro-quesos', 'pan-ajo', 'tiramisu'],
    hora: 21,
    diaSemana: 5
  },

  // 15-21: Perfiles Familiares (3-4 personas: 2 pizzas principales, S/ 50 - S/ 75)
  {
    id: 'TRX-B15',
    perfil: 'Familiar',
    items: ['pepperoni', 'clasica'],
    hora: 20,
    diaSemana: 5
  },
  {
    id: 'TRX-B16',
    perfil: 'Familiar',
    items: ['carnivora', 'clasica', 'gaseosa-15'],
    hora: 14,
    diaSemana: 0
  },
  {
    id: 'TRX-B17',
    perfil: 'Familiar',
    items: ['pepperoni', 'cuatro-quesos', 'gaseosa-15'],
    hora: 21,
    diaSemana: 6
  },
  {
    id: 'TRX-B18',
    perfil: 'Familiar',
    items: ['bbq-crunch', 'clasica', 'pan-ajo'],
    hora: 13,
    diaSemana: 0
  },
  {
    id: 'TRX-B19',
    perfil: 'Familiar',
    items: ['pepperoni', 'carnivora', 'gaseosa-15', 'pan-ajo'],
    hora: 20,
    diaSemana: 6
  },
  {
    id: 'TRX-B20',
    perfil: 'Familiar',
    items: ['clasica', 'vegetariana', 'gaseosa-15'],
    hora: 21,
    diaSemana: 5
  },
  {
    id: 'TRX-B21',
    perfil: 'Familiar',
    items: ['pepperoni', 'bbq-crunch', 'gaseosa-15'],
    hora: 19,
    diaSemana: 6
  },

  // 22-26: Perfiles Grupales (5+ personas: 3+ pizzas + entradas múltiples, > S/ 75)
  {
    id: 'TRX-B22',
    perfil: 'Grupal',
    items: ['pepperoni', 'carnivora', 'clasica', 'gaseosa-15'],
    hora: 21,
    diaSemana: 5
  },
  {
    id: 'TRX-B23',
    perfil: 'Grupal',
    items: ['cuatro-quesos', 'bbq-crunch', 'pepperoni', 'gaseosa-15', 'tequenos'],
    hora: 22,
    diaSemana: 6
  },
  {
    id: 'TRX-B24',
    perfil: 'Grupal',
    items: ['clasica', 'pepperoni', 'vegetariana', 'pan-ajo'],
    hora: 20,
    diaSemana: 0
  },
  {
    id: 'TRX-B25',
    perfil: 'Grupal',
    items: ['carnivora', 'bbq-crunch', 'cuatro-quesos', 'gaseosa-15', 'pan-ajo'],
    hora: 22,
    diaSemana: 5
  },
  {
    id: 'TRX-B26',
    perfil: 'Grupal',
    items: ['pepperoni', 'clasica', 'carnivora', 'tequenos', 'cerveza-artesanal'],
    hora: 21,
    diaSemana: 6
  }
];

module.exports = {
  ORIGEN_BENCHMARK,
  transaccionesBenchmark
};
