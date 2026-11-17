/**
 * ADMIN.JS — Pizza al Paso (Panel de Administración)
 * Autenticación, Métricas de Tienda, Gestión de Comandas y CRUD de Productos
 * Los cambios guardados en localStorage se reflejan inmediatamente en la web de los clientes.
 */

// Credenciales predeterminadas para evaluación
const CREDENCIALES_ADMIN = {
  usuario: 'admin',
  clave: 'admin123'
};

// ═══════════════════════════════════════════════
// 1. CONTROL DE ACCESO / AUTENTICACIÓN
// ═══════════════════════════════════════════════
function verificarSesionAdmin() {
  const estaLogueado = sessionStorage.getItem('pizza_admin_logueado') === 'true';
  const pantallaLogin = document.getElementById('pantallaLogin');
  const pantallaAdmin = document.getElementById('pantallaAdmin');

  if (estaLogueado) {
    if (pantallaLogin) pantallaLogin.style.display = 'none';
    if (pantallaAdmin) pantallaAdmin.style.display = 'flex';
    cargarDashboardCompleto();
  } else {
    if (pantallaLogin) pantallaLogin.style.display = 'flex';
    if (pantallaAdmin) pantallaAdmin.style.display = 'none';
  }
}

function iniciarSesionAdmin(e) {
  e.preventDefault();
  const inputUser = document.getElementById('adminUsuario').value.trim();
  const inputPass = document.getElementById('adminClave').value;
  const errorMsg = document.getElementById('adminLoginError');

  if (inputUser === CREDENCIALES_ADMIN.usuario && inputPass === CREDENCIALES_ADMIN.clave) {
    sessionStorage.setItem('pizza_admin_logueado', 'true');
    if (errorMsg) errorMsg.style.display = 'none';
    verificarSesionAdmin();
  } else {
    if (errorMsg) {
      errorMsg.textContent = 'Usuario o contraseña incorrectos. Revisa las credenciales de demo.';
      errorMsg.style.display = 'block';
    }
  }
}

function cerrarSesionAdmin() {
  sessionStorage.removeItem('pizza_admin_logueado');
  verificarSesionAdmin();
}

// ═══════════════════════════════════════════════
// 2. NAVEGACIÓN POR PESTAÑAS
// ═══════════════════════════════════════════════
function cambiarPestana(pestanaId) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.tab === pestanaId);
  });

  document.querySelectorAll('.admin-seccion').forEach(sec => {
    sec.classList.toggle('activa', sec.id === pestanaId);
  });
}

// ═══════════════════════════════════════════════
// 3. INFORME DE LA TIENDA Y MÉTRICAS
// ═══════════════════════════════════════════════
function cargarDashboardCompleto() {
  actualizarMetricas();
  renderizarTablaPedidos();
  renderizarTablaProductos();
  renderizarEstadisticas();

  // Sincronizar en tiempo real con Neon PostgreSQL
  if (typeof apiObtenerProductos === 'function' && typeof apiObtenerPedidos === 'function') {
    Promise.all([apiObtenerProductos(), apiObtenerPedidos()]).then(() => {
      actualizarMetricas();
      renderizarTablaPedidos();
      renderizarTablaProductos();
      renderizarEstadisticas();
    }).catch(() => {});
  }
}

function obtenerPedidos() {
  try {
    return JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
  } catch (e) {
    return [];
  }
}

let ultimoHashPedidosAdmin = '';

function guardarPedidos(pedidos) {
  localStorage.setItem('pizza_pedidos', JSON.stringify(pedidos));
  actualizarMetricas();
  renderizarTablaPedidos(true);
  renderizarEstadisticas();
}

