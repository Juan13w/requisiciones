const mysql = require('mysql2/promise');

async function testConnection() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'requisiciones_db'
  });

  try {
    console.log('Connected to database');
    
    // Check if the requisicion table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'requisicion'");
    
    if (tables.length === 0) {
      console.log('The requisicion table does not exist. Creating it now...');
      
      // Create the requisicion table
      await connection.execute(`
        CREATE TABLE requisicion (
          id INT AUTO_INCREMENT PRIMARY KEY,
          estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          descripcion TEXT,
          cantidad INT,
          empresa VARCHAR(100),
          proceso VARCHAR(100),
          justificacion TEXT,
          nombre_solicitante VARCHAR(100),
          fecha_solicitud DATE,
          consecutivo VARCHAR(50)
        )
      `);
      
      console.log('Created requisicion table');
      
      // Insert a test record
      await connection.execute(
        'INSERT INTO requisicion (descripcion, cantidad, empresa, proceso, justificacion, nombre_solicitante, fecha_solicitud, consecutivo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['Prueba de requisición', 1, 'Empresa de Prueba', 'Proceso de Prueba', 'Justificación de prueba', 'Usuario de Prueba', new Date(), 'REQ-TEST-001']
      );
      
      console.log('Inserted test record');
    } else {
      console.log('The requisicion table already exists');
    }
    
    // Show all tables in the database
    const [allTables] = await connection.execute('SHOW TABLES');
    console.log('\nTables in database:');
    console.table(allTables);
    
    // Show data from requisicion table if it exists
    try {
      const [rows] = await connection.execute('SELECT * FROM requisicion');
      console.log('\nData in requisicion table:');
      console.table(rows);
    } catch (err) {
      console.log('\nError querying requisicion table:', err.message);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
    console.log('\nConnection closed');
  }
}

testConnection();
