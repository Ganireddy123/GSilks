# GSilks Backend API

## 1. Project overview

This project provides the backend API and MySQL database for the GSilks premium silk saree e-commerce application. It exposes REST endpoints for authentication, categories, products, cart management, orders, and user profile administration.

The architecture is layered as follows:

- Routes handle HTTP routing and endpoint definitions.
- Controllers handle request and response processing.
- Services contain business logic and all database operations.
- MySQL is used through a reusable connection pool.
- Middleware enforces authentication, role checks, validation, and error handling.

## 2. Backend architecture explanation

The backend follows a clean service-oriented structure:

- `server/routes` contains the API route definitions.
- `server/controllers` receives Express requests and calls services.
- `server/services` encapsulates business logic and SQL operations.
- `server/config/db.js` creates and exports the MySQL pool.
- `server/utils` contains reusable helper utilities.
- `server/middleware` is responsible for authentication, roles, validation, upload handling, not-found handling, and central error formatting.

This project uses parameterized SQL queries and keeps all business logic out of route files.

## 3. Complete backend folder structure

```text
server/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── categoryController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   ├── errorMiddleware.js
│   ├── validateMiddleware.js
│   ├── notFoundMiddleware.js
│   └── uploadMiddleware.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   └── userRoutes.js
├── services/
│   ├── authService.js
│   ├── categoryService.js
│   ├── productService.js
│   ├── cartService.js
│   ├── orderService.js
│   └── userService.js
├── utils/
│   ├── ApiError.js
│   ├── asyncHandler.js
│   ├── generateToken.js
│   ├── responseHandler.js
│   └── generateOrderNumber.js
├── uploads/
│   └── .gitkeep
├── app.js
├── server.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── .env
```

## 4. Prerequisites

Before starting this backend, ensure you have:

- Node.js 18+ installed
- MySQL 8.0+ installed and running locally
- A MySQL user with permission to create and modify databases
- A terminal with access to MySQL CLI or MySQL Workbench

## 5. Node.js setup

Install Node.js from the official site and verify it with:

```bash
node -v
npm -v
```

## 6. MySQL setup

Create a local MySQL database and ensure the server can connect using your credentials.

Example MySQL login:

```bash
mysql -u root -p
```

Then create the database manually or run the schema script as shown below.

## 7. How to run database/schema.sql

From the project root:

```bash
mysql -u root -p < database/schema.sql
```

If your MySQL user is not root, replace it with your username:

```bash
mysql -u your_mysql_user -p < database/schema.sql
```

This script creates the `gsilks_db` database and all required tables, indexes, and constraints.

## 8. How to run database/seed.sql

After the schema is created, run the seed data script:

```bash
mysql -u root -p < database/seed.sql
```

This inserts:

- one admin user
- one customer user
- five categories
- sixteen products
- demo cart items
- two sample orders and their order items

## 9. How to create server/.env from .env.example

Copy the example file and update the values:

```bash
cd server
copy .env.example .env
```

On Linux/macOS:

```bash
cp .env.example .env
```

Update the file with your local MySQL credentials and JWT secret.

Example:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gsilks_db

