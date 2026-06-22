-- Vercel Postgres Table Schema for users table
-- Run this in your Vercel database query console to establish user authentication and profile storage.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- securely pbkdf2 hashed password
  salt VARCHAR(64) NOT NULL,
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  coins INT DEFAULT 200, -- Free tier registration starting balance (configurable)
  spent_amount NUMERIC(10, 2) DEFAULT 0.00,
  bio TEXT DEFAULT 'মুদ্রণ ও সাহিত্যপ্রেমী কলাম পাঠক।',
  role VARCHAR(30) DEFAULT 'reader', -- 'reader' or 'writer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fast username indexing for swift registration and session evaluation
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
