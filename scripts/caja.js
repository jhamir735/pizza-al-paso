/**
 * CAJA (POS) - SISTEMA DE COBROS, EMISIÓN DE BOLETAS Y CONTROL DE CAJA
 * Sincronizado en tiempo real con Menú del Cliente, Cocina (KDS) y Administración.
 */

// Estado global de la vista de caja
let filtroEstadoActual = 'pendientes';
let filtroMesaActual = 'todas';
let busquedaTextoActual = '';
let comandaSeleccionadaParaCobro = null;
let sonidoCajaHabilitado = true;
let ultimoHashCaja = '';

// ═══════════════════════════════════════════════
// 1. CARGA DE DATOS Y STORAGE
// ═══════════════════════════════════════════════
function obtenerPedidosCaja() {
  try {
    return JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
  } catch (e) {
    console.error('Error al leer pizza_pedidos:', e);
    return [];
  }
}

function guardarPedidosCaja(pedidos) {
  localStorage.setItem('pizza_pedidos', JSON.stringify(pedidos));
  actualizarMetricasCaja();
  renderizarComandasCaja(true);
}

// ═══════════════════════════════════════════════
// 2. RELOJ Y MÉTRICAS EN VIVO
// ═══════════════════════════════════════════════
function iniciarRelojCaja() {
  const elReloj = document.getElementById('relojCaja');
  if (!elReloj) return;
  const tick = () => {
    const ahora = new Date();
    elReloj.textContent = ahora.toLocaleTimeString('es-PE', { hour12: false });
  };
  tick();
  setInterval(tick, 1000);
}

function actualizarMetricasCaja() {
  const pedidos = obtenerPedidosCaja();

  const pendientes = pedidos.filter(p => (p.estadoPago || 'Pendiente') === 'Pendiente');
  const pagados = pedidos.filter(p => (p.estadoPago || 'Pendiente') === 'Pagado');

  const montoPendiente = pendientes.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
  const montoCobrado = pagados.reduce((acc, p) => acc + (Number(p.total) || 0), 0);

  // Desglose por método de pago
  let totalEfectivo = 0;
  let totalDigital = 0;

  pagados.forEach(p => {
    const tot = Number(p.total) || 0;
    const metodo = (p.metodoCobroFinal || p.pago || '').toLowerCase();
    if (metodo.includes('efectivo')) {
      totalEfectivo += tot;
    } else {
      totalDigital += tot;
    }
  });

  // Elementos UI
  const elCantPend = document.getElementById('metricaCantPendiente');
  const elMontoPend = document.getElementById('metricaMontoPendiente');
  const elCantCobrado = document.getElementById('metricaCantCobrado');
  const elMontoCobrado = document.getElementById('metricaMontoCobrado');
  const elEfectivo = document.getElementById('metricaEfectivoTotal');
  const elDigital = document.getElementById('metricaDigitalTotal');

  // Badges en chips de filtro
  const badgePend = document.getElementById('badgeFiltroPendientes');
  const badgePag = document.getElementById('badgeFiltroPagados');
  const badgeTodos = document.getElementById('badgeFiltroTodos');

  if (elCantPend) elCantPend.textContent = `${pendientes.length} pedidos`;
  if (elMontoPend) elMontoPend.textContent = 'S/ ' + montoPendiente.toFixed(2);
  if (elCantCobrado) elCantCobrado.textContent = `${pagados.length} pagados`;
  if (elMontoCobrado) elMontoCobrado.textContent = 'S/ ' + montoCobrado.toFixed(2);
  if (elEfectivo) elEfectivo.textContent = 'S/ ' + totalEfectivo.toFixed(2);
  if (elDigital) elDigital.textContent = 'S/ ' + totalDigital.toFixed(2);

  if (badgePend) badgePend.textContent = pendientes.length;
  if (badgePag) badgePag.textContent = pagados.length;
  if (badgeTodos) badgeTodos.textContent = pedidos.length;
}

