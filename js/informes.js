// Variable global para mantener la instancia actual del gráfico de Chart.js.
// Esto es crucial para poder destruirlo y crear uno nuevo sin errores visuales al cambiar el reporte.
let graficoActual = null;

document.addEventListener("DOMContentLoaded", () => {
    // Obtenemos las referencias a los elementos clave del DOM.
    const boton = document.getElementById("generarInforme");
    const selectTipo = document.getElementById("tipoConsulta");
    const fechaInicio = document.getElementById("fechaInicio");
    const fechaFin = document.getElementById("fechaFin");
    const btnImprimir = document.getElementById("btnImprimir");

    // Listener principal: Se dispara al hacer clic en 'Generar Informe'.
    boton.addEventListener("click", async () => {
        const tipo = selectTipo.value;
        const inicio = fechaInicio.value;
        const fin = fechaFin.value;
        const tablaHeader = document.getElementById("tablaHeader");
        const tablaBody = document.getElementById("tablaBody");

        // 1. DECLARACIÓN DE VARIABLES DE RUTA Y GRÁFICOS
        let url = "";
        let headers = []; // Encabezados para la tabla.
        let etiquetas = []; // Usado para el eje X del gráfico (nombres, fechas).
        let valores = [];   // Usado para los valores Y del gráfico (cantidades, montos).
        let label = "";     // Etiqueta para la leyenda del gráfico.

        // 2. VALIDACIONES INICIALES Y CONSTRUCCIÓN DE LA URL
        if (!tipo) {
            Swal.fire("Atención", "Debe seleccionar un tipo de consulta", "warning");
            return;
        }

        if (tipo === "recaudacion" || tipo === "periodo") {
             // Validación de fechas obligatoria para reportes por período
            if (!inicio || !fin) {
                Swal.fire("Atención", "Debe completar ambas fechas", "warning");
                return;
            }
            if (new Date(inicio) > new Date(fin)) {
                Swal.fire("Error", "La fecha de inicio no puede ser mayor que la fecha de fin", "error");
                return;
            }
        }
       
        // Lógica de ruteo para consumir los endpoints de estadísticas [cite: 400]
        if (tipo === "variedad") {
            url = "http://localhost:8080/detallePedido/estadisticas/masPedidas";
            headers = ["Nombre", "Tipo", "Total Pedidos"];
            label = "Pizzas Más Pedidas";
        } else if (tipo === "recaudacion") {
            url = `http://localhost:8080/pedido/estadisticas/recaudacion?inicio=${inicio}&fin=${fin}`;
            headers = ["Fecha", "Total Recaudado"];
            label = "Recaudación por Período";
        } else if (tipo === "periodo") {
            url = `http://localhost:8080/pedido/estadisticas/totalPedidos?inicio=${inicio}&fin=${fin}`;
            headers = ["Fecha", "Cantidad de Pedidos", "Monto Total"];
            label = "Pedidos Totales por Período";
        }

        // 3. FETCH Y PROCESAMIENTO DE DATOS
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error al obtener los datos del backend");

            const data = await response.json();
            
            // Si hay datos, mostramos el botón de impresión [cite: 424]
            btnImprimir.style.display = data.length > 0 ? "inline-block" : "none";

            // Limpiar y rellenar tabla
            tablaHeader.innerHTML = "";
            tablaBody.innerHTML = "";

            // 4. GENERACIÓN DE LA TABLA DINÁMICA
            headers.forEach(header => { 
                const th = document.createElement("th");
                th.textContent = header;
                tablaHeader.appendChild(th);
            }); 

            data.forEach(item => { 
                const row = document.createElement("tr");

                // Lógica condicional para mapear los datos según el tipo de reporte
                if (tipo === "variedad") {
                    row.innerHTML = `
                        <td>${item.nombre}</td>
                        <td>${item.tipo}</td>
                        <td>${item.totalPedidos}</td>
                    `;
                } else if (tipo === "recaudacion") {
                    row.innerHTML = `
                        <td>${item.fecha}</td>
                        <td>$${item.totalRecaudado.toFixed(2)}</td>
                    `;
                } else if (tipo === "periodo") {
                    row.innerHTML = `
                        <td>${item.fecha}</td>
                        <td>${item.cantidadPedidos}</td>
                        <td>$${item.montoTotal.toFixed(2)}</td>
                    `;
                }

                tablaBody.appendChild(row);
            });
            
            // 5. PREPARACIÓN DE DATOS PARA CHART.JS
            // Se mapean los resultados del fetch a las variables 'etiquetas' y 'valores'.
            if (tipo === "variedad") {
                etiquetas = data.map(item => `${item.nombre} (${item.tipo})`);
                valores = data.map(item => item.totalPedidos);
            } else if (tipo === "recaudacion") {
                etiquetas = data.map(item => item.fecha);
                valores = data.map(item => item.totalRecaudado);
            } else if (tipo === "periodo") {
                etiquetas = data.map(item => item.fecha);
                valores = data.map(item => item.montoTotal);
            }


            // 6. GENERACIÓN DEL GRÁFICO (Chart.js)
            const canvas = document.getElementById("graficoInforme");

            // Destruir gráfico anterior si existe (PREVENCIÓN DE BUG) [cite: 421]
            if (graficoActual) {
                graficoActual.destroy();
            }

            // Crea la nueva instancia de Chart.js (Gráfico de barras)
            graficoActual = new Chart(canvas, {
                type: 'bar', 
                data: {
                    labels: etiquetas, // Eje X (Fechas o Nombres de Pizzas)
                    datasets: [{
                        label: label,
                        data: valores, // Eje Y (Valores)
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

        } catch (error) {
            // Manejo de errores de conexión o JSON
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al generar el informe'
            });
        }
    });
    
    // Listener para el botón de imprimir (usa la función nativa del navegador)
    btnImprimir.addEventListener('click', imprimirTabla);
});

// FUNCIÓN DE IMPRESIÓN
function imprimirTabla() {
    // Llama a la función nativa de impresión del navegador.
    window.print();
}

// Lógica de mapeo de estado (Mantenida por si se usa en reportes futuros)
function estadoEnumAIndice(estadoStr) {
  const mapa = {
    'PENDIENTE': 0,
    'PREPARANDO': 1,
    'LISTO': 2,
    'ENTREGADO': 3
  };
  return mapa[estadoStr] ?? 0;
}