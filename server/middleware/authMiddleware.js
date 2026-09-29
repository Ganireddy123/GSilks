const jwt = require('jsonwebtoken');
const AuthService = require('../services/authService');
const ApiError = require('../utils/ApiError');
const { sendError } = require('../utils/responseHandler');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication token is missing or invalid.', ['Missing or invalid Authorization header.']);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'Authentication token is missing or invalid.', ['Token is required.']);
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return sendError(res, 401, 'Authentication token is expired or invalid.', ['Invalid or expired token.']);
    }

    let user;
    try {
      const service = AuthService();
      user = await service.getCurrentUser({ id: decoded.id });
    } catch (error) {
      if (error.statusCode === 404) {
        return sendError(res, 401, 'User not found or no longer exists.', ['Authenticated user is unavailable.']);
      }
      throw error;
    }

    if (!user) {
      return sendError(res, 401, 'User not found or no longer exists.', ['Authenticated user is unavailable.']);
    }

    if (user.is_active === 0) {
      return sendError(res, 401, 'Your account is inactive. Please contact support.', ['User account is inactive.']);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    next();
  } catch (error) {
    next(new ApiError(500, 'Authentication failed.', ['Unexpected error while verifying token.']));
  }
};

module.exports = authMiddleware;