// ═══════════════════════════════════════════════
// 3. RENDERIZADO DE PEDIDOS / CUENTAS
// ═══════════════════════════════════════════════
function renderizarComandasCaja(forzar = false) {
  const pedidos = obtenerPedidosCaja();
  const contenedor = document.getElementById('grillaComandasCaja');
  if (!contenedor) return;

  const modalCobro = document.getElementById('modalCobroCaja');
  const estaCobrando = modalCobro && modalCobro.style.display === 'flex';

  const hashActual = JSON.stringify(pedidos) + '|' + filtroEstadoActual + '|' + filtroMesaActual + '|' + busquedaTextoActual;
  if (!forzar && hashActual === ultimoHashCaja) {
    return;
  }
  if (!forzar && estaCobrando) {
    return;
  }
  ultimoHashCaja = hashActual;

  // Filtrado
  let resultado = [...pedidos];

  // 1. Filtro por estado de pago
  if (filtroEstadoActual === 'pendientes') {
    resultado = resultado.filter(p => (p.estadoPago || 'Pendiente') === 'Pendiente');
  } else if (filtroEstadoActual === 'pagados') {
    resultado = resultado.filter(p => (p.estadoPago || 'Pendiente') === 'Pagado');
  }

  // 2. Filtro por mesa
  if (filtroMesaActual !== 'todas') {
    resultado = resultado.filter(p => (p.mesa || '').toLowerCase().includes(filtroMesaActual.toLowerCase()));
  }

  // 3. Filtro por texto (código, mesa o cliente)
  if (busquedaTextoActual.trim() !== '') {
    const q = busquedaTextoActual.toLowerCase();
    resultado = resultado.filter(p =>
      (p.codigo || '').toLowerCase().includes(q) ||
      (p.mesa || '').toLowerCase().includes(q) ||
      (p.cliente || '').toLowerCase().includes(q)
    );
  }

  // Estado vacío
  if (resultado.length === 0) {
    let mensaje = 'No hay pedidos registrados.';
    if (filtroEstadoActual === 'pendientes') {
      mensaje = '¡Excelente! No hay pedidos pendientes de cobro en este momento.';
    } else if (filtroEstadoActual === 'pagados') {
      mensaje = 'No hay comprobantes pagados aún para los filtros seleccionados.';
    }

    contenedor.innerHTML = `
      <div class="caja-vacio">
        <div class="caja-vacio-icono">💵</div>
        <h3>${mensaje}</h3>
        <p style="font-size:13px; color:var(--gris);">Los pedidos emitidos desde las mesas o mostrador se actualizarán automáticamente aquí.</p>
      </div>`;
    return;
  }

  // Generar tarjetas
  contenedor.innerHTML = resultado.map(p => {
    const esPagado = (p.estadoPago || 'Pendiente') === 'Pagado';
    const subtotal = ((Number(p.total) || 0) / 1.18);
    const igv = (Number(p.total) || 0) - subtotal;
    const indiceOriginal = pedidos.findIndex(item => item.codigo === p.codigo);

    return `
      <div class="tarjeta-cuenta ${esPagado ? 'pagado' : 'pendiente'}">
        <!-- Cabecera de Comanda -->
        <div class="cuenta-cabecera">
          <div class="cuenta-mesa-codigo">
            <span class="cuenta-badge-mesa">${p.mesa || 'Mesa 1'}</span>
            <span class="cuenta-codigo">${p.codigo || '#PZ-000'} · ${p.fecha || ''}</span>
          </div>
          <div class="cuenta-badges-estado">
            <span class="badge-pago ${esPagado ? 'pagado' : 'pendiente'}">
              ${esPagado ? '✓ PAGADO' : '⏳ POR COBRAR'}
            </span>
            <span class="badge-cocina-ref">
              Cocina: ${p.estado || 'Recibido'}
            </span>
          </div>
        </div>

        <!-- Info Cliente -->
        <div class="cuenta-info-cliente">
          <span>Comensal: <strong>${p.cliente || 'Cliente en Salón'}</strong></span>
          <span>Pago inicial: <em>${p.pago || 'Presencial'}</em></span>
        </div>

        <!-- Lista de Productos -->
        <div class="cuenta-items-lista">
          ${(p.items || []).map(it => `
            <div class="cuenta-item-fila">
              <div class="cuenta-item-cant-nombre">
                <span class="cuenta-item-cant">${it.cantidad}x</span>
                <span class="cuenta-item-nombre">${it.nombre}</span>
              </div>
              <span class="cuenta-item-precio">S/ ${((Number(it.precio) || 0) * (Number(it.cantidad) || 1)).toFixed(2)}</span>
            </div>
          `).join('')}
          ${p.notas ? `<div style="font-size:11px; color:#d97706; background:#fffbeb; padding:4px 8px; border-radius:4px; margin-top:4px;"><strong>Nota:</strong> ${p.notas}</div>` : ''}
        </div>

        <!-- Desglose de Cuenta -->
        <div class="cuenta-desglose">
          <div class="cuenta-fila-desglose">
            <span>Op. Gravada (Subtotal)</span>
            <span>S/ ${subtotal.toFixed(2)}</span>
          </div>
          <div class="cuenta-fila-desglose">
            <span>I.G.V. (18%)</span>
            <span>S/ ${igv.toFixed(2)}</span>
          </div>
          <div class="cuenta-fila-total">
            <span>TOTAL A COBRAR</span>
            <strong>S/ ${(Number(p.total) || 0).toFixed(2)}</strong>
          </div>
        </div>

        <!-- Acciones POS -->
        <div class="cuenta-acciones">
          ${!esPagado ? `
            <button class="btn-cobrar-pos" onclick="abrirModalCobro('${(p.codigo || '').replace(/'/g, "\\'")}')">
              <span>💳</span> Cobrar Pedido (POS)
            </button>
          ` : `
            <div class="cuenta-info-pagada">
              <span>✓ Pagado con ${p.metodoCobroFinal || p.pago || 'Caja'} (${p.nroComprobante || 'B001-001'})</span>
            </div>
            <button class="btn-ver-boleta" onclick="abrirModalBoleta('${(p.codigo || '').replace(/'/g, "\\'")}')">
              <span>🧾</span> Ver Boleta Fiscal / Imprimir
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// ═══════════════════════════════════════════════
// 4. MODAL DE COBRO (PROCESAR PAGO)
// ═══════════════════════════════════════════════
let metodoPagoSeleccionado = 'Efectivo';

function abrirModalCobro(identificador) {
  const pedidos = obtenerPedidosCaja();
  const pedido = typeof identificador === 'string'
    ? pedidos.find(p => p.codigo === identificador)
    : pedidos[identificador];
  if (!pedido) return;

  comandaSeleccionadaParaCobro = { ...pedido };

  const modal = document.getElementById('modalCobroCaja');
  const txtTitulo = document.getElementById('cobroMesaCodigo');
  const txtTotal = document.getElementById('cobroMontoTotal');
  const inputRecibido = document.getElementById('inputMontoRecibido');
  const txtVuelto = document.getElementById('txtVueltoCalculado');

  if (txtTitulo) txtTitulo.textContent = `${pedido.mesa || 'Mesa 1'} · ${pedido.codigo || ''}`;
  const total = Number(pedido.total) || 0;
  if (txtTotal) txtTotal.textContent = 'S/ ' + total.toFixed(2);

  // Reset inputs
  metodoPagoSeleccionado = 'Efectivo';
  seleccionarMetodoCobro('Efectivo');
  if (inputRecibido) {
    inputRecibido.value = total.toFixed(2);
    calcularVuelto();
  }

  if (modal) modal.style.display = 'flex';
}

function cerrarModalCobro() {
  const modal = document.getElementById('modalCobroCaja');
  if (modal) modal.style.display = 'none';
  comandaSeleccionadaParaCobro = null;
}

function seleccionarMetodoCobro(metodo) {
  metodoPagoSeleccionado = metodo;
  document.querySelectorAll('.metodo-pago-btn').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.metodo === metodo);
  });

  const seccionEfectivo = document.getElementById('seccionDetalleEfectivo');
  const seccionTarjeta = document.getElementById('seccionDetalleTarjeta');
  const seccionYape = document.getElementById('seccionDetalleYape');

  if (seccionEfectivo) seccionEfectivo.style.display = metodo === 'Efectivo' ? 'flex' : 'none';
  if (seccionTarjeta) seccionTarjeta.style.display = metodo === 'Tarjeta' ? 'block' : 'none';
  if (seccionYape) seccionYape.style.display = metodo === 'Yape' ? 'block' : 'none';
}

