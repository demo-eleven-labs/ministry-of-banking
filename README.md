# 💳 Ministry of Banking

A prototype of digital banking application with AI-powered customer support.

![Ministry of Banking](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

## ✨ Features

### 🏦 Core Banking Features

- **Account Dashboard**
- **Transaction Management**
- **Money Transfer**
- **Bill Payments**
- **Top-Up Services**
- **Analytics Dashboard**
- **Admin Panel**

### 🤖 AI-Powered Support

- **Voice-Enabled AI Agent** - ElevenLabs integration
- **24/7 Customer Support** - Instant assistance for banking queries
- **Natural Language Processing** - Conversational banking experience
- **Zendesk Integration** - Seamless ticket management
- **Cal.com Integration** - Calendar appointments integration

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd ministry-of-banking
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**
   Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

4. **Start the server**

```bash
npm start
```

5. **Access the application**

- Frontend Dashboard: `http://localhost:3000`
- Admin Panel: `http://localhost:3000/admin`
- Transaction History: `http://localhost:3000/transactions.html`
- API Health Check: `http://localhost:3000/api/health`

## 🎨 Code Formatting

This project uses **Prettier** for consistent code formatting across the team.

### Setup Prettier

Install Prettier:

```bash
npm install
```

### Format Code

Format all files:

```bash
npm run format
```

Check formatting without making changes:

```bash
npm run format:check
```

### Configuration Files

- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to exclude from formatting

## 📁 Project Structure

```
ministry-of-banking/
├── src/
│   ├── db/
│   │   ├── database.js       # Database operations and user management
│   │   └── users.json        # User data storage (JSON-based)
│   ├── routes/
│   │   ├── account.js        # Account operations routes
│   │   └── users.js          # User authentication & management routes
│   └── server.js             # Express server configuration
├── public/
│   ├── admin.html            # Admin panel for user management
│   ├── index.html            # Main dashboard interface
│   └── transactions.html     # Transaction history page
├── package.json              # Project dependencies
├── .env                      # Environment variables
└── README.md                 # Documentation
```

## 🔌 API Endpoints

### User Management

- `POST /api/users/create` - Create new user account
- `GET /api/users` - Get all users
- `GET /api/users/:email` - Get user by email

### Account Operations

- `GET /api/account/:userId/balance` - Get account balance
- `GET /api/account/:userId/transactions` - Get transaction history

### System

- `GET /api/health` - API health check

## 🛠️ Technologies Used

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web application framework

### Frontend

- **HTML5** - Markup structure
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript** - Client-side logic

### AI & Integration

- **ElevenLabs** - AI voice agent
- **Zendesk** - Customer support integration
- **Cal.com** - Calendar appointments integration

### Data Storage

- **JSON File System** - Lightweight data persistence

## 🔒 Security Considerations

⚠️ **Note**: This is a demonstration/prototype application. For production use, security measurements should be implemented.

## 🌐 Deployment

### Using ngrok (for testing with ElevenLabs)

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000
```

### Production Deployment

Consider deploying to:

- **Heroku** - Easy Node.js deployment
- **Vercel** - Serverless deployment
- **DigitalOcean** - Managed app platform

## 📝 Configuration

### ElevenLabs Agent

Update the agent ID in `public/index.html`:

```html
<elevenlabs-convai agent-id="YOUR_AGENT_ID"></elevenlabs-convai>
```

### Default Users

Sample users are stored in `src/db/users.json`. Modify as needed for testing.

---
