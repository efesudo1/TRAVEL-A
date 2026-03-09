-- Add loyalty_points table
CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    points_count INTEGER DEFAULT 0,
    total_trips INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(passenger_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_passenger ON loyalty_points(passenger_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_company ON loyalty_points(company_id);
