const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

// Create/connect to SQLite database
const db = new Database('hospital.db', { verbose: console.log });

const app = express();
const PORT = 3000;

// Initialize database with test accounts
function initializeDatabase() {
  // Create users table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      firstName TEXT,
      lastName TEXT,
      dateOfBirth TEXT,
      gender TEXT,
      phone TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Basic test accounts
  const testAccounts = [
    { email: 'patient@test.com', password: 'password123', role: 'patient', firstName: 'Test', lastName: 'Patient' },
    { email: 'doctor@test.com', password: 'password123', role: 'doctor', firstName: 'Test', lastName: 'Doctor' },
    { email: 'nurse@test.com', password: 'password123', role: 'nurse', firstName: 'Test', lastName: 'Nurse' },
    { email: 'admin@test.com', password: 'password123', role: 'admin', firstName: 'Test', lastName: 'Admin' },
    { email: 'john@example.com', password: 'password123', role: 'patient', firstName: 'John', lastName: 'Doe' },
    { email: 'drsmith@example.com', password: 'password123', role: 'doctor', firstName: 'Sarah', lastName: 'Smith' }
  ];

  // Insert test accounts if they don't exist
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, password, role, firstName, lastName)
    VALUES (@email, @password, @role, @firstName, @lastName)
  `);

  // Begin a transaction
  const insertMany = db.transaction((users) => {
    for (const user of users) {
      insertUser.run(user);
    }
  });

  // Execute the transaction
  insertMany(testAccounts);
  console.log('Database initialized with test accounts');
}

// Initialize the database
initializeDatabase();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Print all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Login endpoint
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });
  
  try {
    // Find user in database
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(400).json({ 
        error: 'We could not find an account with that email address. Please check your email or register for a new account.' 
      });
    }
    
    if (user.password !== password) {
      return res.status(400).json({ 
        error: 'The password you entered is incorrect. Please try again or use the "Forgot Password" option.' 
      });
    }
    
    // Return successful login response
    res.json({
      token: 'fake-token-' + Date.now(),
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'We\'re experiencing technical difficulties. Please try again later or contact support if the problem persists.' 
    });
  }
});

// Patient registration endpoint
app.post('/auth/register/patient', (req, res) => {
  const userData = req.body;
  console.log('Registration attempt:', userData.email);
  
  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT email FROM users WHERE email = ?').get(userData.email);
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'This email address is already registered. Please use a different email or try logging in.' 
      });
    }
    
    // Insert the new user
    const insertUser = db.prepare(`
      INSERT INTO users (email, password, role, firstName, lastName, dateOfBirth, gender, phone)
      VALUES (@email, @password, @role, @firstName, @lastName, @dateOfBirth, @gender, @phone)
    `);
    
    const newUser = {
      email: userData.email,
      password: userData.password,
      role: 'patient',
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      phone: userData.phone
    };
    
    const result = insertUser.run(newUser);
    console.log('New user registered:', newUser.email, 'ID:', result.lastInsertRowid);
    
    // Return successful registration
    res.status(201).json({
      token: 'fake-token-' + Date.now(),
      user: {
        id: result.lastInsertRowid,
        email: userData.email,
        role: 'patient'
      },
      message: 'Your account has been created successfully. Welcome to our healthcare system!'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'We encountered an issue while creating your account. Please try again later or contact support.' 
    });
  }
});

// Add current user endpoint
app.get('/auth/me', (req, res) => {
  const token = req.header('x-auth-token');
  
  // If no token, return unauthorized
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  
  // For testing, always return a dummy user
  res.json({
    id: 1,
    email: 'test@example.com',
    role: 'patient'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}/`);
  console.log(`Network URL: http://${getLocalIp()}:${PORT}/`);
});

// Handle errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
  } else {
    console.error('Server error:', error);
  }
});

// Get local IP address for network access
function getLocalIp() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '0.0.0.0';
} 