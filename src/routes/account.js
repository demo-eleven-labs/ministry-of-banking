const express = require('express');
const router = express.Router();
const database = require('../db/database');

// Get account balance by user ID
router.get('/:userId/balance', (req, res) => {
  try {
    const user = database.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
      });
    }
    res.json({
      success: true,
      data: {
        balance: user.balance,
        currency: user.currency,
        accountNumber: user.accountNumber,
        accountHolder: `${user.firstName} ${user.lastName}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get transactions by user ID
router.get('/:userId/transactions', (req, res) => {
  try {
    const user = database.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
      });
    }
    res.json({
      success: true,
      data: {
        accountHolder: `${user.firstName} ${user.lastName}`,
        transactions: user.transactions || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
