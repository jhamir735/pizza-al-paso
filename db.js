const { Pool } = require('pg');

// Cadena de conexión de Neon
const connectionString = 'postgresql://neondb_owner:npg_UeQK9BlkPjN4@ep-odd-dust-bdh2627p-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Productos iniciales para sembrar (seed) en la BD si está vacía
const productosSemilla = [
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

async function inicializarBaseDatos() {
  const client = await pool.connect();
  try {
    console.log('🔗 Conectado a PostgreSQL Neon...');

    // 1. Tabla de Productos
    await client.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id VARCHAR(50) PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        precio NUMERIC(10, 2) NOT NULL,
        imagen TEXT,
        etiqueta VARCHAR(50),
        descripcion TEXT,
        preferencias TEXT[],
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "productos" lista.');

    // 2. Tabla de Pedidos / Comandas
    await client.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(30) UNIQUE NOT NULL,
        mesa VARCHAR(50) NOT NULL,
        cliente VARCHAR(100),
        pago VARCHAR(50),
        notas TEXT,
        total NUMERIC(10, 2) NOT NULL,
        fecha VARCHAR(50),
        fecha_completa VARCHAR(100),
        items JSONB NOT NULL,
        estado VARCHAR(50) DEFAULT 'Recibido',
        estado_pago VARCHAR(50) DEFAULT 'Pendiente',
        metodo_cobro_final VARCHAR(50),
        monto_entregado NUMERIC(10, 2),
        monto_vuelto NUMERIC(10, 2),
        tipo_comprobante VARCHAR(50),
        nro_comprobante VARCHAR(50),
        fecha_cobro VARCHAR(100),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "pedidos" lista.');

    // 3. Sembrar productos si la tabla está vacía
    const resCount = await client.query('SELECT COUNT(*) FROM productos');
    if (parseInt(resCount.rows[0].count, 10) === 0) {
      console.log('🌱 Sembrando catálogo inicial de productos...');
      for (const p of productosSemilla) {
        await client.query(
          `INSERT INTO productos (id, nombre, categoria, precio, imagen, etiqueta, descripcion, preferencias)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING;`,
          [p.id, p.nombre, p.categoria, p.precio, p.imagen, p.etiqueta, p.descripcion, p.preferencias]
        );
      }
      console.log('✅ Catálogo inicial sembrado con éxito.');
    } else {
      console.log(`ℹ️ La tabla productos ya cuenta con ${resCount.rows[0].count} registros.`);
    }

    return true;
  } catch (err) {
    console.error('❌ Error al inicializar base de datos:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  inicializarBaseDatos
};
