#!/usr/bin/env node

/**
 * Manual migration script for production environments
 * Usage: node migrate.js [command]
 * 
 * Commands:
 * - check: Check current schema status
 * - fix-constraints: Fix duplicate foreign key constraints
 * - force-sync: Force sync with alter (use with caution)
 */

const { sequelize } = require('./src/models');
const { checkAndFixForeignKeys, runMigrations } = require('./src/utils/migration');

async function checkSchema() {
  try {
    console.log("🔍 Checking database schema...");
    
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log(`📋 Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    await checkAndFixForeignKeys();
    
  } catch (error) {
    console.error("❌ Error checking schema:", error);
  }
}

async function fixConstraints() {
  try {
    console.log("🔧 Fixing foreign key constraints...");
    await checkAndFixForeignKeys();
  } catch (error) {
    console.error("❌ Error fixing constraints:", error);
  }
}

async function forceSync() {
  try {
    console.log("⚠️  WARNING: This will alter existing tables!");
    console.log("🔄 Force syncing database...");
    
    await sequelize.sync({ alter: true });
    console.log("✅ Force sync completed");
  } catch (error) {
    console.error("❌ Force sync failed:", error);
  }
}

async function runCustomMigrations() {
  try {
    console.log("🔄 Running custom migrations...");
    await runMigrations();
  } catch (error) {
    console.error("❌ Custom migrations failed:", error);
  }
}

async function main() {
  const command = process.argv[2];
  
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database");
    
    switch (command) {
      case 'check':
        await checkSchema();
        break;
      case 'fix-constraints':
        await fixConstraints();
        break;
      case 'force-sync':
        await forceSync();
        break;
      case 'migrate':
        await runCustomMigrations();
        break;
      default:
        console.log(`
Usage: node migrate.js [command]

Commands:
  check           - Check current schema status
  fix-constraints - Fix duplicate foreign key constraints  
  force-sync      - Force sync with alter (use with caution)
  migrate         - Run custom migrations
        `);
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await sequelize.close();
  }
}

main();
