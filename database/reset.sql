-- WARNING: This script permanently removes the GSilks database.
-- Run it only in local development environments and only when you are certain you want to reset all data.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

DROP DATABASE IF EXISTS `gsilks_db`;

-- Optional: recreate a clean database and tables using schema.sql.
-- mysql -u root -p < database/schema.sql
