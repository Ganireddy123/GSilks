-- Run after schema.sql and seed.sql to populate cart, order history,
-- order details, and admin dashboard/order pages with repeatable demo data.
USE `gsilks_db`;

SET @demo_user_id = COALESCE(
  (SELECT `id` FROM `users` WHERE `email` = 'customer@gsilks.com' LIMIT 1),
  (SELECT `id` FROM `users` WHERE `role` = 'CUSTOMER' AND `is_active` = 1 ORDER BY `id` LIMIT 1)
);

SET @kanchipuram_product_id = COALESCE(
  (SELECT `id` FROM `products` WHERE `sku` = 'GS-KAN-001' LIMIT 1),
  (SELECT `id` FROM `products` WHERE `sku` = 'KS-001' LIMIT 1),
  (SELECT `id` FROM `products` WHERE `category_id` = 1 AND `is_active` = 1 ORDER BY `id` LIMIT 1)
);
SET @banarasi_product_id = COALESCE(
  (SELECT `id` FROM `products` WHERE `sku` = 'GS-BAN-003' LIMIT 1),
  (SELECT `id` FROM `products` WHERE `sku` = 'BS-001' LIMIT 1),
  (SELECT `id` FROM `products` WHERE `category_id` = 2 AND `is_active` = 1 ORDER BY `id` LIMIT 1)
);
SET @mysore_product_id = COALESCE(
  (SELECT `id` FROM `products` WHERE `sku` = 'GS-MYS-001' LIMIT 1),
  (SELECT `id` FROM `products` WHERE `category_id` = 3 AND `is_active` = 1 ORDER BY `id` LIMIT 1)
);
SET @designer_product_id = COALESCE(
  (SELECT `id` FROM `products` WHERE `sku` = 'GS-DES-003' LIMIT 1),
  (SELECT `id` FROM `products` WHERE `category_id` = 4 AND `is_active` = 1 ORDER BY `id` LIMIT 1)
);

INSERT INTO `cart_items` (`user_id`, `product_id`, `quantity`, `created_at`, `updated_at`)
SELECT @demo_user_id, @designer_product_id, 1, NOW(), NOW()
WHERE @demo_user_id IS NOT NULL
  AND @designer_product_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM `cart_items`
    WHERE `user_id` = @demo_user_id AND `product_id` = @designer_product_id
  );

INSERT INTO `orders` (
  `user_id`, `order_number`, `total_amount`, `payment_status`, `order_status`,
  `shipping_name`, `shipping_phone`, `shipping_address_line1`, `shipping_address_line2`,
  `shipping_city`, `shipping_state`, `shipping_postal_code`, `shipping_country`, `notes`,
  `created_at`, `updated_at`
)
SELECT @demo_user_id, 'GS-SAMPLE-001', p1.`price` + p2.`price`, 'PAID', 'DELIVERED',
       'Demo Customer', '+91 90000 00002', '12 Market Street', 'Near City Center',
       'Chennai', 'Tamil Nadu', '600001', 'India', 'Sample delivered order',
       DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)
FROM `products` p1
JOIN `products` p2 ON p2.`id` = @banarasi_product_id
WHERE @demo_user_id IS NOT NULL
  AND p1.`id` = @kanchipuram_product_id
  AND NOT EXISTS (SELECT 1 FROM `orders` WHERE `order_number` = 'GS-SAMPLE-001');

INSERT INTO `orders` (
  `user_id`, `order_number`, `total_amount`, `payment_status`, `order_status`,
  `shipping_name`, `shipping_phone`, `shipping_address_line1`, `shipping_address_line2`,
  `shipping_city`, `shipping_state`, `shipping_postal_code`, `shipping_country`, `notes`,
  `created_at`, `updated_at`
)
SELECT @demo_user_id, 'GS-SAMPLE-002', p1.`price` + p2.`price`, 'PENDING', 'CONFIRMED',
       'Demo Customer', '+91 90000 00002', '18 Residency Road', 'Apartment 304',
       'Bengaluru', 'Karnataka', '560001', 'India', 'Sample order awaiting payment',
       DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)
FROM `products` p1
JOIN `products` p2 ON p2.`id` = @designer_product_id
WHERE @demo_user_id IS NOT NULL
  AND p1.`id` = @mysore_product_id
  AND NOT EXISTS (SELECT 1 FROM `orders` WHERE `order_number` = 'GS-SAMPLE-002');

INSERT INTO `order_items` (
  `order_id`, `product_id`, `product_name`, `product_sku`, `product_price`, `quantity`, `subtotal`, `created_at`
)
SELECT o.`id`, p.`id`, p.`name`, p.`sku`, p.`price`, 1, p.`price`, o.`created_at`
FROM `orders` o
JOIN `products` p ON p.`id` IN (@kanchipuram_product_id, @banarasi_product_id)
WHERE o.`order_number` = 'GS-SAMPLE-001'
  AND NOT EXISTS (
    SELECT 1 FROM `order_items` oi
    WHERE oi.`order_id` = o.`id` AND oi.`product_id` = p.`id`
  );

INSERT INTO `order_items` (
  `order_id`, `product_id`, `product_name`, `product_sku`, `product_price`, `quantity`, `subtotal`, `created_at`
)
SELECT o.`id`, p.`id`, p.`name`, p.`sku`, p.`price`, 1, p.`price`, o.`created_at`
FROM `orders` o
JOIN `products` p ON p.`id` IN (@mysore_product_id, @designer_product_id)
WHERE o.`order_number` = 'GS-SAMPLE-002'
  AND NOT EXISTS (
    SELECT 1 FROM `order_items` oi
    WHERE oi.`order_id` = o.`id` AND oi.`product_id` = p.`id`
  );