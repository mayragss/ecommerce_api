
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
require("./src/swagger")(app);
app.use(express.json());
app.use(cors());
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

    await sequelize.sync({ alter: true }); // ou { force: true } se preferir limpar
    app.listen(process.env.PORT || 3000, () => {
      console.log("🚀 Server running on port " + (process.env.PORT || 3000));
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
}

start();