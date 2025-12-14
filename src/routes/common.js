const express = require('express');
const router = express.Router();

// Get current date
router.post('/get-current-date', (req, res) => {
  const now = new Date();
  const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // Map number to weekday name
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = weekdays[now.getDay()]; // 0-6 (0 = Sunday)

  res.json({
    success: true,
    date: formattedDate,
    timestamp: now.toISOString(),
    day: dayName,
    message: `Today is ${dayName}, ${formattedDate}`,
  });
});

module.exports = router;
