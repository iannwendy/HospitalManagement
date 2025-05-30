const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8080;
const JWT_SECRET = 'hospital_jwt_secret_hardcoded';

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Create database connection 
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hospital_db',
  waitForConnections: true,
  connectionLimit: 10
});

// Add pool to app.locals
app.locals.pool = pool;

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Portable Hospital API running' });
});

// Test route
app.post('/test', (req, res) => {
  console.log('Test request received:', req.body);
  res.json({ 
    message: 'Test endpoint working',
    body: req.body
  });
});

// Patient registration
app.post('/register/patient', async (req, res) => {
  let connection = null;
  
  try {
    console.log('Registration request received:', req.body);
    const { firstName, lastName, email, password, dateOfBirth, gender, phone } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    // Get a connection from the pool
    connection = await pool.getConnection();
    
    // Check if user already exists
    const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Begin transaction
    await connection.beginTransaction();
    
    // Create user
    const [userResult] = await connection.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, email, 'patient']
    );
    
    const userId = userResult.insertId;
    console.log('User created with ID:', userId);
    
    // Create patient profile
    await connection.query(
      'INSERT INTO patients (user_id, first_name, last_name, date_of_birth, gender, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, firstName, lastName, dateOfBirth || new Date(), gender || 'other', phone || '']
    );
    
    // Commit transaction
    await connection.commit();
    console.log('Patient profile created successfully');
    
    // Generate JWT token
    const token = jwt.sign(
      { id: userId, role: 'patient', email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      message: 'Patient registered successfully',
      token,
      user: { id: userId, email, role: 'patient' }
    });
    
  } catch (error) {
    // Rollback transaction on error
    if (connection) {
      try {
        await connection.rollback();
        console.error('Transaction rolled back.');
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
    
    console.error('Registration error details:', error.message);
    console.error('Full error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Server error during registration: ' + error.message
    });
  } finally {
    // Release the connection
    if (connection) {
      try {
        connection.release();
        console.log('Database connection released.');
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Portable server running on port ${PORT}`);
  console.log(`Try accessing: http://localhost:${PORT}/`);
  console.log(`For registration, POST to: http://localhost:${PORT}/register/patient`);
}); 