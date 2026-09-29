const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const AdminRoutes = () => {
const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.get('/dashboard', adminController.getDashboard);
router.get('/products', adminController.getProducts);
router.get('/categories', adminController.getCategories);
router.get('/orders', adminController.getOrders);
router.get('/users', adminController.getUsers);

return router;
};

module.exports = AdminRoutes;
