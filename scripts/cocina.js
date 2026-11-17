/**
 * COCINA.JS — Pantalla KDS (Kitchen Display System)
 * Pizza al Paso · Monitoreo y despacho en tiempo real para cocineros y pizzeros
 */

let filtroEstadoKds = 'activos'; // 'activos', 'Recibido', 'Al Horno', 'En Mesa', 'todos'
let audioHabilitado = true;
let totalPedidosPrevio = 0;
let ultimoHashTickets = '';

// ═══════════════════════════════════════════════
// 1. CARGA Y SINCRONIZACIÓN DE PEDIDOS
// ═══════════════════════════════════════════════
function obtenerPedidosKds() {
  try {
    return JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
  } catch (e) {
    return [];
  }
}

function guardarPedidosKds(pedidos) {
  localStorage.setItem('pizza_pedidos', JSON.stringify(pedidos));
  renderizarTicketsKds(true);
}

function renderizarTicketsKds(forzar = false) {
  const todos = obtenerPedidosKds();
  const contenedor = document.getElementById('gridTicketsKds');
  if (!contenedor) return;

  const hashActual = JSON.stringify(todos) + '|' + filtroEstadoKds;
  if (!forzar && hashActual === ultimoHashTickets) {
    actualizarContadoresKds(todos);
    return;
  }
  ultimoHashTickets = hashActual;

  // Filtrado según selección
  let filtrados = [];
  if (filtroEstadoKds === 'activos') {
    filtrados = todos.filter(p => p.estado !== 'Entregado');
  } else if (filtroEstadoKds === 'todos') {
    filtrados = todos;
  } else {
    filtrados = todos.filter(p => p.estado === filtroEstadoKds);
  }

  // Actualizar contadores
  actualizarContadoresKds(todos);

  if (filtrados.length === 0) {
    contenedor.innerHTML = `
      <div class="kds-vacio">
        <div class="icono-vacio">🔥</div>
        <h2>No hay pedidos en este estado</h2>
        <p>Cuando un cliente confirme un pedido desde el menú QR, aparecerá en esta pantalla en tiempo real.</p>
      </div>`;
    return;
  }

  contenedor.innerHTML = filtrados.map(p => {
    const codigoEsc = (p.codigo || '').replace(/'/g, "\\'");
    const estadoClass = p.estado === 'Al Horno' ? 'estado-horno' : (p.estado === 'En Mesa' ? 'estado-mesa' : 'estado-recibido');

    // Botón de acción según el estado — usa codigo, no índice (evita bugs con reordenamiento)
    let botonAccionHtml = '';
    if (p.estado === 'Recibido') {
      botonAccionHtml = `
        <button class="btn-accion-cocina btn-al-horno" onclick="cambiarEstadoKds('${codigoEsc}', 'Al Horno')">
          <span>🔥</span> Meter al Horno a Leña
        </button>`;
    } else if (p.estado === 'Al Horno') {
      botonAccionHtml = `
        <button class="btn-accion-cocina btn-listo" onclick="cambiarEstadoKds('${codigoEsc}', 'En Mesa')">
          <span>🍕</span> ¡Listo! Servir a Mesa
        </button>`;
    } else if (p.estado === 'En Mesa') {
      botonAccionHtml = `
        <button class="btn-accion-cocina btn-despachar" onclick="cambiarEstadoKds('${codigoEsc}', 'Entregado')">
          <span>✓</span> Marcar como Entregado
        </button>`;
    } else {
      botonAccionHtml = `<div style="text-align:center; font-size:12px; color:#10b981; font-weight:700;">✓ Pedido Despachado</div>`;
    }

    const itemsHtml = p.items && p.items.length > 0
      ? p.items.map(item => `
          <div class="ticket-item-fila ${item.nombre.toLowerCase().includes('pizza') ? 'es-pizza' : ''}">
            <span class="item-cant-badge">${item.cantidad}</span>
            <div class="item-nombre-detalle">
              <strong>${item.nombre}</strong>
            </div>
          </div>
        `).join('')
      : '<div style="color:#aaa;">Pedido general</div>';

    return `
      <article class="ticket-kds ${estadoClass}">
        <div class="ticket-header">
          <div class="ticket-mesa-box">
            <span>📍</span>
            <strong>${p.mesa || 'Salón'}</strong>
          </div>
          <span class="ticket-tiempo">🕒 ${p.fecha || 'Reciente'}</span>
        </div>

        <div class="ticket-info-cliente">
          <span>Cliente: <strong>${p.cliente || 'Comensal'}</strong></span>
          <span>${p.codigo || ''}</span>
        </div>

        <div class="ticket-items-lista">
          ${itemsHtml}
        </div>

        ${p.notas && p.notas !== 'Sin notas especiales' ? `
          <div class="ticket-notas-box">
            <strong>Nota para el pizzero:</strong><br>
            <em>"${p.notas}"</em>
          </div>
        ` : ''}

        <div class="ticket-acciones">
          ${botonAccionHtml}
        </div>
      </article>
    `;
  }).join('');
}

function cambiarEstadoKds(codigo, nuevoEstado) {
  const todos = obtenerPedidosKds();
  const pedido = todos.find(p => p.codigo === codigo);
  if (pedido) {
    pedido.estado = nuevoEstado;
    guardarPedidosKds(todos);
    reproducirSonidoAccion();

    // Actualizar en Neon BD y notificar otras pestañas
    if (typeof apiActualizarEstadoPedido === 'function') {
      apiActualizarEstadoPedido(pedido.codigo, nuevoEstado);
    }
    if (typeof canalPedidos !== 'undefined' && canalPedidos) {
      canalPedidos.postMessage({ tipo: 'ACTUALIZAR_PEDIDO', codigo, campos: { estado: nuevoEstado } });
    }
  }
}

function actualizarContadoresKds(todos) {
  const countRecibido = todos.filter(p => p.estado === 'Recibido').length;
  const countHorno = todos.filter(p => p.estado === 'Al Horno').length;
  const countMesa = todos.filter(p => p.estado === 'En Mesa').length;
  const countActivos = todos.filter(p => p.estado !== 'Entregado').length;

  const elRec = document.getElementById('countRecibido');
  const elHor = document.getElementById('countHorno');
  const elMes = document.getElementById('countMesa');
  const elAct = document.getElementById('countActivos');

  if (elRec) elRec.textContent = countRecibido;
  if (elHor) elHor.textContent = countHorno;
  if (elMes) elMes.textContent = countMesa;
  if (elAct) elAct.textContent = countActivos;

  // Si entraron nuevos pedidos, emitir sonido y notificación
  if (todos.length > totalPedidosPrevio && totalPedidosPrevio > 0) {
    sonarAlertaNuevoPedido();
  }
  totalPedidosPrevio = todos.length;
}

// ═══════════════════════════════════════════════
// 2. SONIDOS Y ALERTAS DE COCINA (BEEP SINTETIZADO)
// ═══════════════════════════════════════════════
function sonarAlertaNuevoPedido() {
  if (!audioHabilitado) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  } catch (e) {
    console.log('AudioContext no disponible o bloqueado por el navegador');
  }
}

