document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = new FormData(loginForm);
            const data = {
                username: formData.get('username'),
                password: formData.get('password')
            };

            try {
                const response = await fetch('/cuentas/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage('Login exitoso! Redirigiendo...', 'success');
                    setTimeout(() => {
                        window.location.href = '/cuentas/dashboard';
                    }, 1000);
                } else {
                    showMessage(result.error, 'error');
                }
            } catch (error) {
                showMessage('Error de conexión', 'error');
            }
        });
    }

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }
    async function checkSession() {
        try {
            const response = await fetch('/cuentas/auth/check');
            const result = await response.json();

            if (result.authenticated) {
                window.location.href = '/cuentas/dashboard';
            }
        } catch (error) {
            console.log('No hay sesión activa');
        }
    }
});