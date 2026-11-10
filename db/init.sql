CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  categoria ENUM('pusheen','kitty','pvz','perros','gatos','frazadas') NOT NULL,
  precio INT NOT NULL,
  emoji VARCHAR(8) NOT NULL,
  descripcion VARCHAR(160) NOT NULL,
  stock INT NOT NULL DEFAULT 10
) CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente VARCHAR(80) NOT NULL,
  total INT NOT NULL,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS pedido_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unit INT NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
) CHARACTER SET utf8mb4;

INSERT INTO productos (nombre, categoria, precio, emoji, descripcion, stock) VALUES
('Pusheen clásica',      'pusheen',  18500, '🐱', 'Gatita gris de rayas, 30 cm. Súper blandita.', 12),
('Pusheen con donut',    'pusheen',  21000, '🍩', 'Viene abrazada a su donut rosa.', 8),
('Pusheen unicornio',    'pusheen',  23500, '🦄', 'Con cuerno y cola de colores.', 6),
('Hello Kitty lazo rojo','kitty',    19800, '🎀', 'La clásica, con su moño rojo.', 10),
('Hello Kitty mini',     'kitty',     9800, '💖', 'Tamaño llavero, para la mochila.', 20),
('Girasol',              'pvz',      15500, '🌻', 'Produce soles de felpa. Cuidado con los zombis.', 9),
('Lanzaguisantes',       'pvz',      16500, '🌱', 'Dispara guisantes (de mentira) a toda hora.', 9),
('Zombi con cono',       'pvz',      17500, '🧟', 'Peluche zombi con cono. Solo quiere cerebros... y mimos.', 7),
('Perro salchicha',      'perros',   14500, '🌭', 'Largo, larguísimo, ideal para abrazar.', 11),
('Labrador dorado',      'perros',   22000, '🐶', 'Tamaño grande, 50 cm.', 5),
('Gato naranja',         'gatos',    14000, '🐈', 'Gordito y dormilón, como todo gato naranja.', 10),
('Gato negro',           'gatos',    14000, '🐈‍⬛', 'Ojos verdes bordados. Trae buena suerte.', 10),
('Frazada Pusheen',      'frazadas', 32000, '🛏️', 'Frazada polar 1,5 x 1 m con Pusheen estampada.', 6),
('Frazada Hello Kitty',  'frazadas', 32000, '🧸', 'Frazada polar rosa con lazos.', 6),
('Frazada Plants vs Zombies','frazadas', 34500, '🌿', 'Jardín de plantas contra zombis para el sillón.', 4);
