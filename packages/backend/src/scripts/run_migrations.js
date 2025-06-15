const path = require('path');
const Sequelize = require('sequelize');
const Umzug = require('umzug');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '../database.sqlite'),
  logging: false
});

// Initialize Umzug for migrations
const umzug = new Umzug({
  migrations: {
    path: path.join(__dirname, '../../migrations'),
    params: [
      sequelize.getQueryInterface(),
      Sequelize
    ]
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize
  }
});

// Function to run migrations
async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Run all pending migrations
    const migrations = await umzug.up();
    console.log('Migrations executed:', migrations.map(m => m.file).join(', '));
    
    console.log('All migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
