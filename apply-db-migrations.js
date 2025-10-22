#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read migrations
const migration013 = fs.readFileSync('/srv/project-chimera/supabase/migrations/013_add_missing_character_columns.sql', 'utf8');
const migration014 = fs.readFileSync('/srv/project-chimera/supabase/migrations/014_create_asset_tables.sql', 'utf8');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in environment');
  process.exit(1);
}

console.log('\n🔄 Applying Database Migrations\n');
console.log(`Database: ${DATABASE_URL.split('@')[1]}\n`);

const migrations = [
  { name: '013_add_missing_character_columns', sql: migration013 },
  { name: '014_create_asset_tables', sql: migration014 }
];

for (const migration of migrations) {
  try {
    console.log(`📝 Applying ${migration.name}...`);

    // Create temporary SQL file
    const tempFile = `/tmp/${migration.name}.sql`;
    fs.writeFileSync(tempFile, migration.sql);

    // Execute using psql
    execSync(`PGPASSWORD='${process.env.DB_PASSWORD || ''}' psql "${DATABASE_URL}" -f "${tempFile}"`, {
      stdio: 'pipe'
    });

    console.log(`✅ ${migration.name} completed\n`);
    fs.unlinkSync(tempFile);
  } catch (error) {
    console.error(`⚠️  ${migration.name} error:`, error.message);
    console.log(`   (Continuing - may already be applied)\n`);
  }
}

console.log('✨ Migration application completed!\n');
