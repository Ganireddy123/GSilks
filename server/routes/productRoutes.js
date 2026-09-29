const express = require('express');
const { getAllProducts, getProductById, getProductsByCategory, searchProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

const ProductRoutes = () => {
const router = express.Router();

router.get('/get-products', getAllProducts);
router.get('/search-products', searchProducts);
router.get('/get-product/:id', getProductById);
router.get('/get-products-by-category/:id', getProductsByCategory);
router.get('/', getAllProducts);
router.get(
  '/:id',
  validateMiddleware({ id: { required: true, type: 'string', source: 'params' } }),
  getProductById
);

router.post(
  '/insert-product',
  authMiddleware,
  authorizeRoles('ADMIN'),
  uploadMiddleware.single('image'),
  validateMiddleware({
    category_id: { required: true, type: 'number' },
    name: { required: true, type: 'string', minLength: 2 },
    price: { required: true, type: 'number' }
  }),
  createProduct
);

router.put(
  '/update-product',
  authMiddleware,
  authorizeRoles('ADMIN'),
  uploadMiddleware.single('image'),
  (req, res, next) => {
    req.params.id = String(req.body.id || req.body.product_id || '');
    next();
  },
  validateMiddleware({ id: { required: true, type: 'string', source: 'params' } }),
  updateProduct
);

router.put(
  '/delete-product',
  authMiddleware,
  authorizeRoles('ADMIN'),
  (req, res, next) => {
    req.params.id = req.body.id || req.body.product_id;
    next();
  },
  validateMiddleware({ id: { required: true, type: 'string', source: 'params' } }),
  deleteProduct
);

router.post(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN'),
  uploadMiddleware.single('image'),
  validateMiddleware({
    category_id: { required: true, type: 'number', source: 'body' },
    name: { required: true, type: 'string', minLength: 2 },
    price: { required: true, type: 'number', source: 'body' }
  }),
  createProduct
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  uploadMiddleware.single('image'),
  validateMiddleware({
    id: { required: true, type: 'string', source: 'params' },
    category_id: { type: 'number', source: 'body' },
    name: { type: 'string', minLength: 2 },
    slug: { type: 'string', minLength: 2 },
    sku: { type: 'string', minLength: 2 },
    price: { type: 'number', source: 'body' }
  }),
  updateProduct
);

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  validateMiddleware({ id: { required: true, type: 'string', source: 'params' } }),
  deleteProduct
);

return router;
};

module.exports = ProductRoutes;
