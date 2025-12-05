const express = require('express');
const Firebird = require('node-firebird');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuración de la base de datos
const dbConfig = {
    host: 'localhost',
    port: 13150,
    database: 'C:\\Program Files (x86)\\Common Files\\Aspel\\Sistemas Aspel\\COI10.00\\Datos\\Empresa1\\COI10EMPRE1.FDB',
    user: 'SYSDBA',
    password: 'masterkey',
    lowercase_keys: false,
    role: null,
    pageSize: 4096
};

// Servir archivos estáticos
app.use(express.static('public'));

// Ruta para obtener los datos
app.get('/api/saldos', (req, res) => {
    Firebird.attach(dbConfig, (err, db) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.status(500).json({ 
                error: 'Error al conectar a la base de datos',
                details: err.message 
            });
        }

        const query = 'SELECT NUM_CTA, NOMBRE, ABONO01, CARGO01, ABONO02 FROM SALDOS25';

        db.query(query, [], (err, result) => {
            if (err) {
                console.error('Error en la consulta:', err);
                db.detach();
                return res.status(500).json({ 
                    error: 'Error al ejecutar la consulta',
                    details: err.message 
                });
            }

            db.detach();
            res.json(result);
        });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Accede a la aplicación desde tu navegador');
});