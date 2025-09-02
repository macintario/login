document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication().then(() => {
        loadUserInfo();
    });
});

async function checkAuthentication() {
    try {
        const response = await fetch('/cuentas/auth/check');
        const result = await response.json();
        
        if (!result.authenticated) {
            window.location.href = '/cuentas';
        }
    } catch (error) {
        window.location.href = '/cuentas';
    }
}

async function loadUserInfo() {
    try {
        const response = await fetch('/cuentas/auth/user');
        const result = await response.json();
        
        if (response.ok) {
            displayUserInfo(result.user);
        } else {
//            console.error('Error loading user info:', result.error);
            showMessage('Error cargando información del usuario', 'error');
        }
    } catch (error) {
//        console.error('Error:', error);
        showMessage('Error de conexión', 'error');
    }
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
    fetch('/cuentas/auth/escuela')
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