/**
 * ADMIN.JS — Panel de Administración Operativa · Pizza al Paso
 * Incluye:
 * - Autenticación de administrador
 * - Monitoreo de comandas en tiempo real
 * - Gestión CRUD de productos sincronizada con PostgreSQL Neon
 * - Generador de tarjetas QR por mesa (?mesa=1..6)
 */

const CREDENCIALES_ADMIN = {
  usuario: 'admin',
  clave: 'admin123'
};

const MESAS_ADMIN_QR = [
  { id: '1', codigo: 'Mesa 1', zona: 'Salón Principal', capacidad: '4 personas' },
  { id: '2', codigo: 'Mesa 2', zona: 'Junto a Ventana', capacidad: '2 personas' },
  { id: '3', codigo: 'Mesa 3', zona: 'Terraza Exterior', capacidad: '4 personas' },
  { id: '4', codigo: 'Mesa 4', zona: 'Salón Familiar', capacidad: '6 personas' },
  { id: '5', codigo: 'Mesa 5', zona: 'Zona Reservada VIP', capacidad: '6 personas' },
  { id: '6', codigo: 'Mesa 6', zona: 'Barra Horno de Leña', capacidad: '2 personas' }
];

function limpiarEmojisAdmin(str) {
  if (!str) return '';
  return String(str)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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
      errorMsg.textContent = 'Credenciales inválidas. Utiliza el usuario y contraseña de demostración.';
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
  renderizarTarjetasQrAdmin();
  renderizarEstadisticas();

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
          <strong>No hay comandas registradas</strong>
          <p style="font-size: 13px; margin-top: 4px;">Realiza un pedido desde la Carta Digital QR para visualizarlo aquí en tiempo real.</p>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = pedidos.map((p, index) => {
    const itemsResumen = p.items ? p.items.map(i => `${i.cantidad}× ${i.nombre}`).join(', ') : 'Comanda general';
    const codigoEsc = (p.codigo || '').replace(/'/g, "\\'");

    return `
      <tr>
        <td><strong>${p.codigo || '#' + (1000 + index)}</strong></td>
        <td>${p.cliente || 'Comensal'}</td>
        <td><span style="font-weight:700;">${p.mesa || 'Mesa 1'}</span></td>
        <td style="max-width: 280px; font-size: 13px;" title="${itemsResumen}">
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${itemsResumen}</div>
          <small style="color:var(--gris); display:block;">Notas: ${p.notas || 'Sin notas'}</small>
        </td>
        <td><strong>S/ ${(Number(p.total) || 0).toFixed(2)}</strong><br><small style="color:var(--gris);">${p.pago || 'Digital'}</small></td>
        <td>
          <select class="select-estado-kds" onchange="cambiarEstadoPedido('${codigoEsc}', this.value)">
            <option value="Recibido" ${p.estado === 'Recibido' ? 'selected' : ''}>Recibido</option>
            <option value="Al Horno" ${p.estado === 'Al Horno' ? 'selected' : ''}>En Horno a Leña</option>
            <option value="En Mesa" ${p.estado === 'En Mesa' ? 'selected' : ''}>Listo en Mesa</option>
            <option value="Entregado" ${p.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
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
  if (confirm('¿Confirmas que deseas reiniciar el historial de comandas registradas?')) {
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

function formatearNombreCategoria(cat) {
  const c = String(cat || '').toLowerCase();
  if (c.startsWith('pizza')) return 'Pizzas';
  if (c.startsWith('entrada') || c.startsWith('acompa')) return 'Entradas';
  if (c.startsWith('bebida')) return 'Bebidas';
  if (c.startsWith('postre')) return 'Postres';
  return cat;
}

function renderizarTablaProductos() {
  const prods = obtenerProductosAdmin();
  const tbody = document.getElementById('tbodyProductos');
  if (!tbody) return;

  if (prods.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--gris);">
          <strong>No hay productos registrados en el catálogo</strong>
          <p>Utiliza el botón "+ Nuevo Producto" o "Restablecer Catálogo Base".</p>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = prods.map(p => {
    const etiquetaLimpia = limpiarEmojisAdmin(p.etiqueta || 'Carta');
    return `
      <tr>
        <td>
          <img class="prod-mini-thumb" src="${p.imagen}" alt="${p.nombre}"
               onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80'">
        </td>
        <td>
          <strong>${p.nombre}</strong>
          <p style="font-size:12px; color:var(--gris); margin:2px 0 0; max-width:340px; line-height:1.4;">${p.descripcion || ''}</p>
        </td>
        <td><span style="font-weight:700;">${formatearNombreCategoria(p.categoria)}</span></td>
        <td><strong style="color:var(--rojo);">S/ ${(Number(p.precio) || 0).toFixed(2)}</strong></td>
        <td><span class="badge-estado recibido">${etiquetaLimpia}</span></td>
        <td>
          <button type="button" class="btn-accion-icono editar" onclick="abrirModalEditarProducto('${p.id}')">Editar</button>
          <button type="button" class="btn-accion-icono eliminar" onclick="eliminarProductoAdmin('${p.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

let idProductoEnEdicion = null;

function abrirDialogoAdmin(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  if (typeof modal.showModal === 'function') {
    if (!modal.open) modal.showModal();
  } else {
    modal.style.display = 'flex';
  }
}

function cerrarDialogoAdmin(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  if (typeof modal.close === 'function') {
    if (modal.open) modal.close();
    modal.returnValue = '';
  } else {
    modal.style.display = 'none';
  }
}

function abrirModalNuevoProducto() {
  idProductoEnEdicion = null;
  document.getElementById('modalProdTitulo').textContent = 'Agregar Nuevo Producto a la Carta';
  document.getElementById('formProducto').reset();
  document.getElementById('prodId').value = '';
  actualizarPreviewImagen('');
  abrirDialogoAdmin('fondoModalProducto');
}

function abrirModalEditarProducto(id) {
  const prods = obtenerProductosAdmin();
  const prod = prods.find(p => p.id === id);
  if (!prod) return;

  idProductoEnEdicion = id;
  document.getElementById('modalProdTitulo').textContent = 'Editar Producto: ' + prod.nombre;
  document.getElementById('prodId').value = prod.id;
  document.getElementById('prodNombre').value = prod.nombre;

  const catNorm = String(prod.categoria || '').toLowerCase();
  let catValor = 'pizza';
  if (catNorm.startsWith('entrada') || catNorm.startsWith('acompa')) catValor = 'entradas';
  else if (catNorm.startsWith('bebida')) catValor = 'bebidas';
  else if (catNorm.startsWith('postre')) catValor = 'postres';

  document.getElementById('prodCategoria').value = catValor;
  document.getElementById('prodPrecio').value = prod.precio;
  document.getElementById('prodImagen').value = prod.imagen || '';
  document.getElementById('prodEtiqueta').value = limpiarEmojisAdmin(prod.etiqueta || '');
  document.getElementById('prodDescripcion').value = prod.descripcion || '';
  document.getElementById('prodPreferencia').value = (prod.preferencias && prod.preferencias[0]) || 'popular';

  actualizarPreviewImagen(prod.imagen || '');
  abrirDialogoAdmin('fondoModalProducto');
}

function cerrarModalProducto() {
  cerrarDialogoAdmin('fondoModalProducto');
}

function actualizarPreviewImagen(url) {
  const container = document.getElementById('previewImagenBox');
  if (!container) return;
  if (url && url.startsWith('http')) {
    container.innerHTML = `<img src="${url}" alt="Vista previa" onerror="this.onerror=null;this.parentElement.innerHTML='<span>URL de imagen no válida</span>'">`;
  } else {
    container.innerHTML = `<span>Vista previa de la imagen</span>`;
  }
}

function guardarFormularioProducto(e) {
  e.preventDefault();

  const nombre = document.getElementById('prodNombre').value.trim();
  const categoria = document.getElementById('prodCategoria').value;
  const precio = parseFloat(document.getElementById('prodPrecio').value) || 0;
  const imagen = document.getElementById('prodImagen').value.trim() || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80';
  const etiqueta = limpiarEmojisAdmin(document.getElementById('prodEtiqueta').value.trim() || 'Especial');
  const descripcion = document.getElementById('prodDescripcion').value.trim();
  const pref = document.getElementById('prodPreferencia').value || 'popular';

  if (!nombre || precio <= 0) {
    alert('Por favor ingresa un nombre válido y un precio mayor a 0.');
    return;
  }

  const prods = obtenerProductosAdmin();

  if (idProductoEnEdicion) {
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
}

function eliminarProductoAdmin(id) {
  const prods = obtenerProductosAdmin();
  const prod = prods.find(p => p.id === id);
  if (!prod) return;

  if (confirm(`¿Confirmas eliminar "${prod.nombre}" de la carta digital?`)) {
    const filtrados = prods.filter(p => p.id !== id);
    guardarProductosAdmin(filtrados);
    if (typeof apiEliminarProducto === 'function') {
      apiEliminarProducto(id);
    }
  }
}

function restablecerProductosOriginales() {
  if (confirm('¿Restablecer el catálogo base desde el servidor?')) {
    localStorage.removeItem('pizza_productos');
    location.reload();
  }
}

// ═══════════════════════════════════════════════
// 5. GENERADOR DE TARJETAS QR POR MESA
// ═══════════════════════════════════════════════
function generarSvgQrAdmin(semilla) {
  const size = 21;
  const matriz = Array.from({ length: size }, () => Array(size).fill(0));

  function patron(f0, c0) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const borde = r === 0 || r === 6 || c === 0 || c === 6;
        const centro = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matriz[f0 + r][c0 + c] = (borde || centro) ? 1 : 0;
      }
    }
  }

  patron(0, 0);
  patron(0, size - 7);
  patron(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < semilla.length; i++) {
    hash ^= semilla.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) continue;
      if (r === 6 || c === 6) {
        matriz[r][c] = (r + c) % 2 === 0 ? 1 : 0;
        continue;
      }
      hash ^= (r * 31 + c * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      matriz[r][c] = (Math.abs(hash) % 10) < 5 ? 1 : 0;
    }
  }

  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matriz[r][c] === 1) {
        rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#181412"/>`;
      }
    }
  }

  return `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" shape-rendering="crispEdges">${rects}</svg>`;
}

