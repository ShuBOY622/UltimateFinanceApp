-- Create database (run this first if database doesn't exist)
CREATE DATABASE IF NOT EXISTS financeDb;
USE financeDb;

-- The tables will be automatically created by Hibernate with ddl-auto: update
-- But here's the schema for reference:

-- Users table
-- CREATE TABLE users (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     first_name VARCHAR(50) NOT NULL,
--     last_name VARCHAR(50) NOT NULL,
--     email VARCHAR(50) UNIQUE NOT NULL,
--     password VARCHAR(120) NOT NULL,
--     monthly_budget DECIMAL(15,2) DEFAULT 0.00,
--     daily_budget DECIMAL(15,2) DEFAULT 0.00,
--     reward_points DECIMAL(15,2) DEFAULT 0.00,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- Transactions table
-- CREATE TABLE transactions (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     amount DECIMAL(15,2) NOT NULL,
--     description VARCHAR(255) NOT NULL,
--     type ENUM('INCOME', 'EXPENSE') NOT NULL,
--     category VARCHAR(50) NOT NULL,
--     transaction_date TIMESTAMP NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     user_id BIGINT NOT NULL,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- Goals table
-- CREATE TABLE goals (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     description TEXT,
--     target_amount DECIMAL(15,2) NOT NULL,
--     current_amount DECIMAL(15,2) DEFAULT 0.00,
--     target_date DATE NOT NULL,
--     status ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED') DEFAULT 'ACTIVE',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     user_id BIGINT NOT NULL,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- Indexes for better performance
-- CREATE INDEX idx_transactions_user_id ON transactions(user_id);
-- CREATE INDEX idx_transactions_date ON transactions(transaction_date);
-- CREATE INDEX idx_transactions_type ON transactions(type);
-- CREATE INDEX idx_goals_user_id ON goals(user_id);
-- CREATE INDEX idx_goals_status ON goals(status);