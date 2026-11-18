/**
 * GLOBAL.JS — Aplicación Móvil de Autoservicio en Mesa vía QR · Pizza al Paso
 * Diseñado específicamente para experiencia móvil en mesa de restaurante
 */

// ═══════════════════════════════════════════════
// 1. CONFIGURACIÓN DE MESAS DEL RESTAURANTE (QR)
// ═══════════════════════════════════════════════
const CATALOGO_MESAS = {
  '1': { id: '1', codigo: 'Mesa 1', zona: 'Salón Principal', capacidad: '4 personas' },
  '2': { id: '2', codigo: 'Mesa 2', zona: 'Junto a Ventana', capacidad: '2 personas' },
  '3': { id: '3', codigo: 'Mesa 3', zona: 'Terraza Exterior', capacidad: '4 personas' },
  '4': { id: '4', codigo: 'Mesa 4', zona: 'Salón Familiar', capacidad: '6 personas' },
  '5': { id: '5', codigo: 'Mesa 5', zona: 'Zona Reservada VIP', capacidad: '6 personas' },
  '6': { id: '6', codigo: 'Mesa 6', zona: 'Barra Horno de Leña', capacidad: '2 personas' }
};

function resolverMesa(entrada) {
  if (!entrada) return null;
  const texto = String(entrada).trim();
  if (CATALOGO_MESAS[texto]) return CATALOGO_MESAS[texto];
  const matchNum = texto.match(/(\d+)/);
  if (matchNum && CATALOGO_MESAS[matchNum[1]]) {
    return CATALOGO_MESAS[matchNum[1]];
  }
  return null;
}

function formatearEtiquetaMesa(infoMesa) {
  if (!infoMesa) return 'Mesa 1 (Salón Principal)';
  return `${infoMesa.codigo} (${infoMesa.zona})`;
}

// ═══════════════════════════════════════════════
// 2. CATÁLOGO GASTRONÓMICO BASE (ALINEADO CON NEON BD)
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
    etiqueta: 'Más Pedida',
    descripcion: 'Doble porción de pepperoni artesanal curado, mozzarella fundida y orégano silvestre.',
    preferencias: ['popular', 'carnes']
  },
  {
    id: 'cuatro-quesos',
    nombre: 'Pizza Quattro Formaggi',
    categoria: 'pizza',
    precio: 27.50,
    imagen: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Gourmet',
    descripcion: 'Mozzarella, gorgonzola cremoso, fontina y virutas de parmesano reggiano de 24 meses.',
    preferencias: ['veggie']
  },
  {
    id: 'carnivora',
    nombre: 'Pizza Carnívora Rústica',
    categoria: 'pizza',
    precio: 29.90,
    imagen: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Familiar',
    descripcion: 'Jamón prosciutto cotto, panceta crocante al horno de leña, salchicha italiana y carne sazonada.',
    preferencias: ['carnes', 'familiar']
  },
  {
    id: 'vegetariana',
    nombre: 'Pizza Huerta Silvestre',
    categoria: 'pizza',
    precio: 23.90,
    imagen: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Veggie',
    descripcion: 'Champiñones portobello frescos, pimientos asados al fuego, aceitunas negras y rúcula baby.',
    preferencias: ['veggie', 'saludable']
  },
  {
    id: 'bbq-crunch',
    nombre: 'Pizza Pollo BBQ Ahumado',
    categoria: 'pizza',
    precio: 26.50,
    imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Especial',
    descripcion: 'Pechuga marinada al grill, salsa BBQ artesanal, cebolla morada caramelizada y maíz dulce.',
    preferencias: ['carnes', 'familiar']
  },
  {
    id: 'pan-ajo',
    nombre: 'Pan al Ajo Supremo con Queso',
    categoria: 'entradas',
    precio: 10.90,
    imagen: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Para Compartir',
    descripcion: 'Baguette crocante horneada con mantequilla de ajo confitado, perejil y mozzarella gratinada.',
    preferencias: ['popular', 'economica', 'veggie']
  },
  {
    id: 'tequenos',
    nombre: 'Tequeños Rellenos de Queso (6 uds)',
    categoria: 'entradas',
    precio: 13.50,
    imagen: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Crujientes',
    descripcion: 'Masa fina dorada rellena de queso andino derretido con salsa guacamole de la casa.',
    preferencias: ['popular']
  },
  {
    id: 'gaseosa-15',
    nombre: 'Inca Kola / Coca Cola 1.5 L',
    categoria: 'bebidas',
    precio: 9.50,
    imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Familiar',
    descripcion: 'Bebida gaseosa helada en botella familiar para compartir en mesa.',
    preferencias: ['familiar', 'economica']
  },
  {
    id: 'chicha-jarra',
    nombre: 'Jarra de Chicha Morada 1 L',
    categoria: 'bebidas',
    precio: 11.00,
    imagen: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Artesanal',
    descripcion: 'Elaborada diariamente con maíz morado peruano, piña, manzana, canela y toques de limón.',
    preferencias: ['popular', 'familiar', 'saludable']
  },
  {
    id: 'cerveza-artesanal',
    nombre: 'Cerveza Artesanal IPA 330ml',
    categoria: 'bebidas',
    precio: 14.00,
    imagen: 'https://images.unsplash.com/photo-1608270104675-bc44a7f05359?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Premium',
    descripcion: 'Cerveza artesanal local bien fría, con notas cítricas y amargor balanceado.',
    preferencias: ['premium']
  },
  {
    id: 'tiramisu',
    nombre: 'Tiramisú Tradicional de Café',
    categoria: 'postres',
    precio: 12.50,
    imagen: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=700&q=80',
    etiqueta: 'Casero',
    descripcion: 'Capas de bizcochos savoiardi bañados en espresso, crema de mascarpone y cacao puro.',
    preferencias: ['popular', 'premium']
  }
];

