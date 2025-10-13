#!/usr/bin/env node

/**
 * Debug server - loads routes without problematic middleware
 */

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));

app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// Health check
app.get("/health", (req, res) => res.json({ status: "API online" }));

// Test basic routes first
console.log("🔍 Testing basic routes...");

try {
  // Test auth routes (usually the simplest)
  console.log("Loading auth routes...");
  const authRoutes = require('./src/routes/auth.routes');
  app.use('/auth', authRoutes);
  console.log("✅ Auth routes loaded");
} catch (error) {
  console.error("❌ Auth routes failed:", error.message);
}

try {
  // Test user routes
  console.log("Loading user routes...");
  const userRoutes = require('./src/routes/user.routes');
  app.use('/users', userRoutes);
  console.log("✅ User routes loaded");
} catch (error) {
  console.error("❌ User routes failed:", error.message);
}

try {
  // Test cart routes
  console.log("Loading cart routes...");
  const cartRoutes = require('./src/routes/cart.routes');
  app.use('/cart', cartRoutes);
  console.log("✅ Cart routes loaded");
} catch (error) {
  console.error("❌ Cart routes failed:", error.message);
}

try {
  // Test order routes
  console.log("Loading order routes...");
  const orderRoutes = require('./src/routes/order.routes');
  app.use('/orders', orderRoutes);
  console.log("✅ Order routes loaded");
} catch (error) {
  console.error("❌ Order routes failed:", error.message);
}

try {
  // Test favorite routes
  console.log("Loading favorite routes...");
  const favoriteRoutes = require('./src/routes/favorite.routes');
  app.use('/favorites', favoriteRoutes);
  console.log("✅ Favorite routes loaded");
} catch (error) {
  console.error("❌ Favorite routes failed:", error.message);
}

try {
  // Test invoice routes
  console.log("Loading invoice routes...");
  const invoiceRoutes = require('./src/routes/invoice.routes');
  app.use('/invoices', invoiceRoutes);
  console.log("✅ Invoice routes loaded");
} catch (error) {
  console.error("❌ Invoice routes failed:", error.message);
}

try {
  // Test payment routes
  console.log("Loading payment routes...");
  const paymentRoutes = require('./src/routes/payment.routes');
  app.use('/payments', paymentRoutes);
  console.log("✅ Payment routes loaded");
} catch (error) {
  console.error("❌ Payment routes failed:", error.message);
}

try {
  // Test admin routes
  console.log("Loading admin routes...");
  const adminRoutes = require('./src/routes/admin.routes');
  app.use('/admin', adminRoutes);
  console.log("✅ Admin routes loaded");
} catch (error) {
  console.error("❌ Admin routes failed:", error.message);
}

try {
  // Test seo routes
  console.log("Loading seo routes...");
  const seoRoutes = require('./src/routes/seo.routes');
  app.use('/seo', seoRoutes);
  console.log("✅ SEO routes loaded");
} catch (error) {
  console.error("❌ SEO routes failed:", error.message);
}

// Test product routes LAST (they have the upload middleware)
try {
  console.log("Loading product routes...");
  const productRoutes = require('./src/routes/product.routes');
  app.use('/products', productRoutes);
  console.log("✅ Product routes loaded");
} catch (error) {
  console.error("❌ Product routes failed:", error.message);
  console.error("This is likely the problematic route with upload middleware");
}

// Error handling
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Debug server running on port " + (process.env.PORT || 3000));
  console.log("📋 Test the routes to see which one causes the error");
});
