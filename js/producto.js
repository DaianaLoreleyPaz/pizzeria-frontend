function cargarProductos() {
  fetch('http://127.0.0.1:8080/producto/readAll')
    .then(response => response.json())
    .then(productos => {
      const contenedor = document.getElementById('productosContainer');
      contenedor.innerHTML = `
        <div class="mb-3">
          <label for="productoSelect" class="form-label">Agregar producto</label>
          <select id="productoSelect" class="form-select">
            <option value="">Seleccione un producto</option>
          </select>
        </div>
        <div id="productosSeleccionados" class="row"></div>
      `;

      const select = contenedor.querySelector('#productoSelect');
      productos.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.idProducto;
        option.textContent = `${prod.nombre} (${prod.tipo}-${prod.tamanio} porciones) - $${prod.precio}`;
        option.dataset.nombre = prod.nombre;
        option.dataset.tamanio = prod.tamanio;
        option.dataset.tipo = prod.tipo;
        option.dataset.precio = prod.precio;
        select.appendChild(option);
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

        const productosSeleccionados = document.getElementById('productosSeleccionados');
        const div = document.createElement('div');
        div.className = 'col-md-6 mb-2';
        div.id = `prod-${id}`;
        div.innerHTML = `
          <div class="d-flex align-items-center border p-2 rounded">
            <span class="me-2 w-50">${nombre} (${tipo}- ${tamanio} porciones) - $${precio}</span>
            <input type="number" class="form-control me-2 cantidad-input w-25" min="1" value="1" data-id="${id}">
            <button type="button" class="btn btn-sm btn-danger" onclick="document.getElementById('prod-${id}').remove()">X</button>
          </div>
        `;
        productosSeleccionados.appendChild(div);

        this.value = '';
      });
    });
}