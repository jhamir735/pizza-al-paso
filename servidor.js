/**
 * SERVIDOR BACKEND - REST API Y SERVICIO WEB PARA PIZZERÍA AL PASO
 * Conectado a PostgreSQL Neon en la nube.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, inicializarBaseDatos } = require('./db');
const { generarRecomendacionJev } = require('./jev/motorJev');
const { prepararTransacciones, calcularReglasAsociacion } = require('./jev/marketBasket');
const { entrenarNaiveBayes } = require('./jev/naiveBayes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname)));

// ═══════════════════════════════════════════════
// 1. ENDPOINTS DE PRODUCTOS (CRUD)
// ═══════════════════════════════════════════════

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY creado_en ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor al consultar productos' });
  }
});

// Crear un nuevo producto
app.post('/api/productos', async (req, res) => {
  try {
    const { id, nombre, categoria, precio, imagen, etiqueta, descripcion, preferencias } = req.body;
    const prodId = id || ('prod_' + Date.now());
    const query = `
      INSERT INTO productos (id, nombre, categoria, precio, imagen, etiqueta, descripcion, preferencias)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      prodId,
      nombre,
      categoria,
      Number(precio) || 0,
      imagen || '',
      etiqueta || '',
      descripcion || '',
      Array.isArray(preferencias) ? preferencias : []
    ];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al registrar el producto' });
  }
});

// Actualizar un producto existente
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, precio, imagen, etiqueta, descripcion, preferencias } = req.body;
    const query = `
      UPDATE productos
      SET nombre = $1, categoria = $2, precio = $3, imagen = $4, etiqueta = $5, descripcion = $6, preferencias = $7
      WHERE id = $8
      RETURNING *;
    `;
    const values = [
      nombre,
      categoria,
      Number(precio) || 0,
      imagen,
      etiqueta,
      descripcion,
      Array.isArray(preferencias) ? preferencias : [],
      id
    ];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// Eliminar un producto
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente', id });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

// ═══════════════════════════════════════════════
// 2. ENDPOINTS DE PEDIDOS / COMANDAS
// ═══════════════════════════════════════════════

// Obtener todos los pedidos
app.get('/api/pedidos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY id DESC');
    // Normalizar nombres de campos para compatibilidad exacta con frontend
    const pedidosNormalizados = rows.map(r => ({
      id: r.id,
      codigo: r.codigo,
      mesa: r.mesa,
      cliente: r.cliente,
      pago: r.pago,
      notas: r.notas,
      total: Number(r.total),
      fecha: r.fecha,
      fechaCompleta: r.fecha_completa,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
      estado: r.estado,
      estadoPago: r.estado_pago,
      metodoCobroFinal: r.metodo_cobro_final,
      montoEntregado: r.monto_entregado ? Number(r.monto_entregado) : null,
      montoVuelto: r.monto_vuelto ? Number(r.monto_vuelto) : null,
      tipoComprobante: r.tipo_comprobante,
      nroComprobante: r.nro_comprobante,
      fechaCobro: r.fecha_cobro,
      creadoEn: r.creado_en
    }));
    res.json(pedidosNormalizados);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al consultar las comandas' });
  }
});

// Crear una nueva comanda (Cliente desde el Menú QR)
app.post('/api/pedidos', async (req, res) => {
  try {
    const {
      codigo,
      mesa,
      cliente,
      pago,
      notas,
      total,
      fecha,
      fechaCompleta,
      items,
      estado,
      estadoPago
    } = req.body;

    const query = `
      INSERT INTO pedidos (
        codigo, mesa, cliente, pago, notas, total, fecha, fecha_completa, items, estado, estado_pago
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const values = [
      codigo,
      mesa || 'Mesa 1',
      cliente || 'Cliente en Salón',
      pago || 'Presencial / Tarjeta / Efectivo',
      notas || '',
      Number(total) || 0,
      fecha || new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      fechaCompleta || new Date().toLocaleString('es-PE'),
      JSON.stringify(items || []),
      estado || 'Recibido',
      estadoPago || 'Pendiente'
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error al registrar la comanda' });
  }
});

// Actualizar estado de cocina (Recibido -> Al Horno -> En Mesa -> Entregado)
app.put('/api/pedidos/:codigo/estado', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { estado } = req.body;
    const query = `
      UPDATE pedidos
      SET estado = $1
      WHERE codigo = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [estado, codigo]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado de la comanda' });
  }
});

// Actualizar estado de pago en Caja POS (Pendiente -> Pagado)
app.put('/api/pedidos/:codigo/pago', async (req, res) => {
  try {
    const { codigo } = req.params;
    const {
      estadoPago,
      metodoCobroFinal,
      montoEntregado,
      montoVuelto,
      tipoComprobante,
      nroComprobante,
      fechaCobro
    } = req.body;

    const query = `
      UPDATE pedidos
      SET estado_pago = $1,
          metodo_cobro_final = $2,
          monto_entregado = $3,
          monto_vuelto = $4,
          tipo_comprobante = $5,
          nro_comprobante = $6,
          fecha_cobro = $7
      WHERE codigo = $8
      RETURNING *;
    `;

    const values = [
      estadoPago || 'Pagado',
      metodoCobroFinal || 'Efectivo',
      montoEntregado ? Number(montoEntregado) : null,
      montoVuelto ? Number(montoVuelto) : 0,
      tipoComprobante || 'Boleta',
      nroComprobante || '',
      fechaCobro || new Date().toLocaleString('es-PE'),
      codigo
    ];

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al procesar pago:', error);
    res.status(500).json({ error: 'Error al procesar pago de comanda' });
  }
});

// Limpiar historial de pedidos
app.delete('/api/pedidos', async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE pedidos RESTART IDENTITY;');
    res.json({ mensaje: 'Historial de comandas limpiado correctamente' });
  } catch (error) {
    console.error('Error al limpiar pedidos:', error);
    res.status(500).json({ error: 'Error al limpiar comandas' });
  }
});

// ═══════════════════════════════════════════════
// 3. ENDPOINTS DE INTELIGENCIA ARTIFICIAL JEV
// ═══════════════════════════════════════════════

// Motor de recomendación inteligente en vivo
app.post('/api/jev/recomendar', async (req, res) => {
  try {
    const { items, hora, diaSemana } = req.body;

    // Consultar catálogo y pedidos reales de Neon PostgreSQL
    const [resProds, resPeds] = await Promise.all([
      pool.query('SELECT * FROM productos'),
      pool.query('SELECT items FROM pedidos')
    ]);

    const catalogo = resProds.rows;
    const pedidosNeon = resPeds.rows;

    const recomendacion = generarRecomendacionJev(
      Array.isArray(items) ? items : [],
      { hora, diaSemana },
      pedidosNeon,
      catalogo
    );

    res.json(recomendacion);
  } catch (error) {
    console.error('Error en motor JEV:', error);
    res.status(500).json({ error: 'Error al generar recomendación JEV' });
  }
});

// Métricas de calibración de los algoritmos (Naive Bayes y Market Basket)
app.get('/api/jev/metricas', async (req, res) => {
  try {
    const [resProds, resPeds] = await Promise.all([
      pool.query('SELECT * FROM productos'),
      pool.query('SELECT items FROM pedidos')
    ]);

    const catalogo = resProds.rows;
    const pedidosNeon = resPeds.rows;

    const modeloBayes = entrenarNaiveBayes(pedidosNeon, catalogo);
    const trans = prepararTransacciones(pedidosNeon);
    const reglasMBA = calcularReglasAsociacion(trans.transacciones)
      .filter(r => r.lift > 1.0)
      .sort((a, b) => b.lift - a.lift)
      .slice(0, 10);

    res.json({
      naiveBayes: {
        totalMuestras: modeloBayes.totalMuestras,
        pedidosRealesNeon: modeloBayes.conteoRealesNeon,
        pedidosBenchmark: modeloBayes.conteoBenchmark,
        prioris: modeloBayes.prioris
      },
      marketBasketAnalysis: {
        totalTransacciones: trans.totalTransacciones,
        conteoReales: trans.conteoReales,
        conteoBenchmark: trans.conteoBenchmark,
        modoHibrido: trans.modoHibrido,
        topReglasAsociacion: reglasMBA
      }
    });
  } catch (error) {
    console.error('Error al obtener métricas JEV:', error);
    res.status(500).json({ error: 'Error al consultar métricas JEV' });
  }
});

// ═══════════════════════════════════════════════
// 4. ARRANCAR EL SERVIDOR
// ═══════════════════════════════════════════════
async function iniciarServidor() {
  try {
    await inicializarBaseDatos();
    const servidor = app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🍕 SERVIDOR PIZZERÍA AL PASO CONECTADO A NEON BD`);
      console.log(`🚀 Web local: http://localhost:${PORT}`);
      console.log(`📱 Menú QR:  http://localhost:${PORT}/paginas/menu.html`);
      console.log(`🔥 Cocina:   http://localhost:${PORT}/cocina.html`);
      console.log(`💵 Caja POS: http://localhost:${PORT}/caja.html`);
      console.log(`⚙️ Admin:    http://localhost:${PORT}/admin.html`);
      console.log(`==================================================\n`);
      console.log(`⏳ Servidor activo. Presiona Ctrl+C para detenerlo.\n`);
    });

    servidor.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ ERROR: El puerto ${PORT} ya está en uso.`);
        console.error(`   Cierra la otra instancia del servidor o cambia el puerto.`);
        console.error(`   Para cerrar procesos en el puerto ${PORT}, ejecuta:`);
        console.error(`   netstat -ano | findstr :${PORT}  → luego: taskkill /PID <numero> /F\n`);
      } else {
        console.error('Error en el servidor HTTP:', err);
      }
      process.exit(1);
    });

  } catch (err) {
    console.error('No se pudo arrancar el servidor:', err);
    process.exit(1);
  }
}

iniciarServidor();
