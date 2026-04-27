const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema_sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the entire schema at once
    await db.run(schema);

    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await db.close();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;