const express = require('express');
const router = express.Router();
const database = require('../db/database');

// Get all users
router.get('/', (req, res) => {
  try {
    const users = database.getAllUsers();
    res.json({
      success: true,
      users: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get user by account number
router.get('/filter/:accountNumber', (req, res) => {
  try {
    console.log('Fetching user with account number:', req.params.accountNumber);
    const user = database.getUserAccountNumber(req.params.accountNumber);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get user by email
router.get('/:email', (req, res) => {
  try {
    const user = database.getUserByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create new user
router.post('/create', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth } = req.body;

    if (!firstName || !lastName || !email || !phone || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    if (database.userExists(email)) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    const newUser = database.createUser({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
