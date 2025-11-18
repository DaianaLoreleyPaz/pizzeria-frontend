// Este listener se dispara una vez que el HTML está completamente cargado.
// Es el punto de inicio (entry point) de la aplicación.
document.addEventListener('DOMContentLoaded', () => {
  // Llama a la función de pedido para renderizar la tabla con todos los pedidos existentes.
  listarDetallesPedido();
  // Llama a la función de producto para cargar los datos necesarios en los selects de creación/edición.
  cargarProductos();
});
// Este listener es secundario y estaba en el código original para una funcionalidad de descarga.
document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'btnDescargarPDF') {
  // La lógica de descarga de PDF ahora está en generarFactura, por lo que esta función 
    // queda como un remanente, pero es un ejemplo de manejo de eventos globales.
    console.warn("Evento de descarga capturado. La lógica se ejecuta en generarFactura.");
  }
});