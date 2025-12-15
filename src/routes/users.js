const express = require('express');
const router = express.Router();
const database = require('../db/database');
const { sendOTP, isOTPValid } = require('../common/otp');
const { createErrorResponse, createSuccessResponse } = require('../common/errorCodes');

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
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

// Get user by account number
router.get('/filter/:accountNumber', (req, res) => {
  try {
    console.log('Fetching user with account number:', req.params.accountNumber);
    const user = database.getUserAccountNumber(req.params.accountNumber);
    if (!user) {
      return res.status(200).json(createErrorResponse('USER_NOT_FOUND'));
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

// Get user by email
router.get('/:email', (req, res) => {
  try {
    const user = database.getUserByEmail(req.params.email);
    if (!user) {
      return res.status(200).json(createErrorResponse('USER_NOT_FOUND'));
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

// Login user
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(200)
        .json(createErrorResponse('MISSING_REQUIRED_FIELDS', 'Email and password are required'));
    }

    // Hardcoded password - should be "demo"
    const HARDCODED_PASSWORD = 'demo';

    // Check if password matches hardcoded value
    if (password !== HARDCODED_PASSWORD) {
      return res.status(200).json(createErrorResponse('INVALID_CREDENTIALS'));
    }

    // Find user by email
    const user = database.getUserByEmail(email);
    if (!user) {
      return res.status(200).json(createErrorResponse('INVALID_CREDENTIALS'));
    }

    // Return user data (excluding sensitive information if needed)
    res.json({
      success: true,
      message: 'Login successful',
      data: user,
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

// Create new user
router.post('/create', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth } = req.body;

    if (!firstName || !lastName || !email || !phone || !dateOfBirth) {
      return res
        .status(200)
        .json(createErrorResponse('MISSING_REQUIRED_FIELDS', 'All fields are required'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(200).json(createErrorResponse('INVALID_EMAIL_FORMAT'));
    }

    if (database.userExists(email)) {
      return res.status(200).json(createErrorResponse('USER_ALREADY_EXISTS'));
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
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

// Send OTP code to user's email
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(200)
        .json(createErrorResponse('MISSING_REQUIRED_FIELDS', 'Email is required'));
    }

    // Check if user exists
    const user = database.getUserByEmail(email);
    if (!user) {
      return res
        .status(200)
        .json(createErrorResponse('USER_NOT_FOUND', 'User not found with this email'));
    }

    // Generate and send OTP
    const otpResult = await sendOTP(email);

    if (!otpResult.success) {
      return res.status(500).json(createErrorResponse('OTP_SEND_FAILED', otpResult.message));
    }

    // Save OTP to user record
    database.updateUser(email, {
      otp: otpResult.otp,
      otpExpiresAt: otpResult.expiresAt,
    });

    res.json({
      success: true,
      message: otpResult.message,
      demoOTP: otpResult.otp, // For demo/testing, to be visible in browser console
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

// Verify user identity with OTP, date of birth, and account number
router.post('/verify-identity', (req, res) => {
  try {
    const { email, dateOfBirth, accountNumber, otp } = req.body;

    if (!email || !dateOfBirth || !accountNumber || !otp) {
      return res
        .status(200)
        .json(
          createErrorResponse(
            'MISSING_REQUIRED_FIELDS',
            'Email, date of birth, account number, and OTP are required'
          )
        );
    }

    // Get user with OTP data for verification
    const userWithOTP = database._getUserWithOTP(email);
    if (!userWithOTP) {
      return res.status(200).json(createErrorResponse('USER_NOT_FOUND'));
    }

    if (userWithOTP.dateOfBirth !== dateOfBirth) {
      return res.status(200).json(createErrorResponse('DATE_OF_BIRTH_MISMATCH'));
    }

    if (userWithOTP.accountNumber !== accountNumber) {
      return res.status(200).json(createErrorResponse('ACCOUNT_NUMBER_MISMATCH'));
    }

    if (!userWithOTP.otp) {
      return res.status(200).json(createErrorResponse('OTP_NOT_FOUND'));
    }

    if (!isOTPValid(userWithOTP.otpExpiresAt)) {
      database.updateUser(email, {
        otp: null,
        otpExpiresAt: null,
      });

      return res.status(200).json(createErrorResponse('OTP_EXPIRED'));
    }

    if (userWithOTP.otp !== otp) {
      return res.status(200).json(createErrorResponse('INVALID_OTP'));
    }

    // All verifications passed
    database.updateUser(email, {
      otp: null,
      otpExpiresAt: null,
      lastVerifiedAt: new Date().toISOString(),
    });

    // Get clean user data without OTP fields
    const userData = database.getUserByEmail(email);

    res.json({
      success: true,
      message: 'Identity verified successfully',
      data: userData,
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

module.exports = router;
