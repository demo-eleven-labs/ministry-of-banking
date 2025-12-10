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
    const { email, cardType } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
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
        cardNumber: `•••• •••• •••• ${newCard.cardNumber.slice(-4)}`,
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
