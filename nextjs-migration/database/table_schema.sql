-- Vercel Postgres Table Schema for read2print
-- Run the following SQL block in your Vercel database query console to set up the 'articles' table.

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100) DEFAULT '',
  tags TEXT DEFAULT '', -- comma-separated list of tags
  writer_id VARCHAR(50) DEFAULT 'w-admin',
  author VARCHAR(100) NOT NULL, -- writerName
  writer_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  status VARCHAR(20) DEFAULT 'published',
  coins INT DEFAULT 0, -- requiredCoins
  reads INT DEFAULT 0,
  word_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index the created_at field for fast retrieval of newer articles
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