JWT_SECRET=replace_with_a_long_secure_random_secret
JWT_EXPIRES_IN=7d
```

## 10. Installation commands

From the backend folder:

```bash
cd server
npm install
```

## 11. How to start the development server

```bash
cd server
npm run dev
```

Production mode:

```bash
cd server
npm start
```

## 12. API base URL

```text
http://localhost:5000/api
```

## 13. Full API endpoint table

The original plural REST endpoints remain available. The frontend's endpoint registry in `Clint/src/API/constant.js` defines the singular aliases and maps each endpoint to its HTTP method.

### Registry aliases

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET, PUT | /api/auth/profile, /api/auth/update-profile | Logged-in user |
| PUT | /api/auth/change-password | Logged-in user |
| GET | /api/category/get-categories, /api/category/get-category/:id | Public |
| POST, PUT | /api/category/insert-category, /api/category/update-category, /api/category/delete-category | Admin |
| GET | /api/product/get-products, /api/product/get-product/:id, /api/product/get-products-by-category/:id, /api/product/search-products | Public |
| POST, PUT | /api/product/insert-product, /api/product/update-product, /api/product/delete-product | Admin |
| GET, POST, PUT | /api/cart/get-cart, /api/cart/add-to-cart, /api/cart/update-cart, /api/cart/remove-from-cart, /api/cart/clear-cart | Logged-in user |
| POST, GET, PUT | /api/order/create-order, /api/order/get-my-orders, /api/order/get-order/:id, /api/order/cancel-order | Logged-in user |
| GET, PUT | /api/order/admin/get-orders, /api/order/admin/get-order/:id, /api/order/admin/update-order-status | Admin |
| GET, PUT | /api/user/get-profile, /api/user/update-profile, /api/user/change-password | Logged-in user |
| GET, PUT | /api/user/admin/get-users, /api/user/admin/get-user/:id, /api/user/admin/update-user-status | Admin |
| GET | /api/admin/dashboard, /api/admin/products, /api/admin/categories, /api/admin/orders, /api/admin/users | Admin |

Cart and order ownership always comes from the authenticated JWT; clients must not supply another user's ID. Cancelling an order restores its reserved stock and is rejected for paid or otherwise non-cancellable orders because this backend does not implement payment refunds.

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Logged-in user |

### Categories

| Method | Endpoint | Access |
|---|---|---|
| GET | /api/categories | Public |
| GET | /api/categories/:id | Public |
| POST | /api/categories | ADMIN |
| PUT | /api/categories/:id | ADMIN |
| DELETE | /api/categories/:id | ADMIN |

### Products

| Method | Endpoint | Access |
|---|---|---|
| GET | /api/products | Public |
| GET | /api/products/:id | Public |
| POST | /api/products | ADMIN |
| PUT | /api/products/:id | ADMIN |
| DELETE | /api/products/:id | ADMIN |

### Cart

| Method | Endpoint | Access |
|---|---|---|
| GET | /api/cart | Logged-in CUSTOMER |
| POST | /api/cart/items | Logged-in CUSTOMER |
| PUT | /api/cart/items/:id | Logged-in CUSTOMER |
| DELETE | /api/cart/items/:id | Logged-in CUSTOMER |

### Orders

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/orders | Logged-in CUSTOMER |
| GET | /api/orders | CUSTOMER or ADMIN |
| GET | /api/orders/:id | CUSTOMER or ADMIN |
| PATCH | /api/orders/:id/status | ADMIN |

### Users

| Method | Endpoint | Access |
|---|---|---|
| GET | /api/users | ADMIN |
| GET | /api/users/:id | ADMIN |
| PATCH | /api/users/:id/role | ADMIN |
| GET | /api/users/profile | Logged-in user |
| PUT | /api/users/profile | Logged-in user |

### Health

| Method | Endpoint | Access |
|---|---|---|
| GET | /api/health | Public |

## 14. Authentication and JWT usage

The API uses JWT authentication. The token is expected in the request header:

```http
Authorization: Bearer <token>
```

The backend reads the token from the Authorization header, verifies it using the `JWT_SECRET`, and fetches the current user record to ensure the account still exists and is active.

## 15. Sample admin credentials

```text
Email: ganireddy@1234gmail.com
Password: Gani@1234
```

## 16. Sample customer credentials

```text
Email: customer@gsilks.com
Password: Customer@123
```

## 17. Product image upload instructions

Product image uploads are handled through Multer and stored in `server/uploads`.

Example file upload request:

```http
POST /api/products
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

Form fields include:

- `image` file
- `name`
- `slug`
- `sku`
- `price`
- `category_id`
- other optional fields

Accepted file types:

- JPG
- JPEG
- PNG
- WEBP

Maximum size:

- 5 MB per file

Uploaded files are served via:

```text
http://localhost:5000/uploads/<filename>
```

## 18. Error response format

The API returns JSON errors in a consistent envelope:

```json
{
  "success": false,
  "message": "Meaningful error message",
  "errors": []
}
```

## 19. Troubleshooting instructions

### MySQL connection issues

- Confirm MySQL is running
- Verify `.env` database settings match your local database
- Check that the `gsilks_db` database exists

### JWT errors

- Ensure `JWT_SECRET` is set in `server/.env`
- Verify the token is sent as `Authorization: Bearer <token>`

### File upload issues

- Ensure file type is JPG, JPEG, PNG, or WEBP
- Ensure file size is under 5 MB
- Verify `server/uploads` exists

### 404 errors

- Confirm the route path is correct
- Check that the API is running on the expected port

### Duplicate entry errors

- Some create operations require unique values such as email, slug, and SKU
- Use unique values when seeding or creating records

## Quick start summary

```bash
cd server
npm install
cp .env.example .env
# Edit the .env file with your MySQL and JWT settings
cd ..
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
cd server
npm run dev
```

Then test:

```bash
curl http://localhost:5000/api/health
```
