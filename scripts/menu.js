/**
 * MENU.JS — Carta Móvil de Autoservicio en Mesa QR
 * Incluye tarjetas horizontales táctiles con controles +/- directos y recomendador JEV compacto
 */

let filtroCategoriaActivo = 'todas';
let terminoBusqueda = '';

function normalizarCategoriaProducto(cat) {
  const c = String(cat || '').toLowerCase().trim();
  if (c.startsWith('pizza')) return 'pizza';
  if (c.startsWith('entrada') || c.startsWith('acompa')) return 'entradas';
  if (c.startsWith('bebida')) return 'bebidas';
  if (c.startsWith('postre')) return 'postres';
  return c || 'pizza';
}

const titulosCategorias = {
  todas: 'Carta Completa',
  pizza: 'Pizzas al Horno a Leña',
  entradas: 'Entradas para Compartir',
  bebidas: 'Bebidas y Refrescos',
  postres: 'Postres Artesanales'
};

// ═══════════════════════════════════════════════
// RENDERIZADO DEL CATÁLOGO MÓVIL
// ═══════════════════════════════════════════════
function renderizarProductos() {
  const grilla = el('grillaProductos');
  if (!grilla) return;

  if (typeof obtenerProductos === 'function') {
    productos = obtenerProductos();
  }

  const catFiltro = filtroCategoriaActivo === 'todas'
    ? 'todas'
    : normalizarCategoriaProducto(filtroCategoriaActivo);

  const filtrados = productos.filter(p => {
    const catProd = normalizarCategoriaProducto(p.categoria);
    const cumpleCat = catFiltro === 'todas' || catProd === catFiltro;
    const q = terminoBusqueda.toLowerCase().trim();
    const cumpleBusqueda =
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q) ||
      (p.etiqueta || '').toLowerCase().includes(q);
    return cumpleCat && cumpleBusqueda;
  });

  const lblCatTitulo = el('tituloCategoriaActiva');
  const lblCatConteo = el('conteoCategoriaActiva');
  if (lblCatTitulo) lblCatTitulo.textContent = titulosCategorias[catFiltro] || 'Carta';
  if (lblCatConteo) lblCatConteo.textContent = `${filtrados.length} opciones`;

  if (filtrados.length === 0) {
    grilla.innerHTML = `
      <div class="estado-vacio">
        <svg class="ico ico-xl" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <strong>Sin resultados para tu búsqueda</strong>
        <p>Prueba con otro ingrediente o toca "Ver toda la carta".</p>
        <button type="button" class="btn-primario" onclick="restablecerFiltros()" style="margin-top: 12px; padding: 9px 16px; font-size: 13px;">
          Ver toda la carta
        </button>
      </div>`;
    return;
  }

  grilla.innerHTML = filtrados.map(p => {
    const etiquetaLimpia = typeof limpiarTextoEmojis === 'function'
      ? limpiarTextoEmojis(p.etiqueta || 'Artesanal')
      : (p.etiqueta || 'Artesanal');
    const cantEnCarrito = (typeof carrito !== 'undefined' && carrito[p.id]) ? carrito[p.id] : 0;

    const controlAccionHtml = cantEnCarrito > 0
      ? `
        <div class="stepper-tarjeta" aria-label="Cantidad en comanda">
          <button type="button" data-stepper-id="${p.id}" data-stepper-delta="-1" aria-label="Quitar uno">−</button>
          <span>${cantEnCarrito}</span>
          <button type="button" data-stepper-id="${p.id}" data-stepper-delta="1" aria-label="Agregar uno">+</button>
        </div>
      `
      : `
        <button type="button" class="btn-agregar-producto" data-agregar="${p.id}">
          <span>+ Agregar</span>
        </button>
      `;

    return `
      <article class="tarjeta-producto ${cantEnCarrito > 0 ? 'en-comanda' : ''}">
        <div class="producto-cuerpo">
          <span class="etiqueta-producto-inline">${escaparHtml(etiquetaLimpia)}</span>
          <h3 class="producto-nombre">${escaparHtml(p.nombre)}</h3>
          <p class="producto-descripcion">${escaparHtml(p.descripcion)}</p>
          <div class="producto-fila-inferior">
            <span class="producto-precio">${dinero(p.precio)}</span>
          </div>
        </div>
        <div class="producto-columna-foto">
          <div class="producto-imagen">
            <img loading="lazy" src="${p.imagen}" alt="${escaparHtml(p.nombre)}"
                 onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80'">
          </div>
          ${controlAccionHtml}
        </div>
      </article>
    `;
  }).join('');
}

