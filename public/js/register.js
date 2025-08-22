document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            showMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        // Validar fortaleza de contraseña
        if (password.length < 6) {
            showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: password
        };

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Usuario creado exitosamente! Redirigiendo al login...', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            showMessage('Error de conexión', 'error');
        }
    });

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
});