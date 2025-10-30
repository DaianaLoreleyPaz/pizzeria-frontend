async function generarFactura(idPedido) {
  try {
    // Verificar si ya existe la factura
    const readResponse = await fetch(`http://localhost:8080/factura/readOne/${idPedido}`, {
      method: 'GET'
    });

    if (readResponse.ok) {
      const facturaExistente = await readResponse.json();
      mostrarFactura(facturaExistente.pedido.idPedido); // Si ya existe, la muestra
    } else {
      // Si no existe, crear la factura (código del Día 2)
      const createResponse = await fetch(`http://localhost:8080/factura/create/${idPedido}`, {
        method: 'POST'
      });

    if (!createResponse.ok) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al generar la factura'
          });
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
  }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo procesar la factura'
    });
  }
}

async function mostrarFactura(id) {
  try {
    const response = await fetch(`http://localhost:8080/factura/readOne/${id}`);
    if (!response.ok) throw new Error("No se pudo obtener la factura");

    const factura = await response.json();

    Swal.fire({
      icon: 'info',
      title: `Factura Nº ${factura.numeroDeFactura}`,
      html: `
        <b>Cliente:</b> ${factura.pedido.nombreYApellidoCliente}<br>
        <b>Fecha:</b> ${factura.fecha}<br>
        <b>Total:</b> $${factura.pedido.total.toFixed(2)}<br>
        `,
      
    });
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudo mostrar la factura", "error");
  }
}