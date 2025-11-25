document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    // ¡IMPORTANTE! Aquí pegarás la URL que obtendrás de Google Apps Script.
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2vm8OOLkxbOHp2zStXPurxDClXmGsRkGQfoVkuTSvvlmlqpLlZnV9jGFkDHnDachq/exec";

    // Vistas
    const viewHome = document.getElementById('view-home');
    const viewEntrega = document.getElementById('view-entrega');
    const viewNoEntrega = document.getElementById('view-no-entrega');

    // Botones de Navegación
    const btnEntregar = document.getElementById('btn-entregar');
    const btnNoEntregar = document.getElementById('btn-no-entregar');
    const btnVolver = document.getElementById('btn-volver');
    const btnVolverNe = document.getElementById('btn-volver-ne');

    // Botones de QR
    const btnScanQr = document.getElementById('btn-scan-qr');
    const btnScanQrNe = document.getElementById('ne-btn-scan-qr');

    // Formularios
    const formEntrega = document.getElementById('form-entrega');
    const formNoEntrega = document.getElementById('form-no-entrega');

    // Elementos del Escáner QR
    const qrScannerContainer = document.getElementById('qr-scanner-container');
   // const btnCloseScanner = document.getElementById('btn-close-scanner');

    // --- NAVEGACIÓN ENTRE VISTAS ---

    btnEntregar.addEventListener('click', () => {
        viewHome.classList.add('hidden');
        viewEntrega.classList.remove('hidden');
        // Añadimos un estado al historial para poder volver aquí
        history.pushState({view: 'entrega'}, '');
    });

    btnNoEntregar.addEventListener('click', () => {
        viewHome.classList.add('hidden');
        viewNoEntrega.classList.remove('hidden');
        // Añadimos un estado al historial para poder volver aquí
        history.pushState({view: 'no-entrega'}, '');
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

    formEntrega.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos que la página se recargue
        const submitButton = formEntrega.querySelector('button[type="submit"]');
        setLoading(submitButton, true, "Guardando...");

        try {
            const location = await getCurrentLocation();

            // Combinamos datos manuales y automáticos
            const datosEntrega = {
                type: 'entrega', // Para que el script de Google sepa qué hacer
                numeroEnvio: document.getElementById('numero-envio').value,
                nombreRecibe: document.getElementById('nombre-recibe').value,
                apellidoRecibe: document.getElementById('apellido-recibe').value,
                cedulaRecibe: document.getElementById('cedula-recibe').value,
                observaciones: document.getElementById('observaciones').value,
                timestamp: new Date().toISOString(),
                location: `${location.latitude}, ${location.longitude}`,
                status: 'Entregado'
            };

            // Enviamos los datos
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Necesario para peticiones simples a Apps Script
                body: JSON.stringify(datosEntrega),
            });

            // NOTA: Con 'no-cors', no podemos leer la respuesta, pero la petición se envía.
            // Asumimos éxito si no hay un error de red.
            // if (!response.ok) throw new Error('Error en la respuesta del servidor.');

            alert('¡Entrega guardada con éxito!');
            btnVolver.click();

        } catch (error) {
            console.error('Error al guardar entrega:', error);
            alert(`Error: ${error.message}. No se pudo guardar la entrega.`);
        } finally {
            setLoading(submitButton, false, "GUARDAR ENTREGA");
        }
    });

    // --- LÓGICA DEL FORMULARIO DE NO ENTREGA ---

    formNoEntrega.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = formNoEntrega.querySelector('button[type="submit"]');
        setLoading(submitButton, true, "Guardando...");

        try {
            const location = await getCurrentLocation();
            const file = document.getElementById('ne-foto').files[0];
            if (!file) throw new Error("Por favor, toma una foto.");

            const fileData = await readFileAsBase64(file);

            const datosVisitaFallida = {
                type: 'no-entrega', // Para que el script de Google sepa qué hacer
                numeroEnvio: document.getElementById('ne-numero-envio').value,
                evento: document.getElementById('ne-evento').value,
                observaciones: document.getElementById('ne-observaciones').value,
                timestamp: new Date().toISOString(),
                location: `${location.latitude}, ${location.longitude}`,
                foto: fileData // Enviamos la foto como texto Base64
            };

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Necesario para peticiones simples a Apps Script
                body: JSON.stringify(datosVisitaFallida),
            });

            // NOTA: Con 'no-cors', no podemos leer la respuesta.
            // if (!response.ok) throw new Error('Error en la respuesta del servidor.');

            alert('¡Visita guardada con éxito!');
            btnVolverNe.click();

        } catch (error) {
            console.error('Error al guardar visita:', error);
            alert(`Error: ${error.message}. No se pudo guardar la visita.`);
        } finally {
            setLoading(submitButton, false, "GUARDAR VISITA");
        }
    });

    // --- FUNCIONES AUXILIARES ---

    // Muestra un estado de carga en los botones
    function setLoading(button, isLoading, text) {
        button.disabled = isLoading;
        button.textContent = text;
    }

    // Obtiene la ubicación GPS
    function getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                return reject(new Error('Geolocalización no soportada por el navegador.'));
            }
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position.coords),
                (error) => reject(new Error(`Error de geolocalización: ${error.message}`))
            );
        });
    }

    // Lee un archivo (la foto) y lo convierte a texto Base64 para poder enviarlo
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // El resultado es un string largo que representa la imagen
                resolve({
                    base64: reader.result.split(',')[1], // Quitamos el prefijo 'data:image/jpeg;base64,'
                    type: file.type,
                    name: file.name
                });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // --- LÓGICA DEL ESCÁNER QR ---

    // Crear una instancia del lector de QR
    const html5QrCode = new Html5Qrcode("qr-reader");
    let activeInputId = null; // Para saber en qué campo de texto poner el resultado

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        // Cuando se escanea un código, esta función se ejecuta.
        console.log(`Código escaneado: ${decodedText}`, decodedResult);
        
        // Pone el texto del QR en el campo de texto activo
        if (activeInputId) {
            document.getElementById(activeInputId).value = decodedText;
        }

        // Detiene la cámara y cierra el escáner
        stopScanner();
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    function startScanner(targetInputId) {
        activeInputId = targetInputId;
        qrScannerContainer.classList.remove('hidden');
        // Inicia la cámara. Pide permiso al usuario si es la primera vez.
        html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
            .catch(err => {
                console.error("No se pudo iniciar el escáner de QR", err);
                alert("Error al iniciar la cámara. Asegúrate de dar los permisos necesarios.");
                stopScanner();
            });
    }

    function stopScanner() {
        // 1. Oculta la pantalla del escáner inmediatamente
        qrScannerContainer.classList.add('hidden');

        // 2. Intenta detener la cámara de forma segura
        try {
            if (html5QrCode.isScanning) {
                html5QrCode.stop();
            }
        } catch (err) {
            console.warn("El escáner de QR ya estaba detenido.", err);
        }
        
        // 3. Limpia la variable de memoria
        activeInputId = null;
    }

    // Asignar la función a los botones
    btnScanQr.addEventListener('click', () => startScanner('numero-envio'));
    btnScanQrNe.addEventListener('click', () => startScanner('ne-numero-envio'));
    // btnCloseScanner.addEventListener('click', stopScanner);

    // --- LÓGICA MEJORADA PARA EL BOTÓN "VOLVER" DEL ESCÁNER ---
    // Esta nueva función se asegura de que siempre volvamos al Home.
    // function closeScannerAndGoHome() {
    //     stopScanner(); // Primero, detiene la cámara y oculta el escáner.
    //     // Luego, oculta todas las vistas de formularios y muestra la de inicio.
    //     viewEntrega.classList.add('hidden');
    //     viewNoEntrega.classList.add('hidden');
    //     viewHome.classList.remove('hidden');
    // }
    // btnCloseScanner.addEventListener('click', closeScannerAndGoHome);

    // --- MANEJO DEL BOTÓN "ATRÁS" DEL NAVEGADOR/TELÉFONO ---
    window.addEventListener('popstate', (event) => {
        // Esta función se ejecuta cuando el usuario presiona el botón "Atrás" del sistema.
        // Ocultamos todas las vistas de formularios y mostramos la de inicio.
        viewEntrega.classList.add('hidden');
        viewNoEntrega.classList.add('hidden');
        viewHome.classList.remove('hidden');
        stopScanner(); // Por si acaso, también detenemos el escáner si estaba abierto.
    });
});


