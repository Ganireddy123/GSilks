const bcrypt = require('bcryptjs');
const db = require('../db/db.js');
const ApiError = require('../utils/ApiError');

const UserService = () => {
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

const getAllUsers = async (DATA = {}) => {
  const rows = await db.query(
    'SELECT id, name, email, role, phone, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
  return rows.map(sanitizeUser);
};

const getUserById = async (DATA) => {
  const rows = await db.query(
    'SELECT id, name, email, role, phone, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [DATA.id]
  );

  if (!rows.length) {
    throw new ApiError(404, 'User not found.', ['The requested user does not exist.']);
  }

  return sanitizeUser(rows[0]);
};

const updateUserRole = async (DATA) => {
  const { id, role } = DATA;
  if (!['CUSTOMER', 'ADMIN'].includes(role)) {
    throw new ApiError(400, 'Role must be either CUSTOMER or ADMIN.', ['Invalid role value.']);
  }

  const rows = await db.query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) {
    throw new ApiError(404, 'User not found.', ['The requested user does not exist.']);
  }

  if (rows[0].role === 'ADMIN' && role !== 'ADMIN') {
    throw new ApiError(400, 'The admin account role cannot be demoted.', ['Admin account protection.']);
  }
  if (role === 'ADMIN' && rows[0].role !== 'ADMIN') {
    throw new ApiError(403, 'The configured administrator account is the only account that can have the ADMIN role.', ['Additional admin accounts are disabled.']);
  }

  await db.query('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?', [role, id]);
  return await getUserById({ id });
};

const getProfile = async (DATA) => {
  const rows = await db.query(
    'SELECT id, name, email, role, phone, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [DATA.userId]
  );

  if (!rows.length) {
    throw new ApiError(404, 'Profile not found.', ['Authenticated user record does not exist.']);
  }

  return sanitizeUser(rows[0]);
};

const updateProfile = async (DATA) => {
  const { userId, updates } = DATA;
  const rows = await db.query(
    'SELECT id, name, email, role, phone, is_active FROM users WHERE id = ? LIMIT 1',
    [userId]
  );

  if (!rows.length) {
    throw new ApiError(404, 'Profile not found.', ['Authenticated user record does not exist.']);
  }

  const current = rows[0];
  const name = updates.name !== undefined ? String(updates.name).trim() : current.name;
  const phone = updates.phone !== undefined ? String(updates.phone).trim() : current.phone;

  if (!name || name.length < 2) {
    throw new ApiError(400, 'Name must be at least 2 characters long.', ['Name is invalid.']);
  }

  if (updates.role !== undefined && current.role !== 'ADMIN') {
    throw new ApiError(403, 'You are not allowed to change your role.', ['User role is immutable via profile update.']);
  }

  await db.query(
    'UPDATE users SET name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
    [name, phone, userId]
  );

  return await getProfile({ userId });
};

const changePassword = async (DATA) => {
  const { userId, currentPassword, newPassword } = DATA;
  if (!currentPassword || !newPassword || String(newPassword).length < 6) {
    throw new ApiError(400, 'Current password and a new password of at least 6 characters are required.', ['Password input is invalid.']);
  }

  const rows = await db.query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [userId]);
  if (!rows.length) {
    throw new ApiError(404, 'User not found.', ['Authenticated user record does not exist.']);
  }

  const validPassword = await bcrypt.compare(String(currentPassword), rows[0].password_hash);
  if (!validPassword) {
    throw new ApiError(400, 'Current password is incorrect.', ['Password verification failed.']);
  }

  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  await db.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [passwordHash, userId]);
  return { updated: true };
};

const updateUserStatus = async (DATA) => {
  const { adminId, userId, isActive } = DATA;
  const activeValues = new Map([[true, 1], [false, 0], [1, 1], [0, 0], ['1', 1], ['0', 0], ['true', 1], ['false', 0]]);
  if (!activeValues.has(isActive)) {
    throw new ApiError(400, 'is_active must be a boolean value.', ['Invalid account status.']);
  }
  const activeValue = activeValues.get(isActive);
  const rows = await db.query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [userId]);
  if (!rows.length) {
    throw new ApiError(404, 'User not found.', ['The requested user does not exist.']);
  }
  if (Number(adminId) === Number(userId)) {
    throw new ApiError(400, 'You cannot change your own account status.', ['Self-deactivation is not allowed.']);
  }
  if (rows[0].role === 'ADMIN') {
    throw new ApiError(400, 'Administrator account status cannot be changed here.', ['Admin account protection.']);
  }

  await db.query('UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?', [activeValue, userId]);
  return await getUserById({ id: userId });
};

return {
  getAllUsers,
  getUserById,
  updateUserRole,
  getProfile,
  updateProfile,
  changePassword,
  updateUserStatus
};
};

module.exports = UserService;
