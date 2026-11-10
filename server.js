// Servidor Express + MySQL (con respaldo en memoria si no hay base de datos)
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root1234',
  database: process.env.DB_NAME || 'peluches',
};

// Productos de respaldo: la tienda funciona aunque Docker esté apagado
const respaldo = [
  { id: 1, nombre: 'Pusheen clásica', categoria: 'pusheen', precio: 18500, emoji: '🐱', descripcion: 'Gatita gris de rayas, 30 cm.', stock: 12 },
  { id: 4, nombre: 'Hello Kitty lazo rojo', categoria: 'kitty', precio: 19800, emoji: '🎀', descripcion: 'La clásica, con su moño rojo.', stock: 10 },
  { id: 6, nombre: 'Girasol', categoria: 'pvz', precio: 15500, emoji: '🌻', descripcion: 'Produce soles de felpa.', stock: 9 },
  { id: 9, nombre: 'Perro salchicha', categoria: 'perros', precio: 14500, emoji: '🌭', descripcion: 'Largo, larguísimo.', stock: 11 },
  { id: 11, nombre: 'Gato naranja', categoria: 'gatos', precio: 14000, emoji: '🐈', descripcion: 'Gordito y dormilón.', stock: 10 },
  { id: 13, nombre: 'Frazada Pusheen', categoria: 'frazadas', precio: 32000, emoji: '🛏️', descripcion: 'Frazada polar con Pusheen.', stock: 6 },
];

let pool = null;
(async () => {
  try {
    pool = mysql.createPool({ ...config, waitForConnections: true, connectionLimit: 5 });
    await pool.query('SELECT 1');
    console.log('✔ MySQL conectado');
  } catch (e) {
    pool = null;
    console.log('⚠ Sin MySQL (' + e.code + '). Usando productos de respaldo.');
  }
})();

app.get('/api/estado', (_req, res) => res.json({ baseDeDatos: !!pool }));

app.get('/api/productos', async (req, res) => {
  const { categoria } = req.query;
  try {
    if (!pool) {
      return res.json(categoria ? respaldo.filter(p => p.categoria === categoria) : respaldo);
    }
    const [rows] = categoria
      ? await pool.query('SELECT * FROM productos WHERE categoria = ? ORDER BY id', [categoria])
      : await pool.query('SELECT * FROM productos ORDER BY id');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'No se pudieron cargar los productos' });
  }
});

app.post('/api/pedidos', async (req, res) => {
  const { cliente, items } = req.body || {};
  if (!cliente || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Falta el nombre o el carrito está vacío' });
  }
  if (!pool) {
    return res.json({ ok: true, pedido: Math.floor(Math.random() * 9000) + 1000, guardado: false });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    const lineas = [];
    for (const it of items) {
      const cant = Math.max(1, parseInt(it.cantidad, 10) || 1);
      const [[p]] = await conn.query('SELECT id, precio, stock FROM productos WHERE id = ? FOR UPDATE', [it.id]);
      if (!p) throw new Error('Producto inexistente');
      if (p.stock < cant) throw new Error('Sin stock suficiente');
      total += p.precio * cant;
      lineas.push([p.id, cant, p.precio]);
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cant, p.id]);
    }
    const [r] = await conn.query('INSERT INTO pedidos (cliente, total) VALUES (?, ?)', [String(cliente).slice(0, 80), total]);
    for (const [pid, cant, pu] of lineas) {
      await conn.query('INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unit) VALUES (?,?,?,?)', [r.insertId, pid, cant, pu]);
    }
    await conn.commit();
    res.json({ ok: true, pedido: r.insertId, total, guardado: true });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Tienda en http://localhost:' + PORT));
