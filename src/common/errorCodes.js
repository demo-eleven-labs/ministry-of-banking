// These error codes are designed for AI agent use.
// All business logic errors should return HTTP 200 with success: false,
// and one of these error codes for deterministic agent responses.
// Only HTTP 500 should be used for technical failures.

const ERROR_CODES = {
  // Generic Errors
  MISSING_REQUIRED_FIELDS: {
    code: 'MISSING_REQUIRED_FIELDS',
    message: 'Required fields are missing',
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred while processing your request',
  },

  // User Related Errors
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
  },
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    message: 'User with this email already exists',
  },
  INVALID_EMAIL_FORMAT: {
    code: 'INVALID_EMAIL_FORMAT',
    message: 'Invalid email format',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
  },

  // Identity Verification Errors
  IDENTITY_VERIFICATION_FAILED: {
    code: 'IDENTITY_VERIFICATION_FAILED',
    message: 'Identity verification failed. Date of birth or account number does not match.',
  },
  DATE_OF_BIRTH_MISMATCH: {
    code: 'DATE_OF_BIRTH_MISMATCH',
    message: 'Date of birth does not match',
  },
  ACCOUNT_NUMBER_MISMATCH: {
    code: 'ACCOUNT_NUMBER_MISMATCH',
    message: 'Account number does not match',
  },

  // OTP Related Errors
  OTP_NOT_FOUND: {
    code: 'OTP_NOT_FOUND',
    message: 'No OTP found. Please request a new OTP code.',
  },
  OTP_EXPIRED: {
    code: 'OTP_EXPIRED',
    message: 'OTP has expired. Please request a new code.',
  },
  INVALID_OTP: {
    code: 'INVALID_OTP',
    message: 'Invalid OTP code',
  },
  OTP_SEND_FAILED: {
    code: 'OTP_SEND_FAILED',
    message: 'Failed to send OTP code',
  },

  // Card Related Errors
  CARD_NOT_FOUND: {
    code: 'CARD_NOT_FOUND',
    message:
      'No card was found with the provided details. Please double-check the card information and try again.',
  },
  CARD_ALREADY_BLOCKED: {
    code: 'CARD_ALREADY_BLOCKED',
    message: 'This card is already blocked',
  },

  // Account Related Errors
  ACCOUNT_NOT_FOUND: {
    code: 'ACCOUNT_NOT_FOUND',
    message: 'Account not found',
  },

  // Transaction Related Errors
  TRANSACTION_NOT_FOUND: {
    code: 'TRANSACTION_NOT_FOUND',
    message: 'Transaction not found',
  },
  MISSING_SEARCH_CRITERIA: {
    code: 'MISSING_SEARCH_CRITERIA',
    message: 'At least one search parameter is required',
  },
  DISPUTE_ALREADY_EXISTS: {
    code: 'DISPUTE_ALREADY_EXISTS',
    message: 'This transaction has already been disputed',
  },
};

// Helper function to create error response
function createErrorResponse(errorCode, customMessage = null) {
  const error = ERROR_CODES[errorCode];
  if (!error) {
    return {
      success: false,
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };
  }

  return {
    success: false,
    code: error.code,
    message: customMessage || error.message,
  };
}

// Helper function to create success response
function createSuccessResponse(data, message = null) {
  const response = {
    success: true,
  };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  return response;
}

module.exports = {
  ERROR_CODES,
  createErrorResponse,
  createSuccessResponse,
};
