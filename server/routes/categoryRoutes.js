const express = require('express');
const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

const CategoryRoutes = () => {
const router = express.Router();

router.get('/get-categories', getAllCategories);
router.get('/get-category/:id', getCategoryById);
router.get('/', getAllCategories);
router.get(
  '/:id',
  validateMiddleware({ id: { required: true, type: 'string', source: 'params' } }),
  getCategoryById
);

router.post(
  '/insert-category',
  authMiddleware,
  authorizeRoles('ADMIN'),
  validateMiddleware({
    name: { required: true, type: 'string', minLength: 2 },
    slug: { required: true, type: 'string', minLength: 2 }
  }),
  createCategory
);
router.put(
  '/update-category',
  authMiddleware,
  authorizeRoles('ADMIN'),
  (req, res, next) => {
    req.params.id = String(req.body.id || req.body.category_id || '');
    next();
  },
  validateMiddleware({ id: { required: true, type: 'string', source: 'params' } }),
  updateCategory
);
router.put(
  '/delete-category',
  authMiddleware,
  authorizeRoles('ADMIN'),
  (req, res, next) => {
    req.params.id = req.body.id || req.body.category_id;
    next();
  },
  validateMiddleware({ id: { required: true, type: 'string', source: 'params' } }),
  deleteCategory
);

router.post(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN'),
  validateMiddleware({
    name: { required: true, type: 'string', minLength: 2 },
    slug: { required: true, type: 'string', minLength: 2 },
    description: { type: 'string' }
  }),
  createCategory
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  validateMiddleware({
    id: { required: true, type: 'string', source: 'params' },
    name: { type: 'string', minLength: 2 },
    slug: { type: 'string', minLength: 2 }
  }),
  updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  validateMiddleware({ id: { required: true, type: 'string', source: 'params' } }),
  deleteCategory
);

return router;
};

module.exports = CategoryRoutes;
