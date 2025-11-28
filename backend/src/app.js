// Requires

const express = require('express');
const cors = require('cors'); // Permite solicitudes HTTP de afuera
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./database/models/index');
const api_routes = require('./routes/api');

// Initialize the express application

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares

app.use(cors({
    origin: 'http://localhost:5173', // URL de tu frontend
    credentials: true, // si usás cookies o headers con auth
  }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connection to DB

const test_db_connection = async () => {

    try {
        await db.sequelize.authenticate();
        console.log('Conexión a la base de datos establecida.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
        process.exit(1);
    }
};

test_db_connection();

console.log('Current environment:', process.env.NODE_ENV);

// Route System require and use

app.use('/api/v1', api_routes);

// Run server

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
});