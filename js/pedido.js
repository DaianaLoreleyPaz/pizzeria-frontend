// LÓGICA DE SUBMIT (Crear y Editar)
document.getElementById('pedidoForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Esta función empaqueta todos los datos del formulario (cliente, fecha, etc.)
  // y, de manera CRUCIAL, toma los IDs y cantidades de los productos 
  // del div 'productosSeleccionados' para armar el array 'detallesDelPedido'.
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
// Validación: Si no hay productos válidos, muestra un error.
  if (pedido.detallesDelPedido.length === 0) {
    Swal.fire({
          icon: 'warning',
          title: 'Error',
          text: 'Debe seleccionar al menos un producto con cantidad válida'
        });
    return;
  }
// Lógica de ruteo: Determina si es un POST (create) o un PUT (update)
  const idPedido = document.getElementById('idPedido').value;
  const url = idPedido
    ? `http://127.0.0.1:8080/pedido/update/${idPedido}`
    : 'http://127.0.0.1:8080/pedido/create';
  const method = idPedido ? 'PUT' : 'POST';
// FETCH y manejo de la respuesta (success / error)
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

      // Si es exitoso, limpia el formulario y actualiza la tabla de pedidos
      listarDetallesPedido();
      document.getElementById('pedidoForm').reset();
      
      // Limpiamos los productos seleccionados y reseteamos el contenedor
      document.getElementById('productosSeleccionados').innerHTML = '';
      cargarProductos(); // Volvemos a llamar a cargarProductos para restaurar el <select> original
      
      document.getElementById('idPedido').value = '';
    })
    .catch(error => {
       Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al guardar el pedido'
      });
    });
});