function limpiarTextoEmojis(str) {
  if (!str) return '';
  return String(str)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizarListaProductos(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.map(p => ({
    ...p,
    precio: Number(p.precio) || 0,
    etiqueta: limpiarTextoEmojis(p.etiqueta || 'Selección')
  }));
}

function obtenerProductos() {
  const guardados = localStorage.getItem('pizza_productos');
  if (guardados) {
    try {
      const parsed = JSON.parse(guardados);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizarListaProductos(parsed);
      }
    } catch (e) {}
  }
  localStorage.setItem('pizza_productos', JSON.stringify(productosPorDefecto));
  return [...productosPorDefecto];
}

let productos = obtenerProductos();

if (typeof apiObtenerProductos === 'function') {
  apiObtenerProductos().then(prodsBD => {
    if (Array.isArray(prodsBD) && prodsBD.length > 0) {
      productos = normalizarListaProductos(prodsBD);
      localStorage.setItem('pizza_productos', JSON.stringify(productos));
      renderizarCarrito();
      if (typeof renderizarProductos === 'function') renderizarProductos();
    }
  }).catch(() => {});
}

// ═══════════════════════════════════════════════
// 3. ESTADO DE MESA Y DETECCIÓN AUTOMÁTICA DE QR
// ═══════════════════════════════════════════════
let carrito = JSON.parse(sessionStorage.getItem('pizza_carrito') || '{}');
let mesaIdActual = sessionStorage.getItem('pizza_mesa_id') || '1';
let mesaActual = sessionStorage.getItem('pizza_mesa') || formatearEtiquetaMesa(CATALOGO_MESAS['1']);
let metodoPago = 'Yape / Plin';

const el = id => document.getElementById(id);
const dinero = n => 'S/ ' + Number(n).toFixed(2);

function escaparHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

function guardarCarrito() {
  sessionStorage.setItem('pizza_carrito', JSON.stringify(carrito));
}

function guardarMesaPorId(idMesa, origenQr = false) {
  const info = resolverMesa(idMesa) || CATALOGO_MESAS['1'];
  mesaIdActual = info.id;
  mesaActual = formatearEtiquetaMesa(info);
  sessionStorage.setItem('pizza_mesa_id', info.id);
  sessionStorage.setItem('pizza_mesa', mesaActual);
  if (origenQr) {
    sessionStorage.setItem('pizza_qr_vinculado', 'true');
  }
  actualizarIndicadoresMesa();
}

function detectarMesaDesdeUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const paramMesa = params.get('mesa') || params.get('table') || params.get('qr');
    if (!paramMesa) return;

    const info = resolverMesa(paramMesa);
    if (!info) return;

    guardarMesaPorId(info.id, true);

    const ruta = window.location.pathname.toLowerCase();
    const esIndex = ruta.endsWith('/index.html') || ruta === '/' || (!ruta.includes('/paginas/') && !ruta.endsWith('.html'));
    if (esIndex && !params.get('stay')) {
      window.location.replace(`paginas/menu.html?mesa=${encodeURIComponent(info.id)}`);
      return;
    }

    setTimeout(() => {
      mostrarToast(`${info.codigo} (${info.zona}) asignada vía QR`);
    }, 200);
  } catch (e) {}
}

function obtenerUrlQrMesa(idMesa) {
  const origin = window.location.protocol.startsWith('http')
    ? window.location.origin
    : 'http://localhost:3000';
  return `${origin}/paginas/menu.html?mesa=${encodeURIComponent(idMesa)}`;
}

function generarSvgQrMesa(textoSemilla) {
  const size = 21;
  const matriz = Array.from({ length: size }, () => Array(size).fill(0));

  function dibujarPatronPosicion(filaIni, colIni) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const esBorde = r === 0 || r === 6 || c === 0 || c === 6;
        const esCentro = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matriz[filaIni + r][colIni + c] = (esBorde || esCentro) ? 1 : 0;
      }
    }
  }

  dibujarPatronPosicion(0, 0);
  dibujarPatronPosicion(0, size - 7);
  dibujarPatronPosicion(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < textoSemilla.length; i++) {
    hash ^= textoSemilla.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const enEsquinaSupIzq = r < 8 && c < 8;
      const enEsquinaSupDer = r < 8 && c >= size - 8;
      const enEsquinaInfIzq = r >= size - 8 && c < 8;
      if (enEsquinaSupIzq || enEsquinaSupDer || enEsquinaInfIzq) continue;
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

  return `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" shape-rendering="crispEdges" aria-label="Código QR de Mesa">${rects}</svg>`;
}

function actualizarIndicadoresMesa() {
  const info = resolverMesa(mesaIdActual) || CATALOGO_MESAS['1'];
  mesaActual = formatearEtiquetaMesa(info);

  const badgeMesaNav = el('badgeMesaNav');
  if (badgeMesaNav) badgeMesaNav.textContent = info.codigo;

  const subMarcaMesa = el('subMarcaMesa');
  if (subMarcaMesa) subMarcaMesa.textContent = `${info.codigo} · ${info.zona}`;

  const labelMesaCarrito = el('labelMesaCarrito');
  if (labelMesaCarrito) labelMesaCarrito.textContent = `${info.codigo} · ${info.zona} (${info.capacidad})`;

  const numInsignia = el('mesaActivaNumero');
  if (numInsignia) numInsignia.textContent = info.id;

  const tituloMesaCarta = el('mesaActivaTitulo');
  if (tituloMesaCarta) tituloMesaCarta.textContent = `${info.codigo} — ${info.zona}`;

  const subMesaCarta = el('mesaActivaSubtitulo');
  if (subMesaCarta) subMesaCarta.textContent = `Capacidad: ${info.capacidad} · Atención directa en mesa`;

  document.querySelectorAll('.item-mesa-btn').forEach(btn => {
    const btnInfo = resolverMesa(btn.dataset.mesa);
    btn.classList.toggle('activo', Boolean(btnInfo && btnInfo.id === info.id));
  });

  const qrBox = el('qrSvgPreview');
  const qrTitulo = el('qrPreviewTitulo');
  const qrUrlTxt = el('qrPreviewUrl');
  const urlCompleta = obtenerUrlQrMesa(info.id);

  if (qrBox) qrBox.innerHTML = generarSvgQrMesa(urlCompleta);
  if (qrTitulo) qrTitulo.textContent = `QR asignado a ${info.codigo} (${info.zona})`;
  if (qrUrlTxt) qrUrlTxt.textContent = urlCompleta;
}

// ═══════════════════════════════════════════════
// 4. GESTIÓN DE MODALES NATIVOS (<dialog>)
// ═══════════════════════════════════════════════
function abrirDialogo(idModal) {
  const modal = el(idModal);
  if (!modal) return;
  if (typeof modal.showModal === 'function') {
    if (!modal.open) modal.showModal();
  } else {
    modal.style.display = 'flex';
  }
}

function cerrarDialogo(idModal) {
  const modal = el(idModal);
  if (!modal) return;
  if (typeof modal.close === 'function') {
    if (modal.open) modal.close();
    modal.returnValue = '';
  } else {
    modal.style.display = 'none';
  }
}

