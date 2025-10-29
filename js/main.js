// Iniciar
document.addEventListener('DOMContentLoaded', () => {
  listarDetallesPedido();
  cargarProductos();
});

// Este listener estaba en tu script.js original, 
// pero parece estar relacionado con un PDF que ya no existe.
// Lo mantenemos por si acaso.
document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'btnDescargarPDF') {
    // La función original 'descargarFacturaComoPDF()' no existe.
    // La lógica de descarga de PDF ahora está en generarPDF().
    console.warn("Botón 'btnDescargarPDF' presionado, pero la función asociada no está definida.");
  }
});