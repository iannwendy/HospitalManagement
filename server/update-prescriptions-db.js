const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function updateDatabase() {
  // Create a connection to the database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_db',
    multipleStatements: true
  });

  try {
    console.log('Connected to the database.');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database', 'prescription-tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL script
    console.log('Executing SQL script...');
    await connection.query(sql);
    console.log('Prescription tables created successfully!');
    
    // Insert sample data if needed
    console.log('Database update completed.');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    // Close the connection
    await connection.end();
    console.log('Database connection closed.');
  }
}

// Run the update
updateDatabase().catch(console.error); 