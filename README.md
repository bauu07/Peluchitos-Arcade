# Peluchitos Arcade

Tienda online de peluches con estilo de videojuego viejo (8 bits).
Front: HTML + CSS + jQuery (`public/js/tienda.js`). Back: Node + Express. Base de datos: MySQL en Docker.

## Cómo correrlo (en WSL o PowerShell)

1. Instalar dependencias:
   npm install
2. Levantar MySQL con Docker (crea tablas y carga los 15 productos solos):
   docker compose up -d
3. Iniciar el servidor:
   npm start
4. Abrir http://localhost:3000

Si Docker está apagado, la tienda igual abre con algunos productos de respaldo.

## Endpoints
- GET  /api/productos?categoria=pusheen
- POST /api/pedidos  { cliente, items:[{id, cantidad}] }
- GET  /api/estado

## Ver los pedidos guardados
docker exec -it peluches-mysql mysql -uroot -proot1234 peluches -e "SELECT * FROM pedidos;"

## Cambiar el gatito de los botones
Reemplazá `public/img/gatito.svg` por tu propia imagen de Pusheen (mismo nombre, o editá el HTML).
