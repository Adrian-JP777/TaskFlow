const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runMigrations() {
  const duplicateEmails = await pool.query(
    'SELECT lower(email) AS email FROM users GROUP BY lower(email) HAVING count(*) > 1'
  );
  if (duplicateEmails.rows.length) {
    throw new Error('Hay correos duplicados en users; corrígelos antes de crear el índice único.');
  }

  const directory = path.join(__dirname, '../migrations');
  const migrations = fs.readdirSync(directory).filter((file) => file.endsWith('.sql')).sort();
  for (const migration of migrations) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(fs.readFileSync(path.join(directory, migration), 'utf8'));
      await client.query('COMMIT');
      console.log(`Migración aplicada: ${migration}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

runMigrations()
  .catch((error) => {
    console.error('Error al ejecutar migraciones:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
