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

  
  const idPedido = document.getElementById('idPedido').value;
  const url = idPedido
    ? `http://localhost:8080/pedido/update/${idPedido}`
    : 'http://localhost:8080/pedido/create';
  const method = idPedido ? 'PUT' : 'POST';


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
              <button class="btn btn-sm btn-warning me-1" onclick="editarPedidoPorId(${pedido.idPedido})">
                  <i class="fas fa-edit"></i>
                </button>
              <button class="btn btn-sm btn-danger" onclick="eliminarPedido(${pedido.idPedido})">
                <i class="fas fa-trash-alt"></i>
              </button>
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

function editarPedidoPorId(id) {
    window.scrollTo({
          top: 0,
          behavior: 'smooth' // hace el desplazamiento suave
        });
  fetch(`http://localhost:8080/pedido/readOne/${id}`)
    .then(res => res.json())
    .then(pedido => editarPedido(pedido))
    .catch(err => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Error al cargar pedido para editar'
      });
    });
}
function editarPedido(pedido) {
    console.log(pedido);
  document.getElementById('idPedido').value = pedido.idPedido;
  document.getElementById('cliente').value = pedido.nombreYApellidoCliente;
  document.getElementById('demora').value = pedido.demoraEstimada;
  document.getElementById('fecha').value = pedido.fecha;
  document.getElementById('horaEntrega').value = pedido.horaDeEntrega;
  document.getElementById('estado').value = estadoEnumAIndice(pedido.estado);

  const contenedor = document.getElementById('productosContainer');
  contenedor.innerHTML = `
    <div class="mb-3">
      <label for="productoSelect" class="form-label">Modificar producto</label>
      <select id="productoSelect" class="form-select">
        <option value="">Seleccione un producto</option>
      </select>
    </div>
    <div id="productosSeleccionados" class="row"></div>
  `;
  fetch('http://localhost:8080/producto/readAll')
    .then(response => response.json())
    .then(productos => {
      const select = document.getElementById('productoSelect');
      productos.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.idProducto;
        option.textContent = `${prod.nombre} (${prod.tipo}) - $${prod.precio}`;
        option.dataset.nombre = prod.nombre;
        option.dataset.tipo = prod.tipo;
        option.dataset.precio = prod.precio;
        select.appendChild(option);
      });

      const productosSeleccionados = document.getElementById('productosSeleccionados');
      pedido.detallesDelPedido.forEach(detalle => {
        const div = document.createElement('div');
        div.className = 'col-md-6 mb-2';
        div.id = `prod-${detalle.idProducto}`;
        div.innerHTML = `
          <div class="d-flex align-items-center border p-2 rounded">
            <span class="me-2 w-50">${detalle.nombreProducto} (${detalle.tipo}) - $${(detalle.subtotal / detalle.cantidad).toFixed(2)}</span>
            <input type="number" class="form-control me-2 cantidad-input w-25" min="1" value="${detalle.cantidad}" data-id="${detalle.idProducto}">
            <button type="button" class="btn btn-sm btn-danger" onclick="document.getElementById('prod-${detalle.idProducto}').remove()">X</button>
          </div>
        `;
        productosSeleccionados.appendChild(div);
      });

      select.addEventListener('change', function () {
        const selectedOption = this.selectedOptions[0];
        const id = selectedOption.value;
        if (!id) return;
        if (document.getElementById(`prod-${id}`)) {
          alert('Este producto ya está agregado');
          return;
        }

        const nombre = selectedOption.dataset.nombre;
        const tipo = selectedOption.dataset.tipo;
        const precio = selectedOption.dataset.precio;

        const div = document.createElement('div');
        div.className = 'col-md-6 mb-2';
        div.id = `prod-${id}`;
        div.innerHTML = `
          <div class="d-flex align-items-center border p-2 rounded">
            <span class="me-2 w-50">${nombre} (${tipo}) - $${precio}</span>
            <input type="number" class="form-control me-2 cantidad-input w-25" min="1" value="1" data-id="${id}">
            <button type="button" class="btn btn-sm btn-danger" onclick="document.getElementById('prod-${id}').remove()">X</button>
          </div>
        `;
        productosSeleccionados.appendChild(div);
        this.value = '';
      });
    });
}

function eliminarPedido(id) {
  if (confirm("¿Deseas eliminar este pedido? Se eliminarán también sus detalles")) {
    fetch(`http://localhost:8080/pedido/delete/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        Swal.fire({
                icon: 'success',
                title: 'Pedido eliminado',
                text: 'Pedido eliminado correctamente'
              });
        listarDetallesPedido();
      })
      .catch(err => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message || 'Error al eliminar el pedido'
          });
      });
  }
}

// --- Helpers de Estado ---
function estadoEnumAIndice(estadoStr) {
  const mapa = {
    'PENDIENTE': 0,
    'PREPARANDO': 1, // Tu script original decía 'EN_PREPARACION' aquí
    'LISTO': 2,
    'ENTREGADO': 3
  };
  return mapa[estadoStr] ?? 0;
}

function indiceAEstadoEnum(index) {
  const estados = ['PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO'];
  return estados[index] || 'PENDIENTE';
}

function estadoTexto(estadoEnum) {
  const traduccion = {
    'PENDIENTE': 'Pendiente',
    'PREPARANDO': 'En preparación',
    'LISTO': 'Listo',
    'ENTREGADO': 'Entregado'
  };
  return traduccion[estadoEnum] || 'Desconocido';
}

function estadoEnumAIndice(estadoStr) {
  const mapa = {
    'PENDIENTE': 0,
    'PREPARANDO': 1,
    'LISTO': 2,
    'ENTREGADO': 3
  };
  return mapa[estadoStr] ?? 0;
}


