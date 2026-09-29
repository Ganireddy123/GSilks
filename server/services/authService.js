const bcrypt = require('bcryptjs');
const db = require('../db/db.js');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');

const AuthService = () => {
  const sanitizeUser = (user) => {
    if (!user) return null;

    const { password_hash, ...safeUser } = user;
    return safeUser;
  };

  const registerUser = async (DATA) => {
    const { name, email, password } = DATA;
    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required.', ['Missing required registration fields.']);
    }

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedName || normalizedName.length < 2) {
      throw new ApiError(400, 'Name must be at least 2 characters long.', ['Name is invalid.']);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new ApiError(400, 'Please provide a valid email address.', ['Email is invalid.']);
    }

    if (String(password).length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters long.', ['Password is too short.']);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const result = await db.query(
        'INSERT INTO users (name, email, password_hash, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [normalizedName, normalizedEmail, passwordHash, 'CUSTOMER', 1]
      );
      const rows = await db.query(
        'SELECT id, name, email, role, phone, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      const user = rows[0];

      return { user: sanitizeUser(user), token: generateToken(user) };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ApiError(409, 'An account with this email already exists.', ['Email already registered.']);
      }
      throw error;
    }
  };

  const loginUser = async (DATA) => {
    const { email, password } = DATA;
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.', ['Missing login credentials.']);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const rows = await db.query(
      'SELECT id, name, email, password_hash, role, phone, is_active, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (!rows.length) {
      throw new ApiError(401, 'Invalid email or password.', ['User not found.']);
    }

    const user = rows[0];
    if (!await bcrypt.compare(String(password), user.password_hash)) {
      throw new ApiError(401, 'Invalid email or password.', ['Password does not match.']);
    }
    if (user.is_active === 0) {
      throw new ApiError(401, 'Your account is inactive. Please contact support.', ['User is inactive.']);
    }
    return { user: sanitizeUser(user), token: generateToken(user) };
  };

  const getCurrentUser = async (DATA) => {
    const rows = await db.query(
      'SELECT id, name, email, role, phone, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [DATA.id]
    );
    if (!rows.length) {
      throw new ApiError(404, 'User not found.', ['Authenticated user record does not exist.']);
    }
    return sanitizeUser(rows[0]);
  };

  return { registerUser, loginUser, getCurrentUser };
};

module.exports = AuthService;
