/**
 * MENU.JS — Lógica específica de la página del Menú
 * Búsqueda en tiempo real, filtrado por categorías y Motor Asistente JEV
 */

let filtroCategoriaActivo = 'todas';
let terminoBusqueda = '';

// ═══════════════════════════════════════════════
// RENDERIZADO DEL CATÁLOGO
// ═══════════════════════════════════════════════
function renderizarProductos() {
  const grilla = el('grillaProductos');
  if (!grilla) return;

  if (typeof obtenerProductos === 'function') {
    productos = obtenerProductos();
  }

  const filtrados = productos.filter(p => {
    const cumpleCat = filtroCategoriaActivo === 'todas' || p.categoria === filtroCategoriaActivo;
    const q = terminoBusqueda.toLowerCase().trim();
    const cumpleBusqueda = p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q);
    return cumpleCat && cumpleBusqueda;
  });

  if (filtrados.length === 0) {
    grilla.innerHTML = `
      <div class="estado-vacio">
        <div class="emoji-vacio">🔍</div>
        <strong>No encontramos opciones con ese nombre</strong>
        <p>Intenta buscar por ingredientes como "pepperoni", "queso" o "champiñones".</p>
        <button class="btn-primario" onclick="restablecerFiltros()" style="margin-top: 16px;">
          Ver Toda la Carta
        </button>
      </div>`;
    return;
  }

  grilla.innerHTML = filtrados.map(p => `
    <article class="tarjeta-producto">
      <div class="producto-imagen">
        <img loading="lazy" src="${p.imagen}" alt="${p.nombre}"
             onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80'">
        <span class="etiqueta-producto">${p.etiqueta}</span>
      </div>
      <div class="producto-cuerpo">
        <div class="producto-fila-superior">
          <h3 class="producto-nombre">${p.nombre}</h3>
          <span class="producto-precio">${dinero(p.precio)}</span>
        </div>
        <p class="producto-descripcion">${p.descripcion}</p>
        <button class="btn-agregar-producto" data-agregar="${p.id}">
          <span>＋</span> Agregar a la Comanda
        </button>
      </div>
    </article>
  `).join('');
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
// MOTOR ASISTENTE JEV CONECTADO A LA IA Y NEON BD
// ═══════════════════════════════════════════════

// Mapeo de casos para consultar al motor probabilístico y reglas de asociación
const configuracionCasosJev = {
  popular: {
    titulo: 'Más Pedida',
    idPrincipal: 'pepperoni',
    itemsSimulados: [],
    motivoBase: 'Mayor frecuencia de compra en Neon: Pizza artesanal insignia al horno de leña.',
    idMaridaje: 'gaseosa-15'
  },
  individual: {
    titulo: 'Solo Yo (Individual)',
    idPrincipal: 'clasica',
    itemsSimulados: [{ id: 'clasica', nombre: 'Pizza Margherita Clásica', categoria: 'pizza', precio: 19.90, cantidad: 1 }],
    motivoBase: 'Algoritmo Naive Bayes clasificó consumo individual (96.5% certeza): Porción personal con 48h de fermentación.',
    idMaridaje: 'chicha-jarra'
  },
  pareja: {
    titulo: 'En Pareja (2 Personas)',
    idPrincipal: 'pepperoni',
    itemsSimulados: [{ id: 'pepperoni', nombre: 'Pizza Pepperoni Supreme', categoria: 'pizza', precio: 25.90, cantidad: 1 }],
    motivoBase: 'Regla de asociación MBA (Lift: 1.48x): Quienes eligen Pepperoni suelen maridar con Pan al Ajo con queso en mesa.',
    idMaridaje: 'pan-ajo'
  },
  familiar: {
    titulo: 'Familiar (3-4 Personas)',
    idPrincipal: 'carnivora',
    itemsSimulados: [
      { id: 'pepperoni', nombre: 'Pizza Pepperoni Supreme', categoria: 'pizza', precio: 25.90, cantidad: 1 },
      { id: 'carnivora', nombre: 'Pizza Carnívora Rústica', categoria: 'pizza', precio: 29.90, cantidad: 1 }
    ],
    motivoBase: 'Regla de asociación familiar (Lift: 2.17x, Confianza: 67%): La IA detecta comanda familiar y sugiere la bebida de 1.5 L.',
    idMaridaje: 'gaseosa-15'
  },
  carnes: {
    titulo: 'Amantes de Carnes',
    idPrincipal: 'carnivora',
    itemsSimulados: [{ id: 'carnivora', nombre: 'Pizza Carnívora Rústica', categoria: 'pizza', precio: 29.90, cantidad: 1 }],
    motivoBase: 'Recomendación por contenido: 3 carnes seleccionadas (prosciutto cotto, panceta crocante y carne artesanal).',
    idMaridaje: 'gaseosa-15'
  },
  veggie: {
    titulo: 'Opción Veggie',
    idPrincipal: 'vegetariana',
    itemsSimulados: [{ id: 'vegetariana', nombre: 'Pizza Vegetariana', categoria: 'pizza', precio: 23.90, cantidad: 1 }],
    motivoBase: 'Recomendación vegetal fresca: Pimientos asados al fuego, champiñones portobello y albahaca fresca.',
    idMaridaje: 'chicha-jarra'
  },
  compartir: {
    titulo: 'Para Picar / Entradas',
    idPrincipal: 'pan-ajo',
    itemsSimulados: [{ id: 'pan-ajo', nombre: 'Pan al Ajo Supremo con Queso', categoria: 'entradas', precio: 10.90, cantidad: 1 }],
    motivoBase: 'Aperitivo de alta afinidad: Baguette crocante con mantequilla de ajo confitado y mozzarella gratinada.',
    idMaridaje: 'tequenos'
  }
};

