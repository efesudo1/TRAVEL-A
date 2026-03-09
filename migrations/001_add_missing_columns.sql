-- ============================================
-- MIGRATION 001: Add missing columns
-- Non-destructive: only adds new nullable columns
-- ============================================

-- Bookings: add passenger_email and passenger_surname
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_surname TEXT;

-- Snack Inventory: add updated_at timestamp
ALTER TABLE snack_inventory ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
