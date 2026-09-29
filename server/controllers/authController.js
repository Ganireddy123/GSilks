const asyncHandler = require('../utils/asyncHandler');
const AuthService = require('../services/authService');
const { sendSuccess } = require('../utils/responseHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const service = AuthService();
  const result = await service.registerUser({ name, email, password });

  return sendSuccess(res, 201, 'User registered successfully.', {
    user: result.user,
    token: result.token
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const service = AuthService();
  const result = await service.loginUser({ email, password });

  return sendSuccess(res, 200, 'Login successful.', {
    user: result.user,
    token: result.token
  });
});

const getMe = asyncHandler(async (req, res) => {
  const service = AuthService();
  const user = await service.getCurrentUser({ id: req.user.id });
  return sendSuccess(res, 200, 'Profile retrieved successfully.', { user });
});

module.exports = {
  register,
  login,
  getMe
};
