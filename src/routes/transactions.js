const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { createErrorResponse, createSuccessResponse } = require('../common/errorCodes');

const TRANSACTIONS_FILE = path.join(__dirname, '../db/transactions.json');

function readTransactions() {
  try {
    const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading transactions:', error);
    return { transactions: [] };
  }
}

function writeTransactions(data) {
  try {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing transactions:', error);
    return false;
  }
}

// Search for specific transaction by user email
router.get('/search', (req, res) => {
  try {
    const { email, date, dateFrom, dateTo, description, amount } = req.query;

    if (!email) {
      return res
        .status(200)
        .json(createErrorResponse('MISSING_REQUIRED_FIELDS', 'email query parameter is required'));
    }

    if (!date && !dateFrom && !dateTo && !description && !amount) {
      return res
        .status(200)
        .json(
          createErrorResponse(
            'MISSING_SEARCH_CRITERIA',
            'At least one search parameter (date, dateFrom, dateTo, description, or amount) is required.'
          )
        );
    }

    // Validate that date and dateFrom/dateTo are not used together
    if (date && (dateFrom || dateTo)) {
      return res
        .status(200)
        .json(
          createErrorResponse(
            'INVALID_SEARCH_CRITERIA',
            'Cannot use both "date" and "dateFrom/dateTo" parameters together. Use either exact date or date range.'
          )
        );
    }

    // Get user by email
    const database = require('../db/database');
    const user = database.getUserByEmail(email);

    if (!user) {
      return res
        .status(200)
        .json(createErrorResponse('USER_NOT_FOUND', 'User not found with provided email'));
    }

    const transactionsData = readTransactions();

    // Filter transactions for this user
    let userTransactions = transactionsData.transactions.filter(t => t.userId === user.id);

    if (date) {
      const searchDate = new Date(date).toISOString().split('T')[0];
      userTransactions = userTransactions.filter(t => {
        const txnDate = new Date(t.date).toISOString().split('T')[0];
        return txnDate === searchDate;
      });
    }

    if (dateFrom || dateTo) {
      userTransactions = userTransactions.filter(t => {
        const txnDate = new Date(t.date).toISOString().split('T')[0];

        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom).toISOString().split('T')[0];
          const toDate = new Date(dateTo).toISOString().split('T')[0];
          return txnDate >= fromDate && txnDate <= toDate;
        } else if (dateFrom) {
          const fromDate = new Date(dateFrom).toISOString().split('T')[0];
          return txnDate >= fromDate;
        } else if (dateTo) {
          const toDate = new Date(dateTo).toISOString().split('T')[0];
          return txnDate <= toDate;
        }
        return true;
      });
    }

    if (description) {
      const searchDesc = description.toLowerCase();
      userTransactions = userTransactions.filter(t =>
        t.description.toLowerCase().includes(searchDesc)
      );
    }

    if (amount) {
      const searchAmount = parseFloat(amount);
      userTransactions = userTransactions.filter(t => Math.abs(t.amount - searchAmount) < 0.01);
    }

    res.json({
      success: true,
      data: {
        userId: user.id,
        userEmail: email,
        searchCriteria: { date, dateFrom, dateTo, description, amount },
        count: userTransactions.length,
        transactions: userTransactions,
      },
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

// Create a dispute for a transaction by user email
router.post('/dispute', (req, res) => {
  try {
    const { email, transactionId, reason } = req.body;

    if (!email) {
      return res
        .status(200)
        .json(createErrorResponse('MISSING_REQUIRED_FIELDS', 'email is required'));
    }

    if (!transactionId) {
      return res
        .status(200)
        .json(createErrorResponse('MISSING_REQUIRED_FIELDS', 'transactionId is required'));
    }

    // Get user by email
    const database = require('../db/database');
    const user = database.getUserByEmail(email);

    if (!user) {
      return res
        .status(200)
        .json(createErrorResponse('USER_NOT_FOUND', 'User not found with provided email'));
    }

    const transactionsData = readTransactions();

    const originalTransaction = transactionsData.transactions.find(
      t => t.id === transactionId && t.userId === user.id
    );

    if (!originalTransaction) {
      return res.status(200).json(createErrorResponse('TRANSACTION_NOT_FOUND'));
    }

    const existingDispute = transactionsData.transactions.find(
      t =>
        t.description.includes(`Dispute - ${originalTransaction.description}`) &&
        t.userId === user.id
    );

    if (existingDispute) {
      return res.status(200).json({
        ...createErrorResponse('DISPUTE_ALREADY_EXISTS'),
        disputeTransaction: existingDispute,
      });
    }

    // Create a credit transaction to "refund" the disputed amount
    const disputeTransaction = {
      id: `TXN-DISPUTE-${Date.now()}`,
      userId: user.id,
      accountNumber: originalTransaction.accountNumber,
      type: 'credit',
      amount: originalTransaction.amount,
      description: `Dispute - ${originalTransaction.description}`,
      category: 'Dispute',
      date: new Date().toISOString(),
      status: 'pending',
      disputedTransactionId: transactionId,
      disputeReason: reason || 'Customer dispute',
    };

    transactionsData.transactions.push(disputeTransaction);

    const saved = writeTransactions(transactionsData);

    if (!saved) {
      return res
        .status(500)
        .json(createErrorResponse('INTERNAL_ERROR', 'Failed to save dispute transaction'));
    }

    res.json({
      success: true,
      message: 'Dispute transaction created successfully',
      data: {
        originalTransaction: originalTransaction,
        disputeTransaction: disputeTransaction,
        note: 'A support ticket should be created in Zendesk for review',
      },
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

// Get all transactions for a user
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const transactionsData = readTransactions();

    const userTransactions = transactionsData.transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        userId: userId,
        count: userTransactions.length,
        transactions: userTransactions,
      },
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

// Get specific transaction by ID
router.get('/:userId/transaction/:transactionId', (req, res) => {
  try {
    const { userId, transactionId } = req.params;
    const transactionsData = readTransactions();

    const transaction = transactionsData.transactions.find(
      t => t.id === transactionId && t.userId === userId
    );

    if (!transaction) {
      return res.status(200).json(createErrorResponse('TRANSACTION_NOT_FOUND'));
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('INTERNAL_ERROR'));
  }
});

module.exports = router;
