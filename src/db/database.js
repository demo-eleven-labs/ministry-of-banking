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
}

module.exports = new Database();
