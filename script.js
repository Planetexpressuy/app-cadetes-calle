document.addEventListener('DOMContentLoaded', () => {
    // Vistas
    const viewHome = document.getElementById('view-home');
    const viewEntrega = document.getElementById('view-entrega');
    const viewNoEntrega = document.getElementById('view-no-entrega');

    // Botones de Navegación
    const btnEntregar = document.getElementById('btn-entregar');
    const btnNoEntregar = document.getElementById('btn-no-entregar');
    const btnVolver = document.getElementById('btn-volver');
    const btnVolverNe = document.getElementById('btn-volver-ne');

    // Formularios
    const formEntrega = document.getElementById('form-entrega');
    const formNoEntrega = document.getElementById('form-no-entrega');

    // --- NAVEGACIÓN ENTRE VISTAS ---

    btnEntregar.addEventListener('click', () => {
        viewHome.classList.add('hidden');
        viewEntrega.classList.remove('hidden');
    });

    btnNoEntregar.addEventListener('click', () => {
        viewHome.classList.add('hidden');
        viewNoEntrega.classList.remove('hidden');
    });

    btnVolver.addEventListener('click', () => {
        viewEntrega.classList.add('hidden');
        viewHome.classList.remove('hidden');
        formEntrega.reset(); // Limpiamos el formulario al volver
    });

    btnVolverNe.addEventListener('click', () => {
        viewNoEntrega.classList.add('hidden');
        viewHome.classList.remove('hidden');
        formNoEntrega.reset(); // Limpiamos el formulario al volver
    });

    // --- LÓGICA DEL FORMULARIO DE ENTREGA ---

    formEntrega.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitamos que la página se recargue

        // Capturamos los datos que el cadete ingresó
        const datosEntrega = {
            numeroEnvio: document.getElementById('numero-envio').value,
            nombreRecibe: document.getElementById('nombre-recibe').value,
            apellidoRecibe: document.getElementById('apellido-recibe').value,
            cedulaRecibe: document.getElementById('cedula-recibe').value,
            observaciones: document.getElementById('observaciones').value,
        };

        console.log("Datos del formulario de entrega:", datosEntrega);
        alert("Simulación: Entrega guardada. Revisa la consola para ver los datos.");

        formEntrega.reset(); // Limpiamos el formulario
        btnVolver.click(); // Simulamos un clic en "Volver" para regresar al inicio
    });

    // --- LÓGICA DEL FORMULARIO DE NO ENTREGA ---

    formNoEntrega.addEventListener('submit', (e) => {
        e.preventDefault();

        const datosVisitaFallida = {
            numeroEnvio: document.getElementById('ne-numero-envio').value,
            foto: document.getElementById('ne-foto').files[0], // Capturamos el objeto del archivo
            evento: document.getElementById('ne-evento').value,
            observaciones: document.getElementById('ne-observaciones').value,
        };

        console.log("Datos de visita fallida:", datosVisitaFallida);
        // Mostramos el nombre del archivo de la foto para confirmar
        alert(`Simulación: Visita fallida guardada. Foto: ${datosVisitaFallida.foto.name}. Revisa la consola.`);

        formNoEntrega.reset();
        btnVolverNe.click();
    });
});