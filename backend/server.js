const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const app = express();

// Enable compression
app.use(compression());

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Liveness check (no DB) — useful for Vercel / monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Ensure DB is ready (cached after first connect; required for Vercel serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    next(err);
  }
});

// Route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const addressRoutes = require('./routes/addresses');
const wishlistRoutes = require('./routes/wishlist');
const couponRoutes = require('./routes/coupons');
const settingsRoutes = require('./routes/settings');
const notificationRoutes = require('./routes/notifications');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);

// Global error handler - must be last
const errorHandler = require('./middleware/error');
app.use(errorHandler);

// Only listen when not running on Vercel (local development)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || '0.0.0.0';
  const server = app.listen(PORT, HOST, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || 'development'} on http://${HOST}:${PORT}`
    );
  });

  // Handle server errors (e.g., port already in use)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use.`);
      console.error(`Please stop the process using port ${PORT} or use a different port.\n`);
      console.error(`To find and kill the process on Windows:`);
      console.error(`  netstat -ano | findstr :${PORT}`);
      console.error(`  taskkill /PID <PID> /F\n`);
    } else {
      console.error(`Server error: ${err.message}`);
    }
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

// Export for Vercel serverless
module.exports = app;
