// Lógica de la tienda con jQuery: catálogo, filtros y carrito (guardado en localStorage)
$(function () {
  const plata = n => '$' + Number(n).toLocaleString('es-AR');
  let productos = [];
  let carrito = JSON.parse(localStorage.getItem('carritoPeluches') || '[]'); // [{id, cantidad}]

  const guardar = () => localStorage.setItem('carritoPeluches', JSON.stringify(carrito));
  const buscar = id => productos.find(p => p.id === id);

  function cargar(cat) {
    const url = '/api/productos' + (cat ? '?categoria=' + cat : '');
    $.getJSON(url)
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
        <div class="foto" aria-hidden="true">${p.emoji}</div>
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
          <span class="emo">${p.emoji}</span>
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

  $('#comprar').on('click', function () {
    const cliente = $('#cliente').val().trim();
    if (!carrito.length) return $('#mensaje').css('color', '#ffd84d').text('Agregá al menos un peluche.');
    if (!cliente) return $('#mensaje').css('color', '#ffd84d').text('Escribí tu nombre para confirmar.');
    $.ajax({
      url: '/api/pedidos', method: 'POST', contentType: 'application/json',
      data: JSON.stringify({ cliente, items: carrito.map(c => ({ id: c.id, cantidad: c.cantidad })) })
    }).done(r => {
      $('#mensaje').css('color', '#6fcf4f').text('¡Listo! Pedido #' + r.pedido + '. Pusheen está feliz.');
      carrito = []; guardar(); dibujarCarrito(); cargar($('#filtros .activo').data('cat'));
    }).fail(x => $('#mensaje').css('color', '#ff8fb1').text((x.responseJSON && x.responseJSON.error) || 'Error al comprar'));
  });

  $.getJSON('/api/estado').done(e => {
    if (!e.baseDeDatos) $('#aviso').prop('hidden', false).text('Modo sin base de datos: levantá Docker para ver todo el catálogo.');
  });
  cargar('');
});
