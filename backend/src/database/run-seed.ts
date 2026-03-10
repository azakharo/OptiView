import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';

/**
 * Seed script to populate database with initial data
 */
async function runSeed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    console.log('🌱 Starting seed...');

    console.log('NOT IMPLEMENTED!!!!!!!!!!!!!!!!!!!!!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run the seed
runSeed().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
