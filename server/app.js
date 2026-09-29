const express = require('express');
const cors = require('cors');
const path = require('path');
const { config } = require('dotenv');

config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const registeredApiEndpoints = [
  { method: 'GET', path: '/api/health' }
];

const mountApiRoutes = (basePath, createRouter) => {
  const router = createRouter();
  app.use(basePath, router);

  for (const layer of router.stack) {
    if (!layer.route) continue;
    const routePaths = Array.isArray(layer.route.path) ? layer.route.path : [layer.route.path];
    const methods = Object.keys(layer.route.methods)
      .filter((method) => method !== '_all')
      .map((method) => method.toUpperCase());

    for (const routePath of routePaths) {
      if (typeof routePath !== 'string') continue;
      for (const method of methods) {
        registeredApiEndpoints.push({ method, path: `${basePath}${routePath}` });
      }
    }
  }
};

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  });
});

mountApiRoutes('/api/auth', authRoutes);
mountApiRoutes('/api/category', categoryRoutes);
mountApiRoutes('/api/categories', categoryRoutes);
mountApiRoutes('/api/product', productRoutes);
mountApiRoutes('/api/products', productRoutes);
mountApiRoutes('/api/cart', cartRoutes);
mountApiRoutes('/api/order', orderRoutes);
mountApiRoutes('/api/orders', orderRoutes);
mountApiRoutes('/api/user', userRoutes);
mountApiRoutes('/api/users', userRoutes);
mountApiRoutes('/api/admin', adminRoutes);

app.apiEndpoints = registeredApiEndpoints;

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
