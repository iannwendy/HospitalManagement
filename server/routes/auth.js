const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database-mysql');

// Secret key for JWT
const JWT_SECRET = 'hospital_management_secret_key';

// Simple middleware to check if user is authenticated
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Login endpoint
router.post('/login', async (req, res) => {
  console.log('Login endpoint called');
  console.log('Request body:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password' });
  }
  
  try {
    console.log('Login attempt:', { email });
    
    // Find user in database
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // For simplicity, just compare passwords directly (in real app, use bcrypt)
    if (password !== user.password) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    console.log('Login successful for user:', email);
    
    // Create JWT payload
    const payload = {
      id: user.id,
      role: user.role
    };
    
    // If user is a doctor, add doctor_id to payload
    if (user.role === 'doctor') {
      const doctorResult = await db.query('SELECT id FROM doctors WHERE user_id = ?', [user.id]);
      if (doctorResult.length > 0) {
        payload.doctor_id = doctorResult[0].id;
      }
    }
    
    // Sign token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            phone: user.phone || '',
            dateOfBirth: user.date_of_birth || '',
            gender: user.gender || '',
            address: user.address || '',
            insurance: user.insurance || ''
          }
        });
      }
    );
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user data endpoint
router.get('/me', auth, async (req, res) => {
  try {
    // Get user by ID
    const users = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return all user fields
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      phone: user.phone || '',
      dateOfBirth: user.date_of_birth || '',
      gender: user.gender || '',
      address: user.address || '',
      insurance: user.insurance || ''
    });
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register route for patients
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role = 'patient' } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Please enter all required fields' });
  }
  
  try {
    console.log('Registration attempt:', email);
    
    // Check if user already exists
    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Insert user into database
    const result = await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, password, role]
    );
    
    const userId = result.insertId;
    
    // Create JWT payload
    const payload = {
      id: userId,
      role
    };
    
    // Sign token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: userId,
            email,
            role,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            phone: '',
            dateOfBirth: '',
            gender: '',
            address: '',
            insurance: ''
          }
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register patient route (separate endpoint specifically for patients)
router.post('/register/patient', async (req, res) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    dateOfBirth, 
    gender, 
    phone 
  } = req.body;
  
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Please enter all required fields' });
  }
  
  try {
    console.log('Registration attempt:', email);
    
    // Check if user already exists
    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Insert user into database with role = 'patient'
    const result = await db.query(
      `
      INSERT INTO users (email, password, role, first_name, last_name, date_of_birth, gender, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, password, 'patient', firstName, lastName, dateOfBirth, gender, phone]
    );
    
    const userId = result.insertId;
    
    // Create JWT payload
    const payload = {
      id: userId,
      role: 'patient'
    };
    
    // Sign token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: userId,
            email,
            role: 'patient',
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            phone: phone || '',
            dateOfBirth: dateOfBirth || '',
            gender: gender || '',
            address: '',
            insurance: ''
          }
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Database error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 