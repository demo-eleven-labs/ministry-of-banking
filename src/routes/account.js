const express = require('express');
const router = express.Router();
const database = require('../db/database');
const fs = require('fs');
const path = require('path');
const { createErrorResponse, createSuccessResponse } = require('../common/errorCodes');

// Get account balance by user ID
router.get('/:userId/balance', (req, res) => {
  try {
    const user = database.getUserById(req.params.userId);
    if (!user) {
      return res.status(200).json(createErrorResponse('ACCOUNT_NOT_FOUND'));
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
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

// Get transactions by user ID
router.get('/:userId/transactions', (req, res) => {
  try {
    const user = database.getUserById(req.params.userId);
    if (!user) {
      return res.status(200).json(createErrorResponse('ACCOUNT_NOT_FOUND'));
    }

    // Read transactions from JSON file
    const transactionsPath = path.join(__dirname, '../db/transactions.json');
    const transactionsData = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));

    // Filter transactions for this user
    const userTransactions = transactionsData.transactions
      .filter(t => t.userId === req.params.userId || t.accountNumber === user.accountNumber)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

    res.json({
      success: true,
      data: {
        accountHolder: `${user.firstName} ${user.lastName}`,
        transactions: userTransactions,
      },
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

module.exports = router;