function actualizarMetricas() {
  const pedidos = obtenerPedidos();
  const prods = obtenerProductosAdmin();

  const ventasTotales = pedidos.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  const totalComandas = pedidos.length;
  const ticketPromedio = totalComandas > 0 ? (ventasTotales / totalComandas) : 0;

  const elVentas = document.getElementById('kpiVentasTotales');
  const elComandas = document.getElementById('kpiTotalComandas');
  const elTicket = document.getElementById('kpiTicketPromedio');
  const elProds = document.getElementById('kpiTotalProductos');

  if (elVentas) elVentas.textContent = 'S/ ' + ventasTotales.toFixed(2);
  if (elComandas) elComandas.textContent = totalComandas;
  if (elTicket) elTicket.textContent = 'S/ ' + ticketPromedio.toFixed(2);
  if (elProds) elProds.textContent = prods.length;
}

function renderizarTablaPedidos(forzar = false) {
  const pedidos = obtenerPedidos();
  const tbody = document.getElementById('tbodyPedidos');
  if (!tbody) return;

  const hashActual = JSON.stringify(pedidos);
  if (!forzar && hashActual === ultimoHashPedidosAdmin) {
    return;
  }
  ultimoHashPedidosAdmin = hashActual;

  if (pedidos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--gris);">
          <div style="font-size: 32px; margin-bottom: 8px;">📋</div>
          <strong>No hay pedidos registrados todavía</strong>
          <p style="font-size: 13px;">Haz un pedido desde la tienda de clientes para verlo reflejado aquí en tiempo real.</p>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = pedidos.map((p, index) => {
    const itemsResumen = p.items ? p.items.map(i => `${i.cantidad}× ${i.nombre}`).join(', ') : 'Pedido general';
    const estadoClass = p.estado === 'Al Horno' ? 'horno' : (p.estado === 'En Mesa' ? 'mesa' : (p.estado === 'Entregado' ? 'entregado' : 'recibido'));
    const codigoEsc = (p.codigo || '').replace(/'/g, "\\'");

    return `
      <tr>
        <td><strong>${p.codigo || '#' + (1000 + index)}</strong></td>
        <td>${p.cliente || 'Cliente'}</td>
        <td><span style="font-weight:700;">${p.mesa || 'Salón'}</span></td>
        <td style="max-width: 280px; font-size: 13px;" title="${itemsResumen}">
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${itemsResumen}</div>
          <small style="color:var(--gris); display:block;">Notas: ${p.notas || 'Sin notas'}</small>
        </td>
        <td><strong>S/ ${(Number(p.total) || 0).toFixed(2)}</strong><br><small style="color:var(--gris);">${p.pago || 'Digital'}</small></td>
        <td>
          <select class="select-estado-kds" onchange="cambiarEstadoPedido('${codigoEsc}', this.value)">
            <option value="Recibido" ${p.estado === 'Recibido' ? 'selected' : ''}>Recibido</option>
            <option value="Al Horno" ${p.estado === 'Al Horno' ? 'selected' : ''}>🔥 Al Horno</option>
            <option value="En Mesa" ${p.estado === 'En Mesa' ? 'selected' : ''}>🍕 En Mesa</option>
            <option value="Entregado" ${p.estado === 'Entregado' ? 'selected' : ''}>✓ Entregado</option>
          </select>
        </td>
        <td><small style="color:var(--gris);">${p.fecha || ''}</small></td>
      </tr>`;
  }).join('');
}

function cambiarEstadoPedido(identificador, nuevoEstado) {
  const pedidos = obtenerPedidos();
  const pedido = typeof identificador === 'string'
    ? pedidos.find(p => p.codigo === identificador)
    : pedidos[identificador];
  if (pedido) {
    pedido.estado = nuevoEstado;
    guardarPedidos(pedidos);
    if (typeof apiActualizarEstadoPedido === 'function') {
      apiActualizarEstadoPedido(pedido.codigo, nuevoEstado);
    }
    if (typeof canalPedidos !== 'undefined' && canalPedidos) {
      canalPedidos.postMessage({ tipo: 'ACTUALIZAR_PEDIDO', codigo: pedido.codigo, campos: { estado: nuevoEstado } });
    }
  }
}

function limpiarHistorialPedidos() {
  if (confirm('¿Deseas vaciar el historial de pedidos registrados?')) {
    localStorage.removeItem('pizza_pedidos');
    if (typeof apiLimpiarPedidos === 'function') {
      apiLimpiarPedidos();
    }
    cargarDashboardCompleto();
  }
}

// ═══════════════════════════════════════════════
// 4. GESTIÓN DE PRODUCTOS (CRUD)
// ═══════════════════════════════════════════════
function obtenerProductosAdmin() {
  try {
    const raw = localStorage.getItem('pizza_productos');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function guardarProductosAdmin(prods) {
  localStorage.setItem('pizza_productos', JSON.stringify(prods));
  actualizarMetricas();
  renderizarTablaProductos();
}

function renderizarTablaProductos() {
  const prods = obtenerProductosAdmin();
  const tbody = document.getElementById('tbodyProductos');
  if (!tbody) return;

  if (prods.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--gris);">
          <strong>No hay productos en la carta</strong>
          <p>Usa el botón "+ Agregar Nuevo Producto" o "Restablecer Menú Original".</p>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = prods.map(p => `
    <tr>
      <td>
        <img class="prod-mini-thumb" src="${p.imagen}" alt="${p.nombre}"
             onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80'">
      </td>
      <td>
        <strong>${p.nombre}</strong>
        <p style="font-size:12px; color:var(--gris); margin:2px 0 0; max-width:320px; line-height:1.4;">${p.descripcion || ''}</p>
      </td>
      <td><span style="text-transform: capitalize; font-weight:700;">${p.categoria}</span></td>
      <td><strong style="color:var(--rojo);">S/ ${(Number(p.precio) || 0).toFixed(2)}</strong></td>
      <td><span class="badge-estado recibido">${p.etiqueta || 'Menú'}</span></td>
      <td>
        <button class="btn-accion-icono editar" onclick="abrirModalEditarProducto('${p.id}')">✏️ Editar</button>
        <button class="btn-accion-icono eliminar" onclick="eliminarProductoAdmin('${p.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// ── Crear / Editar Producto ──
let idProductoEnEdicion = null;

function abrirModalNuevoProducto() {
  idProductoEnEdicion = null;
  document.getElementById('modalProdTitulo').textContent = 'Agregar Nuevo Producto a la Carta';
  document.getElementById('formProducto').reset();
  document.getElementById('prodId').value = '';
  actualizarPreviewImagen('');
  document.getElementById('fondoModalProducto').style.display = 'flex';
}

function abrirModalEditarProducto(id) {
  const prods = obtenerProductosAdmin();
  const prod = prods.find(p => p.id === id);
  if (!prod) return;

  idProductoEnEdicion = id;
  document.getElementById('modalProdTitulo').textContent = 'Editar Producto: ' + prod.nombre;
  document.getElementById('prodId').value = prod.id;
  document.getElementById('prodNombre').value = prod.nombre;
  document.getElementById('prodCategoria').value = prod.categoria;
  document.getElementById('prodPrecio').value = prod.precio;
  document.getElementById('prodImagen').value = prod.imagen || '';
  document.getElementById('prodEtiqueta').value = prod.etiqueta || '';
  document.getElementById('prodDescripcion').value = prod.descripcion || '';
  document.getElementById('prodPreferencia').value = (prod.preferencias && prod.preferencias[0]) || 'popular';

  actualizarPreviewImagen(prod.imagen || '');
  document.getElementById('fondoModalProducto').style.display = 'flex';
}

function cerrarModalProducto() {
  document.getElementById('fondoModalProducto').style.display = 'none';
}

function actualizarPreviewImagen(url) {
  const container = document.getElementById('previewImagenBox');
  if (!container) return;
  if (url && url.startsWith('http')) {
    container.innerHTML = `<img src="${url}" alt="Preview" onerror="this.onerror=null;this.parentElement.innerHTML='<span>URL de imagen inválida</span>'">`;
  } else {
    container.innerHTML = `<span>Vista previa de la foto</span>`;
  }
}

function guardarFormularioProducto(e) {
  e.preventDefault();

  const nombre = document.getElementById('prodNombre').value.trim();
  const categoria = document.getElementById('prodCategoria').value;
  const precio = parseFloat(document.getElementById('prodPrecio').value) || 0;
  const imagen = document.getElementById('prodImagen').value.trim() || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80';
  const etiqueta = document.getElementById('prodEtiqueta').value.trim() || 'Especial';
  const descripcion = document.getElementById('prodDescripcion').value.trim();
  const pref = document.getElementById('prodPreferencia').value || 'popular';

  if (!nombre || precio <= 0) {
    alert('Por favor indica un nombre válido y un precio mayor a 0.');
    return;
  }

  const prods = obtenerProductosAdmin();

  if (idProductoEnEdicion) {
    // Modo edición
    const idx = prods.findIndex(p => p.id === idProductoEnEdicion);
    if (idx !== -1) {
      const editado = {
        ...prods[idx],
        nombre,
        categoria,
        precio,
        imagen,
        etiqueta,
        descripcion,
        preferencias: [pref, 'compartir']
      };
      prods[idx] = editado;
      if (typeof apiActualizarProducto === 'function') {
        apiActualizarProducto(idProductoEnEdicion, editado);
      }
    }
  } else {
    // Modo nuevo producto
    const nuevoId = 'prod_' + Date.now();
    const nuevoProd = {
      id: nuevoId,
      nombre,
      categoria,
      precio,
      imagen,
      etiqueta,
      descripcion,
      preferencias: [pref, 'compartir']
    };
    prods.unshift(nuevoProd);
    if (typeof apiCrearProducto === 'function') {
      apiCrearProducto(nuevoProd);
    }
  }

  guardarProductosAdmin(prods);
  cerrarModalProducto();
  alert('¡Producto guardado! Ya se sincronizó con PostgreSQL Neon y la carta de los clientes.');
}

function eliminarProductoAdmin(id) {
  const prods = obtenerProductosAdmin();
  const prod = prods.find(p => p.id === id);
  if (!prod) return;

  if (confirm(`¿Seguro que deseas eliminar "${prod.nombre}" de la carta?`)) {
    const filtrados = prods.filter(p => p.id !== id);
    guardarProductosAdmin(filtrados);
    if (typeof apiEliminarProducto === 'function') {
      apiEliminarProducto(id);
    }
  }
}

function restablecerProductosOriginales() {
  if (confirm('¿Restablecer el menú original de 11 productos artesanales?')) {
    localStorage.removeItem('pizza_productos');
    // Fuerza recarga desde global.js
    location.reload();
  }
}

// ═══════════════════════════════════════════════
// 5. ESTADÍSTICAS Y TOP PRODUCTOS MÁS VENDIDOS
// ═══════════════════════════════════════════════
function renderizarEstadisticas() {
  const pedidos = obtenerPedidos();
  const contenedorTop = document.getElementById('contenedorTopProductos');
  const contenedorPagos = document.getElementById('contenedorMetodosPago');

  if (!contenedorTop || !contenedorPagos) return;

  if (pedidos.length === 0) {
    contenedorTop.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--gris);">
        <div style="font-size: 32px; margin-bottom: 8px;">📊</div>
        <strong>No hay datos de ventas aún</strong>
        <p style="font-size: 13px;">A medida que se confirmen comandas desde las mesas, verás el ranking aquí.</p>
      </div>`;
    contenedorPagos.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--gris);">
        <div style="font-size: 32px; margin-bottom: 8px;">💳</div>
        <strong>Sin transacciones registradas</strong>
      </div>`;
    return;
  }

  // 1. Calcular productos más vendidos
  const conteoProductos = {};
  let totalUnidadesVendidas = 0;

  pedidos.forEach(p => {
    (p.items || []).forEach(it => {
      const nombre = it.nombre || 'Producto';
      const cant = Number(it.cantidad) || 1;
      const sub = Number(it.subtotal) || (Number(it.precio) * cant) || 0;
      totalUnidadesVendidas += cant;

      if (!conteoProductos[nombre]) {
        conteoProductos[nombre] = {
          nombre,
          cantidad: 0,
          total: 0,
          imagen: it.imagen || ''
        };
      }
      conteoProductos[nombre].cantidad += cant;
      conteoProductos[nombre].total += sub;
    });
  });

  const arrayTop = Object.values(conteoProductos).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
  const maxCant = arrayTop.length > 0 ? arrayTop[0].cantidad : 1;

  contenedorTop.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${arrayTop.map((item, index) => {
        const pct = Math.round((item.cantidad / maxCant) * 100);
        const medallas = ['🥇', '🥈', '🥉', '4°', '5°'];
        return `
          <div style="background: #fff; border: 1px solid var(--borde); border-radius: 12px; padding: 14px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 18px; font-weight: 700; width: 26px;">${medallas[index]}</span>
                <strong>${item.nombre}</strong>
              </div>
              <div style="text-align: right;">
                <strong style="color: var(--rojo);">${item.cantidad} ${item.cantidad === 1 ? 'unidad' : 'unidades'}</strong>
                <small style="display: block; color: var(--gris); font-size: 11px;">S/ ${item.total.toFixed(2)} recaudados</small>
              </div>
            </div>
            <div style="height: 8px; background: #f1ebe1; border-radius: 999px; overflow: hidden;">
              <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, var(--rojo), var(--dorado)); border-radius: 999px; transition: width 0.4s ease;"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // 2. Desglose de Pagos y Estados
  const pagos = {
    'Efectivo': 0,
    'Tarjeta': 0,
    'Yape': 0,
    'Plin': 0,
    'Otro': 0
  };
  let totalRecaudado = 0;

  pedidos.forEach(p => {
    const tot = Number(p.total) || 0;
    totalRecaudado += tot;
    const met = (p.pago || '').toLowerCase();
    if (met.includes('efectivo')) pagos['Efectivo'] += tot;
    else if (met.includes('tarjeta') || met.includes('pos')) pagos['Tarjeta'] += tot;
    else if (met.includes('yape')) pagos['Yape'] += tot;
    else if (met.includes('plin')) pagos['Plin'] += tot;
    else pagos['Otro'] += tot;
  });

  const estadosComandas = {
    'Recibido': pedidos.filter(p => p.estado === 'Recibido').length,
    'Al Horno': pedidos.filter(p => p.estado === 'Al Horno').length,
    'En Mesa': pedidos.filter(p => p.estado === 'En Mesa').length,
    'Entregado': pedidos.filter(p => p.estado === 'Entregado').length,
  };

  contenedorPagos.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 18px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #fff; border: 1px solid var(--borde); border-radius: 12px; padding: 14px;">
          <small style="color: var(--gris); display: block; font-size: 11px;">💵 Efectivo</small>
          <strong style="font-size: 18px; color: var(--oscuro);">S/ ${pagos['Efectivo'].toFixed(2)}</strong>
        </div>
        <div style="background: #fff; border: 1px solid var(--borde); border-radius: 12px; padding: 14px;">
          <small style="color: var(--gris); display: block; font-size: 11px;">💳 Tarjeta / POS</small>
          <strong style="font-size: 18px; color: var(--oscuro);">S/ ${pagos['Tarjeta'].toFixed(2)}</strong>
        </div>
        <div style="background: #fff; border: 1px solid var(--borde); border-radius: 12px; padding: 14px;">
          <small style="color: var(--gris); display: block; font-size: 11px;">📱 Yape / Digital</small>
          <strong style="font-size: 18px; color: #7c3aed;">S/ ${(pagos['Yape'] + pagos['Plin']).toFixed(2)}</strong>
        </div>
        <div style="background: #fff; border: 1px solid var(--borde); border-radius: 12px; padding: 14px;">
          <small style="color: var(--gris); display: block; font-size: 11px;">📦 Unidades Vendidas</small>
          <strong style="font-size: 18px; color: var(--dorado);">${totalUnidadesVendidas} ítems</strong>
        </div>
      </div>

      <div style="background: #fff; border: 1px solid var(--borde); border-radius: 12px; padding: 16px;">
        <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--oscuro);">Estado Actual de Pedidos</h4>
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
          <span>⏳ Recibidas: <strong>${estadosComandas['Recibido']}</strong></span>
          <span>🔥 Al Horno: <strong>${estadosComandas['Al Horno']}</strong></span>
          <span>🍽️ En Mesa: <strong>${estadosComandas['En Mesa']}</strong></span>
          <span>✓ Entregadas: <strong>${estadosComandas['Entregado']}</strong></span>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════
// 6. INICIALIZACIÓN
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  verificarSesionAdmin();

  // Formulario Login
  const formLogin = document.getElementById('formAdminLogin');
  if (formLogin) formLogin.addEventListener('submit', iniciarSesionAdmin);

  // Cerrar Sesión
  const btnLogout = document.getElementById('btnAdminLogout');
  if (btnLogout) btnLogout.addEventListener('click', cerrarSesionAdmin);

  // Pestañas
  const tabsBar = document.getElementById('adminTabsBar');
  if (tabsBar) {
    tabsBar.addEventListener('click', e => {
      const btn = e.target.closest('.admin-tab-btn');
      if (btn && btn.dataset.tab) cambiarPestana(btn.dataset.tab);
    });
  }

  // Modales Producto
  const btnNuevoProd = document.getElementById('btnNuevoProducto');
  if (btnNuevoProd) btnNuevoProd.addEventListener('click', abrirModalNuevoProducto);

  const btnCerrarModalProd = document.getElementById('btnCerrarModalProd');
  if (btnCerrarModalProd) btnCerrarModalProd.addEventListener('click', cerrarModalProducto);

  const fondoModalProd = document.getElementById('fondoModalProducto');
  if (fondoModalProd) fondoModalProd.addEventListener('click', e => {
    if (e.target === fondoModalProd) cerrarModalProducto();
  });

  const formProd = document.getElementById('formProducto');
  if (formProd) formProd.addEventListener('submit', guardarFormularioProducto);

  const inputProdImg = document.getElementById('prodImagen');
  if (inputProdImg) {
    inputProdImg.addEventListener('input', e => actualizarPreviewImagen(e.target.value.trim()));
  }

  const btnReset = document.getElementById('btnResetProductos');
  if (btnReset) btnReset.addEventListener('click', restablecerProductosOriginales);

  const btnLimpiar = document.getElementById('btnLimpiarPedidos');
  if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarHistorialPedidos);

  // Sincronización en vivo si se agregan pedidos o productos desde otra pestaña
  window.addEventListener('storage', e => {
    if (['pizza_pedidos', 'pizza_productos'].includes(e.key)) {
      actualizarMetricas();
      renderizarTablaPedidos();
      renderizarTablaProductos();
      renderizarEstadisticas();
    }
  });

  // Canal instantáneo entre pestañas
  if (typeof canalPedidos !== 'undefined' && canalPedidos) {
    canalPedidos.addEventListener('message', e => {
      if (!e.data) return;
      if (e.data.tipo === 'NUEVO_PEDIDO' && e.data.pedido) {
        // Insertar pedido en localStorage de esta pestaña
        const lista = JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
        if (!lista.some(p => p.codigo === e.data.pedido.codigo)) {
          lista.unshift(e.data.pedido);
          localStorage.setItem('pizza_pedidos', JSON.stringify(lista));
        }
      } else if (e.data.tipo === 'ACTUALIZAR_PEDIDO' && e.data.codigo) {
        const lista = JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
        const idx = lista.findIndex(p => p.codigo === e.data.codigo);
        if (idx !== -1) {
          lista[idx] = { ...lista[idx], ...e.data.campos };
          localStorage.setItem('pizza_pedidos', JSON.stringify(lista));
        }
      } else if (e.data.tipo === 'LIMPIAR_PEDIDOS') {
        localStorage.removeItem('pizza_pedidos');
      }
      actualizarMetricas();
      renderizarTablaPedidos();
      renderizarEstadisticas();
    });
  }

  // Polling de seguridad cada 3 segundos con Neon
  setInterval(() => {
    if (typeof apiObtenerPedidos === 'function') {
      apiObtenerPedidos().then(() => {
        actualizarMetricas();
        renderizarTablaPedidos();
        renderizarEstadisticas();
      }).catch(() => {});
    }
  }, 3000);
});
