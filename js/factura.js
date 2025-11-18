// FUNCIÓN CLAVE: Lógica de Generación y Control de Duplicados
async function generarFactura(idPedido) {
  try {
// 1. CONTROL DE DUPLICADOS (fetch GET a /factura/readOne/{idPedido})
    const readResponse = await fetch(`http://localhost:8080/factura/readOne/${idPedido}`, {
      method: 'GET'
    });

    if (readResponse.ok) {
      // Si la factura ya existe, la muestra (llama a mostrarFactura)
      const facturaExistente = await readResponse.json();
      mostrarFactura(facturaExistente.pedido.idPedido); // Si ya existe, la muestra
    } else {
      // Si no existe, crear la factura (código del Día 2)
      const createResponse = await fetch(`http://localhost:8080/factura/create/${idPedido}`, {
        method: 'POST'
      });
      // Si NO existe (404), la crea (fetch POST a /factura/create/{idPedido})
      // Si es exitoso, muestra el modal de éxito.

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
        <button id="descargarPdfBtn" class="btn btn-primary mt-2">Descargar PDF</button>
        `,
        didOpen: () => {
            document.getElementById('descargarPdfBtn').addEventListener('click', () => {
              generarPDF(factura);
            });
          }

    });
  }
  // Captura errores de red o del servidor y muestra un Swal.fire
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo procesar la factura'
    });
  }
}
//funcion para mostrar factura 
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
        <button id="descargarPdfBtn" class="btn btn-primary mt-2">Descargar PDF</button>
      `,
      didOpen: () => {
        document.getElementById('descargarPdfBtn').addEventListener('click', () => {
          generarPDF(factura);
        });
      }
    });

  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudo mostrar la factura", "error");
  }
}
// FUNCIÓN CLAVE: Generación y Descarga del PDF
function generarPDF(factura) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const pedido = factura.pedido;

  // Datos de cabecera
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`Factura Nº ${factura.numeroDeFactura}`, 20, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${factura.fecha}`, 20, 30);
  doc.text(`Hora: ${factura.hora}`, 20, 36);
  doc.text(`Cliente: ${pedido.nombreYApellidoCliente}`, 20, 42);
  doc.text(`Estado del Pedido: ${pedido.estado}`, 20, 48);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle del Pedido:", 20, 60);

  // Detalles
  let y = 70;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  pedido.detallesDelPedido.forEach(item => {
    doc.text(`${item.nombreProducto} (${item.tipo}, ${item.tamanio} porciones)`, 20, y);
    doc.text(`x${item.cantidad} = $${item.subtotal.toFixed(2)}`, 140, y);
    y += 8;
  });

  // Total
  doc.setFont("helvetica", "bold");
  doc.text(`Total: $${pedido.total.toFixed(2)}`, 20, y + 10);

  // Footer
  doc.setFontSize(10);
  doc.setFont("courier", "italic");
  doc.text("Pizzería Don Massimo", 150, 280, { align: 'right' });
  doc.text("Las mejores variedades de pizzas", 150, 285, { align: 'right' });

  // Descargar
  doc.save(`Factura_${factura.numeroDeFactura}_${pedido.nombreYApellidoCliente}.pdf`);
}
