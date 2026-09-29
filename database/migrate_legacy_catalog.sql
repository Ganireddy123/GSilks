-- One-time, non-destructive upgrade for the earlier GSilks catalog schema.
-- Preserves existing categories and products. Do not run after schema.sql or more than once.
USE `gsilks_db`;

ALTER TABLE `products` DROP FOREIGN KEY `fk_products_category`;
ALTER TABLE `categories` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;
ALTER TABLE `products`
  MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  MODIFY `category_id` BIGINT UNSIGNED NOT NULL,
  ADD COLUMN `slug` VARCHAR(300) NULL,
  ADD COLUMN `sku` VARCHAR(100) NULL,
  ADD COLUMN `stock` INT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN `material` VARCHAR(120) NULL,
  ADD COLUMN `color` VARCHAR(100) NULL,
  ADD COLUMN `saree_length` VARCHAR(50) NULL,
  ADD COLUMN `blouse_piece` VARCHAR(100) NULL,
  ADD COLUMN `is_featured` BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE `categories` ADD COLUMN `slug` VARCHAR(150) NULL;

UPDATE `categories`
SET `slug` = CONCAT('legacy-category-', `id`)
WHERE `slug` IS NULL OR `slug` = '';

UPDATE `products`
SET `slug` = CONCAT('legacy-product-', `id`),
    `sku` = CONCAT('LEGACY-', `id`),
    `stock` = GREATEST(COALESCE(`stock_quantity`, 0), 0),
    `original_price` = COALESCE(`original_price`, `price`)
WHERE `slug` IS NULL OR `sku` IS NULL;

ALTER TABLE `categories`
  MODIFY `slug` VARCHAR(150) NOT NULL,
  ADD UNIQUE KEY `uq_categories_slug` (`slug`);
ALTER TABLE `products`
  MODIFY `slug` VARCHAR(300) NOT NULL,
  MODIFY `sku` VARCHAR(100) NOT NULL,
  ADD UNIQUE KEY `uq_products_slug` (`slug`),
  ADD UNIQUE KEY `uq_products_sku` (`sku`),
  ADD KEY `idx_products_is_featured` (`is_featured`),
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `phone` VARCHAR(20) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `is_active`)
VALUES
  (1, 'GSilks Administrator', 'ganireddy@1234gmail.com', '$2a$10$3089dYMaEhSUkmlV.x4GZ.yPS4aRdo1tpsc2GbRaNYvqioRmhgGLi', 'ADMIN', '+91 90000 00001', TRUE),
  (2, 'Demo Customer', 'customer@gsilks.com', '$2a$10$lOo32YcbJjJ6Ule4IBvucOez9Fk4ygkQX5/EuPY4bn4Pn/2vXksFK', 'CUSTOMER', '+91 90000 00002', TRUE);

CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_items_user_product` (`user_id`, `product_id`),
  CONSTRAINT `fk_cart_items_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `chk_cart_items_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `order_number` VARCHAR(50) NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `payment_status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `order_status` ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `shipping_name` VARCHAR(100) NOT NULL,
  `shipping_phone` VARCHAR(20) NOT NULL,
  `shipping_address_line1` VARCHAR(255) NOT NULL,
  `shipping_address_line2` VARCHAR(255) NULL,
  `shipping_city` VARCHAR(100) NOT NULL,
  `shipping_state` VARCHAR(100) NOT NULL,
  `shipping_postal_code` VARCHAR(20) NOT NULL,
  `shipping_country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orders_order_number` (`order_number`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `idx_orders_payment_status` (`payment_status`),
  KEY `idx_orders_order_status` (`order_status`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_sku` VARCHAR(100) NULL,
  `product_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  KEY `idx_order_items_product_id` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `chk_order_items_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users` AUTO_INCREMENT = 3;
