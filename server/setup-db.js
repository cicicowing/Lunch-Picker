#!/usr/bin/env node

/**
 * Database Setup Utility
 * Run this script to create and initialize the database
 * Usage: node setup-db.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const isReset = args.includes('--reset');

async function setupDatabase() {
  console.log('🗄️  Lunch Picker Database Setup\n');

  // Connect to PostgreSQL (default postgres database)
  const adminPool = new Pool({
    host: 'localhost',
    user: process.env.USER || 'postgres',
    database: 'postgres',
    port: 5432,
  });

  try {
    // Check if database exists
    const dbCheckResult = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname='lunch_picker'"
    );

    if (dbCheckResult.rows.length > 0) {
      if (isReset) {
        console.log('⚠️  Dropping existing database...');
        await adminPool.query('DROP DATABASE lunch_picker');
        console.log('✅ Database dropped\n');
      } else {
        console.log('ℹ️  Database already exists. Use --reset to recreate.\n');
        await adminPool.end();
        await runSchema();
        return;
      }
    }

    // Create database
    console.log('📦 Creating database "lunch_picker"...');
    await adminPool.query('CREATE DATABASE lunch_picker');
    console.log('✅ Database created\n');

    await adminPool.end();

    // Run schema
    await runSchema();

    console.log('\n✨ Database setup complete!\n');
    console.log('Next steps:');
    console.log('1. Copy server/.env.example to server/.env');
    console.log('2. Add your API keys to server/.env');
    console.log('3. Run: cd server && npm run dev');
    console.log('4. Run: cd client && npm start\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

async function runSchema() {
  console.log('📝 Running schema...');

  const pool = new Pool({
    host: 'localhost',
    user: process.env.USER || 'postgres',
    database: 'lunch_picker',
    port: 5432,
  });

  try {
    const schemaPath = path.join(__dirname, 'src', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);
    console.log('✅ Schema applied\n');

    // Show tables
    const tablesResult = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error running schema:', error.message);
    await pool.end();
    process.exit(1);
  }
}

// Run setup
setupDatabase();
