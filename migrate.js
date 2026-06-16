import { query } from './config/database.ts';

const runMigration = async () => {
  try {
    console.log('Starting migration...');

    // Add role column if it doesn’t exist
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'traveler';
    `);

    console.log('Migration complete: role column added to users table.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

runMigration();
