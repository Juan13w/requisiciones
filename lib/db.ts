import mysql from 'mysql2/promise';

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'requisiciones_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

export default pool;
