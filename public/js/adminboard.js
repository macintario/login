document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication().then(() => {
        cargaCapturados();
    });
});

async function checkAuthentication() {
    try {
        const response = await fetch('/auth/check');
        const result = await response.json();
        
        if (!result.authenticated) {
            window.location.href = '/';
        }
    } catch (error) {
        window.location.href = '/';
    }
}


async function cargaCapturados() {
    console.log('Cargando datos capturados...');
    fetch('/auth/totesc').then(response => response.json()).then(data => {
        console.log('Datos recibidos:', data);
        for (const registro of data.data) {
                        console.log('Registro:', registro);
            agregaFila(registro);
        }
    }).catch(error => {
//        console.error('Error al obtener datos de cuentas:', error);
    });
}

function agregaFila(registro) {
    const tabla = document.getElementById('totalesTable').getElementsByTagName('tbody')[0];
    const fila = tabla.insertRow();
    fila.insertCell(0).innerText = registro.escuela;
    fila.insertCell(1).innerText = registro.casos;
    //boton imprimir
    const theId = 'accionesCell-' + registro.idEscuela;
    const accionesCell = fila.insertCell(2).id = theId;
    const celdaBoton = document.getElementById(theId);
    const imprimirBtn = document.createElement('button');
    imprimirBtn.className = 'btn-secondary';
    imprimirBtn.title = 'Imprimir';
    imprimirBtn.innerHTML = "<i class='fas fa-print'> </i>";
    imprimirBtn.onclick = function() {
        alert('Funcionalidad de impresión en desarrollo');
    };
    celdaBoton.appendChild(imprimirBtn);
}


function displayUserInfo(user) {
    document.getElementById('userWelcome').textContent += user.usuario;
}

function createCreatedAtElement() {
    const infoCard = document.querySelector('.info-card');
    const createdAtP = document.createElement('p');
    createdAtP.innerHTML = '<strong>Fecha de registro:</strong> <span id="userCreatedAt"></span>';
    infoCard.appendChild(createdAtP);
    return document.getElementById('userCreatedAt');
}

function showMessage(message, type) {
    // Crear elemento de mensaje si no existe
    let messageDiv = document.getElementById('dashboardMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'dashboardMessage';
        messageDiv.className = `message ${type}`;
        document.querySelector('.dashboard-container').prepend(messageDiv);
    }
    
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Funciones de las acciones
function showProfile() {
    // Obtener datos frescos antes de mostrar el perfil
    fetch('/auth/escuela')
        .then(response => response.json())
        .then(data => {
            alert(`Perfil de ${data.escuela.siglas}`);
        })
        .catch(error => {
            alert('Error cargando información del perfil');
        });
}


function capturaDatos(){
    console.log('Redirigiendo a captura de datos...');
    window.location.href = '/captura';
}


function showSettings() {
    alert('Funcionalidad de configuración en desarrollo');
}

function showReports() {
    alert('Funcionalidad de reportes en desarrollo');
}

// Verificar sesión periódicamente
setInterval(checkAuthentication, 300000);