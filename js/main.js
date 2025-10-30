
document.addEventListener('DOMContentLoaded', () => {
  listarDetallesPedido();
  cargarProductos();
});
document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'btnDescargarPDF') {
    // Esta función no existe, pero el listener sí estaba en tu script original
    // descargarFacturaComoPDF(); 
  }
});