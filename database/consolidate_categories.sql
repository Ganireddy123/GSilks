-- One-time migration: merge duplicate category IDs 1-4 into matching IDs 5-8.
-- This preserves product assignments before removing duplicate category rows.
USE `gsilks_db`;

START TRANSACTION;

UPDATE `products`
SET `category_id` = CASE `category_id`
  WHEN 1 THEN 5
  WHEN 2 THEN 6
  WHEN 3 THEN 7
  WHEN 4 THEN 8
END
WHERE `category_id` IN (1, 2, 3, 4);

DELETE FROM `categories`
WHERE `id` IN (1, 2, 3, 4);

UPDATE `categories`
SET `id` = `id` - 4
WHERE `id` BETWEEN 5 AND 8;

COMMIT;

ALTER TABLE `categories` AUTO_INCREMENT = 5;