function inicializarLightDismissDialogs() {
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

  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      dialog.returnValue = '';
    });
  });
}

// ═══════════════════════════════════════════════
// 5. CARRITO / COMANDA DE MESA
// ═══════════════════════════════════════════════
function agregarProducto(id) {
  carrito[id] = (carrito[id] || 0) + 1;
  guardarCarrito();
  renderizarCarrito();
  if (typeof renderizarProductos === 'function') renderizarProductos();
  if (typeof verificarChipCarritoJev === 'function') verificarChipCarritoJev();
  const prod = productos.find(p => p.id === id);
  mostrarToast(`Agregado: ${prod ? prod.nombre : 'Producto'}`);
}

function cambiarCantidad(id, delta) {
  carrito[id] = (carrito[id] || 0) + delta;
  if (carrito[id] <= 0) delete carrito[id];
  guardarCarrito();
  renderizarCarrito();
  if (typeof renderizarProductos === 'function') renderizarProductos();
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

  const badge = el('insCarrito');
  if (badge) {
    badge.textContent = cantidad;
    badge.style.display = cantidad > 0 ? 'grid' : 'none';
  }

  const txtSubtotal = el('txtSubtotal');
  const txtTotal = el('txtTotal');
  const btnConfirmar = el('btnConfirmarPedido');
  if (txtSubtotal) txtSubtotal.textContent = dinero(total);
  if (txtTotal) txtTotal.textContent = dinero(total);
  if (btnConfirmar) btnConfirmar.disabled = cantidad === 0;

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

  const listaEl = el('listaProductosCarrito');
  const vacioEl = el('carritoVacio');
  const sugerEl = el('bannerSugerencia');

  if (!listaEl) return;

  if (cantidad === 0) {
    if (vacioEl) vacioEl.style.display = 'block';
    listaEl.innerHTML = '';
    if (sugerEl) sugerEl.style.display = 'none';
    return;
  }

  if (vacioEl) vacioEl.style.display = 'none';

  listaEl.innerHTML = Object.entries(carrito).map(([id, cant]) => {
    const p = productos.find(x => x.id === id);
    if (!p) return '';
    return `
      <div class="fila-carrito">
        <div class="fila-imagen">
          <img src="${p.imagen}" alt="${escaparHtml(p.nombre)}">
        </div>
        <div class="fila-info">
          <strong>${escaparHtml(p.nombre)}</strong>
          <small>${dinero(p.precio)} c/u</small>
          <div class="contador-cantidad">
            <button type="button" data-cambio="-1" data-id="${id}" aria-label="Disminuir cantidad">−</button>
            <span>${cant}</span>
            <button type="button" data-cambio="1" data-id="${id}" aria-label="Aumentar cantidad">+</button>
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

  clearTimeout(debounceJevTimer);
  debounceJevTimer = setTimeout(() => {
    if (typeof apiConsultarJev === 'function') {
      apiConsultarJev(itemsCarrito).then(data => {
        if (data && data.recomendacionPrincipal) {
          const rec = data.recomendacionPrincipal;
          sugerEl.innerHTML = `
            <div class="cabecera-jev-carrito">
              <span>Sugerencia para completar tu mesa</span>
            </div>
            <div class="fila-jev-carrito">
              <img class="sugerencia-miniatura" src="${rec.imagen}" alt="${escaparHtml(rec.nombre)}" onerror="this.style.display='none'">
              <div class="texto-sugerencia">
                <strong>${escaparHtml(rec.nombre)} · <span class="precio-sugerencia">${dinero(rec.precio)}</span></strong>
                <p>${escaparHtml(rec.motivo)}</p>
              </div>
              <button type="button" class="btn-agregar-sugerencia" id="btnSugerenciaJev">+ Sumar</button>
            </div>
          `;
          const btn = el('btnSugerenciaJev');
          if (btn) btn.onclick = () => agregarProducto(rec.id);
          sugerEl.style.display = 'flex';
          return;
        }
        aplicarSugerenciaFallback(ids, sugerEl);
      }).catch(() => aplicarSugerenciaFallback(ids, sugerEl));
    } else {
      aplicarSugerenciaFallback(ids, sugerEl);
    }
  }, 100);
}

function aplicarSugerenciaFallback(ids, sugerEl) {
  const tienePizza = ids.some(id => { const p = productos.find(x => x.id === id); return p && p.categoria === 'pizza'; });
  const tieneBebida = ids.some(id => { const p = productos.find(x => x.id === id); return p && (p.categoria === 'bebidas' || p.categoria === 'bebida'); });

  if (tienePizza && !tieneBebida) {
    const s = productos.find(p => p.id === 'gaseosa-15' || p.id === 'chicha-jarra') || productos[0];
    if (s && !ids.includes(s.id)) {
      sugerEl.innerHTML = `
        <div class="cabecera-jev-carrito"><span>Bebida sugerida para tu mesa</span></div>
        <div class="fila-jev-carrito">
          <img class="sugerencia-miniatura" src="${s.imagen}" alt="${escaparHtml(s.nombre)}" onerror="this.style.display='none'">
          <div class="texto-sugerencia">
            <strong>${escaparHtml(s.nombre)} · <span class="precio-sugerencia">${dinero(s.precio)}</span></strong>
            <p>Acompaña tus pizzas recién salidas del horno.</p>
          </div>
          <button type="button" class="btn-agregar-sugerencia" id="btnSugerenciaJev">+ Sumar</button>
        </div>
      `;
      const btn = el('btnSugerenciaJev');
      if (btn) btn.onclick = () => agregarProducto(s.id);
      sugerEl.style.display = 'flex';
      return;
    }
  }
  sugerEl.style.display = 'none';
}

function abrirCarrito() {
  const sidebar = el('sidebarCarrito');
  const fondo = el('fondoCarrito');
  if (sidebar) { sidebar.classList.add('abierto'); sidebar.setAttribute('aria-hidden', 'false'); }
  if (fondo) { fondo.classList.add('abierto'); }
  renderizarCarrito();
}

function cerrarCarrito() {
  const sidebar = el('sidebarCarrito');
  const fondo = el('fondoCarrito');
  if (sidebar) { sidebar.classList.remove('abierto'); sidebar.setAttribute('aria-hidden', 'true'); }
  if (fondo) { fondo.classList.remove('abierto'); }
}

// ═══════════════════════════════════════════════
// 6. CHECKOUT Y SEGUIMIENTO EN TIEMPO REAL KDS
// ═══════════════════════════════════════════════
function abrirCheckout() {
  if (Object.keys(carrito).length === 0) return;
  cerrarCarrito();
  const lblMesaCheckout = el('checkoutMesaResumen');
  if (lblMesaCheckout) lblMesaCheckout.textContent = mesaActual;
  abrirDialogo('fondoCheckout');
}

function cerrarCheckout() {
  cerrarDialogo('fondoCheckout');
}

function procesarPedido(e) {
  e.preventDefault();
  const nombre = el('nombreCliente') ? el('nombreCliente').value.trim() || 'Comensal en Mesa' : 'Comensal en Mesa';
  const notas = el('notasPedido') ? el('notasPedido').value.trim() : '';
  const codigo = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
  const totalAmt = calcularTotal();

  const nuevoPedido = {
    codigo: '#' + codigo,
    mesa: mesaActual,
    cliente: nombre,
    pago: metodoPago,
    notas: notas || 'Sin notas especiales',
    total: totalAmt,
    fecha: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    fechaCompleta: new Date().toLocaleDateString('es-PE'),
    items: Object.entries(carrito).map(([id, cant]) => {
      const p = productos.find(x => x.id === id);
      return { id, nombre: p ? p.nombre : id, precio: p ? p.precio : 0, cantidad: cant };
    }),
    estado: 'Recibido',
    estadoPago: 'Pendiente'
  };

  try {
    const pedidos = JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
    if (!pedidos.some(p => p.codigo === nuevoPedido.codigo)) {
      pedidos.unshift(nuevoPedido);
      localStorage.setItem('pizza_pedidos', JSON.stringify(pedidos));
    }
    sessionStorage.setItem('pizza_pedido_activo', nuevoPedido.codigo);

    if (typeof canalPedidos !== 'undefined' && canalPedidos) {
      canalPedidos.postMessage({ tipo: 'NUEVO_PEDIDO', pedido: nuevoPedido });
    }
    if (typeof apiCrearPedido === 'function') {
      apiCrearPedido(nuevoPedido).catch(() => {});
    }
  } catch (err) {}

  carrito = {};
  guardarCarrito();
  renderizarCarrito();
  if (typeof renderizarProductos === 'function') renderizarProductos();
  if (typeof verificarChipCarritoJev === 'function') verificarChipCarritoJev();

  const form = el('formularioPedido');
  if (form) form.reset();

  cerrarCheckout();
  mostrarModalSeguimientoPedido(nuevoPedido);
  actualizarBannerPedidoActivo();
}

function mostrarModalSeguimientoPedido(pedido) {
  if (!pedido) return;
  const msj = el('mensajeExito');
  if (msj) {
    msj.textContent = `Orden ${pedido.codigo} enviada desde ${pedido.mesa}.`;
  }

  const filas = (pedido.items || []).map(it =>
    `<div class="fila-recibo"><span>${it.cantidad} × ${escaparHtml(it.nombre)}</span><strong>${dinero(it.precio * it.cantidad)}</strong></div>`
  ).join('');

  const reciboEl = el('reciboDigital');
  if (reciboEl) {
    reciboEl.innerHTML = `
      <div class="fila-recibo"><span>Comanda:</span><strong>${escaparHtml(pedido.codigo)}</strong></div>
      <div class="fila-recibo"><span>Ubicación:</span><strong>${escaparHtml(pedido.mesa)}</strong></div>
      <div class="fila-recibo"><span>Comensal:</span><strong>${escaparHtml(pedido.cliente)}</strong></div>
      <div class="fila-recibo"><span>Pago:</span><strong>${escaparHtml(pedido.pago)}</strong></div>
      <hr style="border:0;border-top:1px solid var(--borde);margin:6px 0;">
      ${filas}
      ${pedido.notas && pedido.notas !== 'Sin notas especiales' ? `<div class="fila-recibo" style="margin-top:4px;"><span>Notas:</span><em>"${escaparHtml(pedido.notas)}"</em></div>` : ''}
      <div class="fila-recibo" style="border-top:1px dashed var(--borde);margin-top:6px;padding-top:6px;font-weight:800;font-size:14px;">
        <span>Total:</span><strong style="color:var(--rojo);">${dinero(pedido.total)}</strong>
      </div>`;
  }

  sincronizarPasosKdsModal(pedido.estado || 'Recibido');
  abrirDialogo('fondoExito');
}

function sincronizarPasosKdsModal(estado) {
  const paso1 = el('paso1KDS');
  const paso2 = el('paso2KDS');
  const paso3 = el('paso3KDS');

  if (estado === 'Recibido') {
    if (paso1) paso1.className = 'paso-kds activo';
    if (paso2) paso2.className = 'paso-kds';
    if (paso3) paso3.className = 'paso-kds';
  } else if (estado === 'Al Horno') {
    if (paso1) paso1.className = 'paso-kds listo';
    if (paso2) paso2.className = 'paso-kds activo';
    if (paso3) paso3.className = 'paso-kds';
  } else if (estado === 'En Mesa' || estado === 'Entregado') {
    if (paso1) paso1.className = 'paso-kds listo';
    if (paso2) paso2.className = 'paso-kds listo';
    if (paso3) paso3.className = estado === 'Entregado' ? 'paso-kds listo' : 'paso-kds activo';
  }
}

function obtenerPedidoActivoDeMesa() {
  try {
    const pedidos = JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
    const codGuardado = sessionStorage.getItem('pizza_pedido_activo');
    if (codGuardado) {
      const encontrado = pedidos.find(p => p.codigo === codGuardado);
      if (encontrado && encontrado.estado !== 'Entregado') return encontrado;
    }
    const info = resolverMesa(mesaIdActual);
    const prefijoMesa = info ? info.codigo.toLowerCase() : 'mesa 1';
    return pedidos.find(p =>
      p.estado !== 'Entregado' &&
      String(p.mesa || '').toLowerCase().includes(prefijoMesa)
    ) || null;
  } catch (e) {
    return null;
  }
}

function actualizarBannerPedidoActivo() {
  const banner = el('bannerPedidoActivo');
  const pedido = obtenerPedidoActivoDeMesa();

  if (pedido) {
    sincronizarPasosKdsModal(pedido.estado);
  }

  if (!banner) return;

  if (!pedido) {
    banner.style.display = 'none';
    return;
  }

  const claseEstado = pedido.estado === 'Al Horno'
    ? 'horno'
    : (pedido.estado === 'En Mesa' ? 'mesa' : 'recibido');

  const textoEstado = pedido.estado === 'Al Horno'
    ? '2/3 · En Horno a Leña'
    : (pedido.estado === 'En Mesa' ? '3/3 · Listo para tu mesa' : '1/3 · Recibido en Cocina');

  banner.style.display = 'block';
  banner.innerHTML = `
    <div class="banner-pedido-interior">
      <div class="pedido-activo-info">
        <span class="estado-pill-vivo ${claseEstado}">${textoEstado}</span>
        <span>Orden <strong>${escaparHtml(pedido.codigo)}</strong> · ${escaparHtml(pedido.mesa)}</span>
      </div>
      <button type="button" class="btn-secundario" style="padding:6px 11px; font-size:11.5px;" id="btnVerSeguimientoVivo">
        Ver Estado
      </button>
    </div>
  `;

  const btnVer = el('btnVerSeguimientoVivo');
  if (btnVer) {
    btnVer.onclick = () => mostrarModalSeguimientoPedido(pedido);
  }
}

function terminarPedido() {
  cerrarDialogo('fondoExito');
}

// ═══════════════════════════════════════════════
// 7. SELECTOR DE MESA QR Y ASISTENCIA EN MESA
// ═══════════════════════════════════════════════
function abrirSelectorMesa() {
  actualizarIndicadoresMesa();
  abrirDialogo('fondoModalMesa');
}

function cerrarSelectorMesa() {
  cerrarDialogo('fondoModalMesa');
}

function seleccionarMesa(entradaMesa) {
  const info = resolverMesa(entradaMesa);
  if (!info) return;
  guardarMesaPorId(info.id, true);
  actualizarBannerPedidoActivo();
  cerrarSelectorMesa();
  mostrarToast(`Asignada: ${info.codigo} (${info.zona})`);
}

function copiarEnlaceQrMesa() {
  const url = obtenerUrlQrMesa(mesaIdActual);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      mostrarToast('Enlace QR copiado al portapapeles');
    }).catch(() => mostrarToast(url));
  } else {
    mostrarToast(url);
  }
}

function abrirModalAsistencia() {
  const sub = el('subtituloAsistenciaMesa');
  if (sub) sub.textContent = `Atención inmediata para ${mesaActual}`;
  abrirDialogo('modalAsistenciaMesa');
}

function cerrarModalAsistencia() {
  cerrarDialogo('modalAsistenciaMesa');
}

function solicitarAsistenciaMesa(tipoSolicitud) {
  const aviso = {
    id: 'ASIST-' + Date.now(),
    mesa: mesaActual,
    tipo: tipoSolicitud,
    hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  };
  try {
    const lista = JSON.parse(localStorage.getItem('pizza_asistencia_mesa') || '[]');
    lista.unshift(aviso);
    localStorage.setItem('pizza_asistencia_mesa', JSON.stringify(lista.slice(0, 20)));
    if (typeof canalPedidos !== 'undefined' && canalPedidos) {
      canalPedidos.postMessage({ tipo: 'ASISTENCIA_MESA', aviso });
    }
  } catch (e) {}

  cerrarModalAsistencia();
  mostrarToast(`Solicitud enviada a salón (${mesaActual})`);
}

// ═══════════════════════════════════════════════
// 8. TOAST MÓVIL SUPERIOR
// ═══════════════════════════════════════════════
let timerToast;
function mostrarToast(mensaje) {
  const t = el('toast');
  if (!t) return;
  const tTxt = el('toastTexto');
  if (tTxt) tTxt.textContent = limpiarTextoEmojis(mensaje);
  t.classList.add('visible');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => t.classList.remove('visible'), 2800);
}

// ═══════════════════════════════════════════════
// 9. INICIALIZACIÓN Y EVENT LISTENERS
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  detectarMesaDesdeUrl();
  inicializarLightDismissDialogs();
  renderizarCarrito();
  actualizarIndicadoresMesa();
  actualizarBannerPedidoActivo();

  if (typeof apiObtenerPedidos === 'function') {
    apiObtenerPedidos().then(() => actualizarBannerPedidoActivo()).catch(() => {});
  }

  // Carrito / Comanda
  const btnNavCarrito = el('btnNavCarrito');
  if (btnNavCarrito) btnNavCarrito.addEventListener('click', abrirCarrito);

  const fondoCarrito = el('fondoCarrito');
  const btnCerrarCarr = el('btnCerrarCarrito');
  if (fondoCarrito) fondoCarrito.addEventListener('click', cerrarCarrito);
  if (btnCerrarCarr) btnCerrarCarr.addEventListener('click', cerrarCarrito);

  const barraCarritoFija = el('barraCarritoFija');
  if (barraCarritoFija) barraCarritoFija.addEventListener('click', abrirCarrito);

  const btnConfirmar = el('btnConfirmarPedido');
  if (btnConfirmar) btnConfirmar.addEventListener('click', abrirCheckout);

  // Selector de Mesa QR
  const btnMesaNav = el('btnMesaNav');
  if (btnMesaNav) btnMesaNav.addEventListener('click', abrirSelectorMesa);

  const btnMesaBottom = el('btnMesaBottom');
  if (btnMesaBottom) btnMesaBottom.addEventListener('click', abrirSelectorMesa);

  const btnCerrarMesa = el('btnCerrarModalMesa');
  if (btnCerrarMesa) btnCerrarMesa.addEventListener('click', cerrarSelectorMesa);

  const btnCopiarQr = el('btnCopiarUrlQr');
  if (btnCopiarQr) btnCopiarQr.addEventListener('click', copiarEnlaceQrMesa);

  const grillaMesas = el('grillaMesas');
  if (grillaMesas) {
    grillaMesas.addEventListener('click', e => {
      const btn = e.target.closest('.item-mesa-btn');
      if (btn && btn.dataset.mesa) seleccionarMesa(btn.dataset.mesa);
    });
  }

  // Asistencia en Mesa
  const btnGuiaNav = el('btnGuiaNav');
  if (btnGuiaNav) btnGuiaNav.addEventListener('click', abrirModalAsistencia);

  const btnCerrarAsistencia = el('btnCerrarModalAsistencia');
  if (btnCerrarAsistencia) btnCerrarAsistencia.addEventListener('click', cerrarModalAsistencia);

  const grillaAsistencia = el('grillaAsistenciaOpciones');
  if (grillaAsistencia) {
    grillaAsistencia.addEventListener('click', e => {
      const btn = e.target.closest('[data-asistencia]');
      if (btn) solicitarAsistenciaMesa(btn.dataset.asistencia);
    });
  }

  // Checkout
  const btnCerrarCO = el('btnCerrarCheckout');
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
  const btnTerminar = el('btnTerminarPedido');
  if (btnTerminar) btnTerminar.addEventListener('click', terminarPedido);

  // Delegación en carrito
  const listaCarrito = el('listaProductosCarrito');
  if (listaCarrito) {
    listaCarrito.addEventListener('click', e => {
      const btn = e.target.closest('[data-cambio]');
      if (btn) cambiarCantidad(btn.dataset.id, Number(btn.dataset.cambio));
    });
  }

  // Delegación global de botón "+ Agregar"
  document.addEventListener('click', e => {
    const btnAgregar = e.target.closest('[data-agregar]');
    if (btnAgregar) agregarProducto(btnAgregar.dataset.agregar);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarCarrito();
  });

  if (typeof canalPedidos !== 'undefined' && canalPedidos) {
    canalPedidos.addEventListener('message', e => {
      if (!e.data) return;
      if (e.data.tipo === 'ACTUALIZAR_PEDIDO' && e.data.codigo) {
        const lista = JSON.parse(localStorage.getItem('pizza_pedidos') || '[]');
        const idx = lista.findIndex(p => p.codigo === e.data.codigo);
        if (idx !== -1) {
          lista[idx] = { ...lista[idx], ...e.data.campos };
          localStorage.setItem('pizza_pedidos', JSON.stringify(lista));
        }
        actualizarBannerPedidoActivo();
        if (e.data.campos && e.data.campos.estado) {
          mostrarToast(`Cocina (${e.data.codigo}): ${e.data.campos.estado}`);
        }
      }
    });
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'pizza_productos') {
      productos = obtenerProductos();
      if (typeof renderizarProductos === 'function') renderizarProductos();
      if (typeof actualizarJev === 'function') actualizarJev('popular');
      renderizarCarrito();
    } else if (e.key === 'pizza_pedidos') {
      actualizarBannerPedidoActivo();
    }
  });
});
