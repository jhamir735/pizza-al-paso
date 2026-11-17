/**
 * GLOBAL.JS — Pizza al Paso (Web Desktop)
 * Lógica compartida: Catálogo, Carrito sincrónico en sessionStorage,
 * Selector de Mesa QR, Llamar al Mozo, Simulación KDS, Checkout y Tour Guiado.
 */

// ═══════════════════════════════════════════════
// 1. CATÁLOGO GASTRONÓMICO
// ═══════════════════════════════════════════════
const productosPorDefecto = [
  {
    id: 'clasica',
    nombre: 'Pizza Margherita Clásica',
    categoria: 'pizza',
    precio: 19.90,
    imagen: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Tradicional',
    descripcion: 'Salsa pomodoro italiano, mozzarella fior di latte, albahaca fresca y aceite de oliva virgen extra.',
    preferencias: ['popular', 'economica', 'veggie']
  },
  {
    id: 'pepperoni',
    nombre: 'Pizza Pepperoni Supreme',
    categoria: 'pizza',
    precio: 25.90,
    imagen: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Más Pedida 🔥',
    descripcion: 'Doble porción de pepperoni artesanal crocante, mozzarella fundida y orégano serrano.',
    preferencias: ['popular', 'carnes', 'compartir']
  },
  {
    id: 'americana',
    nombre: 'Pizza Americana Especial',
    categoria: 'pizza',
    precio: 26.90,
    imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Favorita Familiar',
    descripcion: 'Jamón inglés selecto, queso mozzarella especial de la casa y champiñones salteados al horno.',
    preferencias: ['carnes', 'compartir', 'combo']
  },
  {
    id: 'cuatroquesos',
    nombre: 'Pizza Cuatro Quesos Gourmet',
    categoria: 'pizza',
    precio: 28.50,
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Selección del Chef',
    descripcion: 'Combinación cremosa de mozzarella, gorgonzola, parmesano reggiano y suave provolone.',
    preferencias: ['compartir', 'veggie']
  },
  {
    id: 'vegetariana',
    nombre: 'Pizza Huerto Vegetariano',
    categoria: 'pizza',
    precio: 23.90,
    imagen: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=700&q=80',
    etiqueta: '100% Veggie',
    descripcion: 'Pimientos asados, champiñones frescos, cebolla morada confitada, aceitunas y albahaca.',
    preferencias: ['veggie', 'economica']
  },
  {
    id: 'bbqchicken',
    nombre: 'Pizza BBQ Chicken Crunch',
    categoria: 'pizza',
    precio: 27.90,
    imagen: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Especial BBQ',
    descripcion: 'Pechuga marinada en barbacoa artesanal, tocino crocante, queso mozzarella y cebolla.',
    preferencias: ['carnes', 'compartir']
  },
  {
    id: 'panajo',
    nombre: 'Pan al Ajo Rústico con Queso',
    categoria: 'acompañamiento',
    precio: 8.50,
    imagen: 'https://images.unsplash.com/photo-1619531040576-f9416740661c?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Acompañamiento Top',
    descripcion: 'Pan ciabatta dorado con mantequilla de ajo confitado, mozzarella gratinada y finas hierbas.',
    preferencias: ['economica', 'veggie', 'compartir', 'combo']
  },
  {
    id: 'alitas',
    nombre: 'Alitas Glaseadas BBQ (6 unid.)',
    categoria: 'acompañamiento',
    precio: 16.90,
    imagen: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Para Picar',
    descripcion: 'Alitas horneadas, glaseadas con barbacoa ahumada y servidas con salsa tártara de la casa.',
    preferencias: ['carnes', 'compartir']
  },
  {
    id: 'limonada',
    nombre: 'Limonada Frozen con Hierbabuena',
    categoria: 'bebida',
    precio: 6.50,
    imagen: 'https://images.unsplash.com/photo-1513558161293-cabee9b1a3a3?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Refrescante',
    descripcion: 'Bebida cítrica frapeada con toques de hierbabuena fresca. Maridaje perfecto para tu pizza.',
    preferencias: ['economica', 'veggie', 'compartir', 'combo']
  },
  {
    id: 'chicha',
    nombre: 'Chicha Morada Artesanal (500ml)',
    categoria: 'bebida',
    precio: 5.90,
    imagen: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Tradición',
    descripcion: 'Elaborada con maíz morado, piña, manzana criolla, canela de chanchamayo y clavo de olor.',
    preferencias: ['economica', 'veggie']
  },
  {
    id: 'brownie',
    nombre: 'Volcán de Chocolate con Helado',
    categoria: 'postre',
    precio: 11.90,
    imagen: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Postre',
    descripcion: 'Bizcocho tibio de chocolate con centro líquido y una bola de helado artesanal de vainilla.',
    preferencias: ['compartir', 'veggie']
  }
];

