const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  getProfile,
  updateProfile,
  changePassword,
  updateUserStatus
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

const UserRoutes = () => {
const router = express.Router();

router.get('/get-profile', authMiddleware, getProfile);
router.put('/update-profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.get('/admin/get-users', authMiddleware, authorizeRoles('ADMIN'), getAllUsers);
router.get('/admin/get-user/:id', authMiddleware, authorizeRoles('ADMIN'), getUserById);
router.put('/admin/update-user-status', authMiddleware, authorizeRoles('ADMIN'), (req, res, next) => {
  req.body.id = req.body.id || req.params.id;
  next();
}, validateMiddleware({ id: { required: true, type: 'string' }, is_active: { required: true } }), updateUserStatus);
router.put(
  '/admin/update-user-status/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  validateMiddleware({ id: { required: true, type: 'string', source: 'params' }, is_active: { required: true } }),
  updateUserStatus
);

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllUsers);
router.get('/:id', authMiddleware, authorizeRoles('ADMIN'), validateMiddleware({ id: { required: true, type: 'string', source: 'params' } }), getUserById);
router.patch(
  '/:id/role',
  authMiddleware,
  authorizeRoles('ADMIN'),
  validateMiddleware({
    id: { required: true, type: 'string', source: 'params' },
    role: { required: true, type: 'string', source: 'body', enum: ['CUSTOMER', 'ADMIN'] }
  }),
  updateUserRole
);

return router;
};

module.exports = UserRoutes;