function reproducirSonidoAccion() {
  if (!audioHabilitado) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.22);
  } catch (e) {}
}

function alternarSonido() {
  audioHabilitado = !audioHabilitado;
  const btn = document.getElementById('btnToggleSonido');
  if (btn) {
    btn.textContent = audioHabilitado ? '🔔 Sonido: Activado' : '🔕 Sonido: Silenciado';
  }
}

// ═══════════════════════════════════════════════
// 3. RELOJ DIGITAL DE COCINA
// ═══════════════════════════════════════════════
function iniciarRelojCocina() {
  const elReloj = document.getElementById('relojCocina');
  function actualizar() {
    if (elReloj) {
      const ahora = new Date();
      elReloj.textContent = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }
  actualizar();
  setInterval(actualizar, 1000);
}

// ═══════════════════════════════════════════════
// 4. INICIALIZACIÓN Y EVENT LISTENERS
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  iniciarRelojCocina();

  // 1. Mostrar inmediatamente lo que hay en localStorage (sin esperar red)
  renderizarTicketsKds();

  // 2. Luego sincronizar con Neon y volver a pintar (trae pedidos que llegaron antes de abrir esta pestaña)
  if (typeof apiObtenerPedidos === 'function') {
    apiObtenerPedidos()
      .then(() => renderizarTicketsKds())
      .catch(() => {});
  }

  // Filtros de barra
  const filtrosBar = document.getElementById('kdsFiltrosBar');
  if (filtrosBar) {
    filtrosBar.addEventListener('click', e => {
      const chip = e.target.closest('.chip-contador');
      if (chip && chip.dataset.estado) {
        document.querySelectorAll('.chip-contador').forEach(c => c.classList.remove('activo'));
        chip.classList.add('activo');
        filtroEstadoKds = chip.dataset.estado;
        renderizarTicketsKds();
      }
    });
  }

  // Botón sonido
  const btnSonido = document.getElementById('btnToggleSonido');
  if (btnSonido) btnSonido.addEventListener('click', alternarSonido);

  // Sincronización en tiempo real desde otras pestañas (cliente, caja o admin)
  window.addEventListener('storage', e => {
    if (e.key === 'pizza_pedidos') {
      renderizarTicketsKds();
    }
  });

  // Canal instantáneo entre pestañas
  if (typeof canalPedidos !== 'undefined' && canalPedidos) {
    canalPedidos.addEventListener('message', e => {
      if (!e.data) return;
      if (e.data.tipo === 'NUEVO_PEDIDO' && e.data.pedido) {
        // Insertar el nuevo pedido en localStorage de esta pestaña antes de pintar
        const lista = JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
        if (!lista.some(p => p.codigo === e.data.pedido.codigo)) {
          lista.unshift(e.data.pedido);
          localStorage.setItem('pizza_pedidos', JSON.stringify(lista));
        }
        renderizarTicketsKds();
        if (typeof reproducirAlertaSonido === 'function') reproducirAlertaSonido();
      } else if (e.data.tipo === 'ACTUALIZAR_PEDIDO' && e.data.codigo) {
        const lista = JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
        const idx = lista.findIndex(p => p.codigo === e.data.codigo);
        if (idx !== -1) {
          lista[idx] = { ...lista[idx], ...e.data.campos };
          localStorage.setItem('pizza_pedidos', JSON.stringify(lista));
        }
        renderizarTicketsKds();
      } else if (e.data.tipo === 'LIMPIAR_PEDIDOS') {
        localStorage.removeItem('pizza_pedidos');
        renderizarTicketsKds();
      }
    });
  }

  // Polling de seguridad cada 2 segundos (consulta BD Neon para traer pedidos nuevos)
  setInterval(() => {
    if (typeof apiObtenerPedidos === 'function') {
      apiObtenerPedidos().then(() => renderizarTicketsKds()).catch(() => {});
    } else {
      renderizarTicketsKds();
    }
  }, 2000);
});
