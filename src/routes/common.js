const express = require('express');
const router = express.Router();

// Get current date
router.post('/get-current-date', (req, res) => {
  const now = new Date();
  const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  res.json({
    success: true,
    date: formattedDate,
    timestamp: now.toISOString(),
    message: `Today's date is ${formattedDate}`
  });
});

module.exports = router;
