# GSilks Database

This folder contains the MySQL schema, seed data, reset script, and reusable SQL helpers for the GSilks e-commerce API.

## 1. Purpose

The database is designed to match the app contract defined by the Node.js service layer in `server/services`:

- `users` stores admin and customer accounts with `email`, `password_hash`, `role`, and `is_active`
- `categories` stores product collections and slugs
- `products` stores catalog rows with pricing, stock, category linkage, and filtering metadata
- `cart_items` stores per-user cart state using a unique user + product key
- `orders` stores checkout shipping and payment state
- `order_items` stores a product snapshot for each order line item

## 2. Schema and seed scripts

Run the scripts in this order from the project root:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

To add repeatable sample activity for the customer cart, order history, order details, and admin order/dashboard pages, run this optional fixture after the base seed:

```bash
mysql -u root -p < database/seed_sample_activity.sql
```

The fixture reuses an existing customer and products, creates no passwords, and does not adjust product stock. It can be run again without duplicating its sample orders or cart item.

If your existing `gsilks_db` contains the earlier catalog-only layout, do not run `reset.sql` because it deletes that catalog. Run the one-time additive migration instead:

```bash
mysql -u root -p < database/migrate_legacy_catalog.sql
```

The migration preserves existing category and product rows, adds the current catalog columns, and creates the missing users, cart, and order tables. It also creates the local admin and customer accounts. Do not run it after a fresh `schema.sql` installation or more than once.

If you want to reset the database completely:

```bash
mysql -u root -p < database/reset.sql
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

## 3. Database name and defaults

The expected database name is:

```text
gsilks_db
```

The app uses the connection values in `server/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gsilks_db
```

## 4. Compatibility rules

This SQL design follows the current backend contract and MySQL 8 conventions:

- InnoDB engine
- utf8mb4 / utf8mb4_unicode_ci default collation
- lowercase snake_case table and column naming
- explicit foreign keys and named indexes
- parameterized SQL in the service layer is aligned to the exact table and column names
- `users.password_hash` is the field used by `authService.js`
- `users.email` is unique
- `products.category_id`, `products.slug`, and `products.sku` are enforced as unique or relational keys

## 5. File overview

- `schema.sql` — creates the database and tables
- `seed.sql` — inserts demo users, categories, products, cart items, and orders
- `seed_sample_activity.sql` — adds repeatable sample cart/order activity for empty customer and admin views
- `queries.sql` — reusable SQL snippets for common service calls
- `reset.sql` — dev reset script to drop objects in safe reverse dependency order
- `migrate_legacy_catalog.sql` — one-time additive migration for the earlier catalog-only schema

## 6. Seeded accounts

The seed script creates one admin and one customer account:

- Admin: `ganireddy@1234gmail.com` / `Gani@1234`
- Customer: `customer@gsilks.com` / `Customer@123`

Change these credentials before deploying beyond local development.

## 7. Troubleshooting

### MySQL authentication fails

Check the values in `server/.env` and confirm your MySQL user has permission to create databases and tables.

### Database already exists

If you are re-running setup locally, use the reset script or drop the database manually before rerunning `schema.sql`.

### Foreign key errors

Use `reset.sql` or drop tables in reverse dependency order before creating the schema again.

### Mismatch with app behavior

All service queries are the source of truth. If a query or route fails after a database change, confirm that the table/column names match the service layer exactly before modifying backend code.

## 8. Notes for local development

Use a dedicated local MySQL instance for the application and do not use production credentials in a local development environment. The order totals in the seed script are validated against the sum of the corresponding `order_items.subtotal` values.
