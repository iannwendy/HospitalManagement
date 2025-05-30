const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  console.log('GET /test request received');
  res.json({ message: 'Test server is working' });
});

app.post('/test', (req, res) => {
  console.log('POST /test request received');
  console.log('Body:', req.body);
  res.json({ 
    message: 'Post request received',
    body: req.body
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Try: curl http://localhost:${PORT}/test`);
}); 