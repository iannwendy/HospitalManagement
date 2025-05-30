const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Basic server is running' });
});

app.post('/register/test', (req, res) => {
  console.log('POST /register/test request received');
  console.log('Body:', req.body);
  res.json({ 
    message: 'Registration test endpoint working',
    body: req.body
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Basic server running on port ${PORT}`);
  console.log(`Try: curl http://localhost:${PORT}/`);
}); 