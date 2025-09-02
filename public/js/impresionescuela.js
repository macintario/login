document.addEventListener('DOMContentLoaded', function () {
        cargaCapturados();
});


async function cargaCapturados() {
    console.log('Cargando datos capturados...');

    const idEscuela = window.location.pathname.split('/').slice(-1)[0];
    console.log('ID Escuela:', window.location.pathname);
    const destino = `/cuentas/auth/imprimirEscuela/${idEscuela}`;
    var registros = 0;
    fetch(destino).then(response => response.json()).then(data => {
        console.log('Datos recibidos:', data);
        for (const registro of data) {
//            for(var i=0; i < 20; i++) {
            registros += 1;
            if (registros == 1) {
//                document.getElementById('Titulo').innerText = `Cuentas Capturadas - Escuela: ${registro.escuela} (Total de cuentas: ${data.length})`;
            }
            console.log('Registro:', registro);
            agregaFila(registro);
//            }
        }
    }).catch(error => {
                console.error('Error al obtener datos de cuentas:', error);
    });
}

function agregaFila(registro) {
    const tabla = document.getElementById('TablaCuentas').getElementsByTagName('tbody')[0];
    const fila = tabla.insertRow();
    //console.log('Registro:', registro);    
    fila.insertCell(0).innerText = registro.rfc;
    fila.insertCell(1).innerText = registro.paterno;
    fila.insertCell(2).innerText = registro.materno;
    fila.insertCell(3).innerText = registro.nombre;
    fila.insertCell(4).innerText = registro.promedio;
    fila.insertCell(5).innerText = registro.CLABE;
}