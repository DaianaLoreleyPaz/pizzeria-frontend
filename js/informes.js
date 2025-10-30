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

        // Lógica de fetch (Día 2)
    });
});

// Función de imprimir (Día 4)