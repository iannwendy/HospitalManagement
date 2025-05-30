const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Add transaction methods to the pool
pool.beginTransaction = async function() {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
};

pool.commit = async function(connection) {
  await connection.commit();
  connection.release();
};

pool.rollback = async function(connection) {
  await connection.rollback();
  connection.release();
};

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

module.exports = pool; 