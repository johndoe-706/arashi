CREATE TABLE IF NOT EXISTS accounts (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(5, 2) DEFAULT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'mobile_legend',
  skins INT NOT NULL DEFAULT 0,
  collector_level VARCHAR(64) DEFAULT NULL,
  images JSON NOT NULL,
  is_sold TINYINT(1) NOT NULL DEFAULT 0,
  sold_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ads (
  id CHAR(36) PRIMARY KEY,
  image_url TEXT NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  link TEXT DEFAULT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rank_boost (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX accounts_created_at_idx ON accounts (created_at);
CREATE INDEX accounts_collector_level_idx ON accounts (collector_level);
CREATE INDEX accounts_is_sold_idx ON accounts (is_sold);
CREATE INDEX ads_order_index_idx ON ads (order_index);
CREATE INDEX ads_is_active_idx ON ads (is_active);
