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
  { id: 1, nombre: 'Pusheen clásica', categoria: 'pusheen', precio: 18500, emoji: '🐱', descripcion: 'Gatita gris de rayas, súper blandita. La de siempre.', stock: 12, imagen: 'img/productos/pusheen-clasica.jpg' },
  { id: 7, nombre: 'Hello Kitty overol', categoria: 'kitty', precio: 19000, emoji: '🎀', descripcion: 'La clásica con moño rojo y overol azul.', stock: 10, imagen: 'img/productos/kitty-overol.jpg' },
  { id: 14, nombre: 'Girasol', categoria: 'pvz', precio: 15500, emoji: '🌻', descripcion: 'Produce soles de felpa. Cuidado con los zombis.', stock: 9, imagen: 'img/productos/pvz-girasol.jpg' },
  { id: 19, nombre: 'Perro salchicha', categoria: 'perros', precio: 14500, emoji: '🌭', descripcion: 'Disfrazado de pancho: largo, larguísimo, ideal para abrazar.', stock: 11, imagen: 'img/productos/perro-salchicha.jpg' },
  { id: 25, nombre: 'Gato negro', categoria: 'gatos', precio: 14000, emoji: '🐈‍⬛', descripcion: 'Ojos grandes y dorados. Trae buena suerte.', stock: 10, imagen: 'img/productos/gato-negro.jpg' },
  { id: 29, nombre: 'Frazada Pusheen unicornio', categoria: 'frazadas', precio: 33500, emoji: '🌈', descripcion: 'Frazada polar lila de 1,25 x 1,5 m con Pusheen unicornio.', stock: 5, imagen: 'img/productos/frazada-pusheen-unicornio.jpg' },
];

let pool = null;
(async () => {
  try {
    pool = mysql.createPool({ ...config, waitForConnections: true, connectionLimit: 5 });
    await pool.query('SELECT 1');
    console.log('✔ MySQL conectado');
    // Migración: agrega las columnas de pago si la base ya existía sin ellas
    for (const [tabla, col, def] of [['pedidos', 'pago_marca', 'VARCHAR(12) NULL'], ['pedidos', 'pago_ultimos4', 'CHAR(4) NULL'], ['productos', 'imagen', 'VARCHAR(120) NULL']]) {
      const [c] = await pool.query(
        'SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?', [tabla, col]);
      if (!c.length) await pool.query('ALTER TABLE ' + tabla + ' ADD COLUMN ' + col + ' ' + def);
    }
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

// Validación de tarjeta (simulada: no hay pasarela real). Nunca se guarda el número completo ni el CVV.
const luhn = n => { let s = 0, d = false;
  for (let i = n.length - 1; i >= 0; i--) { let x = +n[i]; if (d) { x *= 2; if (x > 9) x -= 9; } s += x; d = !d; }
  return s % 10 === 0; };
const marcaDe = n => /^4/.test(n) ? 'VISA' : /^(5[1-5]|2[2-7])/.test(n) ? 'MASTERCARD' : /^3[47]/.test(n) ? 'AMEX' : 'TARJETA';

function validarTarjeta(t) {
  if (!t) return { error: 'Faltan los datos de la tarjeta' };
  const num = String(t.numero || '').replace(/\D/g, '');
  if (num.length < 13 || num.length > 19 || !luhn(num)) return { error: 'Número de tarjeta inválido' };
  const m = /^(\d{2})\/(\d{2})$/.exec(String(t.vence || ''));
  if (!m || +m[1] < 1 || +m[1] > 12) return { error: 'Vencimiento inválido (MM/AA)' };
  if (new Date(2000 + +m[2], +m[1], 1) <= new Date()) return { error: 'La tarjeta está vencida' };
  if (!/^\d{3,4}$/.test(String(t.cvv || ''))) return { error: 'Código de seguridad inválido' };
  if (num.endsWith('0002')) return { error: 'Pago rechazado por el banco (tarjeta de prueba 0002)' };
  return { marca: marcaDe(num), ultimos4: num.slice(-4) };
}

app.post('/api/pedidos', async (req, res) => {
  const { cliente, items } = req.body || {};
  if (!cliente || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Falta el nombre o el carrito está vacío' });
  }
  const pago = validarTarjeta(req.body.tarjeta);
  if (pago.error) return res.status(400).json({ error: pago.error });
  if (!pool) {
    return res.json({ ok: true, pedido: Math.floor(Math.random() * 9000) + 1000, guardado: false, ...pago });
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
    const [r] = await conn.query('INSERT INTO pedidos (cliente, total, pago_marca, pago_ultimos4) VALUES (?, ?, ?, ?)', [String(cliente).slice(0, 80), total, pago.marca, pago.ultimos4]);
    for (const [pid, cant, pu] of lineas) {
      await conn.query('INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unit) VALUES (?,?,?,?)', [r.insertId, pid, cant, pu]);
    }
    await conn.commit();
    res.json({ ok: true, pedido: r.insertId, total, guardado: true, ...pago });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Tienda en http://localhost:' + PORT));
