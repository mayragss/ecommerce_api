
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const authRoutes = require("./src/routes/auth.routes");
const path = require("path")
const mysql = require("mysql2/promise"); 

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', // Aceita qualquer origem
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false // Não permite credenciais para origem wildcard
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.sendStatus(200);
});

app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

const { sequelize } = require("./src/models");

// Middleware for JWT auth
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Routes
const userRoutes = require("./src/routes/user.routes");
const productRoutes = require("./src/routes/product.routes");
const orderRoutes = require("./src/routes/order.routes");
const cartRoutes = require("./src/routes/cart.routes");
const favoriteRoutes = require("./src/routes/favorite.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const invoiceRoutes = require("./src/routes/invoice.routes");
const adminRoutes = require("./src/routes/admin.routes");

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/payments", paymentRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/admin", authenticate, adminRoutes);
app.use("/auth", authRoutes);

app.get("/health", (req, res) => res.json({ status: "API online" }));

// Load Swagger AFTER all routes are defined
require("./src/swagger")(app);

// Error handling middleware
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

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
  await connection.end();
}


async function start() {
  try {
    await ensureDatabaseExists(); // ✅ Cria o banco, se não existir
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL");

    // Sync database schema
    await sequelize.sync({ force: false });
    console.log("✅ Database synchronized");
    
    app.listen(process.env.PORT || 3000, () => {
      console.log("🚀 Server running on port " + (process.env.PORT || 3000));
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
}

start();