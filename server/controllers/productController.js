const asyncHandler = require('../utils/asyncHandler');
const ProductService = require('../services/productService');
const { uploadProductImage } = require('../services/uploadService');
const { sendSuccess } = require('../utils/responseHandler');

const getAllProducts = asyncHandler(async (req, res) => {
  const filters = {
    search: req.query.search,
    category: req.query.category,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    featured: req.query.featured,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 12,
    activeOnly: true
  };

  const service = ProductService();
  const result = await service.getAllProducts(filters);
  return sendSuccess(res, 200, 'Products retrieved successfully.', result);
});

const getProductById = asyncHandler(async (req, res) => {
  const service = ProductService();
  const product = await service.getProductById({ id: req.params.id });
  return sendSuccess(res, 200, 'Product retrieved successfully.', { product });
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const service = ProductService();
  const products = await service.getProductsByCategoryId({ categoryId: req.params.id });
  return sendSuccess(res, 200, 'Category products retrieved successfully.', { products });
});

const searchProducts = asyncHandler(async (req, res) => {
  const service = ProductService();
  const result = await service.getAllProducts({
    search: req.query.search || '',
    category: req.query.category,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    featured: req.query.featured,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 12,
    activeOnly: true
  });
  return sendSuccess(res, 200, 'Product search completed successfully.', result);
});

const resolveProductImageUrl = async (req, fallbackUrl = '') => {
  if (req.file) {
    return await uploadProductImage(req.file);
  }

  if (typeof req.body.image_url === 'string') {
    const trimmed = req.body.image_url.trim();
    return trimmed || fallbackUrl;
  }

  return fallbackUrl;
};

const createProduct = asyncHandler(async (req, res) => {
  const service = ProductService();
  const product = await service.createProduct({
    ...req.body,
    image_url: await resolveProductImageUrl(req, '')
  });

  return sendSuccess(res, 201, 'Product created successfully.', { product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const existingProduct = await ProductService().getProductById({ id: req.params.id });
  const updatePayload = {
    ...req.body,
    image_url: await resolveProductImageUrl(req, existingProduct.image_url || '')
  };

  const service = ProductService();
  const product = await service.updateProduct({ ...updatePayload, id: req.params.id });
  return sendSuccess(res, 200, 'Product updated successfully.', { product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const service = ProductService();
  const result = await service.deleteProduct({ id: req.params.id });
  return sendSuccess(res, 200, 'Product deleted successfully.', { deletedProduct: result });
});

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
