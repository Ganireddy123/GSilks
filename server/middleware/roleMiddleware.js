const ApiError = require('../utils/ApiError');
const { sendError } = require('../utils/responseHandler');

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication is required.', ['User context is missing.']);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Access denied. You do not have permission to perform this action.', ['Insufficient role permissions.']);
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};