function agregarBillete(monto) {
  const input = document.getElementById('inputMontoRecibido');
  if (!input) return;
  let actual = Number(input.value) || 0;
  input.value = (actual + monto).toFixed(2);
  calcularVuelto();
}

function fijarMontoExacto() {
  if (!comandaSeleccionadaParaCobro) return;
  const input = document.getElementById('inputMontoRecibido');
  if (input) {
    input.value = (Number(comandaSeleccionadaParaCobro.total) || 0).toFixed(2);
    calcularVuelto();
  }
}

function calcularVuelto() {
  if (!comandaSeleccionadaParaCobro) return;
  const input = document.getElementById('inputMontoRecibido');
  const txtVuelto = document.getElementById('txtVueltoCalculado');
  if (!input || !txtVuelto) return;

  const total = Number(comandaSeleccionadaParaCobro.total) || 0;
  const recibido = Number(input.value) || 0;
  const vuelto = recibido - total;

  if (vuelto >= 0) {
    txtVuelto.textContent = 'S/ ' + vuelto.toFixed(2);
    txtVuelto.style.color = '#15803d';
  } else {
    txtVuelto.textContent = 'Faltan S/ ' + Math.abs(vuelto).toFixed(2);
    txtVuelto.style.color = '#b31b26';
  }
}

