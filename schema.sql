DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS enterprise_auth;
DROP TABLE IF EXISTS transactions;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  balance INTEGER DEFAULT 0, -- Storing in cents (fen) to avoid float issues, or just standard unit. Let's assume CNY unit for simplicity or handling in code. REQU mentions 200 Yuan.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enterprise_auth (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  credit_code TEXT NOT NULL, -- Unified Social Credit Code
  license_image_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Positive for grant/deposit, Negative for usage
  type TEXT NOT NULL, -- 'trial_grant', 'usage', 'payment'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
