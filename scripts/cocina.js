/**
 * COCINA.JS — Pantalla KDS (Kitchen Display System)
 * Monitoreo y despacho en tiempo real para pizzeros
 */

let filtroEstadoKds = 'activos';
let audioHabilitado = true;
let totalPedidosPrevio = 0;
let ultimoHashTickets = '';

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

  let filtrados = [];
  if (filtroEstadoKds === 'activos') {
    filtrados = todos.filter(p => p.estado !== 'Entregado');
  } else if (filtroEstadoKds === 'todos') {
    filtrados = todos;
  } else {
    filtrados = todos.filter(p => p.estado === filtroEstadoKds);
  }

  actualizarContadoresKds(todos);

  if (filtrados.length === 0) {
    contenedor.innerHTML = `
      <div class="kds-vacio">
        <div class="icono-vacio" style="opacity:0.4;">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/></svg>
        </div>
        <h2>Sin comandas en esta bandeja</h2>
        <p>Cuando un comensal envíe su pedido desde el código QR de su mesa, se mostrará inmediatamente aquí.</p>
      </div>`;
    return;
  }

  contenedor.innerHTML = filtrados.map(p => {
    const codigoEsc = (p.codigo || '').replace(/'/g, "\\'");
    const estadoClass = p.estado === 'Al Horno' ? 'estado-horno' : (p.estado === 'En Mesa' ? 'estado-mesa' : 'estado-recibido');

    let botonAccionHtml = '';
    if (p.estado === 'Recibido') {
      botonAccionHtml = `
        <button type="button" class="btn-accion-cocina btn-al-horno" onclick="cambiarEstadoKds('${codigoEsc}', 'Al Horno')">
          <span>Ingresar al Horno a Leña</span>
        </button>`;
    } else if (p.estado === 'Al Horno') {
      botonAccionHtml = `
        <button type="button" class="btn-accion-cocina btn-listo" onclick="cambiarEstadoKds('${codigoEsc}', 'En Mesa')">
          <span>Listo · Despachar a Mesa</span>
        </button>`;
    } else if (p.estado === 'En Mesa') {
      botonAccionHtml = `
        <button type="button" class="btn-accion-cocina btn-despachar" onclick="cambiarEstadoKds('${codigoEsc}', 'Entregado')">
          <span>Confirmar Entrega Final</span>
        </button>`;
    } else {
      botonAccionHtml = `<div style="text-align:center; font-size:12px; color:#10b981; font-weight:700;">Orden Entregada en Mesa</div>`;
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
      : '<div style="color:#aaa;">Comanda general</div>';

    return `
      <article class="ticket-kds ${estadoClass}">
        <div class="ticket-header">
          <div class="ticket-mesa-box">
            <strong>${p.mesa || 'Mesa 1'}</strong>
          </div>
          <span class="ticket-tiempo">${p.fecha || 'Reciente'}</span>
        </div>

        <div class="ticket-info-cliente">
          <span>Comensal: <strong>${p.cliente || 'En Salón'}</strong></span>
          <span>${p.codigo || ''} · <strong>${p.estado || 'Recibido'}</strong></span>
        </div>

        <div class="ticket-items-lista">
          ${itemsHtml}
        </div>

        ${p.notas && p.notas !== 'Sin notas especiales' ? `
          <div class="ticket-notas-box">
            <strong>Indicaciones de mesa:</strong><br>
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

  if (todos.length > totalPedidosPrevio && totalPedidosPrevio > 0) {
    sonarAlertaNuevoPedido();
  }
  totalPedidosPrevio = todos.length;
}

function renderizarAvisoAsistencia(aviso) {
  const barra = document.getElementById('kdsBarraAsistencia');
  if (!barra || !aviso) return;
  barra.style.display = 'flex';
  barra.style.justifyContent = 'space-between';
  barra.style.alignItems = 'center';
  barra.innerHTML = `
    <div>
      <strong>SOLICITUD EN SALÓN (${aviso.hora}):</strong> ${aviso.mesa} requiere <em>"${aviso.tipo}"</em>
    </div>
    <button type="button" onclick="this.parentElement.style.display='none'" style="color:#fcd34d;font-weight:700;font-size:12px;">
      Marcar Atendido ×
    </button>
  `;
  sonarAlertaNuevoPedido();
}

function sonarAlertaNuevoPedido() {
  if (!audioHabilitado) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  } catch (e) {}
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
    btn.textContent = audioHabilitado ? 'Alerta Sonora: Activa' : 'Alerta Sonora: Silenciada';
  }
}

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

document.addEventListener('DOMContentLoaded', () => {
  iniciarRelojCocina();
  renderizarTicketsKds();

  if (typeof apiObtenerPedidos === 'function') {
    apiObtenerPedidos()
      .then(() => renderizarTicketsKds())
      .catch(() => {});
  }

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

  const btnSonido = document.getElementById('btnToggleSonido');
  if (btnSonido) btnSonido.addEventListener('click', alternarSonido);

  window.addEventListener('storage', e => {
    if (e.key === 'pizza_pedidos') {
      renderizarTicketsKds();
    } else if (e.key === 'pizza_asistencia_mesa') {
      const lista = JSON.parse(localStorage.getItem('pizza_asistencia_mesa') || '[]');
      if (lista[0]) renderizarAvisoAsistencia(lista[0]);
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
        renderizarTicketsKds();
        sonarAlertaNuevoPedido();
      } else if (e.data.tipo === 'ACTUALIZAR_PEDIDO' && e.data.codigo) {
        const lista = JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
        const idx = lista.findIndex(p => p.codigo === e.data.codigo);
        if (idx !== -1) {
          lista[idx] = { ...lista[idx], ...e.data.campos };
          localStorage.setItem('pizza_pedidos', JSON.stringify(lista));
        }
        renderizarTicketsKds();
      } else if (e.data.tipo === 'ASISTENCIA_MESA' && e.data.aviso) {
        renderizarAvisoAsistencia(e.data.aviso);
      } else if (e.data.tipo === 'LIMPIAR_PEDIDOS') {
        localStorage.removeItem('pizza_pedidos');
        renderizarTicketsKds();
      }
    });
  }

  setInterval(() => {
    if (typeof apiObtenerPedidos === 'function') {
      apiObtenerPedidos().then(() => renderizarTicketsKds()).catch(() => {});
    } else {
      renderizarTicketsKds();
    }
  }, 2500);
});
