const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Basic authentication routes
app.post('/api/users', (req, res) => {
  const { name, email, password } = req.body;
  
  // For testing only - in production, you would validate and store in database
  console.log('Registration attempt:', { name, email });
  
  // Return a successful response with a mock token
  res.status(201).json({
    _id: `user_${Date.now()}`,
    name,
    email,
    token: 'mock_jwt_token_for_testing',
  });
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  
  // For testing only - in production, you would validate credentials
  console.log('Login attempt:', { email });
  
  // Return a successful response with a mock token
  res.status(200).json({
    _id: `user_${Date.now()}`,
    name: 'Test User',
    email,
    token: 'mock_jwt_token_for_testing',
  });
});

// Status route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

// Get port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 