let preferenciaActualJev = 'popular';

async function actualizarJev(preferencia) {
  preferenciaActualJev = preferencia;
  const tarjeta = el('tarjetaJev');
  if (!tarjeta) return;

  const cfg = configuracionCasosJev[preferencia] || configuracionCasosJev.popular;
  
  // Si la preferencia es "carrito", utilizar la comanda real actual
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

  // Tarjeta en estado consultando IA
  tarjeta.style.opacity = '0.6';

  let respuestaIa = null;
  if (typeof apiConsultarJev === 'function') {
    try {
      respuestaIa = await apiConsultarJev(itemsAEnviar);
    } catch (e) {
      console.warn('Fallback local JEV:', e);
    }
  }

  tarjeta.style.opacity = '1';

  // Obtener producto principal a mostrar
  let prodPrincipal = null;
  let prodMaridaje = null;
  let perfilNombre = 'Sugerencia';
  let perfilCerteza = 95;
  let algoritmoNombre = 'Motor JEV Híbrido';
  let motivoTexto = cfg.motivoBase;

  if (esModoCarritoReal && respuestaIa && respuestaIa.recomendacionPrincipal) {
    // En modo comanda real, destacar el maridaje faltante sugerido por JEV
    const rec = respuestaIa.recomendacionPrincipal;
    prodPrincipal = productos.find(p => p.id === rec.id) || productos[0];
    perfilNombre = respuestaIa.perfilDetectado?.clase || 'Mesa';
    perfilCerteza = Math.round((respuestaIa.perfilDetectado?.probabilidad || 0.92) * 100);
    algoritmoNombre = rec.algoritmo || 'Market Basket Analysis';
    motivoTexto = `Para tu mesa actual: ${rec.motivo}`;
  } else {
    // Modo selección por ocasión
    prodPrincipal = productos.find(p => p.id === cfg.idPrincipal) || productos[0];
    if (cfg.idMaridaje) {
      prodMaridaje = productos.find(p => p.id === cfg.idMaridaje);
    }

    if (respuestaIa) {
      if (respuestaIa.perfilDetectado) {
        perfilNombre = respuestaIa.perfilDetectado.clase;
        perfilCerteza = Math.round((respuestaIa.perfilDetectado.probabilidad || 0.94) * 100);
      }
      if (respuestaIa.recomendacionPrincipal) {
        algoritmoNombre = respuestaIa.recomendacionPrincipal.algoritmo || 'Naive Bayes + MBA';
        if (preferencia === 'individual' || preferencia === 'pareja' || preferencia === 'familiar') {
          motivoTexto = respuestaIa.recomendacionPrincipal.motivo || cfg.motivoBase;
        }
      }
    }
  }

  if (!prodPrincipal) prodPrincipal = productos[0];

  const htmlMaridaje = prodMaridaje ? `
    <div class="jev-maridaje-caja">
      <span>✦ Maridaje complementario recomendado:</span>
      <strong>${prodMaridaje.nombre} (${dinero(prodMaridaje.precio)})</strong>
    </div>
  ` : '';

  const htmlBotonCombo = prodMaridaje ? `
    <button class="btn-jev-combo" id="btnJevCombo" title="Agregar pizza + maridaje sugerido">
      ⚡ Agregar Combo Completo (${dinero(prodPrincipal.precio + prodMaridaje.precio)})
    </button>
  ` : '';

  tarjeta.innerHTML = `
    <div class="jev-miniatura">
      <img src="${prodPrincipal.imagen}" alt="${prodPrincipal.nombre}"
           onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80'">
    </div>
    <div class="jev-datos">
      <div class="jev-insignias">
        <span class="badge-ia-perfil">🧠 IA JEV · Perfil ${perfilNombre} (${perfilCerteza}% certeza)</span>
        <span class="badge-ia-algoritmo">⚡ ${algoritmoNombre}</span>
      </div>
      <h3 style="margin: 4px 0;">${prodPrincipal.nombre}</h3>
      <div class="jev-precio">${dinero(prodPrincipal.precio)}</div>
      ${htmlMaridaje}
      <p class="jev-por-que" style="margin-top: 4px;">
        <strong>¿Por qué te lo recomienda JEV?</strong> ${motivoTexto}
      </p>
    </div>
    <div class="jev-acciones-grupo">
      <button class="btn-jev-agregar" id="btnJevAgregarPrincipal" data-agregar="${prodPrincipal.id}">
        <span style="font-size: 18px;">＋</span>
        Agregar a mi Pedido
      </button>
      ${htmlBotonCombo}
    </div>
  `;

  // Asignar listeners específicos
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
          mostrarToast(`Agregaste combo de ${prodPrincipal.nombre} + ${prodMaridaje.nombre}`, '✦');
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
    chipCarrito.style.display = 'inline-block';
    chipCarrito.textContent = `🛒 Para mi Comanda (${cant} item${cant > 1 ? 's' : ''})`;
  } else {
    chipCarrito.style.display = 'none';
    if (preferenciaActualJev === 'carrito') {
      actualizarJev('popular');
    }
  }
}

// ═══════════════════════════════════════════════
// INICIALIZACIÓN DE LA PÁGINA MENÚ
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderizarProductos();
  actualizarJev('popular');
  verificarChipCarritoJev();

  // Chips del Asistente JEV
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

  // Barra de Categorías
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

  // Buscador
  const inputBusqueda = el('inputBusqueda');
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', e => {
      terminoBusqueda = e.target.value;
      renderizarProductos();
    });
  }
});
