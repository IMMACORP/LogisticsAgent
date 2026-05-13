-- Schema for Inquiry Agent backend

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
