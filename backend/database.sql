-- database.sql
-- Full Database Setup Script for ProfitPros

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Main loss calculation table
CREATE TABLE IF NOT EXISTS loss_calculation (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (cost_per_unit >= 0),
    amount_stocked INTEGER NOT NULL DEFAULT 0 CHECK (amount_stocked >= 0),
    amount_sold INTEGER NOT NULL DEFAULT 0 CHECK (amount_sold >= 0),
    amount_stolen INTEGER NOT NULL DEFAULT 0 CHECK (amount_stolen >= 0),
    
    -- Inventory Metrics
    total_sales DECIMAL(10,2) GENERATED ALWAYS AS (price * amount_sold) STORED,
    stolen_loss DECIMAL(10,2) GENERATED ALWAYS AS (price * amount_stolen) STORED,
    unsold_loss DECIMAL(10,2) GENERATED ALWAYS AS (price * (amount_stocked - amount_sold - amount_stolen)) STORED,
    total_loss DECIMAL(10,2) GENERATED ALWAYS AS (price * (amount_stocked - amount_sold)) STORED,
    loss_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN amount_stocked > 0 
            THEN ((amount_stocked - amount_sold)::DECIMAL / amount_stocked) * 100
            ELSE 0
        END
    ) STORED,
    
    -- Financial Metrics
    initial_investment DECIMAL(10,2) GENERATED ALWAYS AS (cost_per_unit * amount_stocked) STORED,
    cost_of_goods_sold DECIMAL(10,2) GENERATED ALWAYS AS (cost_per_unit * amount_sold) STORED,
    gross_profit DECIMAL(10,2) GENERATED ALWAYS AS (
        (price * amount_sold) - (cost_per_unit * amount_sold)
    ) STORED,
    gross_profit_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN (price * amount_sold) > 0 
            THEN ((price - cost_per_unit) / price) * 100
            ELSE 0
        END
    ) STORED,
    profit DECIMAL(10,2) GENERATED ALWAYS AS (
        (price * amount_sold) - (cost_per_unit * amount_stocked)
    ) STORED,
    profit_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN (price * amount_sold) > 0 
            THEN (((price * amount_sold) - (cost_per_unit * amount_stocked)) / (price * amount_sold)) * 100
            ELSE 0
        END
    ) STORED,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint
    CONSTRAINT valid_inventory CHECK (amount_sold + amount_stolen <= amount_stocked)
);

-- ============================================
-- 2. INDEXES
-- ============================================
CREATE INDEX idx_loss_calculation_user_id ON loss_calculation(user_id);
CREATE INDEX idx_loss_calculation_product_name ON loss_calculation(product_name);
CREATE INDEX idx_loss_calculation_created_at ON loss_calculation(created_at DESC);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE loss_calculation ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_policy ON loss_calculation
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id', TRUE)::INTEGER);

CREATE POLICY insert_policy ON loss_calculation
    FOR INSERT
    WITH CHECK (user_id = current_setting('app.current_user_id', TRUE)::INTEGER);

CREATE POLICY update_policy ON loss_calculation
    FOR UPDATE
    USING (user_id = current_setting('app.current_user_id', TRUE)::INTEGER)
    WITH CHECK (user_id = current_setting('app.current_user_id', TRUE)::INTEGER);

CREATE POLICY delete_policy ON loss_calculation
    FOR DELETE
    USING (user_id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- 4. Helper Functions
CREATE OR REPLACE FUNCTION set_current_user(user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::TEXT, false);
END;
$$ LANGUAGE plpgsql;

-- 5. Timestamp Auto update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loss_calculation_updated_at 
    BEFORE UPDATE ON loss_calculation 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();