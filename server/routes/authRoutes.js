const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

const AuthRoutes = () => {
const router = express.Router();

router.post(
  '/register',
  validateMiddleware({
    name: { required: true, type: 'string', minLength: 2 },
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', minLength: 6 }
  }),
  register
);

router.post(
  '/login',
  validateMiddleware({
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', minLength: 6 }
  }),
  login
);

router.get('/me', authMiddleware, getMe);
router.get('/profile', authMiddleware, getMe);
router.put('/update-profile', authMiddleware, userController.updateProfile);
router.put('/change-password', authMiddleware, userController.changePassword);

return router;
};

module.exports = AuthRoutes;
