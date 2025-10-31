import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db/pool.js';

async function runMigrations() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const backendRoot = path.resolve(currentDir, '..', '..');
  const projectRoot = path.resolve(backendRoot, '..');
  const databaseDir = path.resolve(projectRoot, 'database');

  const entries = await readdir(databaseDir);
  const sqlFiles = entries
    .filter((file) => file.endsWith('.sql'))
    .sort();

  console.log(`Applying migrations from ${databaseDir}`);

  for (const file of sqlFiles) {
    const fullPath = path.join(databaseDir, file);
    const script = await readFile(fullPath, 'utf8');
    const client = await db.getClient();

    console.log(`\n🏗️  Running ${file}`);

    try {
      await client.query('BEGIN');
      await client.query(script);
      await client.query('COMMIT');
      console.log(`✅ Completed ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error while running ${file}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  await db.end();
}

runMigrations().catch((error) => {
  console.error('Migration process failed:', error);
  process.exitCode = 1;
});
