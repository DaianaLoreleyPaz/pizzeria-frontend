async function generarFactura(idPedido) {
  try {
    // En este día, solo creamos, no verificamos duplicados
    const createResponse = await fetch(`http://localhost:8080/factura/create/${idPedido}`, {
      method: 'POST'
    });

    if (!createResponse.ok) {
       throw new Error('Error al generar la factura');
    }

    const factura = await createResponse.json();

    // Mostrar alerta con los datos de la factura
    Swal.fire({
      icon: 'success',
      title: `Factura Nº ${factura.numeroDeFactura}`,
      html: `
        <b>Cliente:</b> ${factura.pedido.nombreYApellidoCliente}<br>
        <b>Fecha:</b> ${factura.fecha}<br>
        <b>Total:</b> $${factura.pedido.total.toFixed(2)}<br>
        `,
    });

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo procesar la factura'
    });
  }
}