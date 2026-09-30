const { sendError } = require('../utils/responseHandler');
const getSafeErrorMessage = require('../utils/safeErrorMessage');

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error('API request failed:', getSafeErrorMessage(err && err.message));

  let statusCode = 500;
  let message = 'Something went wrong on the server.';
  let errors = ['Unexpected server error.'];

  if (err && typeof err.statusCode === 'number' && err.statusCode < 500) {
    statusCode = err.statusCode;
    message = err.message;
    if (Array.isArray(err.errors) && err.errors.length) {
      errors = err.errors;
    }
  }

  if (err && err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry detected.';
    errors = ['A record with the same values already exists.'];
  }

  if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Invalid reference provided.';
    errors = ['One or more referenced records do not exist.'];
  }

  if (err && err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 400;
    message = 'This record cannot be deleted because it is still in use.';
    errors = ['Foreign key constraint prevents deletion.'];
  }

  if (err && err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed.';
    errors = Array.isArray(err.errors) ? err.errors.map((item) => item.message || item) : [err.message];
  }

  if (err && err.name === 'MulterError') {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Image is too large.'
      : getSafeErrorMessage(err.message || 'The uploaded file could not be processed.');
    errors = [
      err.code === 'LIMIT_FILE_SIZE'
        ? 'The selected image must be 5MB or smaller.'
        : getSafeErrorMessage(err.message || 'The uploaded file could not be processed.')
    ];
  }

  if (err && err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Authentication token is invalid.';
    errors = ['The access token is invalid or malformed.'];
  }

  if (err && err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired.';
    errors = ['The access token has expired.'];
  }

  if (err && err.code === 'ERR_INVALID_ARG_TYPE') {
    statusCode = 400;
    message = 'Invalid argument type.';
    errors = ['A request field had an invalid type.'];
  }

  if (statusCode >= 500) {
    message = err && err.exposeSafeMessage
      ? getSafeErrorMessage(err.message)
      : 'Something went wrong on the server.';
    errors = ['Unexpected server error.'];
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = errorMiddleware;
