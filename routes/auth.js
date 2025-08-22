const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const router = express.Router();

// Registrar usuario
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validar campos
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // Verificar si el usuario ya existe
        const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
        db.query(checkUserQuery, [username, email], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error del servidor' });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: 'Usuario o email ya existen' });
            }

            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar usuario
            const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error creando usuario' });
                }
                res.status(201).json({ message: 'Usuario creado exitosamente' });
            });
        });

    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Login de usuario
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error del servidor' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = results[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Crear sesión
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        res.json({ message: 'Login exitoso', user: req.session.user });
    });
});

module.exports = router;