function reproducirSonidoCobro() {
  if (!sonidoCajaHabilitado) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    // Silently continue
  }
}

function confirmarCobroComanda() {
  if (!comandaSeleccionadaParaCobro) return;

  const total = Number(comandaSeleccionadaParaCobro.total) || 0;
  const inputRecibido = document.getElementById('inputMontoRecibido');
  const recibido = Number(inputRecibido ? inputRecibido.value : total) || total;

  if (metodoPagoSeleccionado === 'Efectivo' && recibido < total) {
    alert(`El monto recibido (S/ ${recibido.toFixed(2)}) es menor que el total de la comanda (S/ ${total.toFixed(2)}).`);
    return;
  }

  // Generar serie y número de comprobante
  const tipoDoc = document.querySelector('input[name="tipoComprobante"]:checked')?.value || 'Boleta';
  const numeroCorrelativo = Math.floor(1000 + Math.random() * 9000);
  const nroComprobante = `${tipoDoc === 'Factura' ? 'F001' : 'B001'}-${numeroCorrelativo}`;

  // Actualizar pedido buscando por código único
  const pedidos = obtenerPedidosCaja();
  const pedido = pedidos.find(p => p.codigo === comandaSeleccionadaParaCobro.codigo);

  if (pedido) {
    pedido.estadoPago = 'Pagado';
    pedido.metodoCobroFinal = metodoPagoSeleccionado;
    pedido.montoEntregado = recibido;
    pedido.montoVuelto = Math.max(0, recibido - total);
    pedido.tipoComprobante = tipoDoc;
    pedido.nroComprobante = nroComprobante;
    pedido.fechaCobro = new Date().toLocaleString('es-PE');

    guardarPedidosCaja(pedidos);
    reproducirSonidoCobro();
    cerrarModalCobro();

    // Actualizar en Neon BD
    if (typeof apiActualizarPagoPedido === 'function') {
      apiActualizarPagoPedido(pedido.codigo, {
        estadoPago: pedido.estadoPago,
        metodoCobroFinal: pedido.metodoCobroFinal,
        montoEntregado: pedido.montoEntregado,
        montoVuelto: pedido.montoVuelto,
        tipoComprobante: pedido.tipoComprobante,
        nroComprobante: pedido.nroComprobante,
        fechaCobro: pedido.fechaCobro
      });
    }

    // Ofrecer visualizar la boleta
    setTimeout(() => {
      abrirModalBoleta(pedido.codigo);
    }, 200);
  }
}