// FUNCIÓN CLAVE: LISTAR PEDIDOS (Renderización de la Vista)
function listarDetallesPedido() {
  fetch('http://127.0.0.1:8080/pedido/readAll')
    .then(response => response.json())
    .then(pedidos => {
      const tbody = document.querySelector('#tablaPedidos tbody');
      tbody.innerHTML = '';
      // Itera sobre todos los pedidos recibidos
      pedidos.forEach(pedido => {
      console.log(pedido.estado)
      // Itera sobre los detalles para renderizar las filas y calcular el total.
        pedido.detallesDelPedido.forEach(detalle => {
          const tr = document.createElement('tr');
          // Para cambiar el color del estado dependiendo su valor
          const claseEstado = pedido.estado.toLowerCase() === 'pendiente' ? 'text-danger'
                              : pedido.estado.toLowerCase() === 'listo' ? 'text-success'
                              : pedido.estado.toLowerCase() === 'entregado' ? 'text-dark'
                              : pedido.estado.toLowerCase() === 'preparando' ? 'text-warning'
                              : '';
          // Renderización: Crea la fila <tr> para mostrar la data del producto.
          // Incluye la lógica para mostrar el botón de Factura solo si el estado es 'LISTO'.
          // Incluye los botones 'Editar' y 'Eliminar'
          tr.innerHTML = `
            <td>${pedido.idPedido}</td>
            <td>${pedido.nombreYApellidoCliente || 'Sin cliente'}</td>
            <td>${detalle.nombreProducto}</td>
            <td>${detalle.tipo}</td>
            <td>${detalle.tamanio}</td>
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
              ${pedido.estado.toLowerCase() === 'listo' ? `
                    <button class="btn btn-sm btn-success mt-1" onclick="generarFactura(${pedido.idPedido})">
                      <i class="fas fa-file-invoice-dollar"></i> Factura
                    </button>` : ''
                  }
             </td>
          `;
          tbody.appendChild(tr);
        });
      });
    });
}
// FUNCIÓN CLAVE: EDICIÓN (Abre un pedido para modificarlo)
function editarPedidoPorId(id) {
    window.scrollTo({
          top: 0,
          behavior: 'smooth' // hace el desplazamiento suave
        });
  fetch(`http://127.0.0.1:8080/pedido/readOne/${id}`)
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

// ==================================================================
// ============ FUNCIÓN MODIFICADA ==================================
// ==================================================================
function editarPedido(pedido) {
    console.log(pedido);
    // 1. Rellenamos los datos del formulario (esto no cambia)
    document.getElementById('idPedido').value = pedido.idPedido;
    document.getElementById('cliente').value = pedido.nombreYApellidoCliente;
    document.getElementById('demora').value = pedido.demoraEstimada;
    document.getElementById('fecha').value = pedido.fecha;
    document.getElementById('horaEntrega').value = pedido.horaDeEntrega;
    document.getElementById('estado').value = estadoEnumAIndice(pedido.estado);

    // 2. Reemplazamos el HTML del contenedor por los 3 selects anidados
    const contenedor = document.getElementById('productosContainer');
    contenedor.innerHTML = `
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label for="selectNombre" class="form-label">Agregar/Modificar producto</label>
            <select id="selectNombre" class="form-select">
              <option value="">Seleccione un nombre</option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="selectTipo" class="form-label">Tipo</label>
            <select id="selectTipo" class="form-select" disabled>
              <option value="">Seleccione un tipo</option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="selectTamanio" class="form-label">Porciones</label>
            <select id="selectTamanio" class="form-select" disabled>
              <option value="">Seleccione porciones</option>
            </select>
          </div>
          <div class="col-md-2">
            <button type="button" id="btnAddProducto" class="btn btn-primary w-100" disabled>Agregar</button>
          </div>
        </div>
        <div id="productosSeleccionados" class="row mt-3"></div>
    `;

    // 3. Obtenemos la referencia al div de productos seleccionados
    const productosSeleccionados = document.getElementById('productosSeleccionados');
      
    // 4. Rellenamos los productos que YA ESTÁN en el pedido (esto es crucial)
    pedido.detallesDelPedido.forEach(detalle => {
      const div = document.createElement('div');
      div.className = 'col-md-6 mb-2';
      div.id = `prod-${detalle.idProducto}`;
      div.innerHTML = `
        <div class="d-flex align-items-center border p-2 rounded">
          <span class="me-2 w-50">${detalle.nombreProducto} (${detalle.tipo} - ${detalle.tamanio} porciones) - $${(detalle.subtotal / detalle.cantidad).toFixed(2)}</span>
          <input type="number" class="form-control me-2 cantidad-input w-25" min="1" value="${detalle.cantidad}" data-id="${detalle.idProducto}">
          <button type="button" class="btn btn-sm btn-danger" onclick="document.getElementById('prod-${detalle.idProducto}').remove()">X</button>
        </div>
      `;
      productosSeleccionados.appendChild(div);
    });

    // 5. Obtenemos referencias a los nuevos selects (copiado de producto.js)
    const selectNombre = document.getElementById('selectNombre');
    const selectTipo = document.getElementById('selectTipo');
    const selectTamanio = document.getElementById('selectTamanio');
    const btnAddProducto = document.getElementById('btnAddProducto');

    // 6. Llenamos el primer select (Nombres)
    //    USAMOS las variables globales 'productConfig' y 'allProducts' que 'producto.js' ya cargó.
    //    No necesitamos hacer fetch de nuevo.
    Object.keys(productConfig).sort().forEach(nombre => {
      const option = document.createElement('option');
      option.value = nombre;
      option.textContent = nombre;
      selectNombre.appendChild(option);
    });

    // 7. Creamos los listeners para los selects anidados (copiado de producto.js)
    
    // Cuando cambia el NOMBRE
    selectNombre.addEventListener('change', () => {
      const nombreSel = selectNombre.value;
      
      // Reseteamos los selects hijos
      selectTipo.innerHTML = '<option value="">Seleccione un tipo</option>';
      selectTamanio.innerHTML = '<option value="">Seleccione porciones</option>';
      selectTipo.disabled = true;
      selectTamanio.disabled = true;
      btnAddProducto.disabled = true;

      if (nombreSel) {
        // Llenamos el select de Tipo
        Object.keys(productConfig[nombreSel]).sort().forEach(tipo => {
          const option = document.createElement('option');
          option.value = tipo;
          option.textContent = tipo;
          selectTipo.appendChild(option);
        });
        selectTipo.disabled = false;
      }
    });

    // Cuando cambia el TIPO
    selectTipo.addEventListener('change', () => {
      const nombreSel = selectNombre.value;
      const tipoSel = selectTipo.value;

      // Reseteamos el select hijo
      selectTamanio.innerHTML = '<option value="">Seleccione porciones</option>';
      selectTamanio.disabled = true;
      btnAddProducto.disabled = true;

      if (tipoSel) {
        // Llenamos el select de Tamaño (Porciones)
        productConfig[nombreSel][tipoSel].sort((a, b) => a - b).forEach(tamanio => {
          const option = document.createElement('option');
          option.value = tamanio;
          option.textContent = `${tamanio} porciones`;
          selectTamanio.appendChild(option);
        });
        selectTamanio.disabled = false;
      }
    });

    // Cuando cambia el TAMAÑO
    selectTamanio.addEventListener('change', () => {
      btnAddProducto.disabled = !selectTamanio.value;
    });

    // 8. Acción del botón AGREGAR (copiado de producto.js)
    btnAddProducto.addEventListener('click', () => {
      const nombreSel = selectNombre.value;
      const tipoSel = selectTipo.value;
      const tamanioSel = parseInt(selectTamanio.value, 10); // El tamaño es un número

      // Buscamos en la lista original el producto que coincide
      const productoEncontrado = allProducts.find(p => 
        p.nombre === nombreSel && 
        p.tipo === tipoSel && 
        p.tamanio === tamanioSel
      );

      if (!productoEncontrado) {
        alert('Error: No se pudo encontrar el producto.');
        return;
      }

      const id = productoEncontrado.idProducto;
      if (document.getElementById(`prod-${id}`)) {
        alert('Este producto ya está agregado');
        return;
      }

      // Agregamos el producto a la lista (como antes)
      // const productosSeleccionados = document.getElementById('productosSeleccionados'); // ya está definida arriba
      const div = document.createElement('div');
      div.className = 'col-md-6 mb-2';
      div.id = `prod-${id}`;
      div.innerHTML = `
        <div class="d-flex align-items-center border p-2 rounded">
          <span class="me-2 w-50">${productoEncontrado.nombre} (${productoEncontrado.tipo} - ${productoEncontrado.tamanio} porciones) - $${productoEncontrado.precio}</span>
          <input type="number" class="form-control me-2 cantidad-input w-25" min="1" value="1" data-id="${id}">
          <button type="button" class="btn btn-sm btn-danger" onclick="document.getElementById('prod-${id}').remove()">X</button>
        </div>
      `;
      productosSeleccionados.appendChild(div);

      // Reseteamos los selects
      selectNombre.value = "";
      selectTipo.innerHTML = '<option value="">Seleccione un tipo</option>';
      selectTamanio.innerHTML = '<option value="">Seleccione porciones</option>';
      selectTipo.disabled = true;
      selectTamanio.disabled = true;
      btnAddProducto.disabled = true;
    });
}
// ==================================================================
// ============ FIN FUNCIÓN MODIFICADA ==============================
// ==================================================================


// --- Helpers de Estado (Usados para traducir estados de BDD a índices de formulario) ---
function cambiarEstado(id, estadoActual) {
  const nuevoEstado = (estadoActual + 1) % 4;

  fetch(`http://127.0.0.1:8080/pedido/readOne/${id}`)
    .then(response => response.json())
    .then(pedido => {
      pedido.estado = indiceAEstadoEnum(nuevoEstado);

      fetch(`http://127.0.0.1:8080/pedido/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      })
        .then(response => {
          if (!response.ok) throw new Error('Error al actualizar');
          return response.json();
        })
        .then(() => {
          alert('Estado cambiado');
          listarDetallesPedido();
        })
        .catch(error => {
          console.error(error);
          alert('Error al cambiar estado');
        });
    });
}
// --- Para eliminar un pedido
function eliminarPedido(id) {
  if (confirm("¿Deseas eliminar este pedido? Se eliminarán también sus detalles")) {
    fetch(`http://127.0.0.1:8080/pedido/delete/${id}`, {
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