const db = require('../db/db.js');
const CategoryService = require('./categoryService');

const AdminService = () => {
  const getDashboard = async (DATA = {}) => {
    const orderRows = await db.query(
      `SELECT COUNT(*) AS total_orders,
            COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total_amount ELSE 0 END), 0) AS paid_revenue,
            SUM(order_status = 'PENDING') AS pending_orders
     FROM orders`
    );
    const userRows = await db.query('SELECT COUNT(*) AS total_users FROM users WHERE role = ?', ['CUSTOMER']);
    const productRows = await db.query(
      'SELECT COUNT(*) AS total_products, SUM(stock = 0) AS out_of_stock FROM products WHERE is_active = 1'
    );
    const revenueRows = await db.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS monthKey, SUM(total_amount) AS revenue
       FROM orders
       WHERE payment_status = 'PAID'
         AND created_at >= DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 11 MONTH), '%Y-%m-01')
         AND created_at < DATE_FORMAT(DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), '%Y-%m-01')
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY DATE_FORMAT(created_at, '%Y-%m')`
    );
    const recentOrderRows = await db.query(
      `SELECT o.id, o.order_number AS orderNumber,
              COALESCE(NULLIF(u.name, ''), u.email) AS customer,
              COALESCE(GROUP_CONCAT(CONCAT(oi.product_name, ' × ', oi.quantity) ORDER BY oi.id SEPARATOR ', '), '') AS product,
              o.total_amount AS amount, o.order_status AS status
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id, o.order_number, u.name, u.email, o.total_amount, o.order_status, o.created_at
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    const revenueByMonthMap = new Map(revenueRows.map((row) => [row.monthKey, Number(row.revenue || 0)]));
    const revenueByMonth = Array.from({ length: 12 }, (_, index) => {
      const month = new Date();
      month.setDate(1);
      month.setMonth(month.getMonth() - 11 + index);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      return {
        label: month.toLocaleString('en-US', { month: 'short' }),
        revenue: revenueByMonthMap.get(monthKey) || 0
      };
    });

    return {
      totalOrders: Number(orderRows[0].total_orders || 0),
      paidRevenue: Number(orderRows[0].paid_revenue || 0),
      pendingOrders: Number(orderRows[0].pending_orders || 0),
      totalUsers: Number(userRows[0].total_users || 0),
      totalProducts: Number(productRows[0].total_products || 0),
      outOfStockProducts: Number(productRows[0].out_of_stock || 0),
      revenueByMonth,
      recentOrders: recentOrderRows.map((order) => ({ ...order, amount: Number(order.amount || 0) }))
    };
  };

  const getProducts = async (DATA = {}) => {
    return await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.created_at DESC`
    );
  };

  const getCategories = async (DATA = {}) => {
    return await CategoryService().getAllCategories();
  };

  const getOrders = async (DATA = {}) => {
    return await db.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     INNER JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
    );
  };

  const getUsers = async (DATA = {}) => {
    return await db.query(
      'SELECT id, name, email, role, phone, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
  };

  return { getDashboard, getProducts, getCategories, getOrders, getUsers };
};

module.exports = AdminService;
