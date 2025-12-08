const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const usersRoutes = require('./routes/users');
const accountRoutes = require('./routes/account');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/users', usersRoutes);
app.use('/api/account', accountRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Ministry of Banking API is running',
    timestamp: new Date().toISOString(),
  });
});

// Frontend routes

// Root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Admin dashboard to view users
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════');
  console.log('🚀 Ministry of Banking Server is running');
  console.log('═══════════════════════════════════════════════');
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`Admin Panel: http://localhost:${PORT}/admin`);
  console.log('═══════════════════════════════════════════════');
});
