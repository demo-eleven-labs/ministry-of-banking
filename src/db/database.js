const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'users.json');
const CARDS_FILE = path.join(__dirname, 'cards.json');

// Initialize database files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
}
if (!fs.existsSync(CARDS_FILE)) {
  fs.writeFileSync(CARDS_FILE, JSON.stringify({ cards: [] }, null, 2));
}

class Database {
  constructor() {
    this.loadData();
  }

  loadData() {
    try {
      const usersData = fs.readFileSync(USERS_FILE, 'utf8');
      const cardsData = fs.readFileSync(CARDS_FILE, 'utf8');
      this.data = {
        users: JSON.parse(usersData).users || [],
        cards: JSON.parse(cardsData).cards || [],
      };
    } catch (error) {
      console.error('Error loading database:', error);
      this.data = { users: [], cards: [] };
    }
  }

  saveData() {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users: this.data.users }, null, 2));
      fs.writeFileSync(CARDS_FILE, JSON.stringify({ cards: this.data.cards }, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Create new user
  createUser(userData) {
    const userId = `USER-${Date.now()}`;
    const accountNumber = `ACC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const newUser = {
      id: userId,
      accountNumber: accountNumber,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      dateOfBirth: userData.dateOfBirth,
      address: userData.address || '',
      balance: 10000,
      currency: 'USD',
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'AI Agent',
    };

    this.data.users.push(newUser);
    this.saveData();

    return newUser;
  }

  // Check if user exists by email
  userExists(email) {
    return this.data.users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Get user by email
  getUserByEmail(email) {
    return this.data.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Get user by account number
  getUserAccountNumber(accountNumber) {
    return this.data.users.find(
      user => user.accountNumber.toLowerCase() === accountNumber.toLowerCase()
    );
  }

  // Get all users
  getAllUsers() {
    return this.data.users;
  }

  // Get user by ID
  getUserById(userId) {
    return this.data.users.find(user => user.id === userId);
  }

  // Get all cards for a user
  getUserCards(userId) {
    return this.data.cards.filter(card => card.userId === userId);
  }

  // Get all active cards for a user
  getActiveUserCards(userId) {
    return this.data.cards.filter(card => card.userId === userId && card.status === 'active');
  }

  // Create new card
  createCard(cardData) {
    const cardId = `CARD-${Date.now()}`;
    const fullCardNumber = this.generateCardNumber();
    const last4Digits = fullCardNumber.slice(-4);
    const maskedCardNumber = `**** **** **** ${last4Digits}`;

    const newCard = {
      id: cardId,
      userId: cardData.userId,
      cardNumber: maskedCardNumber,
      cardType: cardData.cardType || 'debit',
      cardBrand: cardData.cardBrand || 'Visa',
      expiryDate: this.generateExpiryDate(),
      status: 'active',
      issuedAt: new Date().toISOString(),
      cardholderName: cardData.cardholderName,
    };

    this.data.cards.push(newCard);
    this.saveData();

    return newCard;
  }

  // Card number - 16 digits
  generateCardNumber() {
    const prefix = '4532'; // Visa prefix
    let number = prefix;
    for (let i = 0; i < 12; i++) {
      number += Math.floor(Math.random() * 10);
    }
    return number;
  }

  // Expiry date - 3 years from now
  generateExpiryDate() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear() + 3).slice(-2);
    return `${month}/${year}`;
  }

  // Update card status
  updateCardStatus(cardId, newStatus) {
    const card = this.data.cards.find(c => c.id === cardId);
    if (card) {
      card.status = newStatus;
      this.saveData();
      return card;
    }
    return null;
  }
}

module.exports = new Database();
