const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

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
        if (req.session.user.tipoUsuario == '2') {
            res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
        } else {
            res.sendFile(path.join(__dirname, 'views', 'adminboard.html'));
        }
    } else {
        res.redirect('/');
    }
});

app.get('/captura', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'views', 'capturados.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/agregar', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'views', 'agregar.html'));
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

app.get('/actualizar/:idAlumno', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'views', 'actualizar.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/imprimirEscuela/:idEscuela', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'imprimirEscuela.html'));
});


app.get('/generaPDF/:idEscuela', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = `http://localhost:3000/imprimirEscuela/${req.params.idEscuela}`;
    console.log('Generando PDF para URL:', url);
    generarPDFAvanzado(url, 'documento-avanzado.pdf')
        .then(() => console.log('Proceso completado'))
        .catch(err => console.error('Error:', err));

    res.sendFile(path.join(__dirname, 'documento-avanzado.pdf'));

    await browser.close();
    // Eliminar el archivo después de enviarlo al cliente
    fs.unlink('documento-avanzado.pdf', (err) => {
        if (err) {
            console.error('Error al eliminar el archivo:', err);
        } else {
            console.log('Archivo eliminado exitosamente');
        }

    });
});


async function generarPDFAvanzado(url, outputPath) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        // Configurar viewport
        await page.setViewport({ width: 1200, height: 800 });

        // Navegar a la página
        await page.goto(url, {
            waitUntil: 'networkidle0',
        });

        // Esperar a que ciertos elementos carguen (opcional)
        await page.waitForSelector('body');

        // Opciones avanzadas para el PDF
        const pdfOptions = {
            path: outputPath,
            format: 'LETTER',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="font-size: 10px; text-align: center; width: 100%;">
                    Página <span class="pageNumber"></span> de <span class="totalPages"></span>
                </div>
            `,
            footerTemplate: `
                <div style="font-size: 10px; text-align: center; width: 100%;">
                    Generado el ${new Date().toLocaleDateString()}
                </div>
            `,
            margin: {
                top: '40mm',
                right: '20mm',
                bottom: '40mm',
                left: '20mm'
            },
            preferCSSPageSize: true
        };

        // Generar PDF
        const pdfBuffer = await page.pdf(pdfOptions);

        console.log('PDF generado exitosamente');
        return pdfBuffer;

    } catch (error) {
        console.error('Error al generar PDF:', error);
        throw error;
    } finally {
        await browser.close();
    }
}


//server

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
