# 🐱 Peluchitos Arcade

Tienda online de peluches con estilo de videojuego retro (8 bits). Se pueden ver los productos, filtrarlos por categoría, armar un carrito y pagar con tarjeta. Cada compra queda guardada en una base de datos.

Es un proyecto escolar: el pago con tarjeta es **simulado** (no se cobra dinero real).

---

## Índice

1. [¿Qué es y qué se puede hacer?](#qué-es-y-qué-se-puede-hacer)
2. [Tecnologías usadas](#tecnologías-usadas)
3. [Cómo funciona (explicado desde cero)](#cómo-funciona-explicado-desde-cero)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Requisitos](#requisitos)
6. [Instalación y uso paso a paso](#instalación-y-uso-paso-a-paso)
7. [Cómo comprar en la tienda](#cómo-comprar-en-la-tienda)
8. [Pago con tarjeta (simulado)](#pago-con-tarjeta-simulado)
9. [Base de datos](#base-de-datos)
10. [API (endpoints)](#api-endpoints)
11. [Personalizar la tienda](#personalizar-la-tienda)
12. [Problemas comunes](#problemas-comunes)
13. [Límites del proyecto](#límites-del-proyecto)

---

## Qué es y qué se puede hacer

Peluchitos Arcade vende peluches de seis categorías: **Pusheen, Hello Kitty, Plants vs Zombis, Perros, Gatos y Frazadas** (34 productos en total, cada uno con su foto).

La persona que visita la página puede:

- Ver todos los peluches con su foto (emoji), descripción, precio y stock disponible.
- Filtrar por categoría con los botones de arriba del catálogo.
- Agregar peluches al carrito y cambiar las cantidades con `+` y `-`.
- Cerrar la página y volver más tarde: **el carrito se guarda** en el navegador.
- Escribir su nombre y los datos de la tarjeta para confirmar la compra.
- Recibir un número de pedido cuando el pago es aprobado.

Al comprar, el stock de los productos baja automáticamente.

---

## Tecnologías usadas

| Parte | Tecnología | Para qué sirve |
|---|---|---|
| Página (front) | HTML, CSS y jQuery | Lo que ve y toca el usuario |
| Servidor (back) | Node.js + Express | Recibe los pedidos del navegador y responde |
| Base de datos | MySQL 8 | Guarda productos y pedidos |
| Contenedor | Docker Compose | Levanta MySQL sin instalarlo a mano |
| Tipografías | Press Start 2P y VT323 (Google Fonts) | El estilo de videojuego viejo |

---

## Cómo funciona (explicado desde cero)

Una página web como esta tiene tres partes que se hablan entre sí:

```
 NAVEGADOR                SERVIDOR                 BASE DE DATOS
 (index.html,   ──────►   (server.js)   ──────►    (MySQL en Docker)
  style.css,    ◄──────   Node + Express ◄──────   tablas: productos,
  tienda.js)                                        pedidos, pedido_items
```

1. **El navegador** descarga `index.html`, `style.css` y `tienda.js`. Esa es la tienda que ves.
2. Apenas carga, `tienda.js` le pide al servidor la lista de productos (`GET /api/productos`).
3. **El servidor** (`server.js`) le pregunta a MySQL y devuelve los productos en formato JSON.
4. `tienda.js` dibuja las tarjetas de productos en pantalla.
5. Cuando agregás algo al carrito, todo pasa en el navegador y se guarda en `localStorage` (una memoria chiquita del navegador). Por eso el carrito sigue ahí si recargás la página.
6. Cuando tocás **Pagar y confirmar**, el navegador valida los datos y se los manda al servidor (`POST /api/pedidos`).
7. El servidor vuelve a validar todo, **recalcula el total con los precios de la base de datos** (para que nadie pueda inventar precios), descuenta el stock y guarda el pedido.
8. El servidor responde con el número de pedido y la tienda muestra el mensaje de éxito.

### Modo de respaldo

Si MySQL no está encendido, el servidor **no se rompe**: usa una lista de 6 productos guardada en el propio código y avisa en pantalla con un cartel amarillo. En ese modo se puede probar todo, pero los pedidos no se guardan.

---

## Estructura del proyecto

```
peluchitos-arcade/
├── public/                 Todo lo que ve el navegador
│   ├── index.html          La estructura de la página
│   ├── css/style.css       Colores, tamaños y estilo 8 bits
│   ├── js/tienda.js        Catálogo, filtros, carrito y formulario de pago
│   └── img/
│       ├── gatito.svg      El gatito de los botones y el ícono de la pestaña
│       └── productos/      Las fotos de los 34 peluches
├── db/
│   └── init.sql            Crea las tablas y carga los 34 productos
├── server.js               El servidor: API, validación de tarjeta y pedidos
├── docker-compose.yml      Levanta MySQL en Docker
├── package.json            Dependencias y comandos de npm
└── README.md               Este archivo
```

---

## Requisitos

- [Node.js](https://nodejs.org) 18 o más nuevo
- [Docker](https://www.docker.com) (con Docker Compose)
- Git (solo si vas a clonar el repositorio)

Para comprobar que los tenés:

```bash
node -v
docker -v
git --version
```

---

## Instalación y uso paso a paso

Funciona en WSL, Linux, macOS o PowerShell.

**1. Conseguir el proyecto**

```bash
git clone https://github.com/TU_USUARIO/peluchitos-arcade.git
cd peluchitos-arcade
```

**2. Instalar las dependencias**

```bash
npm install
```

**3. Levantar la base de datos**

```bash
docker compose up -d
```

La primera vez, MySQL crea las tablas y carga los 34 productos solo. Puede tardar unos segundos en estar listo.

**4. Iniciar el servidor**

```bash
npm start
```

En la terminal tiene que aparecer `✔ MySQL conectado` y `Tienda en http://localhost:3000`.

**5. Abrir la tienda**

Entrá a **http://localhost:3000** desde el navegador.

**Para apagar todo**

- Servidor: `Ctrl + C` en la terminal.
- Base de datos: `docker compose down` (los datos se conservan).
- Base de datos borrando todos los datos: `docker compose down -v`.

> Modo desarrollo: `npm run dev` reinicia el servidor solo cada vez que cambiás `server.js`.

---

## Cómo comprar en la tienda

1. Elegí una categoría arriba, o dejá **Todos**.
2. Tocá **Agregar** en el peluche que quieras. Se abre el carrito a la derecha.
3. Con `+` y `-` cambiás la cantidad. No podés pedir más que el stock disponible.
4. Escribí tu **nombre** y los datos de la **tarjeta** (ver la siguiente sección).
5. Tocá **Pagar y confirmar**.
6. Si todo está bien, aparece el mensaje con tu número de pedido y el carrito se vacía.

El carrito se cierra con el botón **Cerrar**, tocando afuera o con la tecla `Esc`.

---

## Pago con tarjeta (simulado)

El formulario valida los datos igual que una tienda real, pero **no cobra nada**. Hay una pasarela de pagos que falta (ver [Límites](#límites-del-proyecto)).

**Qué se controla:**

- Número de tarjeta válido (algoritmo de Luhn, el mismo que usan los bancos).
- Vencimiento con formato `MM/AA` y que no esté vencida.
- Código de seguridad de 3 o 4 números.

Estas validaciones se hacen **dos veces**: en el navegador (para avisar rápido) y en el servidor (para que nadie se las saltee).

**Qué se guarda:** solo la marca (Visa, Mastercard, Amex) y los **últimos 4 dígitos**. El número completo y el código de seguridad **nunca se guardan**.

**Tarjetas de prueba:**

| Número | Resultado |
|---|---|
| `4242 4242 4242 4242` | Pago aprobado |
| `5555 5555 5555 4444` | Pago aprobado (Mastercard) |
| Cualquier número válido que termine en `0002` (ej. `4000 0000 0000 0002`) | Pago rechazado |

Usá cualquier vencimiento futuro (por ejemplo `12/30`) y cualquier código de 3 números.

---

## Base de datos

MySQL corre en Docker, en el puerto **3307** de tu compu (el 3306 queda libre por si ya tenés MySQL instalado).

**Tablas:**

| Tabla | Qué guarda |
|---|---|
| `productos` | Nombre, categoría, precio, emoji, foto, descripción y stock |
| `pedidos` | Cliente, total, fecha, marca de tarjeta y últimos 4 dígitos |
| `pedido_items` | Qué productos y cuántos se compraron en cada pedido, con el precio de ese momento |

**Ver los pedidos guardados:**

```bash
docker exec -it peluches-mysql mysql -uroot -proot1234 peluches -e "SELECT id, cliente, total, pago_marca, pago_ultimos4, creado FROM pedidos;"
```

**Ver qué compró cada cliente:**

```bash
docker exec -it peluches-mysql mysql -uroot -proot1234 peluches -e "SELECT p.id, p.cliente, pr.nombre, i.cantidad, i.precio_unit FROM pedidos p JOIN pedido_items i ON i.pedido_id = p.id JOIN productos pr ON pr.id = i.producto_id;"
```

**Base creada con una versión anterior:** al arrancar, el servidor agrega solo las columnas de pago que falten. Si preferís empezar de cero: `docker compose down -v && docker compose up -d`.

**Variables de entorno (opcionales):** el servidor usa estos valores por defecto y se pueden cambiar sin tocar el código.

| Variable | Por defecto |
|---|---|
| `PORT` | `3000` |
| `DB_HOST` | `127.0.0.1` |
| `DB_PORT` | `3307` |
| `DB_USER` | `root` |
| `DB_PASS` | `root1234` |
| `DB_NAME` | `peluches` |

---

## API (endpoints)

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/productos` | Devuelve todos los productos |
| GET | `/api/productos?categoria=pusheen` | Devuelve solo una categoría (`pusheen`, `kitty`, `pvz`, `perros`, `gatos`, `frazadas`) |
| POST | `/api/pedidos` | Valida el pago, descuenta stock y guarda el pedido |
| GET | `/api/estado` | Indica si la base de datos está conectada |

**Ejemplo de pedido:**

```json
POST /api/pedidos
{
  "cliente": "Ana Pérez",
  "tarjeta": { "numero": "4242424242424242", "vence": "12/30", "cvv": "123" },
  "items": [ { "id": 1, "cantidad": 2 }, { "id": 6, "cantidad": 1 } ]
}
```

**Respuesta si sale bien:**

```json
{ "ok": true, "pedido": 7, "total": 52500, "guardado": true, "marca": "VISA", "ultimos4": "4242" }
```

**Si algo falla** devuelve código 400 con un mensaje, por ejemplo `{ "error": "Sin stock suficiente" }`.

La compra es **todo o nada**: si un producto no tiene stock, no se guarda nada ni se descuenta nada de los demás.

---

## Personalizar la tienda

**Cambiar el gatito de los botones**
Reemplazá `public/img/gatito.svg` por tu imagen (con el mismo nombre) o cambiá la ruta en `index.html`.

**Cambiar los colores**
Están al principio de `public/css/style.css`, en el bloque `:root`. Cambiás el valor y se actualiza toda la página.

**Cambiar el tamaño general**
En `style.css`, la primera línea de `html{...}` controla la escala. Todo está en `rem`, así que si subís o bajás ese valor, se agranda o achica toda la página de forma pareja.

**Agregar un producto**
Copiá la foto a `public/img/productos/` (por ejemplo `pusheen-pirata.jpg`) y, con la base encendida:

```bash
docker exec -it peluches-mysql mysql -uroot -proot1234 peluches -e "INSERT INTO productos (nombre, categoria, precio, emoji, descripcion, stock, imagen) VALUES ('Pusheen pirata', 'pusheen', 20000, '🏴‍☠️', 'Con parche y espada.', 5, 'img/productos/pusheen-pirata.jpg');"
```

Para que los productos nuevos también aparezcan al reiniciar desde cero, agregalos también en `db/init.sql`.

**Agregar una categoría nueva**
Hay que tocar tres lugares: la lista `ENUM` de `db/init.sql`, un botón nuevo en `index.html` (con `data-cat="nombre"`) y, si querés color propio, una regla `.tarjeta[data-cat="nombre"]` en `style.css`. Como las bases ya creadas no se actualizan solas, hay que correr `docker compose down -v` y levantar de nuevo.

---

## Problemas comunes

| Síntoma | Qué hacer |
|---|---|
| Cartel amarillo "Modo sin base de datos" | Docker está apagado. Corré `docker compose up -d`, esperá unos segundos y reiniciá el servidor |
| `Sin MySQL (ECONNREFUSED)` en la terminal | Lo mismo: MySQL todavía no arrancó o Docker está apagado |
| `Error: Cannot find module 'express'` | Falta correr `npm install` |
| `port is already allocated` o `EADDRINUSE` | Otro programa usa el puerto. Cerralo o cambiá `PORT` (servidor) o el puerto `3307` en `docker-compose.yml` |
| "No se pudo cargar el catálogo" | El servidor no está corriendo. Corré `npm start` |
| La página se ve sin estilo | Entrá por `http://localhost:3000`, no abriendo `index.html` con doble clic |
| "Sin stock suficiente" | Se agotó ese peluche. Para reponer: `docker compose down -v && docker compose up -d` |

---

## Límites del proyecto

Es un trabajo escolar, así que algunas cosas están simplificadas a propósito:

- **El pago es simulado.** Para cobrar de verdad habría que integrar una pasarela (por ejemplo Mercado Pago) dentro de `POST /api/pedidos`.
- **No hay cuentas de usuario ni panel de administración.** Los productos se cambian desde la base de datos.
- **La contraseña de la base (`root1234`) es pública** en este repositorio. No la uses en ningún otro lado, y si publicás la tienda en internet, cambiala usando las variables de entorno.
- **No hay HTTPS.** Para datos de tarjetas reales sería obligatorio.

---

Hecho en la escuela con Node, Express, jQuery y MySQL · Pusheen te vigila 🐱
