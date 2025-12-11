const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

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

// Get all transactions for a user
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const transactionsData = readTransactions();

    const userTransactions = transactionsData.transactions.filter(t => t.userId === userId);

    res.json({
      success: true,
      data: {
        userId: userId,
        count: userTransactions.length,
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

// Search for specific transaction by date and description
router.get('/:userId/search', (req, res) => {
  try {
    const { userId } = req.params;
    const { date, description, amount } = req.query;

    if (!date && !description && !amount) {
      return res.status(400).json({
        success: false,
        error: 'At least one search parameter (date, description, or amount) is required',
      });
    }

    const transactionsData = readTransactions();

    let userTransactions = transactionsData.transactions.filter(t => t.userId === userId);

    if (date) {
      const searchDate = new Date(date).toISOString().split('T')[0];
      userTransactions = userTransactions.filter(t => {
        const txnDate = new Date(t.date).toISOString().split('T')[0];
        return txnDate === searchDate;
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
        userId: userId,
        searchCriteria: { date, description, amount },
        count: userTransactions.length,
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

// Create a dispute for a transaction
router.post('/:userId/dispute', (req, res) => {
  try {
    const { userId } = req.params;
    const { transactionId, reason } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID is required',
      });
    }

    const transactionsData = readTransactions();

    const originalTransaction = transactionsData.transactions.find(
      t => t.id === transactionId && t.userId === userId
    );

    if (!originalTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    const existingDispute = transactionsData.transactions.find(
      t =>
        t.description.includes(`Dispute - ${originalTransaction.description}`) &&
        t.userId === userId
    );

    if (existingDispute) {
      return res.status(400).json({
        success: false,
        error: 'This transaction has already been disputed',
        disputeTransaction: existingDispute,
      });
    }

    // Create a credit transaction to "refund" the disputed amount
    const disputeTransaction = {
      id: `TXN-DISPUTE-${Date.now()}`,
      userId: userId,
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
      return res.status(500).json({
        success: false,
        error: 'Failed to save dispute transaction',
      });
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
    res.status(500).json({
      success: false,
      error: error.message,
    });
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
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
