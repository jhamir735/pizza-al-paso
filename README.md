# Pizza al Paso - Sistema Web de Autoservicio QR

Sistema integral de autoservicio digital para restaurante y pizzeria. Desarrollado con arquitectura web desacoplada, incluye carta digital con pedidos mediante codigo QR en mesa, pantalla de despacho para cocina (KDS), terminal de punto de venta (POS) para control de cobros y facturacion, panel de administracion comercial y persistencia relacional en la nube mediante Neon PostgreSQL.

---

## Acceso Publico en la Nube (Despliegue Online 24/7)

El sistema se encuentra desplegado y activo en internet. Cualquier integrante del equipo, docente o usuario puede acceder directamente desde su navegador (movil, tablet o computadora) sin necesidad de instalar programas ni encender un servidor local:

| Modulo | Descripcion | Enlace en la Nube |
| :--- | :--- | :--- |
| **Inicio** | Portal principal del restaurante | [https://pizza-al-paso.onrender.com](https://pizza-al-paso-1.onrender.com/) |
| **Menu QR (Clientes)** | Carta digital, seleccion de mesa, carrito y comanda en vivo | [https://pizza-al-paso.onrender.com/paginas/menu.html](https://pizza-al-paso-1.onrender.com/) |
| **Cocina (KDS)** | Pantalla para pizzeros (Recibido, Al Horno, En Mesa) | [https://pizza-al-paso.onrender.com/cocina.html](https://pizza-al-paso-1.onrender.com/cocina.html) |
| **Caja (POS)** | Registro de cobros (Efectivo, Yape/Plin, Tarjetas) y boletas | [https://pizza-al-paso.onrender.com/caja.html](https://pizza-al-paso-1.onrender.com/caja.html) |
| **Administracion** | Panel de metricas, ventas y catalogo de productos | [https://pizza-al-paso.onrender.com/admin.html](https://pizza-al-paso-1.onrender.com/admin.html) |

*Nota sobre el servidor en la nube:* La instancia gratuita entra en reposo tras periodos de inactividad. Si el sitio no ha recibido visitas recientes, la primera carga puede tomar entre 30 y 45 segundos mientras reactiva el servicio. Luego de esto, la navegacion opera de forma inmediata.

---

## Guia de Ejecucion Local (Para Desarrolladores y Colaboradores)

Si un compañero o evaluador desea ejecutar el proyecto de forma local en su propia computadora, el procedimiento es el siguiente:

### Paso 1: Obtener el codigo
1. En la pagina principal del repositorio, hacer clic en el boton verde **Code**.
2. Seleccionar **Download ZIP** y descomprimir el archivo en cualquier carpeta del equipo (o clonar mediante `git clone https://github.com/jhamir735/pizza-al-paso.git`).

### Paso 2: Iniciar el servidor

#### Opcion A (Recomendada en Windows - Sin configuracion):
Hacer doble clic sobre el archivo ejecutable:
```bash
iniciar_servidor.bat
```
El archivo se posiciona de manera automatica en el directorio del proyecto, valida la estructura y levanta el servidor backend en el puerto local 3000.

#### Opcion B (Por consola o terminal):
1. Abrir la terminal (PowerShell, CMD o Bash) y posicionarse en la carpeta del proyecto:
   ```bash
   cd "MVP PIZZERIA"
   ```
2. Instalar dependencias de Node.js:
   ```bash
   npm install
   ```
3. Iniciar el servicio:
   ```bash
   node servidor.js
   ```
   o mediante npm:
   ```bash
   npm start
   ```

### Paso 3: Acceso a rutas locales
Una vez levantado el servidor local, ingresar en el navegador:
* Inicio: `http://localhost:3000`
* Menu Clientes: `http://localhost:3000/paginas/menu.html`
* Cocina KDS: `http://localhost:3000/cocina.html`
* Caja POS: `http://localhost:3000/caja.html`
* Administracion: `http://localhost:3000/admin.html`

*Nota sobre la base de datos:* La conexion a Neon PostgreSQL se encuentra centralizada y configurada en el proyecto, por lo que tanto el despliegue en la nube como las ejecuciones locales sincronizan sobre la misma base de datos remota sin requerir configuraciones de bases de datos locales.

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
