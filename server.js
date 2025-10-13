
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
const { checkAndFixForeignKeys } = require("./src/utils/migration");

async function fixDuplicateConstraints() {
  try {
    console.log("🔧 Fixing duplicate foreign key constraints...");
    
    // Get all foreign key constraints
    const [constraints] = await sequelize.query(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME IS NOT NULL 
      AND TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, CONSTRAINT_NAME
    `);
    
    // Group by constraint name to find duplicates
    const constraintGroups = {};
    constraints.forEach(constraint => {
      if (!constraintGroups[constraint.CONSTRAINT_NAME]) {
        constraintGroups[constraint.CONSTRAINT_NAME] = [];
      }
      constraintGroups[constraint.CONSTRAINT_NAME].push(constraint);
    });
    
    // Find and fix duplicates
    for (const [constraintName, constraintList] of Object.entries(constraintGroups)) {
      if (constraintList.length > 1) {
        console.log(`🔧 Found duplicate constraint: ${constraintName}`);
        
        // Keep the first one, drop the rest
        for (let i = 1; i < constraintList.length; i++) {
          const constraint = constraintList[i];
          const newName = `${constraintName}_${i}`;
          
          try {
            // Drop the duplicate constraint
            await sequelize.query(`
              ALTER TABLE \`${constraint.TABLE_NAME}\` 
              DROP FOREIGN KEY \`${constraintName}\`
            `);
            
            // Recreate with new name
            await sequelize.query(`
              ALTER TABLE \`${constraint.TABLE_NAME}\` 
              ADD CONSTRAINT \`${newName}\` 
              FOREIGN KEY (\`${constraint.COLUMN_NAME}\`) 
              REFERENCES \`${constraint.REFERENCED_TABLE_NAME}\`(\`${constraint.REFERENCED_COLUMN_NAME}\`)
              ON DELETE SET NULL ON UPDATE CASCADE
            `);
            
            console.log(`✅ Renamed constraint ${constraintName} to ${newName} in table ${constraint.TABLE_NAME}`);
          } catch (error) {
            console.log(`⚠️  Could not fix constraint ${constraintName}: ${error.message}`);
          }
        }
      }
    }
    
    console.log("✅ Duplicate constraints fixed");
  } catch (error) {
    console.error("❌ Error fixing duplicate constraints:", error);
  }
}

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

async function checkSchemaChanges() {
  try {
    // Get current database schema
    const [tables] = await sequelize.query("SHOW TABLES");
    if (tables.length === 0) return true; // No tables, need to create
    
    // Check if all expected tables exist
    const expectedTables = ['Users', 'Products', 'Orders', 'OrderItems', 'Carts', 'CartItems', 'Addresses', 'Favorites', 'Coupons'];
    const existingTables = tables.map(table => Object.values(table)[0]);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`📋 Missing tables: ${missingTables.join(', ')}`);
      return true;
    }
    
    // Check for schema changes by comparing with model definitions
    // This is a simplified check - in production you might want more sophisticated migration handling
    console.log("📋 All tables exist, checking for schema changes...");
    
    // For now, we'll use alter: true but with error handling
    try {
      await sequelize.sync({ alter: true });
      console.log("✅ Schema synchronized successfully");
      return false;
    } catch (error) {
      if (error.message.includes('Duplicate foreign key constraint name')) {
        console.log("⚠️  Schema has conflicts, but tables exist. Continuing with existing schema...");
        return false;
      }
      throw error;
    }
  } catch (error) {
    console.error("❌ Error checking schema:", error);
    return true; // If we can't check, assume we need to create
  }
}

async function start() {
  try {
    await ensureDatabaseExists(); // ✅ Cria o banco, se não existir
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL");

    const needsSync = await checkSchemaChanges();
    if (needsSync) {
      console.log("📋 Creating/updating tables...");
      try {
        await sequelize.sync({ force: false });
      } catch (error) {
        if (error.message.includes('Duplicate foreign key constraint name')) {
          console.log("⚠️  Duplicate constraint detected, trying to fix...");
          await fixDuplicateConstraints();
          // Try sync again after fixing constraints
          await sequelize.sync({ force: false });
        } else {
          throw error;
        }
      }
    }
    
    // Check for foreign key issues in production
    if (process.env.NODE_ENV === 'production') {
      await checkAndFixForeignKeys();
    }
    
    app.listen(process.env.PORT || 3000, () => {
      console.log("🚀 Server running on port " + (process.env.PORT || 3000));
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
}

start();