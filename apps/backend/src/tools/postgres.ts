import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://user:password@localhost:5432/inquiry_agent'
});

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      prompt TEXT NOT NULL,
      response JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
