const asyncHandler = require('../utils/asyncHandler');
const CartService = require('../services/cartService');
const { sendSuccess } = require('../utils/responseHandler');

const getCart = asyncHandler(async (req, res) => {
  const service = CartService();
  const cart = await service.getCartByUserId({ userId: req.user.id });
  return sendSuccess(res, 200, 'Cart retrieved successfully.', { cart });
});

const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const service = CartService();
  const cart = await service.addItemToCart({ userId: req.user.id, productId, quantity });
  return sendSuccess(res, 201, 'Product added to cart successfully.', { cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cartItemId = req.params.id || req.body.id || req.body.cartItemId;
  const service = CartService();
  const cart = await service.updateCartItem({ userId: req.user.id, cartItemId, quantity });
  return sendSuccess(res, 200, 'Cart item updated successfully.', { cart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cartItemId = req.params.id || req.body.id || req.body.cartItemId;
  const service = CartService();
  const cart = await service.removeCartItem({ userId: req.user.id, cartItemId });
  return sendSuccess(res, 200, 'Cart item removed successfully.', { cart });
});

const clearCart = asyncHandler(async (req, res) => {
  const service = CartService();
  const cart = await service.clearCart({ userId: req.user.id });
  return sendSuccess(res, 200, 'Cart cleared successfully.', { cart });
});

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
