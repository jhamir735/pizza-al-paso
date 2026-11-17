# 🍕 Pizza al Paso — Sistema Web Autoservicio QR & Motor IA JEV

Plataforma gastronómica integral de autoservicio digital para restaurante/pizzería artesanal. Incluye carta digital con pedidos en mesa vía QR, pantalla de despacho para cocina (KDS), terminal de punto de venta y cobro (Caja POS), panel de administración comercial y base de datos relacional en la nube con **Neon PostgreSQL**.

---

## 🚀 Enlaces de Acceso Rápido (Servidor Local)

Con el servidor backend iniciado (`http://localhost:3000`), accede directamente a cada módulo:

| Módulo | Descripción | Enlace Directo |
| :--- | :--- | :--- |
| 🏠 **Inicio** | Página principal de presentación y bienvenida | [http://localhost:3000](http://localhost:3000) |
| 📱 **Menú QR (Clientes)** | Carta digital interactiva, selección de mesa, carrito y pedidos en vivo | [http://localhost:3000/paginas/menu.html](http://localhost:3000/paginas/menu.html) |
| 🔥 **Cocina (KDS)** | Pantalla para pizzeros: tickets en tiempo real (*Recibido* ➔ *Al Horno* ➔ *En Mesa*) | [http://localhost:3000/cocina.html](http://localhost:3000/cocina.html) |
| 💵 **Caja (POS)** | Control de cuentas por mesa, cobros (Efectivo / Yape / Tarjeta) y boletas fiscales | [http://localhost:3000/caja.html](http://localhost:3000/caja.html) |
| ⚙️ **Administración** | Dashboard general de ventas, métricas, historial de pedidos y catálogo de productos | [http://localhost:3000/admin.html](http://localhost:3000/admin.html) |
| ℹ️ **Nosotros** | Historia, concepto y filosofía gastronómica | [http://localhost:3000/paginas/nosotros.html](http://localhost:3000/paginas/nosotros.html) |
| 📞 **Contacto** | Ubicación, horarios y formulario de reservas | [http://localhost:3000/paginas/contacto.html](http://localhost:3000/paginas/contacto.html) |

---

## 🛠️ Cómo Ejecutar el Proyecto

### Opción 1: Un Solo Clic (Recomendado en Windows)
Haz doble clic en el archivo:
```bash
iniciar_servidor.bat
```
Este script se ubica automáticamente en la carpeta del proyecto, verifica los componentes y arranca el backend en el puerto `3000`.

---

### Opción 2: Desde la Terminal (PowerShell o CMD)

1. **Abrir la terminal e ingresar a la carpeta del proyecto:**
   ```powershell
   cd "MVP PIZZERIA"
   ```

2. **Instalar dependencias (solo la primera vez):**
   ```powershell
   npm install
   ```

3. **Iniciar el servidor backend:**
   ```powershell
   node servidor.js
   ```
   *(o también `npm start`)*

4. **Confirmación en consola:**
   ```text
   🔗 Conectado a PostgreSQL Neon...
   ✅ Tabla "productos" lista.
   ✅ Tabla "pedidos" lista.
   🍕 SERVIDOR PIZZERÍA AL PASO CONECTADO A NEON BD
   🚀 Web local: http://localhost:3000
   ⏳ Servidor activo. Presiona Ctrl+C para detenerlo.
   ```

5. Abre en tu navegador cualquiera de los enlaces indicados arriba.

---

## 🧠 Motor de Recomendaciones Inteligentes (JEV)

El proyecto incorpora el motor gastronómico **JEV** estructurado en tres componentes:

1. **Reglas Contextuales:** Analiza variables de entorno (día de la semana, hora del servicio, composición actual de la comanda).
2. **Market Basket Analysis (MBA):** Minería de patrones frecuentes de compra (*Support*, *Confidence* y *Lift*) conectada a los pedidos históricos reales de Neon PostgreSQL.
3. **Clasificador Naive Bayes:** Estimación probabilística con suavizado de Laplace para clasificar perfiles de comensales (*Individual*, *Pareja*, *Familiar*, *Grupal*) y sugerir maridajes ideales.

---

## 📦 Arquitectura del Software

```text
MVP PIZZERIA/
├── admin.html               # Panel de Administración comercial y métricas
├── caja.html                # Terminal de Caja (POS), cobros y boletas
├── cocina.html              # Pantalla KDS para pizzeros y despacho
├── index.html               # Landing page y bienvenida
├── db.js                    # Conexión pool a PostgreSQL Neon en la nube
├── servidor.js              # Backend Node.js / Express y API REST
├── package.json             # Dependencias del proyecto (express, pg, cors)
├── iniciar_servidor.bat     # Lanzador automático para Windows
│
├── jev/                     # Motor de Inteligencia Artificial Gastronómica
│   ├── motorJev.js          # Orquestador del asistente y recomendaciones
│   ├── marketBasket.js      # Algoritmo de Reglas de Asociación (MBA)
│   ├── naiveBayes.js        # Clasificador probabilístico Bayesiano
│   ├── datasetBenchmark.js  # Calibración gastronómica inicial
│   └── test_jev.js          # Pruebas unitarias de algoritmos
│
├── paginas/                 # Vistas del cliente
│   ├── menu.html            # Carta digital interactiva con asistente JEV
│   ├── nosotros.html        # Página institucional
│   └── contacto.html        # Información de contacto y reservas
│
├── scripts/                 # Lógica frontend
│   ├── api.js               # Cliente de comunicación con backend y BroadcastChannel
│   ├── global.js            # Carrito en tiempo real, selector de mesa y toast
│   ├── menu.js              # Renderizado de carta, filtros y sugerencias
│   ├── cocina.js            # Lógica KDS en tiempo real
│   ├── caja.js              # Flujo de cobros y emisión fiscal
│   └── admin.js             # Métricas y gestión de catálogo
│
└── estilos/                 # Hojas de estilo CSS modularizadas
    ├── global.css
    ├── menu.css
    ├── cocina.css
    ├── caja.css
    └── admin.css
```

---

## 👨‍💻 Autor & Colaborador
* **Autor / Propietario:** Jhamir Alexander (`jhamir735`)
* **Correo:** `jhmralexander@gmail.com`
* **Proyecto:** Pizza al Paso — Innovación y Transformación Digital
