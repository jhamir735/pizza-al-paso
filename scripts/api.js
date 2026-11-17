/**
 * API.JS - CLIENTE DE COMUNICACIÓN CON LA BASE DE DATOS NEON POSTGRESQL
 * Conecta las páginas web con el backend en Express y PostgreSQL Neon.
 * Cuenta con sincronización bidireccional y fallback a localStorage en caso offline.
 */

const API_BASE = window.location.protocol.startsWith('http')
  ? `${window.location.origin}/api`
  : 'http://localhost:3000/api';

// Verificar estado de conexión
async function apiVerificarConexion() {
  try {
    const res = await fetch(`${API_BASE}/productos`, { method: 'GET' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// ═══════════════════════════════════════════════
// 1. PRODUCTOS (CATÁLOGO)
// ═══════════════════════════════════════════════

async function apiObtenerProductos() {
  try {
    const res = await fetch(`${API_BASE}/productos`);
    if (!res.ok) throw new Error('Respuesta no satisfactoria del servidor');
    const productos = await res.json();
    // Guardar copia local en localStorage para respaldo y sincronización instantánea
    localStorage.setItem('pizza_productos', JSON.stringify(productos));
    return productos;
  } catch (e) {
    console.warn('Conectando vía localStorage (fallback):', e.message);
    return JSON.parse(localStorage.getItem('pizza_productos') || '[]');
  }
}

async function apiCrearProducto(producto) {
  try {
    const res = await fetch(`${API_BASE}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Guardando producto localmente (fallback):', e.message);
  }
  return null;
}

async function apiActualizarProducto(id, producto) {
  try {
    const res = await fetch(`${API_BASE}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Actualizando producto localmente (fallback):', e.message);
  }
  return null;
}

async function apiEliminarProducto(id) {
  try {
    const res = await fetch(`${API_BASE}/productos/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Eliminando producto localmente (fallback):', e.message);
  }
  return null;
}

// ═══════════════════════════════════════════════
// 2. PEDIDOS / COMANDAS Y CANAL EN VIVO
// ═══════════════════════════════════════════════

// Canal de difusión en tiempo real entre pestañas (Cliente, Cocina KDS, Caja POS y Admin)
const canalPedidos = (typeof window !== 'undefined' && 'BroadcastChannel' in window)
  ? new BroadcastChannel('pizza_al_paso_canal')
  : null;

function sincronizarNuevoPedido(pedido) {
  if (canalPedidos) {
    try {
      canalPedidos.postMessage({ tipo: 'NUEVO_PEDIDO', pedido });
    } catch (e) {
      console.warn('Error al emitir en canal de pedidos:', e);
    }
  }
}

function sincronizarActualizacionPedido(codigo, campos) {
  if (canalPedidos) {
    try {
      canalPedidos.postMessage({ tipo: 'ACTUALIZAR_PEDIDO', codigo, campos });
    } catch (e) {
      console.warn('Error al emitir actualización en canal:', e);
    }
  }
}

async function apiObtenerPedidos() {
  try {
    const res = await fetch(`${API_BASE}/pedidos`);
    if (!res.ok) throw new Error('Error al conectar con API pedidos');
    const pedidosNeon = await res.json();

    // Fusión inteligente: Neon PostgreSQL es la fuente de verdad.
    // Solo preservamos de localStorage pedidos nuevos que aún no hayan alcanzado Neon (offline).
    const pedidosLocales = JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
    const mapa = new Map();

    // 1. Cargar pedidos actualizados desde Neon PostgreSQL
    pedidosNeon.forEach(p => mapa.set(p.codigo, p));

    // 2. Integrar pedidos locales huérfanos que aún no hayan subido a Neon
    pedidosLocales.forEach(p => {
      if (!mapa.has(p.codigo)) {
        mapa.set(p.codigo, p);
        apiCrearPedido(p).catch(() => {});
      }
    });

    const listaFinal = Array.from(mapa.values());
    localStorage.setItem('pizza_pedidos', JSON.stringify(listaFinal));
    return listaFinal;
  } catch (e) {
    console.warn('Leyendo pedidos desde localStorage (fallback):', e.message);
    return JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
  }
}

async function apiCrearPedido(pedido) {
  // La notificación BroadcastChannel la hace el llamador (procesarPedido en global.js)
  // para evitar doble emisión. Aquí sólo persistimos en Neon.
  try {
    const res = await fetch(`${API_BASE}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido)
    });
    if (res.ok) {
      const creado = await res.json();
      return creado;
    }
  } catch (e) {
    console.warn('Error al registrar pedido en Neon (guardado en localStorage):', e.message);
  }
  return null;
}

async function apiActualizarEstadoPedido(codigo, estado) {
  sincronizarActualizacionPedido(codigo, { estado });
  try {
    const res = await fetch(`${API_BASE}/pedidos/${encodeURIComponent(codigo)}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Error al actualizar estado en Neon:', e.message);
  }
  return null;
}

async function apiActualizarPagoPedido(codigo, datosPago) {
  sincronizarActualizacionPedido(codigo, datosPago);
  try {
    const res = await fetch(`${API_BASE}/pedidos/${encodeURIComponent(codigo)}/pago`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPago)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Error al actualizar pago en Neon:', e.message);
  }
  return null;
}

async function apiLimpiarPedidos() {
  if (canalPedidos) {
    canalPedidos.postMessage({ tipo: 'LIMPIAR_PEDIDOS' });
  }
  try {
    const res = await fetch(`${API_BASE}/pedidos`, {
      method: 'DELETE'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Error al limpiar pedidos en Neon:', e.message);
  }
  return null;
}

// ═══════════════════════════════════════════════
// 3. INTELIGENCIA ARTIFICIAL JEV
// ═══════════════════════════════════════════════

async function apiConsultarJev(itemsCarrito) {
  try {
    const ahora = new Date();
    const res = await fetch(`${API_BASE}/jev/recomendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: itemsCarrito,
        hora: ahora.getHours(),
        diaSemana: ahora.getDay()
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Error al consultar motor JEV en backend (activando fallback local):', e.message);
  }
  return null;
}

async function apiConsultarMetricasJev() {
  try {
    const res = await fetch(`${API_BASE}/jev/metricas`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Error al consultar métricas JEV:', e.message);
  }
  return null;
}
