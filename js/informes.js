document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("generarInforme");

    boton.addEventListener("click", async () => {
        const tipo = document.getElementById("tipoConsulta").value;
        const inicio = document.getElementById("fechaInicio").value;
        const fin = document.getElementById("fechaFin").value;
        const tablaHeader = document.getElementById("tablaHeader");
        const tablaBody = document.getElementById("tablaBody");

        if (!tipo) {
            Swal.fire("Atención", "Debe seleccionar un tipo de consulta", "warning");
            return;
        }

        if (!inicio || !fin) {
            Swal.fire("Atención", "Debe completar ambas fechas", "warning");
            return;
        }

        if (new Date(inicio) > new Date(fin)) {
            Swal.fire("Error", "La fecha de inicio no puede ser mayor que la fecha de fin", "error");
            return;
        }

        let url = "";
        let headers = [];

        if (tipo === "variedad") {
            url = "http://localhost:8080/detallePedido/estadisticas/masPedidas";
            headers = ["Nombre", "Tipo", "Total Pedidos"];
        } else if (tipo === "recaudacion") {
            url = `http://localhost:8080/pedido/estadisticas/recaudacion?inicio=${inicio}&fin=${fin}`;
            headers = ["Fecha", "Total Recaudado"];
        } else if (tipo === "periodo") {
            url = `http://localhost:8080/pedido/estadisticas/totalPedidos?inicio=${inicio}&fin=${fin}`;
            headers = ["Fecha", "Cantidad de Pedidos", "Monto Total"];
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error al obtener los datos del backend");

            const data = await response.json();

            // Botón imprimir (Día 4)

            // Limpiar tabla
            tablaHeader.innerHTML = "";
            tablaBody.innerHTML = "";

            // Encabezados
            headers.forEach(header => {
                const th = document.createElement("th");
                th.textContent = header;
                tablaHeader.appendChild(th);
            });

            // Cuerpo de tabla
            data.forEach(item => {
                const row = document.createElement("tr");

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

            // Gráfico (Día 3)

        } catch (error) {
            alert("Error al generar el informe: " + error.message);
        }
    });
});

// Función de imprimir (Día 4)