SET NAMES utf8mb4;
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  categoria ENUM('pusheen','kitty','pvz','perros','gatos','frazadas') NOT NULL,
  precio INT NOT NULL,
  emoji VARCHAR(8) NOT NULL,
  descripcion VARCHAR(160) NOT NULL,
  stock INT NOT NULL DEFAULT 10,
  imagen VARCHAR(120) NULL
) CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente VARCHAR(80) NOT NULL,
  total INT NOT NULL,
  pago_marca VARCHAR(12) NULL,
  pago_ultimos4 CHAR(4) NULL,
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

INSERT INTO productos (nombre, categoria, precio, emoji, descripcion, stock, imagen) VALUES
('Pusheen clásica', 'pusheen', 18500, '🐱', 'Gatita gris de rayas, súper blandita. La de siempre.', 12, 'img/productos/pusheen-clasica.jpg'),
('Pusheen con galleta', 'pusheen', 19500, '🍪', 'Abraza su galleta con chips de chocolate.', 10, 'img/productos/pusheen-galleta.jpg'),
('Pusheen panqueque', 'pusheen', 22000, '🥞', 'Torre de panqueques con jarabe. Imposible no abrazarla.', 7, 'img/productos/pusheen-panqueque.jpg'),
('Pusheen Miku', 'pusheen', 25500, '🎤', 'Edición especial con peluca turquesa y micrófono.', 3, 'img/productos/pusheen-miku.jpg'),
('Pusheen rollo de frutilla', 'pusheen', 21000, '🍓', 'Rosa, con frutilla arriba y cola rayada.', 8, 'img/productos/pusheen-rollo-frutilla.jpg'),
('Pusheen unicornio', 'pusheen', 23500, '🦄', 'Con cuerno plateado, melena y cola arcoíris.', 6, 'img/productos/pusheen-unicornio.jpg'),
('Hello Kitty overol', 'kitty', 19000, '🎀', 'La clásica con moño rojo y overol azul.', 10, 'img/productos/kitty-overol.jpg'),
('Hello Kitty osito', 'kitty', 24000, '🧸', 'Disfrazada de osito blanco con moñito rojo.', 6, 'img/productos/kitty-osito.jpg'),
('Hello Kitty frutilla', 'kitty', 26000, '🍓', 'Grande, con moño rosa y una frutilla en brazos.', 5, 'img/productos/kitty-frutilla.jpg'),
('Hello Kitty almohadón', 'kitty', 17500, '🛏️', 'Cara de Kitty en forma de almohadón para la cama.', 9, 'img/productos/kitty-almohadon.jpg'),
('Hello Kitty musculosa', 'kitty', 20000, '💪', 'La más fuerte del gimnasio. Abraza fuerte.', 3, 'img/productos/kitty-musculosa.jpg'),
('Hello Kitty mini frutilla', 'kitty', 9000, '🍓', 'Tamaño mini, vestida de frutilla.', 25, 'img/productos/kitty-mini-frutilla.jpg'),
('Pochacco con frutilla', 'kitty', 21500, '🐶', 'El perrito de Sanrio abrazando una frutilla gigante.', 8, 'img/productos/pochacco-frutilla.jpg'),
('Girasol', 'pvz', 15500, '🌻', 'Produce soles de felpa. Cuidado con los zombis.', 9, 'img/productos/pvz-girasol.jpg'),
('Lanzaguisantes doble', 'pvz', 16500, '🌱', 'Dispara guisantes (de mentira) por partida doble.', 9, 'img/productos/pvz-lanzaguisantes-doble.jpg'),
('Nuez', 'pvz', 14500, '🥔', 'Aguanta todo lo que le tiren. Ideal para defender el sillón.', 8, 'img/productos/pvz-nuez.jpg'),
('Calabaza gruñona', 'pvz', 15500, '🥒', 'Con cara de pocos amigos, pero blandita.', 6, 'img/productos/pvz-calabaza.jpg'),
('Zombi', 'pvz', 17500, '🧟', 'Peluche zombi con saco marrón. Solo quiere cerebros... y mimos.', 7, 'img/productos/pvz-zombi.jpg'),
('Perro salchicha', 'perros', 14500, '🌭', 'Disfrazado de pancho: largo, larguísimo, ideal para abrazar.', 11, 'img/productos/perro-salchicha.jpg'),
('Labrador dorado', 'perros', 22000, '🐶', 'Tamaño grande, mirada tierna y pelo súper suave.', 5, 'img/productos/perro-labrador.jpg'),
('Husky', 'perros', 21000, '🐺', 'Pelaje gris y blanco, ojos celestes. Se sienta solito.', 6, 'img/productos/perro-husky.jpg'),
('Perrito marrón', 'perros', 12500, '🐕', 'Redondito, mullido y con cachetes rosados.', 12, 'img/productos/perro-marron.jpg'),
('Snoopy', 'perros', 18500, '🐕', 'El beagle más famoso, blanco con orejas negras.', 8, 'img/productos/perro-snoopy.jpg'),
('Gato blanco manchado', 'gatos', 14000, '🐈', 'Gordito y dormilón, de los que ocupan todo el sillón.', 10, 'img/productos/gato-blanco.jpg'),
('Gato negro', 'gatos', 14000, '🐈‍⬛', 'Ojos grandes y dorados. Trae buena suerte.', 10, 'img/productos/gato-negro.jpg'),
('Gato calicó pixelado', 'gatos', 16000, '🐱', 'Gato calicó en versión pixelada, para fans del juego.', 8, 'img/productos/gato-minecraft.jpg'),
('Gato tiburón gris', 'gatos', 12500, '🦈', 'Gatito naranja disfrazado de tiburón. Muerde de mentira.', 14, 'img/productos/gato-tiburon-gris.jpg'),
('Gato tiburón azul', 'gatos', 13500, '🦈', 'Versión azul con ojos verdes y patitas rosas.', 12, 'img/productos/gato-tiburon-azul.jpg'),
('Frazada Pusheen unicornio', 'frazadas', 33500, '🌈', 'Frazada polar lila de 1,25 x 1,5 m con Pusheen unicornio.', 5, 'img/productos/frazada-pusheen-unicornio.jpg'),
('Frazada Pusheen chocolate caliente', 'frazadas', 32000, '☕', 'Frazada polar rosa con Pusheen, copos de nieve y chocolate caliente.', 6, 'img/productos/frazada-pusheen-chocolate.jpg'),
('Cubrecama Pusheen fin de semana', 'frazadas', 38000, '🎮', 'Ropa de cama con Pusheen durmiendo, donut y joystick.', 4, 'img/productos/cubrecama-pusheen.jpg'),
('Frazada Snoopy', 'frazadas', 32500, '🧸', 'Frazada polar rosa con Snoopy por todas partes.', 6, 'img/productos/frazada-snoopy.jpg'),
('Frazada Spider-Man', 'frazadas', 31000, '🕷️', 'Frazada roja con telaraña y los ojos del Hombre Araña.', 7, 'img/productos/frazada-spiderman.jpg'),
('Frazada de estrellas', 'frazadas', 28000, '⭐', 'Frazada celeste suavecita con estrellas blancas.', 8, 'img/productos/frazada-estrellas.jpg');
