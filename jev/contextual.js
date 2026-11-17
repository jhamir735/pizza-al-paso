/**
 * JEV - COMPONENTE A: REGLAS CONTEXTUALES
 * Analiza variables temporales y de carrito:
 * - Día de la semana (Lunes-Jueves vs Viernes-Domingo)
 * - Hora del pedido (Almuerzo vs Cena / Tarde)
 * - Cantidad y categorías presentes en el carrito (Pizzas, Bebidas, Entradas, Postres)
 */

function evaluarReglasContextuales(carritoItems, contexto, catalogoProductos) {
  const ahora = new Date();
  const hora = (contexto && typeof contexto.hora === 'number') ? contexto.hora : ahora.getHours();
  const diaSemana = (contexto && typeof contexto.diaSemana === 'number') ? contexto.diaSemana : ahora.getDay();

  const esFinDeSemana = (diaSemana === 0 || diaSemana === 5 || diaSemana === 6); // Vie, Sáb, Dom
  const esAlmuerzo = (hora >= 11 && hora < 16);
  const esCena = (hora >= 18 || hora < 4);

  // Mapear ítems del carrito con su categoría usando el catálogo
  const idsEnCarrito = new Set(carritoItems.map(it => it.id));
  const productosEnCarrito = carritoItems.map(it => {
    const infoCat = catalogoProductos.find(p => p.id === it.id) || {};
    return {
      id: it.id,
      nombre: it.nombre || infoCat.nombre,
      categoria: it.categoria || infoCat.categoria || 'pizza',
      cantidad: Number(it.cantidad) || 1,
      precio: Number(it.precio || infoCat.precio) || 0
    };
  });

  const conteoPizzas = productosEnCarrito
    .filter(p => p.categoria === 'pizza')
    .reduce((sum, p) => sum + p.cantidad, 0);

  const conteoBebidas = productosEnCarrito
    .filter(p => p.categoria === 'bebidas' || p.categoria === 'bebida')
    .reduce((sum, p) => sum + p.cantidad, 0);

  const conteoEntradas = productosEnCarrito
    .filter(p => p.categoria === 'entradas' || p.categoria === 'acompañamiento')
    .reduce((sum, p) => sum + p.cantidad, 0);

  const conteoPostres = productosEnCarrito
    .filter(p => p.categoria === 'postres' || p.categoria === 'postre')
    .reduce((sum, p) => sum + p.cantidad, 0);

  const sugerencias = [];

  // REGLA 1: Falta de Bebida
  if (conteoPizzas >= 1 && conteoBebidas === 0) {
    if (conteoPizzas >= 2 || esFinDeSemana) {
      if (!idsEnCarrito.has('gaseosa-15')) {
        sugerencias.push({
          idProducto: 'gaseosa-15',
          score: 0.95,
          origen: 'Regla Contextual: Bebida Familiar',
          motivo: 'Detectamos 2+ pizzas en tu mesa. Una gaseosa familiar helada de 1.5 L es el maridaje ideal para compartir.'
        });
      }
      if (!idsEnCarrito.has('chicha-jarra')) {
        sugerencias.push({
          idProducto: 'chicha-jarra',
          score: 0.88,
          origen: 'Regla Contextual: Bebida Artesanal',
          motivo: 'Jarra de Chicha Morada artesanal de 1L hecha en casa, ideal para maridar con pizzas al horno.'
        });
      }
    } else {
      // 1 sola pizza en almuerzo o noche
      const targetBebida = esCena ? 'cerveza-artesanal' : 'chicha-jarra';
      if (!idsEnCarrito.has(targetBebida)) {
        sugerencias.push({
          idProducto: targetBebida,
          score: 0.90,
          origen: 'Regla Contextual: Bebida Personal',
          motivo: esCena
            ? 'Una cerveza artesanal bien fría con notas cítricas es el acompañamiento perfecto para la noche.'
            : 'Refréscate al almuerzo con nuestra Chicha Morada artesanal con frutas naturales.'
        });
      }
    }
  }

  // REGLA 2: Tiene Pizza y Bebida, pero NO tiene Entradas para picar
  if (conteoPizzas >= 1 && conteoBebidas >= 1 && conteoEntradas === 0) {
    if (!idsEnCarrito.has('pan-ajo')) {
      sugerencias.push({
        idProducto: 'pan-ajo',
        score: 0.85,
        origen: 'Regla Contextual: Entrada Crujiente',
        motivo: 'Acompañamiento estrella: Pan al ajo crocante con mantequilla confitada y queso fior di latte gratinado.'
      });
    } else if (!idsEnCarrito.has('tequenos')) {
      sugerencias.push({
        idProducto: 'tequenos',
        score: 0.82,
        origen: 'Regla Contextual: Entrada para Compartir',
        motivo: 'Tequeños crocantes rellenos de queso andino derretido con salsa guacamole de la casa.'
      });
    }
  }

  // REGLA 3: Menú completo salado, sugerir Postre
  if (conteoPizzas >= 1 && (conteoBebidas >= 1 || conteoEntradas >= 1) && conteoPostres === 0) {
    if (!idsEnCarrito.has('tiramisu')) {
      sugerencias.push({
        idProducto: 'tiramisu',
        score: 0.78,
        origen: 'Regla Contextual: Cierre Dulce',
        motivo: 'Cierra tu comida con broche de oro con nuestro Tiramisú tradicional de café espresso y mascarpone.'
      });
    }
  }

  // REGLA 4: Solo entradas o carrito recién iniciado
  if (conteoPizzas === 0 && conteoEntradas >= 1) {
    const favPizza = esFinDeSemana ? 'pepperoni' : 'clasica';
    if (!idsEnCarrito.has(favPizza)) {
      sugerencias.push({
        idProducto: favPizza,
        score: 0.92,
        origen: 'Regla Contextual: Plato Principal',
        motivo: 'Para plato de fondo te sugerimos nuestra pizza al horno a leña más aclamada.'
      });
    }
  }

  return sugerencias;
}

module.exports = {
  evaluarReglasContextuales
};
