const { Pool } = require('pg');
require('dotenv').config({ path: '../.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL
      );
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initDb();
