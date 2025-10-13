const { sequelize } = require('../models');

/**
 * Manual migration utilities for production environments
 * Use these when automatic sync fails or for complex schema changes
 */

async function runMigrations() {
  try {
    console.log("🔄 Running manual migrations...");
    
    // Example: Add new column to existing table
    // await sequelize.query("ALTER TABLE Products ADD COLUMN newField VARCHAR(255)");
    
    // Example: Create new table
    // await sequelize.query(`
    //   CREATE TABLE IF NOT EXISTS NewTable (
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     name VARCHAR(255),
    //     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    //   )
    // `);
    
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

async function checkAndFixForeignKeys() {
  try {
    console.log("🔧 Checking foreign key constraints...");
    
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
    `);
    
    console.log(`Found ${constraints.length} foreign key constraints`);
    
    // Check for duplicate constraint names
    const constraintNames = constraints.map(c => c.CONSTRAINT_NAME);
    const duplicates = constraintNames.filter((name, index) => constraintNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      console.log(`⚠️  Found duplicate constraint names: ${duplicates.join(', ')}`);
      console.log("💡 Consider running: DROP FOREIGN KEY constraint_name; then recreate");
    }
    
  } catch (error) {
    console.error("❌ Error checking foreign keys:", error);
  }
}

module.exports = {
  runMigrations,
  checkAndFixForeignKeys
};
