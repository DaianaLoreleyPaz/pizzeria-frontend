
function listarDetallesPedido() {
  fetch('http://localhost:8080/pedido/readAll')
    .then(response => response.json())
    .then(pedidos => {
      const tbody = document.querySelector('#tablaPedidos tbody');
      tbody.innerHTML = '';
      pedidos.forEach(pedido => {
        pedido.detallesDelPedido.forEach(detalle => {
          const tr = document.createElement('tr');
      // Para cambiar el color del estado dependiendo su valor
          const claseEstado = pedido.estado.toLowerCase() === 'pendiente' ? 'text-danger'
                              : pedido.estado.toLowerCase() === 'listo' ? 'text-success'
                              : pedido.estado.toLowerCase() === 'entregado' ? 'text-dark'
                              : pedido.estado.toLowerCase() === 'preparando' ? 'text-warning'
                              : '';
          tr.innerHTML = `
            <td>${pedido.idPedido}</td>
            <td>${pedido.nombreYApellidoCliente || 'Sin cliente'}</td>
            <td>${detalle.nombreProducto}</td>
            <td>${detalle.tipo}</td>
            <td>${detalle.cantidad}</td>
            <td class="${claseEstado}">${pedido.estado}</td>
            <td>$${(detalle.subtotal / detalle.cantidad).toFixed(2)}</td>
            <td>$${detalle.subtotal.toFixed(2)}</td>
            <td>
              </td>
          `;
          tbody.appendChild(tr);
        });
      });
    });
}


function indiceAEstadoEnum(index) {
  const estados = ['PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO'];
  return estados[index] || 'PENDIENTE';
}


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
      
      document.getElementById('pedidoForm').reset();
     
    })
    .catch(error => {
       Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al guardar el pedido'
      });
    });
});
listarDetallesPedido(); 
document.getElementById('productosSeleccionados').innerHTML = ''; 