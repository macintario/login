var usr = 'NULL';
document.addEventListener('DOMContentLoaded', function () {
    checkAuthentication().then(() => {
        llenaForma();
        document.getElementById('userWelcome').textContent += usr;
        document.getElementById('actualizarForm').addEventListener('submit', function (event) {
            event.preventDefault(); // Evita el envío del formulario por defecto

            const formData = new FormData(this);
            const data = {};
//            console.log('Datos del formulario:', Array.from(formData.entries()));
            formData.forEach((value, key) => {
                data[key] = value;
                if (key === 'CLABE') {
                    const validacion = validarCLABE(value);
                    if (validacion.error) {
                        alert('CLABE incorrecta: ' + validacion.error);
                        return;
                    }
                }
            });


            const idAlumno = formData.get('idAlumno');
//            console.log('Actualizando información del Alumno:', idAlumno);
//            console.log('Datos a enviar:', data);
            fetch(`/auth/actualizar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => response.json()).then(data => {
                if (data.success) {
                    alert('Registro actualizado exitosamente.');
                    window.location.href = '/captura'; // Redirige a la página de capturados
                } else {
                    alert('Error al actualizar el registro: ' + data.message);
                }
            }).catch(error => {
//                console.error('Error al actualizar el registro:', error);
                alert('Ocurrió un error al actualizar el registro.');
            });
        });
    });
});

function actualizarRegistro(idAlumno) {
    // Aquí puedes agregar la lógica para actualizar el registro
//    alert('Actualizar registro: ' + idAlumno);
    window.location.href = `/actualizar/${idAlumno}`;
}
async function checkAuthentication() {
    try {
        const response = await fetch('/auth/check');
        const result = await response.json();
        //        console.log(result);
        if (!result.authenticated) {
            window.location.href = '/';
        }
        usr = result.user.username;
    } catch (error) {
        window.location.href = '/';
    }
}
function llenaForma() {
    const urlParts = window.location.pathname.split('/');
    const idAlumno = urlParts[urlParts.length - 1];
//    console.log('Cargando información del Alumno con ID:', idAlumno);
    fetch(`/auth/obtenercta/${idAlumno}`).then(response => response.json()).then(data => {
  //      console.log('Datos recibidos:', data);
        if (data && data.length > 0) {
            const registro = data[0];
            document.getElementById('rfc').value = registro.rfc || '';
            document.getElementById('paterno').value = registro.paterno || '';
            document.getElementById('materno').value = registro.materno || '';
            document.getElementById('nombre').value = registro.nombre || '';
            document.getElementById('promedio').value = registro.promedio || '';
            document.getElementById('CLABE').value = registro.CLABE || '';
            document.getElementById('idAlumno').value = registro.idAlumno || '';
            document.getElementById('idEscuela').value = registro.idEscuela || '';
        } else {
            alert('No se encontraron datos para el alumno con ID: ' + idAlumno);
        }
    }).catch(error => {
//        console.error('Error al obtener datos del alumno:', error);
    });
}
