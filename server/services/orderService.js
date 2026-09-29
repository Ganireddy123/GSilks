const db = require('../db/db.js');
const pool = db.pool;
const ApiError = require('../utils/ApiError');
const generateOrderNumber = require('../utils/generateOrderNumber');

const OrderService = () => {
const getOrderById = async (DATA) => {
  const { orderId, userId = null, isAdmin = false } = DATA;
  const rows = await db.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     INNER JOIN users u ON u.id = o.user_id
     WHERE o.id = ? LIMIT 1`,
    [orderId]
  );

  if (!rows.length) {
    throw new ApiError(404, 'Order not found.', ['The requested order does not exist.']);
  }

  const order = rows[0];

  if (!isAdmin && Number(order.user_id) !== Number(userId)) {
    throw new ApiError(403, 'You are not allowed to access this order.', ['Order ownership mismatch.']);
  }

  const items = await db.query(
    'SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC',
    [orderId]
  );

  return {
    ...order,
    items
  };
};

const getOrdersForUser = async (DATA) => {
  const { userId, isAdmin = false } = DATA;
  const query = isAdmin
    ? `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       INNER JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    : `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       INNER JOIN users u ON u.id = o.user_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`;

  const params = isAdmin ? [] : [userId];
  const rows = await db.query(query, params);

  const orders = await Promise.all(rows.map(async (order) => {
    const items = await db.query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [order.id]);
    return { ...order, items };
  }));

  return orders;
};

const createOrder = async (DATA) => {
  const { userId, shippingData, notes } = DATA;
  const cartRows = await db.query(
    'SELECT ci.id AS cart_item_id, ci.product_id, ci.quantity, p.name, p.price, p.stock, p.is_active FROM cart_items ci INNER JOIN products p ON p.id = ci.product_id WHERE ci.user_id = ? ORDER BY ci.id ASC',
    [userId]
  );

  if (!cartRows.length) {
    throw new ApiError(400, 'Your cart is empty.', ['No cart items available for checkout.']);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const productIds = cartRows.map((item) => item.product_id);
    const [productRows] = await connection.execute(
      `SELECT id, name, sku, stock, is_active, price FROM products WHERE id IN (${productIds.map(() => '?').join(',')}) FOR UPDATE`,
      productIds
    );

    const productMap = new Map(productRows.map((product) => [product.id, product]));

    for (const cartItem of cartRows) {
      const product = productMap.get(cartItem.product_id);

      if (!product) {
        throw new ApiError(400, `Product ${cartItem.product_id} no longer exists.`, ['Product is missing.']);
      }

      if (product.is_active === 0) {
        throw new ApiError(400, `Product ${product.name} is inactive.`, ['Inactive product cannot be ordered.']);
      }

      if (Number(product.stock) < Number(cartItem.quantity)) {
        throw new ApiError(400, `Insufficient stock for ${product.name}.`, ['Inventory shortage.']);
      }
    }

    const totalAmount = cartRows.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    const orderNumber = generateOrderNumber();
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
        user_id, order_number, total_amount, payment_status, order_status,
        shipping_name, shipping_phone, shipping_address_line1, shipping_address_line2,
        shipping_city, shipping_state, shipping_postal_code, shipping_country,
        notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        orderNumber,
        Number(totalAmount).toFixed(2),
        'PENDING',
        'PENDING',
        shippingData.shipping_name,
        shippingData.shipping_phone,
        shippingData.shipping_address_line1,
        shippingData.shipping_address_line2 || '',
        shippingData.shipping_city,
        shippingData.shipping_state,
        shippingData.shipping_postal_code,
        shippingData.shipping_country,
        notes || ''
      ]
    );

    const orderId = orderResult.insertId;

    for (const cartItem of cartRows) {
      const product = productMap.get(cartItem.product_id);
      const subtotal = Number(product.price) * Number(cartItem.quantity);

      await connection.execute(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_sku, product_price, quantity, subtotal, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          orderId,
          cartItem.product_id,
          cartItem.name,
          product.sku,
          Number(product.price),
          Number(cartItem.quantity),
          Number(subtotal).toFixed(2)
        ]
      );

      await connection.execute(
        'UPDATE products SET stock = stock - ?, updated_at = NOW() WHERE id = ?',
        [Number(cartItem.quantity), cartItem.product_id]
      );
    }

    await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    await connection.commit();

    const order = await getOrderById({ orderId, userId, isAdmin: false });
    return order;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateOrderStatus = async (DATA) => {
  const { orderId, status } = DATA;
  const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid order status.', ['Order status is not supported.']);
  }

  const rows = await db.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId]);
  if (!rows.length) {
    throw new ApiError(404, 'Order not found.', ['The requested order does not exist.']);
  }

  await db.query('UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?', [status, orderId]);
  return await getOrderById({ orderId, userId: null, isAdmin: true });
};

const cancelOrder = async (DATA) => {
  const { orderId, userId } = DATA;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [orderRows] = await connection.execute(
      'SELECT id, user_id, order_status, payment_status FROM orders WHERE id = ? LIMIT 1 FOR UPDATE',
      [orderId]
    );

    if (!orderRows.length) {
      throw new ApiError(404, 'Order not found.', ['The requested order does not exist.']);
    }
    if (Number(orderRows[0].user_id) !== Number(userId)) {
      throw new ApiError(403, 'You are not allowed to cancel this order.', ['Order ownership mismatch.']);
    }
    if (!['PENDING', 'CONFIRMED'].includes(orderRows[0].order_status) || orderRows[0].payment_status === 'PAID') {
      throw new ApiError(400, 'This order can no longer be cancelled.', ['Order is not in a cancellable state.']);
    }

    const [items] = await connection.execute(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );
    for (const item of items) {
      await connection.execute(
        'UPDATE products SET stock = stock + ?, updated_at = NOW() WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.execute(
      'UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?',
      ['CANCELLED', orderId]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return await getOrderById({ orderId, userId, isAdmin: false });
};

return {
  createOrder,
  getOrdersForUser,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
};

module.exports = OrderService;
