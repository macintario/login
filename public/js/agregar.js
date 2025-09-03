
var usr = 'NULL';
var idEscuela = 0;
document.addEventListener('DOMContentLoaded', function () {
    checkAuthentication().then(() => {
        document.getElementById('userWelcome').textContent += usr;
        document.getElementById('idEscuela').value = idEscuela;
    });
    if (document.getElementById('agregarForm')) {
        document.getElementById('agregarForm').addEventListener('submit', function (e) {
            e.preventDefault();
            //console.log('Formulario enviado');
            guardarDatos();
        });
    }
//console.log(validarCLABE('012180011260239327')); // CLABE válida de BBVA
//console.log(validarCLABE('032180000118359719')); // CLABE vlaida banco ficticio WIKI
//console.log(validarCLABE('012180004123456780')); // CLABE inválida (dígito control erróneo)
//console.log(validarCLABE('0121800041234567'));   // CLABE muy corta
//console.log(validarCLABE('0121800041234567890')); // CLABE muy larga
//console.log(validarCLABE('abc012180004123456789')); // CLABE con caracteres no numéricos

});


function guardarDatos() {
    const form = document.getElementById('agregarForm');
    const formData = new FormData(form);
    const data = {};
    //console.log('Datos del formulario:', Array.from(formData.entries()));
    formData.forEach((value, key) => {
        data[key] = value;
    });
    validacion = validarCLABE(data['CLABE']);
    if (validacion.error) {
        alert('CLABE incorrecta: ' + validacion.error);
        return;
    }
    //console.log('Datos a enviar:', data);
    fetch('/auth/agregarcta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Registro agregado exitosamente');
                window.location.href = '/cuentas/captura';
            } else {
                alert('Error al agregar registro: ' + result.error);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            alert('Error de conexión');
        });
}
async function checkAuthentication() {
    try {
        const response = await fetch('/auth/check');
        const result = await response.json();
        //console.log(result);
        if (!result.authenticated) {
            window.location.href = '/cuentas';
        }
        usr = result.user.username;
        idEscuela = result.user.escuela;
        //        console.log(idEscuela);
    } catch (error) {
        window.location.href = '/cuentas';
    }
}