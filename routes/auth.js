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
        const checkUserQuery = 'SELECT * FROM USUARIO WHERE usuario = ? ';
        db.query(checkUserQuery, [username], async (err, results) => {
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

    const query = 'SELECT * FROM USUARIO WHERE usuario = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error del servidor' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = results[0];

        // Verificar contraseña
        //        const isValidPassword = await bcrypt.compare(password, user.password);
        const isValidPassword = (password === user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Crear sesión
        req.session.user = {
            id: user.idUsr,
            username: user.usuario,
            tipoUsuario: user.tipoUsuario,
            escuela: user.escuela,
        };
//        console.log(req.session.user);
        res.json({ message: 'Login exitoso', user: req.session.user });
    });
});

router.get('/user', (req, res) => {
    if (req.session.user) {
        // Opcional: obtener datos frescos de la base de datos
        const query = 'SELECT * FROM USUARIO WHERE idUsr = ?';
        db.query(query, [req.session.user.id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error obteniendo datos del usuario' });
            }

            if (results.length > 0) {
                res.json({ user: results[0] });
            } else {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        });
    } else {
        res.status(401).json({ error: 'No autenticado' });
    }
});


router.get('/escuela', (req, res) => {
    if (req.session.user) {
        // Opcional: obtener datos frescos de la base de datos
        console.log(req.session.user.escuela);
        const query = 'SELECT * FROM ESCUELA WHERE idEscuela = ?';
        db.query(query, [req.session.user.escuela], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error obteniendo datos de la escuela' });
            }

            if (results.length > 0) {
                res.json({ escuela: results[0] });
            } else {
                res.status(404).json({ error: 'Escuela no encontrada' });
            }
        });
    } else {
        res.status(401).json({ error: 'No autenticado' });
    }
});


module.exports = router;