document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado
    checkAuthentication();
    
    // Cargar información del usuario
    loadUserInfo();
});

async function checkAuthentication() {
    try {
        const response = await fetch('/auth/check', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/';
        }
    } catch (error) {
        window.location.href = '/';
    }
}

function loadUserInfo() {
    // Esta información debería venir de la sesión o de una API
    // Por ahora, la mostraremos desde el servidor mediante datos incrustados
    // o podríamos hacer una petición al servidor
    
    // Simulamos la carga de datos (en una app real, esto vendría del servidor)
    const userData = {
        id: '123',
        username: 'usuario_ejemplo',
        email: 'usuario@ejemplo.com'
    };

    document.getElementById('userWelcome').textContent += userData.username;
    document.getElementById('userUsername').textContent = userData.username;
    document.getElementById('userEmail').textContent = userData.email;
    document.getElementById('userId').textContent = userData.id;
}

function showProfile() {
    alert('Funcionalidad de perfil en desarrollo');
}

function showSettings() {
    alert('Funcionalidad de configuración en desarrollo');
}

function showReports() {
    alert('Funcionalidad de reportes en desarrollo');
}

// Verificar sesión periódicamente
setInterval(checkAuthentication, 300000); // Cada 5 minutos