// ═══════════════════════════════════════════════
// 5. MODAL DE COMPROBANTE FISCAL / BOLETA
// ═══════════════════════════════════════════════
function abrirModalBoleta(identificador) {
  const pedidos = obtenerPedidosCaja();
  const p = typeof identificador === 'string'
    ? pedidos.find(item => item.codigo === identificador)
    : pedidos[identificador];
  if (!p) return;

  const contenedor = document.getElementById('cuerpoTicketTermico');
  const modal = document.getElementById('modalBoletaFiscal');
  if (!contenedor || !modal) return;

  const total = Number(p.total) || 0;
  const subtotal = total / 1.18;
  const igv = total - subtotal;
  const fecha = p.fechaCobro || p.fechaCompleta || new Date().toLocaleString('es-PE');
  const doc = p.nroComprobante || 'B001-0001';
  const tipoDoc = p.tipoComprobante || 'BOLETA DE VENTA ELECTRÓNICA';

  contenedor.innerHTML = `
    <div class="ticket-header">
      <h4>PIZZERÍA AL PASO S.A.C.</h4>
      <p>RUC: 20601234567</p>
      <p>Jr. Artesanos 142, Miraflores · Lima, Perú</p>
      <p>Tel: (01) 234-5678</p>
      <div class="ticket-separador"></div>
      <strong style="font-size:13px;">${tipoDoc.toUpperCase()}</strong>
      <p style="font-weight:700; font-size:13px;">${doc}</p>
    </div>

    <div class="ticket-datos-fiscales">
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Comensal:</strong> ${p.cliente || 'CLIENTE SALÓN'}</p>
      <p><strong>Ubicación:</strong> ${p.mesa || 'Mesa 1'}</p>
      <p><strong>Cajero:</strong> Caja Principal 01</p>
    </div>

    <div class="ticket-separador"></div>

    <table class="ticket-tabla-items">
      <thead>
        <tr>
          <th>Cant.</th>
          <th>Descripción</th>
          <th style="text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${(p.items || []).map(it => `
          <tr>
            <td>${it.cantidad}</td>
            <td>${it.nombre}</td>
            <td class="num">S/ ${((Number(it.precio) || 0) * (Number(it.cantidad) || 1)).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="ticket-separador"></div>

    <div class="ticket-totales">
      <div class="fila">
        <span>OP. GRAVADA:</span>
        <span>S/ ${subtotal.toFixed(2)}</span>
      </div>
      <div class="fila">
        <span>I.G.V. (18%):</span>
        <span>S/ ${igv.toFixed(2)}</span>
      </div>
      <div class="fila gran-total">
        <span>IMPORTE TOTAL:</span>
        <span>S/ ${total.toFixed(2)}</span>
      </div>
      <div class="fila" style="margin-top:4px;">
        <span>Forma de Pago:</span>
        <span>${p.metodoCobroFinal || p.pago || 'Efectivo'}</span>
      </div>
      ${p.montoEntregado ? `
        <div class="fila">
          <span>Importe Recibido:</span>
          <span>S/ ${Number(p.montoEntregado).toFixed(2)}</span>
        </div>
        <div class="fila">
          <span>Vuelto Entregado:</span>
          <span>S/ ${Number(p.montoVuelto || 0).toFixed(2)}</span>
        </div>
      ` : ''}
    </div>

    <div class="ticket-separador"></div>

    <div class="ticket-footer">
      <p>Representación impresa de la ${tipoDoc}</p>
      <p>Autorizado por SUNAT · Consulta web: pizzaalpaso.pe</p>
      <p style="margin-top:8px; font-weight:700;">¡Gracias por su visita y buen provecho! 🍕</p>
    </div>
  `;

  modal.style.display = 'flex';
}

function cerrarModalBoleta() {
  const modal = document.getElementById('modalBoletaFiscal');
  if (modal) modal.style.display = 'none';
}

function imprimirComprobante() {
  window.print();
}

// ═══════════════════════════════════════════════
// 6. ARQUEO Y CIERRE DE CAJA (MODAL)
// ═══════════════════════════════════════════════
function abrirModalArqueoCaja() {
  const pedidos = obtenerPedidosCaja();
  const pagados = pedidos.filter(p => (p.estadoPago || 'Pendiente') === 'Pagado');
  const pendientes = pedidos.filter(p => (p.estadoPago || 'Pendiente') === 'Pendiente');

  let efectivo = 0;
  let tarjeta = 0;
  let yapePlin = 0;

  pagados.forEach(p => {
    const tot = Number(p.total) || 0;
    const m = (p.metodoCobroFinal || p.pago || '').toLowerCase();
    if (m.includes('efectivo')) efectivo += tot;
    else if (m.includes('tarjeta') || m.includes('pos')) tarjeta += tot;
    else yapePlin += tot;
  });

  const granTotal = efectivo + tarjeta + yapePlin;

  const elModal = document.getElementById('modalArqueoCaja');
  const cuerpo = document.getElementById('cuerpoArqueoCaja');

  if (cuerpo) {
    cuerpo.innerHTML = `
      <div style="background:var(--crema-suave); border:1px solid var(--borde); border-radius:12px; padding:18px; margin-bottom:16px;">
        <h4 style="font-size:16px; margin-bottom:12px; color:var(--oscuro);">Resumen de Operaciones del Turno</h4>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
          <span>Comandas Cobradas:</span>
          <strong>${pagados.length} tickets</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
          <span>Comandas Pendientes:</span>
          <strong style="color:var(--dorado-oscuro);">${pendientes.length} cuentas por cobrar</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:13px;">
          <span>Hora de Apertura:</span>
          <span>Hoy · 12:00:00</span>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
        <div style="display:flex; justify-content:space-between; padding:10px 14px; background:#fff; border:1px solid var(--borde); border-radius:8px;">
          <span>💵 Efectivo en Gaveta:</span>
          <strong style="font-size:16px;">S/ ${efectivo.toFixed(2)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:10px 14px; background:#fff; border:1px solid var(--borde); border-radius:8px;">
          <span>💳 Tarjetas / Terminal POS:</span>
          <strong style="font-size:16px;">S/ ${tarjeta.toFixed(2)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:10px 14px; background:#fff; border:1px solid var(--borde); border-radius:8px;">
          <span>📱 Billeteras Digitales (Yape/Plin):</span>
          <strong style="font-size:16px; color:#7c3aed;">S/ ${yapePlin.toFixed(2)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:14px; background:var(--oscuro); color:#fff; border-radius:8px; align-items:center;">
          <span style="font-weight:700;">TOTAL RECAUDADO EN CAJA:</span>
          <strong style="font-size:22px; color:var(--dorado);">S/ ${granTotal.toFixed(2)}</strong>
        </div>
      </div>
    `;
  }

  if (elModal) elModal.style.display = 'flex';
}

function cerrarModalArqueoCaja() {
  const elModal = document.getElementById('modalArqueoCaja');
  if (elModal) elModal.style.display = 'none';
}

// ═══════════════════════════════════════════════
// 7. INICIALIZACIÓN Y EVENT LISTENERS
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  iniciarRelojCaja();
  actualizarMetricasCaja();
  renderizarComandasCaja();

  // Sincronizar con Neon BD al cargar
  if (typeof apiObtenerPedidos === 'function') {
    apiObtenerPedidos().then(() => {
      actualizarMetricasCaja();
      renderizarComandasCaja();
    }).catch(() => {});
  }

  // Filtros de estado (Chips)
  document.querySelectorAll('.chip-filtro-caja').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip-filtro-caja').forEach(c => c.classList.remove('activo'));
      chip.classList.add('activo');
      filtroEstadoActual = chip.dataset.filtro;
      renderizarComandasCaja();
    });
  });

  // Selector de mesa
  const selMesa = document.getElementById('cajaSelectorMesa');
  if (selMesa) {
    selMesa.addEventListener('change', e => {
      filtroMesaActual = e.target.value;
      renderizarComandasCaja();
    });
  }

  // Buscador de texto
  const inpBuscador = document.getElementById('cajaBuscador');
  if (inpBuscador) {
    inpBuscador.addEventListener('input', e => {
      busquedaTextoActual = e.target.value;
      renderizarComandasCaja();
    });
  }

  // Métodos de pago en modal de cobro
  document.querySelectorAll('.metodo-pago-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      seleccionarMetodoCobro(btn.dataset.metodo);
    });
  });

  // Input recibido en modal
  const inpRecibido = document.getElementById('inputMontoRecibido');
  if (inpRecibido) {
    inpRecibido.addEventListener('input', calcularVuelto);
  }

  // Sincronización en tiempo real desde otras pestañas (cliente confirma pedido o cocina cambia estado)
  window.addEventListener('storage', e => {
    if (e.key === 'pizza_pedidos') {
      actualizarMetricasCaja();
      renderizarComandasCaja();
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
        actualizarMetricasCaja();
        renderizarComandasCaja();
      } else if (e.data.tipo === 'ACTUALIZAR_PEDIDO' && e.data.codigo) {
        const lista = JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
        const idx = lista.findIndex(p => p.codigo === e.data.codigo);
        if (idx !== -1) {
          lista[idx] = { ...lista[idx], ...e.data.campos };
          localStorage.setItem('pizza_pedidos', JSON.stringify(lista));
        }
        actualizarMetricasCaja();
        renderizarComandasCaja();
      } else if (e.data.tipo === 'LIMPIAR_PEDIDOS') {
        localStorage.removeItem('pizza_pedidos');
        actualizarMetricasCaja();
        renderizarComandasCaja();
      }
    });
  }

  // Intervalo de seguridad para refrescar cada 3 segundos y sincronizar con Neon
  setInterval(() => {
    if (typeof apiObtenerPedidos === 'function') {
      apiObtenerPedidos().then(() => {
        actualizarMetricasCaja();
        renderizarComandasCaja();
      }).catch(() => {});
    } else {
      actualizarMetricasCaja();
      renderizarComandasCaja();
    }
  }, 3000);
});