function renderizarTarjetasQrAdmin() {
  const cont = document.getElementById('contenedorTarjetasQrAdmin');
  if (!cont) return;

  const origin = window.location.protocol.startsWith('http')
    ? window.location.origin
    : 'http://localhost:3000';

  cont.innerHTML = MESAS_ADMIN_QR.map(m => {
    const url = `${origin}/paginas/menu.html?mesa=${m.id}`;
    return `
      <div style="border: 1.5px solid var(--borde); border-radius: 14px; padding: 20px; background: #fcfaf7; display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 18px; font-family: 'Playfair Display', serif;">${m.codigo}</strong>
            <small style="display: block; color: var(--gris); font-size: 12px;">${m.zona} · ${m.capacidad}</small>
          </div>
          <span class="badge-estado recibido">QR Activo</span>
        </div>

        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 96px; height: 96px; background: #fff; border: 1px solid var(--borde); border-radius: 8px; padding: 8px; flex-shrink: 0;">
            ${generarSvgQrAdmin(url)}
          </div>
          <div style="flex: 1; min-width: 0;">
            <small style="color: var(--gris); font-size: 11px; display: block; margin-bottom: 4px;">URL de asignación automática:</small>
            <div style="font-family: monospace; font-size: 11px; background: #fff; border: 1px solid var(--borde); padding: 6px 8px; border-radius: 6px; word-break: break-all; margin-bottom: 10px;">
              ${url}
            </div>
            <a href="paginas/menu.html?mesa=${m.id}" target="_blank" class="btn-primario" style="padding: 7px 12px; font-size: 12px; width: 100%;">
              Probar Escaneo de ${m.codigo} →
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ═══════════════════════════════════════════════
// 6. ESTADÍSTICAS Y RANKING DE PRODUCTOS
// ═══════════════════════════════════════════════
function renderizarEstadisticas() {
  const pedidos = obtenerPedidos();
  const contenedorTop = document.getElementById('contenedorTopProductos');
  const contenedorPagos = document.getElementById('contenedorMetodosPago');

  if (!contenedorTop || !contenedorPagos) return;

  if (pedidos.length === 0) {
    contenedorTop.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--gris);">
        <strong>Sin registros de ventas en el periodo actual</strong>
        <p style="font-size: 13px; margin-top: 4px;">A medida que se emitan comandas desde las mesas, se calculará el ranking aquí.</p>
      </div>`;
    contenedorPagos.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--gris);">
        <strong>Sin transacciones registradas</strong>
      </div>`;
    return;
  }

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
          total: 0
        };
      }
      conteoProductos[nombre].cantidad += cant;
      conteoProductos[nombre].total += sub;
    });
  });

  const arrayTop = Object.values(conteoProductos).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
  const maxCant = arrayTop.length > 0 ? arrayTop[0].cantidad : 1;

  contenedorTop.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      ${arrayTop.map((item, index) => {
        const pct = Math.round((item.cantidad / maxCant) * 100);
        return `
          <div style="background: #fff; border: 1px solid var(--borde); border-radius: 10px; padding: 14px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 13px; font-weight: 800; color: var(--rojo); width: 24px;">#${index + 1}</span>
                <strong>${item.nombre}</strong>
              </div>
              <div style="text-align: right;">
                <strong style="color: var(--rojo);">${item.cantidad} ${item.cantidad === 1 ? 'unidad' : 'unidades'}</strong>
                <small style="display: block; color: var(--gris); font-size: 11px;">S/ ${item.total.toFixed(2)} facturados</small>
              </div>
            </div>
            <div style="height: 7px; background: #f1ebe1; border-radius: 999px; overflow: hidden;">
              <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, var(--rojo), var(--dorado)); border-radius: 999px;"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  const pagos = { Efectivo: 0, Tarjeta: 0, Yape: 0, Plin: 0, Otro: 0 };

  pedidos.forEach(p => {
    const tot = Number(p.total) || 0;
    const met = (p.pago || '').toLowerCase();
    if (met.includes('efectivo')) pagos.Efectivo += tot;
    else if (met.includes('tarjeta') || met.includes('pos')) pagos.Tarjeta += tot;
    else if (met.includes('yape')) pagos.Yape += tot;
    else if (met.includes('plin')) pagos.Plin += tot;
    else pagos.Otro += tot;
  });

  const estadosComandas = {
    Recibido: pedidos.filter(p => p.estado === 'Recibido').length,
    Horno: pedidos.filter(p => p.estado === 'Al Horno').length,
    Mesa: pedidos.filter(p => p.estado === 'En Mesa').length,
    Entregado: pedidos.filter(p => p.estado === 'Entregado').length
  };

  contenedorPagos.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #fff; border: 1px solid var(--borde); border-radius: 10px; padding: 14px;">
          <small style="color: var(--gris); display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;">Efectivo</small>
          <strong style="font-size: 18px; color: var(--oscuro);">S/ ${pagos.Efectivo.toFixed(2)}</strong>
        </div>
        <div style="background: #fff; border: 1px solid var(--borde); border-radius: 10px; padding: 14px;">
          <small style="color: var(--gris); display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;">Tarjeta / POS</small>
          <strong style="font-size: 18px; color: var(--oscuro);">S/ ${pagos.Tarjeta.toFixed(2)}</strong>
        </div>
        <div style="background: #fff; border: 1px solid var(--borde); border-radius: 10px; padding: 14px;">
          <small style="color: var(--gris); display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;">Yape / Plin</small>
          <strong style="font-size: 18px; color: #7c3aed;">S/ ${(pagos.Yape + pagos.Plin).toFixed(2)}</strong>
        </div>
        <div style="background: #fff; border: 1px solid var(--borde); border-radius: 10px; padding: 14px;">
          <small style="color: var(--gris); display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;">Unidades Totales</small>
          <strong style="font-size: 18px; color: var(--dorado);">${totalUnidadesVendidas} platos</strong>
        </div>
      </div>

      <div style="background: #fff; border: 1px solid var(--borde); border-radius: 10px; padding: 16px;">
        <h4 style="font-size: 14px; margin-bottom: 10px; color: var(--oscuro);">Flujo Operativo KDS</h4>
        <div style="display: flex; justify-content: space-between; font-size: 13px; flex-wrap: wrap; gap: 8px;">
          <span>Recibidas: <strong>${estadosComandas.Recibido}</strong></span>
          <span>En Horno: <strong>${estadosComandas.Horno}</strong></span>
          <span>En Mesa: <strong>${estadosComandas.Mesa}</strong></span>
          <span>Entregadas: <strong>${estadosComandas.Entregado}</strong></span>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════
// 7. INICIALIZACIÓN
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  verificarSesionAdmin();

  // Fallback light-dismiss para <dialog closedby="any">
  if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dialog); });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, dialog)) {
          dialog.close();
          dialog.returnValue = '';
        }
      });
    }
  }

  const formLogin = document.getElementById('formAdminLogin');
  if (formLogin) formLogin.addEventListener('submit', iniciarSesionAdmin);

  const btnLogout = document.getElementById('btnAdminLogout');
  if (btnLogout) btnLogout.addEventListener('click', cerrarSesionAdmin);

  const tabsBar = document.getElementById('adminTabsBar');
  if (tabsBar) {
    tabsBar.addEventListener('click', e => {
      const btn = e.target.closest('.admin-tab-btn');
      if (btn && btn.dataset.tab) cambiarPestana(btn.dataset.tab);
    });
  }

  const btnNuevoProd = document.getElementById('btnNuevoProducto');
  if (btnNuevoProd) btnNuevoProd.addEventListener('click', abrirModalNuevoProducto);

  const btnCerrarModalProd = document.getElementById('btnCerrarModalProd');
  if (btnCerrarModalProd) btnCerrarModalProd.addEventListener('click', cerrarModalProducto);

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

  window.addEventListener('storage', e => {
    if (['pizza_pedidos', 'pizza_productos'].includes(e.key)) {
      actualizarMetricas();
      renderizarTablaPedidos();
      renderizarTablaProductos();
      renderizarEstadisticas();
    }
  });

  if (typeof canalPedidos !== 'undefined' && canalPedidos) {
    canalPedidos.addEventListener('message', e => {
      if (!e.data) return;
      if (e.data.tipo === 'NUEVO_PEDIDO' && e.data.pedido) {
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
