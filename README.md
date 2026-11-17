# Pizza al Paso - Sistema Web de Autoservicio QR

Sistema integral de autoservicio digital para restaurante y pizzeria. Desarrollado con arquitectura web desacoplada, incluye carta digital con pedidos mediante codigo QR en mesa, pantalla de despacho para cocina (KDS), terminal de punto de venta (POS) para control de cobros y facturacion, panel de administracion comercial y persistencia relacional en la nube mediante Neon PostgreSQL.

---

## Modulos del Sistema

Con el servidor backend en ejecucion, los modulos se encuentran accesibles en las siguientes rutas:

| Modulo | Descripcion | Ruta Local |
| :--- | :--- | :--- |
| **Inicio** | Portal principal del restaurante | `http://localhost:3000` |
| **Menu QR (Clientes)** | Carta digital interactiva, seleccion de mesa, carrito y envio de pedidos | `http://localhost:3000/paginas/menu.html` |
| **Cocina (KDS)** | Pantalla para pizzeros y control de estados (Recibido, Al Horno, En Mesa) | `http://localhost:3000/cocina.html` |
| **Caja (POS)** | Registro de cobros (Efectivo, Yape/Plin, Tarjetas) y emision de comprobantes | `http://localhost:3000/caja.html` |
| **Administracion** | Panel de control de ventas, metricas, gestion de pedidos y catalogo | `http://localhost:3000/admin.html` |
| **Nosotros** | Informacion institucional del restaurante | `http://localhost:3000/paginas/nosotros.html` |
| **Contacto** | Ubicacion, canales de atencion y reservas | `http://localhost:3000/paginas/contacto.html` |

---

## Guia de Ejecucion

### Opcion 1: Ejecucion directa en Windows
Ejecutar el archivo por lotes ubicado en la raiz:
```bash
iniciar_servidor.bat
```
El script se posiciona de forma automatica en el directorio del proyecto y levanta el servidor backend en el puerto 3000.

---

### Opcion 2: Ejecucion por consola

1. Abrir la terminal y ubicarse en la carpeta del proyecto:
   ```bash
   cd "MVP PIZZERIA"
   ```

2. Instalar las dependencias de Node.js:
   ```bash
   npm install
   ```

3. Iniciar el servidor:
   ```bash
   node servidor.js
   ```
   o alternativamente:
   ```bash
   npm start
   ```

4. Salida esperada en consola:
   ```text
   Conectado a PostgreSQL Neon...
   Tabla "productos" lista.
   Tabla "pedidos" lista.
   SERVIDOR PIZZERIA AL PASO CONECTADO A NEON BD
   Web local: http://localhost:3000
   Servidor activo. Presiona Ctrl+C para detenerlo.
   ```

---

## Motor de Recomendaciones JEV

El sistema cuenta con un motor algoritmico de sugerencias gastronomicas implementado en backend:

1. **Reglas Contextuales:** Evaluacion en tiempo de ejecucion segun variables temporales (dia de la semana, franja horaria) y composicion de la comanda actual.
2. **Market Basket Analysis (MBA):** Mineria de patrones de compra frecuentes calculando metricas de Soporte (Support), Confianza (Confidence) y Elevacion (Lift) directamente sobre el historial transaccional en PostgreSQL.
3. **Clasificador Probabilistico Naive Bayes:** Modelo bayesiano con suavizado de Laplace para estimar la tipologia de consumo (Individual, Pareja, Familiar o Grupal) y predecir maridajes de acompañamientos y bebidas.

---

## Estructura del Proyecto

```text
MVP PIZZERIA/
|-- admin.html               # Panel de administracion
|-- caja.html                # Terminal de cobros y caja POS
|-- cocina.html              # Pantalla KDS de cocina
|-- index.html               # Pagina de inicio del cliente
|-- db.js                    # Conexion a Neon PostgreSQL
|-- servidor.js              # Servidor API REST en Express
|-- package.json             # Manifiesto y dependencias npm
|-- iniciar_servidor.bat     # Lanzador para entorno Windows
|
|-- jev/                     # Motor algoritmico de recomendacion
|   |-- motorJev.js          # Orquestador del motor
|   |-- marketBasket.js      # Implementacion de reglas de asociacion
|   |-- naiveBayes.js        # Clasificador Naive Bayes con Laplace
|   |-- datasetInicial.js    # Dataset de calibracion
|   `-- test_jev.js          # Pruebas unitarias de algoritmos
|
|-- paginas/                 # Vistas del cliente
|   |-- menu.html            # Carta digital y asistente
|   |-- nosotros.html        # Pagina nosotros
|   `-- contacto.html        # Pagina de contacto
|
|-- scripts/                 # Logica de cliente (Frontend)
|   |-- api.js               # Comunicacion con backend y sincronizacion
|   |-- global.js            # Carrito de compras y simulador QR
|   |-- menu.js              # Renderizado de carta y sugerencias
|   |-- cocina.js            # Gestion de tickets KDS
|   |-- caja.js              # Logica de cobros y boletas
|   `-- admin.js             # Gestion de metricas y catalogo
|
`-- estilos/                 # Hojas de estilo CSS
    |-- global.css
    |-- menu.css
    |-- cocina.css
    |-- caja.css
    `-- admin.css
```

---

## Autor

* **Desarrollador:** Jhamir Alexander
* **Correo:** jhmralexander@gmail.com
* **Proyecto:** Pizza al Paso - Transformacion Digital y Autoservicio QR
