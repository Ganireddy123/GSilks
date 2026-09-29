-- GSilks database query library
-- These queries are intentionally kept reusable and parameterized for the Node.js MySQL service layer.
-- Replace placeholders such as ? with values at runtime.

-- -----------------------------------------------------------------------------
-- Authentication and user lookups
-- -----------------------------------------------------------------------------
SELECT id, name, email, password_hash, role, phone, is_active, created_at, updated_at
FROM users
WHERE email = ?
LIMIT 1;

SELECT id, name, email, role, phone, is_active, created_at, updated_at
FROM users
WHERE id = ?
LIMIT 1;

-- -----------------------------------------------------------------------------
-- Categories
-- -----------------------------------------------------------------------------
SELECT *
FROM categories
WHERE is_active = ?
ORDER BY created_at DESC;

SELECT *
FROM categories
WHERE id = ?
LIMIT 1;

-- -----------------------------------------------------------------------------
-- Products: catalog listing and detail lookups
-- -----------------------------------------------------------------------------
SELECT p.*, c.name AS category_name, c.slug AS category_slug
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.is_active = ?
  AND c.slug = ?
  AND p.price >= ?
  AND p.price <= ?
ORDER BY p.created_at DESC
LIMIT ? OFFSET ?;

SELECT COUNT(*) AS total
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.is_active = ?
  AND (p.name LIKE ? OR p.description LIKE ? OR p.material LIKE ? OR p.color LIKE ?);

SELECT p.*, c.name AS category_name, c.slug AS category_slug
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.id = ?
LIMIT 1;

-- -----------------------------------------------------------------------------
-- Cart operations
-- -----------------------------------------------------------------------------
SELECT ci.id, ci.user_id, ci.product_id, ci.quantity, ci.created_at, ci.updated_at,
       p.name AS product_name, p.slug AS product_slug, p.price, p.original_price,
       p.image_url, p.stock, p.is_active, c.name AS category_name
FROM cart_items ci
INNER JOIN products p ON p.id = ci.product_id
LEFT JOIN categories c ON c.id = p.category_id
WHERE ci.user_id = ?
ORDER BY ci.updated_at DESC;

SELECT *
FROM cart_items
WHERE user_id = ? AND product_id = ?
LIMIT 1;

UPDATE cart_items
SET quantity = ?, updated_at = NOW()
WHERE id = ?;

DELETE FROM cart_items
WHERE id = ?;

-- -----------------------------------------------------------------------------
-- Order lifecycle
-- -----------------------------------------------------------------------------
SELECT o.*, u.name AS customer_name, u.email AS customer_email
FROM orders o
INNER JOIN users u ON u.id = o.user_id
WHERE o.user_id = ?
ORDER BY o.created_at DESC;

SELECT o.*, u.name AS customer_name, u.email AS customer_email
FROM orders o
INNER JOIN users u ON u.id = o.user_id
WHERE o.id = ?
LIMIT 1;

SELECT *
FROM order_items
WHERE order_id = ?
ORDER BY id ASC;

INSERT INTO orders (
  user_id, order_number, total_amount, payment_status, order_status,
  shipping_name, shipping_phone, shipping_address_line1, shipping_address_line2,
  shipping_city, shipping_state, shipping_postal_code, shipping_country,
  notes, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());

INSERT INTO order_items (
  order_id, product_id, product_name, product_sku, product_price, quantity, subtotal, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, NOW());

UPDATE orders
SET order_status = ?, updated_at = NOW()
WHERE id = ?;

-- -----------------------------------------------------------------------------
-- Admin and reporting queries
-- -----------------------------------------------------------------------------
SELECT COUNT(*) AS total_orders
FROM orders;

SELECT COUNT(*) AS total_users
FROM users
WHERE role = 'CUSTOMER';

SELECT COUNT(*) AS active_products
FROM products
WHERE is_active = 1;

SELECT o.id, o.order_number, o.total_amount, o.order_status,
       u.name AS customer_name, u.email AS customer_email
FROM orders o
INNER JOIN users u ON u.id = o.user_id
ORDER BY o.created_at DESC
LIMIT 10;

SELECT SUM(subtotal) AS order_total
FROM order_items
WHERE order_id = ?;