function obtenerProductos() {
  const guardados = localStorage.getItem('pizza_productos');
  if (guardados) {
    try {
      const parsed = JSON.parse(guardados);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error('Error al cargar productos de localStorage', e);
    }
  }
  localStorage.setItem('pizza_productos', JSON.stringify(productosPorDefecto));
  return [...productosPorDefecto];
}

let productos = obtenerProductos();

// Sincronizar catálogo con Neon DB al iniciar
if (typeof apiObtenerProductos === 'function') {
  apiObtenerProductos().then(prodsBD => {
    if (Array.isArray(prodsBD) && prodsBD.length > 0) {
      productos = prodsBD;
      renderizarCarrito();
      if (typeof renderizarMenu === 'function') renderizarMenu();
    }
  }).catch(() => {});
}

// ═══════════════════════════════════════════════
// 2. ESTADO SINCRONIZADO EN SESSIONSTORAGE
// ═══════════════════════════════════════════════
let carrito = JSON.parse(sessionStorage.getItem('pizza_carrito') || '{}');
let mesaActual = sessionStorage.getItem('pizza_mesa') || 'Mesa 1 (Salón)';
let metodoPago = 'Yape / Plin';

const descripcionMesas = {
  'Mesa 1': 'Salón Principal',
  'Mesa 2': 'Ventana',
  'Mesa 3': 'Terraza',
  'Mesa 4': 'Familiar',
  'Mesa 5': 'Zona VIP'
};

const el = id => document.getElementById(id);
const dinero = n => 'S/ ' + Number(n).toFixed(2);

