-- ============================================
-- DIGIBUS - Standalone Database Schema
-- (Supabase auth.users bağımlılığı kaldırıldı)
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

-- Users (standalone — no auth.users FK)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  travel_number TEXT,
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
  passenger_surname TEXT,
  passenger_phone TEXT,
  passenger_email TEXT,
  status booking_status DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loyalty Points
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  points_count INTEGER DEFAULT 0 CHECK (points_count >= 0 AND points_count <= 7),
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(passenger_id, company_id)
);

-- ============================================
-- SNACK / MARKET TABLES
-- ============================================

-- Snack Products (Atıştırmalık Ürünleri)
CREATE TABLE snack_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'atistirmalik',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Snack Inventory (Muavin Stok Yönetimi)
CREATE TABLE snack_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES snack_products(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  stock_count INTEGER DEFAULT 0 CHECK (stock_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, trip_id)
);

-- Snack Orders (Yolcu Siparişleri)
CREATE TABLE snack_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES snack_products(id) ON DELETE CASCADE,
  seat_number INTEGER,
  quantity INTEGER DEFAULT 1,
  total_price DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX idx_snack_inventory_trip ON snack_inventory(trip_id);
CREATE INDEX idx_snack_orders_trip ON snack_orders(trip_id);

-- ============================================
-- FUNCTIONS
-- ============================================

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
