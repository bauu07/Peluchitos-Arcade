// Lógica de la tienda con jQuery: catálogo, filtros y carrito (guardado en localStorage)
$(function () {
  const plata = n => '$' + Number(n).toLocaleString('es-AR');
  let productos = [];
  let carrito = JSON.parse(localStorage.getItem('carritoPeluches') || '[]'); // [{id, cantidad}]

  const guardar = () => localStorage.setItem('carritoPeluches', JSON.stringify(carrito));
  // Foto del producto: usa la imagen si existe y, si no, el emoji
  const foto = p => p.imagen ? `<img src="${encodeURI(p.imagen)}" alt="" loading="lazy">` : p.emoji;
  // Modo demo: si no hay servidor (por ejemplo en GitHub Pages) se usa data/productos.json
  let modoEstatico = false;
  const vendidos = () => { try { return JSON.parse(localStorage.getItem('stockDemo') || '{}'); } catch (e) { return {}; } };
  const catalogo = cat => $.getJSON('api/productos' + (cat ? '?categoria=' + cat : ''))
    .catch(() => {
      modoEstatico = true;
      return $.getJSON('data/productos.json').then(lista => {
        const v = vendidos();
        return lista.filter(p => !cat || p.categoria === cat)
          .map(p => ({ ...p, stock: Math.max(0, p.stock - (v[p.id] || 0)) }));
      });
    });
  const buscar = id => productos.find(p => p.id === id);

  function cargar(cat) {
    catalogo(cat)
      .done(data => {
        // el catálogo completo sirve para armar el carrito
        if (!cat) productos = data; else data.forEach(p => { if (!buscar(p.id)) productos.push(p); });
        dibujarGrilla(data);
        dibujarCarrito();
      })
      .fail(() => $('#grilla').html('<p>No se pudo cargar el catálogo. ¿Está corriendo el servidor?</p>'));
  }

  function dibujarGrilla(lista) {
    $('#grilla').html(lista.map(p => `
      <article class="tarjeta" data-cat="${p.categoria}">
        <div class="foto" aria-hidden="true">${foto(p)}</div>
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <span class="precio">${plata(p.precio)}</span>
        <span class="stock">Quedan ${p.stock}</span>
        <button class="btn chico agregar" data-id="${p.id}" ${p.stock < 1 ? 'disabled' : ''}>
          <img src="img/gatito.svg" alt="" width="30"> Agregar
        </button>
      </article>`).join(''));
  }

  function dibujarCarrito() {
    const $ul = $('#items').empty();
    let total = 0, cantidad = 0;
    carrito.forEach(it => {
      const p = buscar(it.id); if (!p) return;
      total += p.precio * it.cantidad; cantidad += it.cantidad;
      $ul.append(`
        <li class="item">
          <span class="emo">${foto(p)}</span>
          <span>${p.nombre}<br>${plata(p.precio)}</span>
          <span class="cant">
            <button data-menos="${p.id}" aria-label="Quitar uno">-</button>
            <b>${it.cantidad}</b>
            <button data-mas="${p.id}" aria-label="Sumar uno">+</button>
          </span>
        </li>`);
    });
    if (!carrito.length) $ul.append('<li>Todavía no agregaste peluches.</li>');
    $('#total').text(plata(total));
    $('#contador').text(cantidad);
  }

  function cambiar(id, delta) {
    const it = carrito.find(c => c.id === id);
    const p = buscar(id);
    if (!it && delta > 0) carrito.push({ id, cantidad: 1 });
    else if (it) {
      it.cantidad = Math.min(it.cantidad + delta, p ? p.stock : 99);
      if (it.cantidad <= 0) carrito = carrito.filter(c => c.id !== id);
    }
    guardar(); dibujarCarrito();
  }

  const abrir = v => {
    $('#carrito').toggleClass('abierto', v).attr('aria-hidden', !v);
    $('#velo').prop('hidden', !v);
  };

  // Eventos
  $('#filtros').on('click', '.btn', function () {
    $('#filtros .btn').removeClass('activo'); $(this).addClass('activo');
    cargar($(this).data('cat'));
  });
  $('#grilla').on('click', '.agregar', function () { cambiar(Number($(this).data('id')), 1); abrir(true); });
  $('#items').on('click', '[data-mas]', function () { cambiar(Number($(this).data('mas')), 1); });
  $('#items').on('click', '[data-menos]', function () { cambiar(Number($(this).data('menos')), -1); });
  $('#abrirCarrito').on('click', () => abrir(true));
  $('#cerrarCarrito, #velo').on('click', () => abrir(false));
  $(document).on('keydown', e => { if (e.key === 'Escape') abrir(false); });
  $('#vaciar').on('click', () => { carrito = []; guardar(); dibujarCarrito(); });

  // ---- Pago con tarjeta ----
  const luhn = n => { let s = 0, d = false;
    for (let i = n.length - 1; i >= 0; i--) { let x = +n[i]; if (d) { x *= 2; if (x > 9) x -= 9; } s += x; d = !d; }
    return n.length >= 13 && s % 10 === 0; };
  const marcaDe = n => /^4/.test(n) ? 'VISA' : /^(5[1-5]|2[2-7])/.test(n) ? 'MASTERCARD' : /^3[47]/.test(n) ? 'AMEX' : '';
  const solo = v => v.replace(/\D/g, '');

  $('#numero').on('input', function () {
    const n = solo(this.value).slice(0, 19);
    this.value = n.replace(/(.{4})/g, '$1 ').trim();
    $('#marca').text(marcaDe(n));
  });
  $('#vence').on('input', function () {
    const n = solo(this.value).slice(0, 4);
    this.value = n.length > 2 ? n.slice(0, 2) + '/' + n.slice(2) : n;
  });
  $('#cvv').on('input', function () { this.value = solo(this.value).slice(0, 4); });

  function errorTarjeta(num, vence, cvv) {
    if (!luhn(num)) return ['#numero', 'El número de tarjeta no es válido.'];
    const m = /^(\d{2})\/(\d{2})$/.exec(vence);
    if (!m || +m[1] < 1 || +m[1] > 12) return ['#vence', 'Vencimiento inválido. Usá el formato MM/AA.'];
    if (new Date(2000 + +m[2], +m[1], 1) <= new Date()) return ['#vence', 'La tarjeta está vencida.'];
    if (!/^\d{3,4}$/.test(cvv)) return ['#cvv', 'El código de seguridad debe tener 3 o 4 números.'];
    return null;
  }
  const msg = (t, color) => $('#mensaje').css('color', color).text(t);

  // Pedido real (servidor) o simulado en el navegador (modo demo)
  function pedidoDemo(p) {
    const d = $.Deferred(), num = p.tarjeta.numero, v = vendidos();
    if (num.endsWith('0002')) return d.reject({ responseJSON: { error: 'Pago rechazado por el banco (tarjeta de prueba 0002)' } }).promise();
    for (const it of p.items) {
      const pr = buscar(it.id);
      if (!pr || pr.stock < it.cantidad) return d.reject({ responseJSON: { error: 'Sin stock suficiente' } }).promise();
    }
    p.items.forEach(it => { v[it.id] = (v[it.id] || 0) + it.cantidad; });
    try { localStorage.setItem('stockDemo', JSON.stringify(v)); } catch (e) {}
    return d.resolve({ pedido: Math.floor(Math.random() * 9000) + 1000, marca: marcaDe(num), ultimos4: num.slice(-4) }).promise();
  }
  const pedir = p => modoEstatico ? pedidoDemo(p) : $.ajax({
    url: 'api/pedidos', method: 'POST', contentType: 'application/json', data: JSON.stringify(p) });

  $('#formPago').on('submit', function (e) {
    e.preventDefault();
    $('#formPago input').removeClass('mal');
    const cliente = $('#cliente').val().trim();
    const num = solo($('#numero').val()), vence = $('#vence').val(), cvv = $('#cvv').val();
    if (!carrito.length) return msg('Agregá al menos un peluche.', '#ffd84d');
    if (!cliente) { $('#cliente').addClass('mal').focus(); return msg('Escribí tu nombre para confirmar.', '#ffd84d'); }
    const err = errorTarjeta(num, vence, cvv);
    if (err) { $(err[0]).addClass('mal').focus(); return msg(err[1], '#ff8fb1'); }

    $('#comprar').prop('disabled', true);
    msg('Procesando el pago…', '#ffd84d');
    pedir({ cliente, tarjeta: { numero: num, vence, cvv },
      items: carrito.map(c => ({ id: c.id, cantidad: c.cantidad })) }).done(r => {
      msg('¡Pago aprobado! Pedido #' + r.pedido + ' · ' + r.marca + ' terminada en ' + r.ultimos4 + '. Pusheen está feliz.' + (modoEstatico ? ' (Modo demo: no se guardó ningún pedido.)' : ''), '#6fcf4f');
      carrito = []; guardar(); dibujarCarrito(); this.reset(); $('#marca').text('');
      cargar($('#filtros .activo').data('cat'));
    }).fail(x => msg((x.responseJSON && x.responseJSON.error) || 'Error al pagar', '#ff8fb1'))
      .always(() => $('#comprar').prop('disabled', false));
    $('#cvv').val(''); // el código nunca queda en pantalla
  });

  $.getJSON('api/estado').done(e => {
    if (!e.baseDeDatos) $('#aviso').prop('hidden', false).text('Modo sin base de datos: levantá Docker para ver todo el catálogo.');
  }).fail(() => $('#aviso').prop('hidden', false).text('Modo demo: esta versión online no tiene servidor ni base de datos, así que los pedidos no se guardan.'));
  cargar('');
});
