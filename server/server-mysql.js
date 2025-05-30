const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database-mysql');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Add middleware to show detailed error information
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message });
});

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Create a redirect from /auth to /api/auth for compatibility
app.use('/auth', (req, res, next) => {
  console.log(`Redirecting ${req.method} /auth${req.url} to /api/auth${req.url}`);
  req.url = `/api/auth${req.url}`;
  app.handle(req, res, next);
});

// Use routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`MySQL server running on port ${PORT}`);
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

// Get local IP address for network connection
function getLocalIp() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-ipv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  
  return 'localhost';
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Server shutting down...');
  await db.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 