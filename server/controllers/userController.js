const asyncHandler = require('../utils/asyncHandler');
const UserService = require('../services/userService');
const { sendSuccess } = require('../utils/responseHandler');

const getAllUsers = asyncHandler(async (req, res) => {
  const service = UserService();
  const users = await service.getAllUsers();
  return sendSuccess(res, 200, 'Users retrieved successfully.', { users });
});

const getUserById = asyncHandler(async (req, res) => {
  const service = UserService();
  const user = await service.getUserById({ id: req.params.id });
  return sendSuccess(res, 200, 'User retrieved successfully.', { user });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const service = UserService();
  const user = await service.updateUserRole({ id: req.params.id, role: req.body.role });
  return sendSuccess(res, 200, 'User role updated successfully.', { user });
});

const getProfile = asyncHandler(async (req, res) => {
  const service = UserService();
  const profile = await service.getProfile({ userId: req.user.id });
  return sendSuccess(res, 200, 'Profile retrieved successfully.', { profile });
});

const updateProfile = asyncHandler(async (req, res) => {
  const service = UserService();
  const profile = await service.updateProfile({ userId: req.user.id, updates: req.body });
  return sendSuccess(res, 200, 'Profile updated successfully.', { profile });
});

const changePassword = asyncHandler(async (req, res) => {
  const service = UserService();
  await service.changePassword({ userId: req.user.id, ...req.body });
  return sendSuccess(res, 200, 'Password changed successfully.', {});
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const userId = req.body.id || req.params.id;
  const service = UserService();
  const user = await service.updateUserStatus({ adminId: req.user.id, userId, isActive: req.body.is_active });
  return sendSuccess(res, 200, 'User status updated successfully.', { user });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  getProfile,
  updateProfile,
  changePassword,
  updateUserStatus
};
