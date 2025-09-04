var usr = 'NULL';
document.addEventListener('DOMContentLoaded', function () {
    checkAuthentication().then(() => {
        llenaTabla();
        document.getElementById('userWelcome').textContent += usr;
    });
});

function agregaRegistro() {
    window.location.href = '/cuentas/agregar';
}

async function checkAuthentication() {
    try {
        const response = await fetch('/cuentas/auth/check');
        const result = await response.json();
        //        console.log(result);
        if (!result.authenticated) {
            window.location.href = '/cuentas';
        }
        usr = result.user.username;
    } catch (error) {
        window.location.href = '/cuentas';
    }
}
function llenaTabla() {
    //    console.log('Cargando información del Cuentas...');
    fetch('/cuentas/auth/cuentas').then(response => response.json()).then(data => {
        console.log('Numero de datos recibidos:', data.recordsTotal);
        for (const registro of data.data) {
            //            console.log('Registro:', registro);
            agregaFila(registro);
        }
    }).catch(error => {
//        console.error('Error al obtener datos de cuentas:', error);
    });
}
function agregaFila(registro) {
    const tabla = document.getElementById('TablaCuentas').getElementsByTagName('tbody')[0];
    const fila = tabla.insertRow();
    fila.insertCell(0).innerText = registro.rfc;
    fila.insertCell(1).innerText = registro.paterno;
    fila.insertCell(2).innerText = registro.materno;
    fila.insertCell(3).innerText = registro.nombre;
    fila.insertCell(4).innerText = registro.promedio;
    fila.insertCell(5).innerText = registro.CLABE;
    //boton editar
    const theId = 'accionesCell-' + registro.idAlumno
    const accionesCell = fila.insertCell(6).id = theId;
    const celdaBoton = document.getElementById(theId);
    const editarBtn = document.createElement('button');
    editarBtn.className = 'btn-primary';
    editarBtn.title = 'Editar';
    editarBtn.innerHTML = "<i class='fas fa-pencil'> </i>";
    editarBtn.onclick = function () {
        // Aquí puedes agregar la lógica para editar el registro
        //alert('Editar registro: ' + registro.idAlumno);
        actualizarRegistro(registro.idAlumno);
    };
    celdaBoton.appendChild(editarBtn);
    //boton eliminar
    const eliminarBtn = document.createElement('button');
    eliminarBtn.className = 'btn-danger';
    eliminarBtn.title = 'Eliminar';
    eliminarBtn.innerHTML = "<i class='fas fa-trash'> </i>";
    eliminarBtn.onclick = function () {
        // Aquí puedes agregar la lógica para eliminar el registro
        //        alert('Eliminar registro: ' + registro.idAlumno);
        eliminarRegistro(registro.idAlumno);
    }
    celdaBoton.appendChild(eliminarBtn);
}

function actualizarRegistro(idAlumno) {
    // Aquí puedes agregar la lógica para actualizar el registro
    alert('Actualizar registro: ' + idAlumno);
    window.location.href = `/cuentas/actualizar/${idAlumno}`;
}

function eliminarRegistro(idAlumno) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
        fetch(`/cuentas/auth/eliminarcta/${idAlumno}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Registro eliminado exitosamente');
                    location.reload();
                } else {
                    alert('Error al eliminar registro: ' + result.error);
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
                alert('Error de conexión');
            });
    }
}