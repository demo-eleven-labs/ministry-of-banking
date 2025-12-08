const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'users.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
}

class Database {
  constructor() {
    this.loadData();
  }

  loadData() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      this.data = JSON.parse(data);
    } catch (error) {
      console.error('Error loading database:', error);
      this.data = { users: [] };
    }
  }

  saveData() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
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
      balance: 15420.5,
      currency: 'USD',
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'AI Agent',
      transactions: this.generateInitialTransactions(),
    };

    this.data.users.push(newUser);
    this.saveData();

    return newUser;
  }

  // Generate initial transactions
  generateInitialTransactions() {
    return [
      {
        id: 'TXN-001',
        type: 'credit',
        amount: 2500.0,
        description: 'Salary Deposit',
        category: 'Income',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: 'TXN-002',
        type: 'debit',
        amount: 85.2,
        description: 'Grocery Store',
        category: 'Shopping',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: 'TXN-003',
        type: 'debit',
        amount: 45.0,
        description: 'Internet Bill',
        category: 'Utilities',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: 'TXN-004',
        type: 'credit',
        amount: 150.0,
        description: 'Refund - Amazon',
        category: 'Refund',
        date: new Date().toISOString(),
        status: 'completed',
      },
      {
        id: 'TXN-005',
        type: 'debit',
        amount: 12.5,
        description: 'Coffee Shop',
        category: 'Food & Dining',
        date: new Date().toISOString(),
        status: 'pending',
      },
    ];
  }

  // Check if user exists by email
  userExists(email) {
    return this.data.users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Get user by email
  getUserByEmail(email) {
    return this.data.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Get all users
  getAllUsers() {
    return this.data.users;
  }

  // Get user by ID
  getUserById(userId) {
    return this.data.users.find(user => user.id === userId);
  }
}

module.exports = new Database();
