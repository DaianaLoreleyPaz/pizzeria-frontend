// Mapeo estado
function indiceAEstadoEnum(index) {
  const estados = ['PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO'];
  return estados[index] || 'PENDIENTE';
}

// Guardar (crear) pedido
document.getElementById('pedidoForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  const pedido = {
    nombreYApellidoCliente: formData.get('cliente'),
    demoraEstimada: parseFloat(formData.get('demora')),
    fecha: formData.get('fecha'),
    horaDeEntrega: formData.get('horaEntrega'),
    estado: indiceAEstadoEnum(parseInt(formData.get('estado'))),
    detallesDelPedido: []
  };

  // Esta lógica de leer '.cantidad-input' aún no tiene efecto,
  // pero la incluimos como parte de "vincular el formulario"
  document.querySelectorAll('.cantidad-input').forEach(input => {
    const cantidad = parseInt(input.value);
    const id = parseInt(input.dataset.id);
    if (cantidad > 0) {
      pedido.detallesDelPedido.push({
        idProducto: id,
        cantidad: cantidad
      });
    }
  });

  if (pedido.detallesDelPedido.length === 0) {
    Swal.fire({
          icon: 'warning',
          title: 'Error',
          text: 'Debe seleccionar al menos un producto con cantidad válida'
        });
    return;
  }

  // En este commit, AÚN NO editamos, solo creamos
  const url = 'http://localhost:8080/pedido/create';
  const method = 'POST';

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedido)
  })
    .then(response => {
      if (!response.ok) throw new Error('Error al guardar');
      return response.json();
    })
    .then(() => {
       Swal.fire({
        icon: 'success',
        title: 'Pedido guardado',
        text: 'Pedido guardado correctamente'
      });
      // listarDetallesPedido(); // <- Aún no existe
      document.getElementById('pedidoForm').reset();
      // document.getElementById('productosSeleccionados').innerHTML = ''; // <- Aún no existe
    })
    .catch(error => {
       Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al guardar el pedido'
      });
    });
});