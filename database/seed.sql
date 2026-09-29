USE `gsilks_db`;

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `is_active`, `created_at`, `updated_at`)
VALUES
  (1, 'GSilks Administrator', 'ganireddy@1234gmail.com', '$2a$10$3089dYMaEhSUkmlV.x4GZ.yPS4aRdo1tpsc2GbRaNYvqioRmhgGLi', 'ADMIN', '+91 90000 00001', TRUE, NOW(), NOW()),
  (2, 'Demo Customer', 'customer@gsilks.com', '$2a$10$lOo32YcbJjJ6Ule4IBvucOez9Fk4ygkQX5/EuPY4bn4Pn/2vXksFK', 'CUSTOMER', '+91 90000 00002', TRUE, NOW(), NOW());

ALTER TABLE `users` AUTO_INCREMENT = 3;

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `is_active`, `created_at`, `updated_at`)
VALUES
  (1, 'Kanchipuram Silk Sarees', 'kanchipuram-silk-sarees', 'Traditional pure silk sarees with rich zari work.', 'https://example.com/images/kanchipuram.jpg', TRUE, NOW(), NOW()),
  (2, 'Banarasi Silk Sarees', 'banarasi-silk-sarees', 'Elegant Banarasi silk sarees with traditional weaving.', 'https://example.com/images/banarasi.jpg', TRUE, NOW(), NOW()),
  (3, 'Mysore Silk Sarees', 'mysore-silk-sarees', 'Premium Mysore silk sarees with classic designs.', 'https://example.com/images/mysore.jpg', TRUE, NOW(), NOW()),
  (4, 'Designer Silk Sarees', 'designer-silk-sarees', 'Modern designer silk sarees for special occasions.', 'https://example.com/images/designer.jpg', TRUE, NOW(), NOW());

ALTER TABLE `categories` AUTO_INCREMENT = 5;

INSERT INTO `products` (
  `id`, `category_id`, `name`, `slug`, `sku`, `description`, `price`, `original_price`, `stock`, `image_url`, `material`, `color`, `saree_length`, `blouse_piece`, `is_featured`, `is_active`, `created_at`, `updated_at`
)
VALUES
  (1, 1, 'Royal Temple Kanchipuram Saree', 'royal-temple-kanchipuram-saree', 'KS-001', 'A rich temple-inspired Kanchipuram silk saree with dense zari border and regal texture.', 18500.00, 22000.00, 12, 'https://images.example.com/products/ks-001.jpg', 'Pure Silk', 'Red', '5.5 m', TRUE, TRUE, TRUE, NOW(), NOW()),
  (2, 1, 'Pearl Zari Kanchipuram Saree', 'pearl-zari-kanchipuram-saree', 'KS-002', 'Pearl-toned saree featuring delicate zari work, elegant drape, and festive charm.', 17200.00, 20500.00, 15, 'https://images.example.com/products/ks-002.jpg', 'Pure Silk', 'Pearl Gold', '5.5 m', TRUE, FALSE, TRUE, NOW(), NOW()),
  (3, 1, 'Emerald Heritage Saree', 'emerald-heritage-saree', 'KS-003', 'Emerald silk saree crafted with traditional motifs and a luxurious, heirloom feel.', 19800.00, 23500.00, 10, 'https://images.example.com/products/ks-003.jpg', 'Pure Silk', 'Emerald', '5.5 m', TRUE, FALSE, TRUE, NOW(), NOW()),
  (4, 1, 'Ivory Temple Border Saree', 'ivory-temple-border-saree', 'KS-004', 'Soft ivory silk saree with intricate temple border and a graceful festive silhouette.', 16800.00, 19800.00, 9, 'https://images.example.com/products/ks-004.jpg', 'Pure Silk', 'Ivory', '5.5 m', TRUE, FALSE, TRUE, NOW(), NOW()),
  (5, 2, 'Banarasi Rose Gold Saree', 'banarasi-rose-gold-saree', 'BS-001', 'A rose-gold Banarasi silk saree with handwoven elegance and floral zari detailing.', 21400.00, 25500.00, 8, 'https://images.example.com/products/bs-001.jpg', 'Silk Blend', 'Rose Gold', '5.5 m', TRUE, TRUE, TRUE, NOW(), NOW()),
  (6, 2, 'Mughal Garden Banarasi Saree', 'mughal-garden-banarasi-saree', 'BS-002', 'Luxury Banarasi silk saree inspired by Mughal gardens and detailed handloom textures.', 22500.00, 26900.00, 7, 'https://images.example.com/products/bs-002.jpg', 'Silk Blend', 'Emerald', '5.5 m', TRUE, TRUE, TRUE, NOW(), NOW()),
  (7, 2, 'Jardiniere Zari Saree', 'jardiniere-zari-saree', 'BS-003', 'Elegant zari-heavy saree with refined floral patterns and a couture-inspired look.', 20300.00, 23900.00, 13, 'https://images.example.com/products/bs-003.jpg', 'Silk Blend', 'Maroon', '5.5 m', TRUE, FALSE, TRUE, NOW(), NOW()),
  (8, 2, 'Saffron Heritage Saree', 'saffron-heritage-saree', 'BS-004', 'Saffron-toned Banarasi silk saree crafted for celebratory warmth and glamour.', 18900.00, 22800.00, 11, 'https://images.example.com/products/bs-004.jpg', 'Silk Blend', 'Saffron', '5.5 m', TRUE, FALSE, TRUE, NOW(), NOW()),
  (9, 3, 'Pattu Royal Blue Saree', 'pattu-royal-blue-saree', 'PS-001', 'Royal blue pattu silk saree with rich finish, traditional drape, and festive glow.', 17600.00, 21400.00, 20, 'https://images.example.com/products/ps-001.jpg', 'Pattu Silk', 'Royal Blue', '5.5 m', TRUE, TRUE, TRUE, NOW(), NOW()),
  (10, 3, 'Pearl Pattu Silk Saree', 'pearl-pattu-silk-saree', 'PS-002', 'Pearl-white silk saree with minimal zari work designed for graceful celebrations.', 15400.00, 18600.00, 18, 'https://images.example.com/products/ps-002.jpg', 'Pattu Silk', 'Pearl White', '5.5 m', TRUE, FALSE, TRUE, NOW(), NOW()),
  (11, 3, 'Champagne Pattu Saree', 'champagne-pattu-saree', 'PS-003', 'Champagne-hued pattu silk created for subtle luxury and celebratory ease.', 16400.00, 20100.00, 16, 'https://images.example.com/products/ps-003.jpg', 'Pattu Silk', 'Champagne', '5.5 m', TRUE, FALSE, TRUE, NOW(), NOW()),
  (12, 3, 'Deep Plum Pattu Saree', 'deep-plum-pattu-saree', 'PS-004', 'Deep plum silk saree with graceful finish and a rich color palette for grand events.', 17900.00, 21900.00, 14, 'https://images.example.com/products/ps-004.jpg', 'Pattu Silk', 'Plum', '5.5 m', TRUE, FALSE, TRUE, NOW(), NOW()),
  (13, 4, 'Bridal Enchantment Saree', 'bridal-enchantment-saree', 'BR-001', 'A statement bridal saree with exquisite design work and shimmer suited for the wedding day.', 34900.00, 42000.00, 6, 'https://images.example.com/products/br-001.jpg', 'Pure Silk', 'Deep Red', '5.5 m', TRUE, TRUE, TRUE, NOW(), NOW()),
  (14, 4, 'Gilded Bride Saree', 'gilded-bride-saree', 'BR-002', 'Bridal heirloom-inspired silk saree with gilded detailing and rich classic drape.', 38900.00, 46000.00, 5, 'https://images.example.com/products/br-002.jpg', 'Pure Silk', 'Saffron', '5.5 m', TRUE, TRUE, TRUE, NOW(), NOW()),
  (15, 4, 'Everyday Sheen Soft Silk Saree', 'everyday-sheen-soft-silk-saree', 'SS-001', 'Lightweight soft silk saree that balances elegance, freshness, and effortless daywear comfort.', 11900.00, 14800.00, 24, 'https://images.example.com/products/ss-001.jpg', 'Soft Silk', 'Pastel Pink', '5.5 m', TRUE, FALSE, TRUE, NOW(), NOW()),
  (16, 4, 'Lavender Soft Silk Saree', 'lavender-soft-silk-saree', 'SS-002', 'A dreamy lavender soft silk saree with graceful styling and easy drape for modern occasions.', 12800.00, 15800.00, 22, 'https://images.example.com/products/ss-002.jpg', 'Soft Silk', 'Lavender', '5.5 m', TRUE, FALSE, TRUE, NOW(), NOW());

