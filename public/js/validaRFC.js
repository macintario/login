/**
 * Valida un RFC mexicano (persona física o moral).
 * @param {string} rfc - RFC a validar.
 * @returns {boolean} true si es válido, false si no.
 */
function validaRFC(rfc) {
    rfc = rfc.trim().toUpperCase();
    // Expresión regular para RFC persona física y moral
    const regex = /^([A-ZÑ&]{3,4}) ?-? ?([0-9]{2})([0-1][0-9])([0-3][0-9]) ?-? ?([A-Z0-9]{2})([0-9A])$/;
    return regex.test(rfc);
}

// Ejemplo de uso:
/*
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('rfc');
    const mensaje = document.getElementById('mensajeRFC');

    if (input && mensaje) {
        input.addEventListener('input', () => {
            if (validaRFC(input.value)) {
                mensaje.textContent = 'RFC válido';
                mensaje.style.color = 'green';
            } else {
                mensaje.textContent = 'RFC inválido';
                mensaje.style.color = 'red';
            }
        });
    }
});
*/