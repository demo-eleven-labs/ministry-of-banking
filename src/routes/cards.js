const express = require('express');
const router = express.Router();
const database = require('../db/database');

// Get all cards for a user
router.get('/user/:userId', (req, res) => {
  try {
    const cards = database.getUserCards(req.params.userId);
    res.json({
      success: true,
      data: { cards },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get active cards for a user
router.get('/user/:userId/active', (req, res) => {
  try {
    const cards = database.getActiveUserCards(req.params.userId);
    res.json({
      success: true,
      data: { cards, count: cards.length },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Issue new card
router.post('/issue-card', (req, res) => {
  try {
    const { email, cardType, dateOfBirth, accountNumber } = req.body;

    if (!email || !dateOfBirth || !accountNumber) {
      return res.status(400).json({
        success: false,
        error: 'Email, date of birth, and account number are required for identity verification',
      });
    }

    // Find user by email
    const user = database.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found with this email',
      });
    }

    // Identity verification
    if (user.dateOfBirth !== dateOfBirth || user.accountNumber !== accountNumber) {
      return res.status(403).json({
        success: false,
        error: 'Identity verification failed. Date of birth or account number does not match.',
      });
    }

    // Create new card
    const newCard = database.createCard({
      userId: user.id,
      cardType: cardType || 'debit',
      cardBrand: 'Visa',
      cardholderName: `${user.firstName} ${user.lastName}`,
    });

    res.status(201).json({
      success: true,
      message: `New ${newCard.cardType} card issued successfully`,
      data: {
        cardId: newCard.id,
        cardNumber: newCard.cardNumber,
        cardType: newCard.cardType,
        cardBrand: newCard.cardBrand,
        expiryDate: newCard.expiryDate,
        cardholderName: newCard.cardholderName,
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