function restablecerFiltros() {
  filtroCategoriaActivo = 'todas';
  terminoBusqueda = '';
  const inputBusqueda = el('inputBusqueda');
  if (inputBusqueda) inputBusqueda.value = '';
  document.querySelectorAll('.btn-categoria').forEach(b =>
    b.classList.toggle('activo', b.dataset.filtro === 'todas'));
  renderizarProductos();
}

// ═══════════════════════════════════════════════
// MOTOR DE RECOMENDACIÓN GASTRONÓMICA JEV (COMPACTO MÓVIL)
// ═══════════════════════════════════════════════
const configuracionCasosJev = {
  popular: {
    titulo: 'Más Pedida',
    idPrincipal: 'pepperoni',
    itemsSimulados: [],
    motivoBase: 'La más pedida en salón: doble pepperoni artesanal y mozzarella al horno de leña.',
    idMaridaje: 'gaseosa-15'
  },
  individual: {
    titulo: 'Individual',
    idPrincipal: 'clasica',
    itemsSimulados: [{ id: 'clasica', nombre: 'Pizza Margherita Clásica', categoria: 'pizza', precio: 19.90, cantidad: 1 }],
    motivoBase: 'Ideal para 1 persona: masa madre ligera de 48h con albahaca fresca.',
    idMaridaje: 'chicha-jarra'
  },
  pareja: {
    titulo: 'En Pareja',
    idPrincipal: 'pepperoni',
    itemsSimulados: [{ id: 'pepperoni', nombre: 'Pizza Pepperoni Supreme', categoria: 'pizza', precio: 25.90, cantidad: 1 }],
    motivoBase: 'Favorita para compartir en pareja junto a una porción de Pan al Ajo gratinado.',
    idMaridaje: 'pan-ajo'
  },
  familiar: {
    titulo: 'Familiar',
    idPrincipal: 'carnivora',
    itemsSimulados: [
      { id: 'pepperoni', nombre: 'Pizza Pepperoni Supreme', categoria: 'pizza', precio: 25.90, cantidad: 1 },
      { id: 'carnivora', nombre: 'Pizza Carnívora Rústica', categoria: 'pizza', precio: 29.90, cantidad: 1 }
    ],
    motivoBase: 'Para 3 a 4 personas en mesa: combinación contundente de carnes al horno.',
    idMaridaje: 'gaseosa-15'
  },
  veggie: {
    titulo: 'Vegetariana',
    idPrincipal: 'vegetariana',
    itemsSimulados: [{ id: 'vegetariana', nombre: 'Pizza Huerta Silvestre', categoria: 'pizza', precio: 23.90, cantidad: 1 }],
    motivoBase: 'Champiñones portobello frescos, pimientos asados, aceitunas y rúcula.',
    idMaridaje: 'chicha-jarra'
  }
};

let preferenciaActualJev = 'popular';

