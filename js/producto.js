// Estas variables globales (Model de datos en el Frontend) son necesarias para que 
// otras funciones (como editarPedido en pedido.js) puedan acceder a los productos
// sin tener que hacer un FETCH extra.
let allProducts = [];
let productConfig = {};

// FUNCIÓN CLAVE: Carga los productos y configura los selects anidados
function cargarProductos() {
  fetch('http://localhost:8080/producto/readAll')
    .then(response => {
      // Manejo de errores de red o servidor
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      return response.json();
    })
    .then(productos => {
      allProducts = productos; // Guarda el array plano
      
      // 1. Procesamos la lista de productos para crear un "mapa" de selección
      productConfig = {};
      productos.forEach(p => {
        if (!productConfig[p.nombre]) {
          productConfig[p.nombre] = {};
        }
        if (!productConfig[p.nombre][p.tipo]) {
          productConfig[p.nombre][p.tipo] = [];
        }
        // Nos aseguramos de no duplicar tamaños
        if (!productConfig[p.nombre][p.tipo].includes(p.tamanio)) {
             productConfig[p.nombre][p.tipo].push(p.tamanio);
        }
      });

      // 2. Renderización del HTML: Reemplaza el <select> único por los 3 selects y el botón.
      const contenedor = document.getElementById('productosContainer');
      contenedor.innerHTML = `
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label for="selectNombre" class="form-label">Producto</label>
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

      // 3. Obtenemos referencias a los nuevos elementos
      const selectNombre = document.getElementById('selectNombre');
      const selectTipo = document.getElementById('selectTipo');
      const selectTamanio = document.getElementById('selectTamanio');
      const btnAddProducto = document.getElementById('btnAddProducto');

      // 4. Llenamos el primer select (Nombres)
      Object.keys(productConfig).sort().forEach(nombre => {
        const option = document.createElement('option');
        option.value = nombre;
        option.textContent = nombre;
        selectNombre.appendChild(option);
      });

      // 5. Creamos los listeners para los selects anidados (La lógica del "Controller/ViewModel")
      
      // Listener 1: Cuando cambia el NOMBRE, se resetea y llena el TIPO      selectTamanio.addEventListener('change', () => {
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

      // Listener 2: Cuando cambia el TIPO, se resetea y llena el TAMAÑO
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

      
      btnAddProducto.disabled = !selectTamanio.value;
     

      //Listener 3: Botón AGREGAR (Busca el ID único y lo añade al listado del pedido)
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
        const productosSeleccionados = document.getElementById('productosSeleccionados');
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

    })
    .catch(error => {
      console.error("Error en cargarProductos:", error);
      // Manejo de error si el fetch falla
      const contenedor = document.getElementById('productosContainer');
      contenedor.innerHTML = '<div class="alert alert-danger">No se pudieron cargar los productos. Verifique la conexión con el backend.</div>';
    });
}