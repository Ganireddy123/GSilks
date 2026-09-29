const { sendError } = require('../utils/responseHandler');

const notFoundMiddleware = (req, res) => {
  return sendError(res, 404, 'Route not found.', ['The requested API endpoint does not exist.']);
};

module.exports = notFoundMiddleware;
