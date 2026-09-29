const db = require('../db/db.js');
const ApiError = require('../utils/ApiError');

const CartService = () => {
const getCartByUserId = async (DATA) => {
  const rows = await db.query(
    `SELECT ci.id, ci.user_id, ci.product_id, ci.quantity, ci.created_at, ci.updated_at,
            p.name AS product_name, p.slug AS product_slug, p.price, p.original_price,
            p.image_url, p.stock, p.is_active, c.name AS category_name
     FROM cart_items ci
     INNER JOIN products p ON p.id = ci.product_id
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ci.user_id = ?
     ORDER BY ci.updated_at DESC`,
    [DATA.userId]
  );

  const items = rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    quantity: Number(row.quantity),
    product_name: row.product_name,
    product_slug: row.product_slug,
    price: Number(row.price),
    original_price: Number(row.original_price),
    image_url: row.image_url,
    stock: Number(row.stock),
    is_active: row.is_active,
    category_name: row.category_name,
    subtotal: Number(row.price) * Number(row.quantity)
  }));

  const grandTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    items,
    grandTotal,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
  };
};

const addItemToCart = async (DATA) => {
  const { userId, productId, quantity } = DATA;
  if (!productId) {
    throw new ApiError(400, 'Product ID is required.', ['Product ID is missing.']);
  }

  const productQty = Number(quantity ?? 1);
  if (!Number.isInteger(productQty) || productQty < 1) {
    throw new ApiError(400, 'Quantity must be at least 1.', ['Invalid quantity.']);
  }

  const productRows = await db.query(
    'SELECT id, name, price, stock, is_active FROM products WHERE id = ? LIMIT 1',
    [productId]
  );

  if (!productRows.length) {
    throw new ApiError(404, 'Product not found.', ['The selected product does not exist.']);
  }

  const product = productRows[0];

  if (product.is_active === 0) {
    throw new ApiError(400, 'This product is currently inactive and cannot be added to cart.', ['Product is inactive.']);
  }

  if (Number(product.stock) < productQty) {
    throw new ApiError(400, 'Insufficient stock for this product.', ['Requested quantity exceeds available stock.']);
  }

  const existingRows = await db.query(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? LIMIT 1',
    [userId, productId]
  );

  if (existingRows.length) {
    const newQuantity = Number(existingRows[0].quantity) + productQty;

    if (Number(product.stock) < newQuantity) {
      throw new ApiError(400, 'Cart quantity exceeds current stock.', ['Product stock is insufficient for the updated cart quantity.']);
    }

    await db.query(
      'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [newQuantity, existingRows[0].id]
    );
  } else {
    await db.query(
      'INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [userId, productId, productQty]
    );
  }

  return await getCartByUserId({ userId });
};

const updateCartItem = async (DATA) => {
  const { userId, cartItemId, quantity } = DATA;
  const productQty = Number(quantity);
  if (!Number.isInteger(productQty) || productQty < 1) {
    throw new ApiError(400, 'Quantity must be at least 1.', ['Invalid quantity.']);
  }

  const cartRows = await db.query(
    'SELECT * FROM cart_items WHERE id = ? AND user_id = ? LIMIT 1',
    [cartItemId, userId]
  );

  if (!cartRows.length) {
    throw new ApiError(404, 'Cart item not found.', ['The requested cart item does not exist for this user.']);
  }

  const cartItem = cartRows[0];

  const productRows = await db.query(
    'SELECT id, stock, is_active FROM products WHERE id = ? LIMIT 1',
    [cartItem.product_id]
  );

  if (!productRows.length) {
    throw new ApiError(404, 'Product not found.', ['The product referenced by this cart item no longer exists.']);
  }

  const product = productRows[0];

  if (product.is_active === 0) {
    throw new ApiError(400, 'This product is inactive and cannot remain in your cart.', ['Product is inactive.']);
  }

  if (Number(product.stock) < productQty) {
    throw new ApiError(400, 'Insufficient stock for the updated quantity.', ['Requested quantity exceeds available stock.']);
  }

  await db.query(
    'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
    [productQty, cartItemId]
  );

  return await getCartByUserId({ userId });
};

const removeCartItem = async (DATA) => {
  const { userId, cartItemId } = DATA;
  const rows = await db.query(
    'SELECT * FROM cart_items WHERE id = ? AND user_id = ? LIMIT 1',
    [cartItemId, userId]
  );

  if (!rows.length) {
    throw new ApiError(404, 'Cart item not found.', ['The requested cart item does not exist for this user.']);
  }

  await db.query('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
  return await getCartByUserId({ userId });
};

const clearCart = async (DATA) => {
  await db.query('DELETE FROM cart_items WHERE user_id = ?', [DATA.userId]);
  return await getCartByUserId({ userId: DATA.userId });
};

return {
  getCartByUserId,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
};

module.exports = CartService;
