const express = require('express');
const router = express.Router();
const { createErrorResponse } = require('../common/errorCodes');

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

// Get weekday for any specific date
router.post('/get-weekday-for-date', (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res
      .status(200)
      .json(
        createErrorResponse('MISSING_REQUIRED_FIELDS', 'Date is required in YYYY-MM-DD format')
      );
  }

  try {
    const targetDate = new Date(date + 'T00:00:00Z');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[targetDate.getDay()];

    res.json({
      success: true,
      date: date,
      weekday: dayOfWeek,
    });
  } catch (error) {
    res
      .status(200)
      .json(
        createErrorResponse(
          'INVALID_DATE_FORMAT',
          'Invalid date format. Please use YYYY-MM-DD format.'
        )
      );
  }
});

module.exports = router;
