#!/usr/bin/env node

/**
 * Quick fix for duplicate foreign key constraints
 * This script will clean up the database and allow the server to start
 */

const { sequelize } = require('./src/models');

async function fixConstraints() {
  try {
    console.log("🔧 Fixing duplicate foreign key constraints...");
    
    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Connected to database");
    
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
    
    console.log(`Found ${constraints.length} foreign key constraints`);
    
    // Find duplicates
    const constraintNames = constraints.map(c => c.CONSTRAINT_NAME);
    const duplicates = [...new Set(constraintNames.filter((name, index) => constraintNames.indexOf(name) !== index))];
    
    if (duplicates.length === 0) {
      console.log("✅ No duplicate constraints found");
      return;
    }
    
    console.log(`Found duplicate constraints: ${duplicates.join(', ')}`);
    
    // Fix each duplicate
    for (const constraintName of duplicates) {
      const constraintList = constraints.filter(c => c.CONSTRAINT_NAME === constraintName);
      
      if (constraintList.length > 1) {
        console.log(`🔧 Fixing constraint: ${constraintName}`);
        
        // Keep the first one, drop and recreate the rest
        for (let i = 1; i < constraintList.length; i++) {
          const constraint = constraintList[i];
          const newName = `${constraintName}_fixed_${i}`;
          
          try {
            // Drop the duplicate constraint
            await sequelize.query(`
              ALTER TABLE \`${constraint.TABLE_NAME}\` 
              DROP FOREIGN KEY \`${constraintName}\`
            `);
            console.log(`  ✅ Dropped duplicate constraint from ${constraint.TABLE_NAME}`);
            
            // Recreate with new name
            await sequelize.query(`
              ALTER TABLE \`${constraint.TABLE_NAME}\` 
              ADD CONSTRAINT \`${newName}\` 
              FOREIGN KEY (\`${constraint.COLUMN_NAME}\`) 
              REFERENCES \`${constraint.REFERENCED_TABLE_NAME}\`(\`${constraint.REFERENCED_COLUMN_NAME}\`)
              ON DELETE SET NULL ON UPDATE CASCADE
            `);
            console.log(`  ✅ Recreated as ${newName}`);
            
          } catch (error) {
            console.log(`  ⚠️  Could not fix ${constraintName}: ${error.message}`);
          }
        }
      }
    }
    
    console.log("✅ All duplicate constraints fixed!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sequelize.close();
  }
}

fixConstraints();
