const express = require('express');
const { getCart, addItemToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

const CartRoutes = () => {
const router = express.Router();

router.use(authMiddleware);

router.get('/get-cart', getCart);
router.post(
  '/add-to-cart',
  validateMiddleware({
    productId: { required: true, type: 'number' },
    quantity: { type: 'number' }
  }),
  addItemToCart
);
router.put('/update-cart', (req, res, next) => {
  req.body.id = req.body.id || req.body.cartItemId;
  next();
}, validateMiddleware({ id: { required: true, type: 'string' }, quantity: { required: true, type: 'number' } }), updateCartItem);
router.put('/remove-from-cart', (req, res, next) => {
  req.body.id = req.body.id || req.body.cartItemId;
  next();
}, validateMiddleware({ id: { required: true, type: 'string' } }), removeCartItem);
router.put('/clear-cart', clearCart);
router.get('/', getCart);
router.post(
  '/items',
  validateMiddleware({
    productId: { required: true, type: 'number', source: 'body' },
    quantity: { required: true, type: 'number', source: 'body' }
  }),
  addItemToCart
);

router.put(
  '/items/:id',
  validateMiddleware({
    id: { required: true, type: 'string', source: 'params' },
    quantity: { required: true, type: 'number', source: 'body' }
  }),
  updateCartItem
);

router.delete(
  '/items/:id',
  validateMiddleware({ id: { required: true, type: 'string', source: 'params' } }),
  removeCartItem
);

return router;
};

module.exports = CartRoutes;
