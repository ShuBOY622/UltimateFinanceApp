-- Investment table creation script for FinanceApp
-- Run this if the table is not automatically created

USE financeDb;

CREATE TABLE IF NOT EXISTS investments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    quantity DECIMAL(15,2) NOT NULL,
    purchase_price DECIMAL(15,2) NOT NULL,
    current_price DECIMAL(15,2),
    purchase_date DATETIME NOT NULL,
    platform VARCHAR(100),
    sector VARCHAR(100),
    notes VARCHAR(500),
    user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Price tracking fields for live updates
    last_price_update DATETIME NULL,
    price_source VARCHAR(50) NULL,
    live_price_enabled BOOLEAN DEFAULT true,
    last_price_error VARCHAR(100) NULL,
    
    CONSTRAINT fk_investment_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Add missing columns to existing table (safe to run multiple times)
ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS last_price_update DATETIME NULL,
ADD COLUMN IF NOT EXISTS price_source VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS live_price_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_price_error VARCHAR(100) NULL;

-- Update existing records to have default values
UPDATE investments 
SET 
    price_source = 'MANUAL',
    live_price_enabled = true,
    last_price_error = NULL
WHERE price_source IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_investment_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_symbol ON investments(symbol);
CREATE INDEX IF NOT EXISTS idx_investment_type ON investments(type);
CREATE INDEX IF NOT EXISTS idx_investment_price_source ON investments(price_source);

-- Verify table creation
DESCRIBE investments;