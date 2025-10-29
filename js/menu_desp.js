document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.querySelector('.sidebar');

    // Colapsa el menú al cargar
    sidebar.classList.add('collapsed');

    // Expande el menú al pasar el ratón
    sidebar.addEventListener('mouseenter', function () {
        sidebar.classList.remove('collapsed');
    });

    // Colapsa de nuevo al salir el ratón
    sidebar.addEventListener('mouseleave', function () {
        sidebar.classList.add('collapsed');
    });
});

// Capturar los elementos del menú
const menuItems = document.querySelectorAll('.sidebar-menu li');

// Agregar eventos a cada opción del menú
menuItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        // Aquí puedes hacer una llamada AJAX o cambiar dinámicamente el contenido
        const preview = this.querySelector('.menu-preview');
        preview.textContent = "Cargando vista previa...";
    });
});
