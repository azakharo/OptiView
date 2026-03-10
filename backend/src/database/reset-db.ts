import { dataSourceOptions } from '../data-source';
import { DataSource } from 'typeorm';

/**
 * Reset database - truncate all tables
 * Usage: npm run db:reset
 */

async function resetDatabase() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    console.log('🔄 Resetting database...\n');

    // Truncate all tables
    console.log('📋 Truncating tables...');

    // Get all table names from the database
    const tables: Array<{ tablename: string }> = await dataSource.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT IN ('migrations', 'typeorm_metadata')
    `);

    if (tables.length === 0) {
      console.log('  ℹ️ No tables to truncate');
    } else {
      // Disable triggers and truncate each table
      for (const { tablename } of tables) {
        await dataSource.query(
          `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`,
        );
        console.log(`  ✓ Truncated table: ${tablename}`);
      }
    }

    // Reset sequences for serial/bigserial columns
    console.log('\n🔄 Resetting sequences...');
    const sequences: Array<{ sequence_name: string }> = await dataSource.query(`
      SELECT sequence_name FROM information_schema.sequences
      WHERE sequence_schema = 'public'
      AND sequence_name NOT IN ('migrations_id_seq')
    `);

    for (const { sequence_name } of sequences) {
      await dataSource.query(
        `ALTER SEQUENCE "${sequence_name}" RESTART WITH 1`,
      );
      console.log(`  ✓ Reset sequence: ${sequence_name}`);
    }

    console.log('\n✅ Database reset complete!');

    // Close this connection before seed script runs
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Reset failed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the reset
void resetDatabase();
