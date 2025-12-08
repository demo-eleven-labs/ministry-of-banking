const express = require('express');
const router = express.Router();
const database = require('../db/database');
const fs = require('fs');
const path = require('path');

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

    // Read transactions from JSON file
    const transactionsPath = path.join(__dirname, '../db/transactions.json');
    const transactionsData = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));

    // Filter transactions for this user
    const userTransactions = transactionsData.transactions.filter(
      t => t.userId === req.params.userId || t.accountNumber === user.accountNumber
    );

    res.json({
      success: true,
      data: {
        accountHolder: `${user.firstName} ${user.lastName}`,
        transactions: userTransactions,
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
