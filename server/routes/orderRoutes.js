const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  getAdminOrders,
  getAdminOrderById,
  cancelOrder
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');

const OrderRoutes = () => {
const router = express.Router();

router.use(authMiddleware);

router.post(
  '/create-order',
  validateMiddleware({
    shipping: { required: true, type: 'object' },
    'shipping.shipping_name': { required: true, type: 'string' },
    'shipping.shipping_phone': { required: true, type: 'string' },
    'shipping.shipping_address_line1': { required: true, type: 'string' },
    'shipping.shipping_city': { required: true, type: 'string' },
    'shipping.shipping_state': { required: true, type: 'string' },
    'shipping.shipping_postal_code': { required: true, type: 'string' },
    'shipping.shipping_country': { required: true, type: 'string' }
  }),
  createOrder
);
router.get('/get-my-orders', getMyOrders);
router.get('/get-order/:id', getOrderById);
router.put('/cancel-order', (req, res, next) => {
  req.body.id = req.body.id || req.body.orderId;
  next();
}, validateMiddleware({ id: { required: true, type: 'string' } }), cancelOrder);
router.put('/cancel-order/:id', cancelOrder);
router.get('/admin/get-orders', authorizeRoles('ADMIN'), getAdminOrders);
router.get('/admin/get-order/:id', authorizeRoles('ADMIN'), getAdminOrderById);
router.put('/admin/update-order-status', authorizeRoles('ADMIN'), (req, res, next) => {
  req.body.id = req.body.id || req.body.orderId;
  next();
}, validateMiddleware({ id: { required: true, type: 'string' }, status: { required: true, type: 'string' } }), updateOrderStatus);
router.post(
  '/',
  validateMiddleware({
    shipping: {
      required: true,
      type: 'object',
      source: 'body'
    },
    'shipping.shipping_name': { required: true, type: 'string', source: 'body' },
    'shipping.shipping_phone': { required: true, type: 'string', source: 'body' },
    'shipping.shipping_address_line1': { required: true, type: 'string', source: 'body' },
    'shipping.shipping_city': { required: true, type: 'string', source: 'body' },
    'shipping.shipping_state': { required: true, type: 'string', source: 'body' },
    'shipping.shipping_postal_code': { required: true, type: 'string', source: 'body' },
    'shipping.shipping_country': { required: true, type: 'string', source: 'body' }
  }),
  createOrder
);

router.get('/', getOrders);
router.get(
  '/:id',
  validateMiddleware({ id: { required: true, type: 'string', source: 'params' } }),
  getOrderById
);

router.patch(
  '/:id/status',
  authorizeRoles('ADMIN'),
  validateMiddleware({
    id: { required: true, type: 'string', source: 'params' },
    status: { required: true, type: 'string', source: 'body' }
  }),
  updateOrderStatus
);

return router;
};

module.exports = OrderRoutes;
