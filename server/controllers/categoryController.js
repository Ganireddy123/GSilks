const asyncHandler = require('../utils/asyncHandler');
const categoryService = require('../services/categoryService');
const { sendSuccess } = require('../utils/responseHandler');

const getAllCategories = asyncHandler(async (req, res) => {
  const service = categoryService();
  const categories = await service.getAllCategories({ isActiveOnly: false });
  return sendSuccess(res, 200, 'Categories retrieved successfully.', { categories });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const service = categoryService();
  const category = await service.getCategoryById({ id: req.params.id });
  return sendSuccess(res, 200, 'Category retrieved successfully.', { category });
});

const createCategory = asyncHandler(async (req, res) => {
  const service = categoryService();
  const category = await service.createCategory(req.body);
  return sendSuccess(res, 201, 'Category created successfully.', { category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const service = categoryService();
  const category = await service.updateCategory({ ...req.body, id: req.params.id });
  return sendSuccess(res, 200, 'Category updated successfully.', { category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const service = categoryService();
  const result = await service.deleteCategory({ id: req.params.id });
  return sendSuccess(res, 200, 'Category deleted successfully.', { deletedCategory: result });
});

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
