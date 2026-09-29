const asyncHandler = require('../utils/asyncHandler');
const AdminService = require('../services/adminService');
const { sendSuccess } = require('../utils/responseHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const service = AdminService();
  const dashboard = await service.getDashboard(req.params);
  return sendSuccess(res, 200, 'Admin dashboard retrieved successfully.', { dashboard });
});

const getProducts = asyncHandler(async (req, res) => {
  const service = AdminService();
  const products = await service.getProducts(req.params);
  return sendSuccess(res, 200, 'Products retrieved successfully.', { products });
});

const getCategories = asyncHandler(async (req, res) => {
  const service = AdminService();
  const categories = await service.getCategories(req.params);
  return sendSuccess(res, 200, 'Categories retrieved successfully.', { categories });
});

const getOrders = asyncHandler(async (req, res) => {
  const service = AdminService();
  const orders = await service.getOrders(req.params);
  return sendSuccess(res, 200, 'Orders retrieved successfully.', { orders });
});

const getUsers = asyncHandler(async (req, res) => {
  const service = AdminService();
  const users = await service.getUsers(req.params);
  return sendSuccess(res, 200, 'Users retrieved successfully.', { users });
});

module.exports = { getDashboard, getProducts, getCategories, getOrders, getUsers };