ALTER TABLE `products` AUTO_INCREMENT = 17;

INSERT INTO `cart_items` (`id`, `user_id`, `product_id`, `quantity`, `created_at`, `updated_at`)
VALUES
  (1, 2, 1, 1, NOW(), NOW()),
  (2, 2, 9, 2, NOW(), NOW()),
  (3, 2, 15, 1, NOW(), NOW());

ALTER TABLE `cart_items` AUTO_INCREMENT = 4;

INSERT INTO `orders` (`id`, `user_id`, `order_number`, `total_amount`, `payment_status`, `order_status`, `shipping_name`, `shipping_phone`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_postal_code`, `shipping_country`, `notes`, `created_at`, `updated_at`)
VALUES
  (1, 2, 'GS-20260928-A1B2C3', 48000.00, 'PAID', 'CONFIRMED', 'Demo Customer', '+91 90000 00002', '12 Market Street', 'Near City Center', 'Chennai', 'Tamil Nadu', '600001', 'India', 'Gift wrap please.', NOW(), NOW()),
  (2, 2, 'GS-20260929-D4E5F6', 37800.00, 'PENDING', 'PENDING', 'Demo Customer', '+91 90000 00002', '18 Residency Road', 'Apartment 304', 'Bengaluru', 'Karnataka', '560001', 'India', 'Need express delivery.', NOW(), NOW());

ALTER TABLE `orders` AUTO_INCREMENT = 3;

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `product_sku`, `product_price`, `quantity`, `subtotal`, `created_at`)
VALUES
  (1, 1, 1, 'Royal Temple Kanchipuram Saree', 'KS-001', 18500.00, 1, 18500.00, NOW()),
  (2, 1, 9, 'Pattu Royal Blue Saree', 'PS-001', 17600.00, 1, 17600.00, NOW()),
  (3, 1, 15, 'Everyday Sheen Soft Silk Saree', 'SS-001', 11900.00, 1, 11900.00, NOW()),
  (4, 2, 11, 'Champagne Pattu Saree', 'PS-003', 16400.00, 1, 16400.00, NOW()),
  (5, 2, 5, 'Banarasi Rose Gold Saree', 'BS-001', 21400.00, 1, 21400.00, NOW());

ALTER TABLE `order_items` AUTO_INCREMENT = 6;

UPDATE `orders`
SET `total_amount` = (
  SELECT SUM(`subtotal`)
  FROM `order_items`
  WHERE `order_items`.`order_id` = `orders`.`id`
)
WHERE `id` IN (1, 2);