function escaparHtml(str) {
  return str.replace(/[&<>"']/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}

function guardarCarrito() {
  sessionStorage.setItem('pizza_carrito', JSON.stringify(carrito));
}

function guardarMesa(nombre) {
  mesaActual = nombre;
  sessionStorage.setItem('pizza_mesa', nombre);
  actualizarIndicadoresMesa();
}

function actualizarIndicadoresMesa() {
  const badgeMesaNav = el('badgeMesaNav');
  if (badgeMesaNav) badgeMesaNav.textContent = mesaActual;

  const labelMesaCarrito = el('labelMesaCarrito');
  if (labelMesaCarrito) labelMesaCarrito.textContent = mesaActual;
}

// ═══════════════════════════════════════════════
// 3. CARRITO / COMANDA
// ═══════════════════════════════════════════════
function agregarProducto(id) {
  carrito[id] = (carrito[id] || 0) + 1;
  guardarCarrito();
  renderizarCarrito();
  if (typeof verificarChipCarritoJev === 'function') verificarChipCarritoJev();
  const prod = productos.find(p => p.id === id);
  mostrarToast(`Agregaste "${prod ? prod.nombre : 'producto'}"`, '🍕');
}

function cambiarCantidad(id, delta) {
  carrito[id] = (carrito[id] || 0) + delta;
  if (carrito[id] <= 0) delete carrito[id];
  guardarCarrito();
  renderizarCarrito();
  if (typeof verificarChipCarritoJev === 'function') verificarChipCarritoJev();
}

function calcularTotal() {
  return Object.entries(carrito).reduce((suma, [id, cant]) => {
    const p = productos.find(x => x.id === id);
    return suma + (p ? p.precio * cant : 0);
  }, 0);
}

function renderizarCarrito() {
  const cantidad = Object.values(carrito).reduce((a, b) => a + b, 0);
  const total = calcularTotal();

  // Badges y totales
  const badge = el('insCarrito');
  if (badge) badge.textContent = cantidad;

  const txtSubtotal = el('txtSubtotal');
  const txtTotal = el('txtTotal');
  const btnConfirmar = el('btnConfirmarPedido');
  if (txtSubtotal) txtSubtotal.textContent = dinero(total);
  if (txtTotal) txtTotal.textContent = dinero(total);
  if (btnConfirmar) btnConfirmar.disabled = cantidad === 0;

  // Barra fija inferior (mobile)
  const barraFija = el('barraCarritoFija');
  if (barraFija) {
    if (cantidad > 0) {
      const cB = el('contadorBarra');
      const tB = el('totalBarra');
      if (cB) cB.textContent = cantidad;
      if (tB) tB.textContent = dinero(total);
      barraFija.style.display = 'flex';
    } else {
      barraFija.style.display = 'none';
    }
  }

  // Lista de items
  const listaEl = el('listaProductosCarrito');
  const vacioEl = el('carritoVacio');
  const sugerEl = el('bannerSugerencia');

  if (!listaEl) return;

  if (cantidad === 0) {
    if (vacioEl) vacioEl.style.display = 'block';
    listaEl.innerHTML = '';
    if (sugerEl) {
      sugerEl.innerHTML = `
        <div class="cabecera-jev-carrito">
          <span>✦ Asistente JEV</span>
          <span style="font-weight:normal;color:#92400e;text-transform:none;">· Sugerencia de bienvenida</span>
        </div>
        <div class="fila-jev-carrito">
          <img class="sugerencia-miniatura" src="https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=80" alt="Pizza Pepperoni">
          <div class="texto-sugerencia">
            <strong>Pizza Pepperoni Supreme</strong>
            <span class="precio-sugerencia">S/ 24.90</span>
            <p>La favorita indiscutible con doble pepperoni artesanal y mozzarella.</p>
          </div>
          <button class="btn-agregar-sugerencia" id="btnSugerenciaJevInicio">+ Agregar</button>
        </div>
      `;
      const btn = el('btnSugerenciaJevInicio');
      if (btn) btn.onclick = () => {
        agregarProducto('pepperoni');
        mostrarToast('Agregaste Pizza Pepperoni recomendada por JEV', '✦');
      };
      sugerEl.style.display = 'flex';
    }
    return;
  }

  if (vacioEl) vacioEl.style.display = 'none';

  listaEl.innerHTML = Object.entries(carrito).map(([id, cant]) => {
    const p = productos.find(x => x.id === id);
    if (!p) return '';
    return `
      <div class="fila-carrito">
        <div class="fila-imagen">
          <img src="${p.imagen}" alt="${p.nombre}">
        </div>
        <div class="fila-info">
          <strong>${p.nombre}</strong>
          <small>${dinero(p.precio)} c/u</small>
          <div class="contador-cantidad">
            <button data-cambio="-1" data-id="${id}" aria-label="Restar">−</button>
            <span>${cant}</span>
            <button data-cambio="1" data-id="${id}" aria-label="Sumar">＋</button>
          </div>
        </div>
        <span class="fila-precio">${dinero(p.precio * cant)}</span>
      </div>`;
  }).join('');

  verificarSugerencia();
}

let debounceJevTimer = null;

function verificarSugerencia() {
  const sugerEl = el('bannerSugerencia');
  if (!sugerEl) return;

  const ids = Object.keys(carrito);
  if (ids.length === 0) {
    sugerEl.style.display = 'none';
    return;
  }

  const itemsCarrito = ids.map(id => {
    const p = productos.find(x => x.id === id) || {};
    return {
      id,
      nombre: p.nombre || id,
      categoria: p.categoria || 'pizza',
      precio: p.precio || 0,
      cantidad: carrito[id] || 1
    };
  });

  // Debounce para optimizar llamadas asíncronas
  clearTimeout(debounceJevTimer);
  debounceJevTimer = setTimeout(() => {
    if (typeof apiConsultarJev === 'function') {
      apiConsultarJev(itemsCarrito).then(data => {
        if (data && data.recomendacionPrincipal) {
          const rec = data.recomendacionPrincipal;
          const perfil = data.perfilDetectado?.clase || 'Sugerencia';

          sugerEl.innerHTML = `
            <div class="cabecera-jev-carrito">
              <span>✦ Asistente JEV</span>
              <span style="font-weight:normal;color:#92400e;text-transform:none;">· ${perfil === 'Individual' ? 'Para acompañar tu pedido' : perfil === 'Pareja' ? 'Para dos personas' : perfil === 'Familiar' ? 'Para toda la mesa' : 'Maridaje recomendado'}</span>
            </div>
            <div class="fila-jev-carrito">
              <img class="sugerencia-miniatura" src="${rec.imagen}" alt="${rec.nombre}" onerror="this.style.display='none'">
              <div class="texto-sugerencia">
                <strong>${rec.nombre}</strong>
                <span class="precio-sugerencia">${dinero(rec.precio)}</span>
                <p>${rec.motivo}</p>
              </div>
              <button class="btn-agregar-sugerencia" id="btnSugerenciaJev">+ Agregar</button>
            </div>
          `;

          const btn = el('btnSugerenciaJev');
          if (btn) btn.onclick = () => {
            agregarProducto(rec.id);
            mostrarToast(`Agregaste ${rec.nombre} recomendado por JEV`, '✦');
          };

          sugerEl.style.display = 'flex';
          return;
        }
        aplicarSugerenciaFallback(ids, sugerEl);
      }).catch(() => {
        aplicarSugerenciaFallback(ids, sugerEl);
      });
    } else {
      aplicarSugerenciaFallback(ids, sugerEl);
    }
  }, 100);
}

function aplicarSugerenciaFallback(ids, sugerEl) {
  const tienePizza = ids.some(id => { const p = productos.find(x => x.id === id); return p && p.categoria === 'pizza'; });
  const tieneBebida = ids.some(id => { const p = productos.find(x => x.id === id); return p && (p.categoria === 'bebidas' || p.categoria === 'bebida'); });
  const tieneAcomp = ids.some(id => { const p = productos.find(x => x.id === id); return p && (p.categoria === 'entradas' || p.categoria === 'acompañamiento'); });

  if (tienePizza && !tieneBebida) {
    const s = productos.find(p => p.id === 'gaseosa-15' || p.id === 'chicha-jarra') || productos[0];
    if (s && !ids.includes(s.id)) {
      renderizarSugerenciaSimple(sugerEl, s, 'Maridaje refrescante recomendado para tus pizzas al horno de leña.');
      return;
    }
  }
  if (tienePizza && !tieneAcomp) {
    const s = productos.find(p => p.id === 'pan-ajo' || p.id === 'tequenos') || productos[0];
    if (s && !ids.includes(s.id)) {
      renderizarSugerenciaSimple(sugerEl, s, 'Entrada crujiente y dorada para picar en la mesa.');
      return;
    }
  }
  sugerEl.style.display = 'none';
}

function renderizarSugerenciaSimple(sugerEl, s, motivo) {
  sugerEl.innerHTML = `
    <div class="cabecera-jev-carrito">
      <span>✦ Asistente JEV</span>
      <span style="font-weight:normal;color:#92400e;text-transform:none;">· Maridaje sugerido</span>
    </div>
    <div class="fila-jev-carrito">
      <img class="sugerencia-miniatura" src="${s.imagen}" alt="${s.nombre}" onerror="this.style.display='none'">
      <div class="texto-sugerencia">
        <strong>${s.nombre}</strong>
        <span class="precio-sugerencia">${dinero(s.precio)}</span>
        <p>${motivo}</p>
      </div>
      <button class="btn-agregar-sugerencia" id="btnSugerenciaJev">+ Agregar</button>
    </div>
  `;
  const btn = el('btnSugerenciaJev');
  if (btn) btn.onclick = () => {
    agregarProducto(s.id);
    mostrarToast(`Agregaste ${s.nombre} recomendado por JEV`, '✦');
  };
  sugerEl.style.display = 'flex';
}

function abrirCarrito() {
  const sidebar = el('sidebarCarrito');
  const fondo = el('fondoCarrito');
  if (sidebar) { sidebar.classList.add('abierto'); sidebar.setAttribute('aria-hidden', 'false'); }
  if (fondo) { fondo.classList.add('abierto'); }
  document.body.style.overflow = 'hidden';
  renderizarCarrito();
}

function cerrarCarrito() {
  const sidebar = el('sidebarCarrito');
  const fondo = el('fondoCarrito');
  if (sidebar) { sidebar.classList.remove('abierto'); sidebar.setAttribute('aria-hidden', 'true'); }
  if (fondo) { fondo.classList.remove('abierto'); }
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════
// 4. CHECKOUT Y SIMULADOR KDS (COCINA)
// ═══════════════════════════════════════════════
function abrirCheckout() {
  if (Object.keys(carrito).length === 0) return;
  cerrarCarrito();
  const modal = el('fondoCheckout');
  if (modal) modal.style.display = 'flex';
}

function cerrarCheckout() {
  const modal = el('fondoCheckout');
  if (modal) modal.style.display = 'none';
}

function procesarPedido(e) {
  e.preventDefault();
  const nombre = el('nombreCliente') ? el('nombreCliente').value.trim() || 'Cliente' : 'Cliente';
  const notas = el('notasPedido') ? el('notasPedido').value.trim() : '';
  const codigo = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
  const totalAmt = calcularTotal();

  // Guardar pedido en localStorage para el panel de cocina, caja y administración
  const nuevoPedido = {
    codigo: '#' + codigo,
    mesa: mesaActual,
    cliente: nombre,
    pago: metodoPago,
    notas: notas || 'Sin notas especiales',
    total: totalAmt,
    fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fechaCompleta: new Date().toLocaleDateString('es-PE'),
    items: Object.entries(carrito).map(([id, cant]) => {
      const p = productos.find(x => x.id === id);
      return { id, nombre: p ? p.nombre : id, precio: p ? p.precio : 0, cantidad: cant };
    }),
    estado: 'Recibido',
    estadoPago: 'Pendiente' // Controlado por Caja (POS)
  };

  try {
    // 1. Guardar inmediatamente en localStorage (disponible mismo instante)
    const pedidos = JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
    if (!pedidos.some(p => p.codigo === nuevoPedido.codigo)) {
      pedidos.unshift(nuevoPedido);
      localStorage.setItem('pizza_pedidos', JSON.stringify(pedidos));
    }
    // 2. Emitir BroadcastChannel para notificar a Cocina/Caja/Admin en otras pestañas
    if (typeof canalPedidos !== 'undefined' && canalPedidos) {
      canalPedidos.postMessage({ tipo: 'NUEVO_PEDIDO', pedido: nuevoPedido });
    }
    // 3. Persistir en Neon PostgreSQL en segundo plano (no bloquea el flujo)
    if (typeof apiCrearPedido === 'function') {
      apiCrearPedido(nuevoPedido).catch(err => console.warn('Neon offline, pedido en localStorage:', err));
    }
  } catch (err) {
    console.error('Error al guardar pedido:', err);
  }

  const msj = el('mensajeExito');
  if (msj) msj.textContent = `¡Gracias, ${nombre}! Tu pedido para ${mesaActual} ha sido enviado a cocina.`;

  const filas = Object.entries(carrito).map(([id, cant]) => {
    const p = productos.find(x => x.id === id);
    return `<div class="fila-recibo"><span>${cant} × ${p.nombre}</span><strong>${dinero(p.precio * cant)}</strong></div>`;
  }).join('');

  const reciboEl = el('reciboDigital');
  if (reciboEl) reciboEl.innerHTML = `
    <div class="fila-recibo"><span>Código de Pedido:</span><strong>#${codigo}</strong></div>
    <div class="fila-recibo"><span>Ubicación:</span><strong>${mesaActual}</strong></div>
    <div class="fila-recibo"><span>Método de Pago:</span><strong>${metodoPago}</strong></div>
    <hr style="border:0;border-top:1px solid var(--borde);margin:8px 0;">
    ${filas}
    ${notas ? `<div class="fila-recibo" style="margin-top:4px;"><span>Notas al pizzero:</span><em>"${escaparHtml(notas)}"</em></div>` : ''}
    <div class="fila-recibo" style="border-top:1px dashed var(--borde);margin-top:8px;padding-top:8px;font-weight:800;font-size:15px;">
      <span>Total a Pagar:</span><strong style="color:var(--rojo);">${dinero(totalAmt)}</strong>
    </div>`;

  cerrarCheckout();
  const fondoExito = el('fondoExito');
  if (fondoExito) fondoExito.style.display = 'flex';
  simularKDS();
}

function simularKDS() {
  const paso2 = el('paso2KDS');
  const paso3 = el('paso3KDS');
  if (paso2) paso2.className = 'paso-kds activo';
  if (paso3) paso3.className = 'paso-kds';
  setTimeout(() => {
    if (paso2) paso2.className = 'paso-kds listo';
    if (paso3) paso3.className = 'paso-kds activo';
    mostrarToast('¡Tu pizza está en el horno a leña!', '🔥');
  }, 3500);
}

function terminarPedido() {
  carrito = {};
  guardarCarrito();
  renderizarCarrito();
  const fondoExito = el('fondoExito');
  if (fondoExito) fondoExito.style.display = 'none';
  const form = el('formularioPedido');
  if (form) form.reset();
  mostrarToast('¡Pedido completado con éxito!', '✨');
}

// ═══════════════════════════════════════════════
// 5. SELECTOR DE MESA (SIMULADOR QR)
// ═══════════════════════════════════════════════
function abrirSelectorMesa() {
  const modal = el('fondoModalMesa');
  if (modal) modal.style.display = 'flex';
}

function cerrarSelectorMesa() {
  const modal = el('fondoModalMesa');
  if (modal) modal.style.display = 'none';
}

function seleccionarMesa(nombreMesa) {
  const desc = descripcionMesas[nombreMesa] || 'Salón';
  guardarMesa(`${nombreMesa} (${desc})`);
  cerrarSelectorMesa();
  mostrarToast(`Mesa configurada: ${nombreMesa} (${desc})`, '📍');
}

// ═══════════════════════════════════════════════
// 6. TOAST FLOTANTE
// ═══════════════════════════════════════════════
let timerToast;
function mostrarToast(mensaje, icono = '✨') {
  const t = el('toast');
  if (!t) return;
  const tTxt = el('toastTexto');
  const tIco = el('toastIcono');
  if (tTxt) tTxt.textContent = mensaje;
  if (tIco) tIco.textContent = icono;
  t.classList.add('visible');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => t.classList.remove('visible'), 3200);
}

// ═══════════════════════════════════════════════
// 7. GUÍA / TOUR INTERACTIVO
// ═══════════════════════════════════════════════
function iniciarTour() {
  mostrarToast('💡 Autoservicio QR: Selecciona tu mesa, haz tu pedido, Cocina prepara y Caja registra tu pago', '💡');
}

// ═══════════════════════════════════════════════
// 9. EVENT LISTENERS UNIVERSALES
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderizarCarrito();
  actualizarIndicadoresMesa();

  // Carrito
  const btnNavCarrito = el('btnNavCarrito');
  if (btnNavCarrito) btnNavCarrito.addEventListener('click', abrirCarrito);

  const fondoCarrito = el('fondoCarrito');
  const btnCerrarCarr = el('btnCerrarCarrito');
  if (fondoCarrito) fondoCarrito.addEventListener('click', cerrarCarrito);
  if (btnCerrarCarr) btnCerrarCarr.addEventListener('click', cerrarCarrito);

  const btnBarraFija = el('btnBarraFija');
  if (btnBarraFija) btnBarraFija.addEventListener('click', abrirCarrito);

  const btnConfirmar = el('btnConfirmarPedido');
  if (btnConfirmar) btnConfirmar.addEventListener('click', abrirCheckout);

  // Selector de Mesa
  const btnMesaNav = el('btnMesaNav');
  if (btnMesaNav) btnMesaNav.addEventListener('click', abrirSelectorMesa);

  const fondoModalMesa = el('fondoModalMesa');
  const btnCerrarMesa = el('btnCerrarModalMesa');
  if (fondoModalMesa) fondoModalMesa.addEventListener('click', e => {
    if (e.target === fondoModalMesa) cerrarSelectorMesa();
  });
  if (btnCerrarMesa) btnCerrarMesa.addEventListener('click', cerrarSelectorMesa);

  const grillaMesas = el('grillaMesas');
  if (grillaMesas) {
    grillaMesas.addEventListener('click', e => {
      const btn = e.target.closest('.item-mesa-btn');
      if (btn && btn.dataset.mesa) seleccionarMesa(btn.dataset.mesa);
    });
  }

  // Guía
  const btnGuiaNav = el('btnGuiaNav');
  if (btnGuiaNav) btnGuiaNav.addEventListener('click', iniciarTour);

  // Checkout
  const fondoCheckout = el('fondoCheckout');
  const btnCerrarCO = el('btnCerrarCheckout');
  if (fondoCheckout) fondoCheckout.addEventListener('click', e => {
    if (e.target === fondoCheckout) cerrarCheckout();
  });
  if (btnCerrarCO) btnCerrarCO.addEventListener('click', cerrarCheckout);

  const formPedido = el('formularioPedido');
  if (formPedido) formPedido.addEventListener('submit', procesarPedido);

  const grillaPago = el('grillaPago');
  if (grillaPago) {
    grillaPago.addEventListener('click', e => {
      const opt = e.target.closest('.opcion-pago');
      if (!opt) return;
      document.querySelectorAll('.opcion-pago').forEach(o => o.classList.remove('seleccionada'));
      opt.classList.add('seleccionada');
      metodoPago = opt.dataset.pago;
    });
  }

  // Modal Éxito
  const fondoExito = el('fondoExito');
  const btnTerminar = el('btnTerminarPedido');
  if (fondoExito) fondoExito.addEventListener('click', e => {
    if (e.target === fondoExito) terminarPedido();
  });
  if (btnTerminar) btnTerminar.addEventListener('click', terminarPedido);

  // Delegación de eventos en carrito
  const listaCarrito = el('listaProductosCarrito');
  if (listaCarrito) {
    listaCarrito.addEventListener('click', e => {
      const btn = e.target.closest('[data-cambio]');
      if (btn) cambiarCantidad(btn.dataset.id, Number(btn.dataset.cambio));
    });
  }

  // Delegación de botón "Agregar" global
  document.addEventListener('click', e => {
    const btnAgregar = e.target.closest('[data-agregar]');
    if (btnAgregar) agregarProducto(btnAgregar.dataset.agregar);
  });

  // Tecla Escape para cerrar cualquier modal abierto
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      cerrarCarrito();
      cerrarCheckout();
      cerrarSelectorMesa();
    }
  });

  // Sincronización en vivo con cambios del Administrador
  window.addEventListener('storage', (e) => {
    if (e.key === 'pizza_productos') {
      productos = obtenerProductos();
      if (typeof renderizarProductos === 'function') {
        renderizarProductos();
      }
      if (typeof actualizarJev === 'function') {
        actualizarJev('popular');
      }
      renderizarCarrito();
    }
  });
});
