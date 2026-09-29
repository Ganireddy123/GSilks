const asyncHandler = require('../utils/asyncHandler');
const OrderService = require('../services/orderService');
const { sendSuccess } = require('../utils/responseHandler');

const createOrder = asyncHandler(async (req, res) => {
  const service = OrderService();
  const order = await service.createOrder({
    userId: req.user.id,
    shippingData: req.body.shipping,
    notes: req.body.notes
  });

  return sendSuccess(res, 201, 'Order created successfully.', { order });
});

const getOrders = asyncHandler(async (req, res) => {
  const service = OrderService();
  const orders = await service.getOrdersForUser({ userId: req.user.id, isAdmin: req.user.role === 'ADMIN' });
  return sendSuccess(res, 200, 'Orders retrieved successfully.', { orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const service = OrderService();
  const order = await service.getOrderById({ orderId: req.params.id, userId: req.user.id, isAdmin: req.user.role === 'ADMIN' });
  return sendSuccess(res, 200, 'Order retrieved successfully.', { order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const service = OrderService();
  const order = await service.updateOrderStatus({
    orderId: req.params.id || req.body.id || req.body.orderId,
    status: req.body.status
  });
  return sendSuccess(res, 200, 'Order status updated successfully.', { order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const service = OrderService();
  const orders = await service.getOrdersForUser({ userId: req.user.id, isAdmin: false });
  return sendSuccess(res, 200, 'Orders retrieved successfully.', { orders });
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const service = OrderService();
  const orders = await service.getOrdersForUser({ userId: req.user.id, isAdmin: true });
  return sendSuccess(res, 200, 'Orders retrieved successfully.', { orders });
});

const getAdminOrderById = asyncHandler(async (req, res) => {
  const service = OrderService();
  const order = await service.getOrderById({ orderId: req.params.id, userId: null, isAdmin: true });
  return sendSuccess(res, 200, 'Order retrieved successfully.', { order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id || req.body.id || req.body.orderId;
  const service = OrderService();
  const order = await service.cancelOrder({ orderId, userId: req.user.id });
  return sendSuccess(res, 200, 'Order cancelled successfully.', { order });
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  getAdminOrders,
  getAdminOrderById,
  cancelOrder
};