async function actualizarJev(preferencia) {
  preferenciaActualJev = preferencia;
  const tarjeta = el('tarjetaJev');
  if (!tarjeta) return;

  const cfg = configuracionCasosJev[preferencia] || configuracionCasosJev.popular;

  let itemsAEnviar = cfg.itemsSimulados;
  let esModoCarritoReal = false;
  if (preferencia === 'carrito') {
    esModoCarritoReal = true;
    const ids = Object.keys(carrito);
    itemsAEnviar = ids.map(id => {
      const p = productos.find(x => x.id === id) || {};
      return { id, nombre: p.nombre, categoria: p.categoria || 'pizza', precio: p.precio, cantidad: carrito[id] };
    });
  }

  let respuestaIa = null;
  if (typeof apiConsultarJev === 'function') {
    try {
      respuestaIa = await apiConsultarJev(itemsAEnviar);
    } catch (e) {}
  }

  let prodPrincipal = null;
  let prodMaridaje = null;
  let motivoTexto = cfg.motivoBase;

  if (esModoCarritoReal && respuestaIa && respuestaIa.recomendacionPrincipal) {
    const rec = respuestaIa.recomendacionPrincipal;
    prodPrincipal = productos.find(p => p.id === rec.id) || productos[0];
    motivoTexto = rec.motivo;
  } else {
    prodPrincipal = productos.find(p => p.id === cfg.idPrincipal) || productos[0];
    if (cfg.idMaridaje) {
      prodMaridaje = productos.find(p => p.id === cfg.idMaridaje);
    }
    if (respuestaIa && respuestaIa.recomendacionPrincipal && (preferencia === 'individual' || preferencia === 'pareja' || preferencia === 'familiar')) {
      motivoTexto = respuestaIa.recomendacionPrincipal.motivo || cfg.motivoBase;
    }
  }

  if (!prodPrincipal) prodPrincipal = productos[0];

  const htmlBotonCombo = prodMaridaje ? `
    <button type="button" class="btn-jev-combo" id="btnJevCombo">
      + Agregar Dúo: ${escaparHtml(prodPrincipal.nombre)} + ${escaparHtml(prodMaridaje.nombre)} (${dinero(prodPrincipal.precio + prodMaridaje.precio)})
    </button>
  ` : '';

  tarjeta.innerHTML = `
    <div class="jev-fila-principal">
      <div class="jev-miniatura">
        <img src="${prodPrincipal.imagen}" alt="${escaparHtml(prodPrincipal.nombre)}"
             onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80'">
      </div>
      <div class="jev-datos">
        <h3>${escaparHtml(prodPrincipal.nombre)}</h3>
        <div class="jev-precio">${dinero(prodPrincipal.precio)}</div>
        <p class="jev-por-que">${escaparHtml(motivoTexto)}</p>
      </div>
      <button type="button" class="btn-jev-agregar" id="btnJevAgregarPrincipal">
        + Pedir
      </button>
    </div>
    ${htmlBotonCombo}
  `;

  const btnPrincipal = el('btnJevAgregarPrincipal');
  if (btnPrincipal) {
    btnPrincipal.onclick = () => {
      if (typeof agregarProducto === 'function') {
        agregarProducto(prodPrincipal.id);
        verificarChipCarritoJev();
      }
    };
  }

  const btnCombo = el('btnJevCombo');
  if (btnCombo && prodMaridaje) {
    btnCombo.onclick = () => {
      if (typeof agregarProducto === 'function') {
        agregarProducto(prodPrincipal.id);
        agregarProducto(prodMaridaje.id);
        if (typeof mostrarToast === 'function') {
          mostrarToast(`Dúo agregado a tu comanda`);
        }
        verificarChipCarritoJev();
      }
    };
  }
}

function verificarChipCarritoJev() {
  const chipCarrito = el('chipCarritoJev');
  if (!chipCarrito) return;
  const cant = Object.values(carrito).reduce((a, b) => a + b, 0);
  if (cant > 0) {
    chipCarrito.style.display = 'inline-flex';
    chipCarrito.textContent = `Para mi Pedido (${cant})`;
  } else {
    chipCarrito.style.display = 'none';
    if (preferenciaActualJev === 'carrito') {
      actualizarJev('popular');
    }
  }
}

// ═══════════════════════════════════════════════
// INICIALIZACIÓN DE LA CARTA MÓVIL
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderizarProductos();
  actualizarJev('popular');
  verificarChipCarritoJev();

  // Delegación para botones +/- dentro de cada tarjeta de producto
  const grilla = el('grillaProductos');
  if (grilla) {
    grilla.addEventListener('click', e => {
      const btnStep = e.target.closest('[data-stepper-id]');
      if (btnStep && typeof cambiarCantidad === 'function') {
        cambiarCantidad(btnStep.dataset.stepperId, Number(btnStep.dataset.stepperDelta));
      }
    });
  }

  const chipsJev = el('chipsJev');
  if (chipsJev) {
    chipsJev.addEventListener('click', e => {
      const chip = e.target.closest('.chip-jev');
      if (!chip) return;
      document.querySelectorAll('.chip-jev').forEach(c => c.classList.remove('activo'));
      chip.classList.add('activo');
      actualizarJev(chip.dataset.pref);
    });
  }

  const barraCategorias = el('barraCategorias');
  if (barraCategorias) {
    barraCategorias.addEventListener('click', e => {
      const btn = e.target.closest('.btn-categoria');
      if (!btn) return;
      document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      filtroCategoriaActivo = btn.dataset.filtro;
      renderizarProductos();
    });
  }

  const inputBusqueda = el('inputBusqueda');
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', e => {
      terminoBusqueda = e.target.value;
      renderizarProductos();
    });
  }
});
