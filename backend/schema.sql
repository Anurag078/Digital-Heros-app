CREATE DATABASE IF NOT EXISTS digital_heroes;
USE digital_heroes;

CREATE TABLE IF NOT EXISTS charities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  image_url TEXT NULL,
  contribution_min DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'subscriber') NOT NULL DEFAULT 'subscriber',
  subscription_status TINYINT(1) NOT NULL DEFAULT 0,
  plan ENUM('monthly', 'yearly') NULL,
  expiry_date DATETIME NULL,
  charity_id INT NULL,
  charity_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_charity FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  score INT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_scores_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_scores_user_date UNIQUE (user_id, date),
  CONSTRAINT chk_score_range CHECK (score >= 1 AND score <= 45)
);

CREATE TABLE IF NOT EXISTS draws (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numbers JSON NOT NULL,
  status ENUM('simulated', 'published') NOT NULL DEFAULT 'simulated',
  total_pool DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  pool_5 DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  pool_4 DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  pool_3 DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  rollover_from DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS winnings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  draw_id INT NOT NULL,
  match_type INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status ENUM('unclaimed', 'pending', 'paid', 'rejected') NOT NULL DEFAULT 'unclaimed',
  proof_image TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_winnings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_winnings_draw FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE
);

INSERT INTO charities (name, description, contribution_min)
SELECT 'Golf for Good', 'Helping kids play golf.', 10.00
WHERE NOT EXISTS (SELECT 1 FROM charities WHERE name = 'Golf for Good');

INSERT INTO charities (name, description, contribution_min)
SELECT 'Green Heroes', 'Environmental protection.', 10.00
WHERE NOT EXISTS (SELECT 1 FROM charities WHERE name = 'Green Heroes');
