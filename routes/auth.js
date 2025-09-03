const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const session = require('express-session');

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

router.get('/cuentas', (req, res) => {
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query.search?.value || '';

    console.log('/cuentas Parámetros recibidos:', { start, length, search });

    let query = `SELECT * FROM ALUMNO WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as total FROM ALUMNO WHERE 1=1`;
    let idEscuela = req.session.user.escuela;
    query += ` AND idEscuela = ${idEscuela} order by  paterno, materno, nombre`;
    countQuery += ` AND idEscuela = ${idEscuela}`;
    if (search) {
        query += ` AND (nombre LIKE '%${search}%' OR email LIKE '%${search}%')`;
        countQuery += ` AND (nombre LIKE '%${search}%' OR email LIKE '%${search}%')`;
    }

    query += ` LIMIT ${start}, ${length}`;

    //    console.log('Consultas generadas:', { query, countQuery });

    db.query(countQuery, (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            //console.log('Resultados obtenidos:', results);
            res.json({
                recordsTotal: countResult[0].total,
                recordsFiltered: countResult[0].total,
                data: results
            });
        });
    });
});

router.post('/agregarcta', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    console.log(req.body);
    const { rfc, paterno, materno, nombre, promedio, CLABE } = req.body;

    if (!rfc || !paterno || !materno || !nombre || !promedio || !CLABE) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const insertQuery = `
        INSERT INTO ALUMNO (rfc, paterno, materno, nombre, promedio, CLABE, idEscuela)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertQuery, [rfc, paterno, materno, nombre, promedio, CLABE, req.session.user.escuela], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error agregando registro' });
        }
        res.status(201).json({ success: true, message: 'Registro agregado exitosamente' });
    });
});

router.delete('/eliminarcta/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    const deleteQuery = 'DELETE FROM ALUMNO WHERE idAlumno = ?';
    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error eliminando registro' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }
        res.json({ success: true, message: 'Registro eliminado exitosamente' });
    });
});

router.post('/actualizar', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    const { id } = req.params;
    const { rfc, paterno, materno, nombre, promedio, CLABE, idEscuela, idAlumno } = req.body;
    //    console.log("Bdy");
    //    console.log(req.body);
    if (!rfc || !paterno || !materno || !nombre || !promedio || !CLABE) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const updateQuery = `
        UPDATE ALUMNO
        SET rfc = ?, paterno = ?, materno = ?, nombre = ?, promedio = ?, CLABE = ?, idEscuela = ?
        WHERE idAlumno = ?
    `;
    db.query(updateQuery, [rfc, paterno, materno, nombre, promedio, CLABE, idEscuela, idAlumno], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error actualizando registro' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }
        res.json({ success: true, message: 'Registro actualizado exitosamente' });
    });
});

router.get('/totesc', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    //    const idEscuela = req.session.user.escuela;
    console.log("Cargando totales por escuela");
    let query = `select e.idEscuela, siglas as escuela, count(*) as casos  from ALUMNO a join ESCUELA e on a.idEscuela = e.idEscuela group by e.idEscuela, siglas order by 1`;
    let countQuery = `select count(*) total from ALUMNO a join ESCUELA e on a.idEscuela = e.idEscuela`;
    //let idEscuela = req.session.user.escuela;

    //query += ` LIMIT ${start}, ${length}`;

    //    console.log('Consultas generadas:', { query, countQuery });

    db.query(countQuery, (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });
        //        console.log('Resultados de conteo obtenidos:', countResult);
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            //            console.log('Resultados obtenidos:', results);
            res.json({
                recordsTotal: countResult[0].total,
                recordsFiltered: countResult[0].total,
                data: results
            });
        });
    });
});

router.get('/obtenercta/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    const selectQuery = 'SELECT * FROM ALUMNO WHERE idAlumno = ?';
    db.query(selectQuery, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error obteniendo registro' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }
        res.json(results);
    });
});

router.get('/imprimirEscuela/:idEscuela', (req, res) => {
    /*
        if (!req.session.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }
            */
    console.log("Cargando listado por escuela..");
    const { idEscuela } = req.params;
    try {
        const selectQuery = 'SELECT rfc, paterno, materno, a.nombre as nombre, promedio, CLABE, e.siglas as escuela  FROM ALUMNO a join ESCUELA e on e.idEscuela = a.idEscuela WHERE a.idEscuela = ? ';
        console.log("Ejecutando consulta para escuela:", selectQuery, idEscuela);
        db.query(selectQuery, [idEscuela], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error obteniendo registros' });
            }
            //console.log('Resultados obtenidos:', results);
            res.json(results);
        });
    } catch (error) {
        console.error('Error en /imprimirEscuela/:idEscuela', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

module.exports = router;