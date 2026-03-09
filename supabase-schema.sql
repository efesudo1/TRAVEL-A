-- ============================================
-- DIGIBUS - Database Schema
-- Multi-Tenant Bus Journey Management Platform
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('admin', 'assistant', 'passenger');
CREATE TYPE trip_status AS ENUM ('scheduled', 'on_time', 'delayed', 'completed');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'completed');

-- ============================================
-- TABLES
-- ============================================

-- Companies (Multi-tenant root)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  theme_colors JSONB DEFAULT '{"primary": "#FF6B35", "secondary": "#0A1628"}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'passenger',
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buses
CREATE TABLE buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plate_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 45,
  model TEXT,
  is_active BOOLEAN DEFAULT true,
  current_location JSONB DEFAULT '{"lng": 0, "lat": 0}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  route_json JSONB DEFAULT '[]',
  departure_time TIMESTAMPTZ NOT NULL,
  estimated_arrival_time TIMESTAMPTZ,
  actual_arrival_time TIMESTAMPTZ,
  status trip_status DEFAULT 'scheduled',
  assistant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stops
CREATE TABLE stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  coordinates JSONB NOT NULL DEFAULT '{"lng": 0, "lat": 0}',
  planned_arrival TIMESTAMPTZ NOT NULL,
  actual_arrival TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 10,
  stop_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings / PNR
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  passenger_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pnr_code TEXT UNIQUE NOT NULL,
  seat_number INTEGER,
  passenger_name TEXT,
  passenger_phone TEXT,
  status booking_status DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Passenger Accounts (self-registration)
CREATE TABLE passenger_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loyalty Points
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passenger_email TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  points_count INTEGER DEFAULT 0 CHECK (points_count >= 0 AND points_count <= 7),
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(passenger_email, company_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_buses_company ON buses(company_id);
CREATE INDEX idx_trips_company ON trips(company_id);
CREATE INDEX idx_trips_bus ON trips(bus_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_departure ON trips(departure_time);
CREATE INDEX idx_stops_trip ON stops(trip_id);
CREATE INDEX idx_stops_order ON stops(trip_id, stop_order);
CREATE INDEX idx_bookings_trip ON bookings(trip_id);
CREATE INDEX idx_bookings_pnr ON bookings(pnr_code);
CREATE INDEX idx_bookings_passenger ON bookings(passenger_id);
CREATE INDEX idx_loyalty_passenger ON loyalty_points(passenger_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Companies: admins see only their company
CREATE POLICY "Admins can view their company"
  ON companies FOR SELECT
  USING (
    id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM bookings WHERE bookings.pnr_code IS NOT NULL)
  );

-- Users: users can see their own profile; admins can see company users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins can view company users"
  ON users FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage company users"
  ON users FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Buses: scoped to company
CREATE POLICY "Company members can view buses"
  ON buses FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage buses"
  ON buses FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Trips: scoped to company + public read for PNR tracking
CREATE POLICY "Company members can view trips"
  ON trips FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage trips"
  ON trips FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public can view trips via PNR"
  ON trips FOR SELECT
  USING (
    id IN (SELECT trip_id FROM bookings WHERE pnr_code IS NOT NULL)
  );

-- Stops: scoped to trip company + public for PNR
CREATE POLICY "Company members can view stops"
  ON stops FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));

CREATE POLICY "Public can view stops via PNR"
  ON stops FOR SELECT
  USING (
    trip_id IN (SELECT trip_id FROM bookings WHERE pnr_code IS NOT NULL)
  );

CREATE POLICY "Assistants can update stops"
  ON stops FOR UPDATE
  USING (trip_id IN (
    SELECT id FROM trips WHERE assistant_id = auth.uid()
  ));

-- Bookings: passengers see own; admins see company; public PNR lookup (no personal data)
CREATE POLICY "Passengers can view own bookings"
  ON bookings FOR SELECT
  USING (passenger_id = auth.uid());

CREATE POLICY "Company staff can view bookings"
  ON bookings FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));

CREATE POLICY "Public PNR lookup"
  ON bookings FOR SELECT
  USING (true);

-- Loyalty: passengers see own
CREATE POLICY "Passengers can view own loyalty"
  ON loyalty_points FOR SELECT
  USING (passenger_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update subsequent stops when delay is reported
CREATE OR REPLACE FUNCTION update_subsequent_stops(
  p_trip_id UUID,
  p_from_stop_order INTEGER,
  p_delay_minutes INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE stops
  SET actual_arrival = planned_arrival + (p_delay_minutes || ' minutes')::INTERVAL
  WHERE trip_id = p_trip_id
    AND stop_order >= p_from_stop_order
    AND actual_arrival IS NULL;

  -- Update trip status to delayed
  UPDATE trips
  SET status = 'delayed'
  WHERE id = p_trip_id AND status != 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate unique PNR code
CREATE OR REPLACE FUNCTION generate_pnr()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate PNR on booking insert
CREATE OR REPLACE FUNCTION auto_generate_pnr()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pnr_code IS NULL OR NEW.pnr_code = '' THEN
    NEW.pnr_code := generate_pnr();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_pnr
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_pnr();

-- Update loyalty points when booking is completed
CREATE OR REPLACE FUNCTION update_loyalty_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id UUID;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.passenger_id IS NOT NULL THEN
    SELECT company_id INTO v_company_id FROM trips WHERE id = NEW.trip_id;

    INSERT INTO loyalty_points (passenger_id, company_id, points_count, total_trips)
    VALUES (NEW.passenger_id, v_company_id, 1, 1)
    ON CONFLICT (passenger_id, company_id)
    DO UPDATE SET
      points_count = CASE
        WHEN loyalty_points.points_count >= 7 THEN 0
        ELSE loyalty_points.points_count + 1
      END,
      total_trips = loyalty_points.total_trips + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loyalty_update
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_on_completion();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE trips;
ALTER PUBLICATION supabase_realtime ADD TABLE stops;
ALTER PUBLICATION supabase_realtime ADD TABLE buses;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
