const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'mi-secreto-seguro',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Rutas
app.use('/auth', authRoutes);

// Servir archivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Ruta para verificar autenticación
app.get('/auth/check', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});