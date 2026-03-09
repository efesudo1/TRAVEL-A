// ============================================
// DIGIBUS - TypeScript Type Definitions
// ============================================

export type UserRole = 'owner' | 'admin' | 'assistant' | 'passenger';
export type TripStatus = 'scheduled' | 'on_time' | 'delayed' | 'completed';
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  slug: string;
  theme_colors: {
    primary: string;
    secondary: string;
  };
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  company_id: string | null;
  avatar_url: string | null;
  username: string | null;
  password_hash: string | null;
  created_at: string;
}

export interface Bus {
  id: string;
  company_id: string;
  plate_number: string;
  capacity: number;
  model: string | null;
  is_active: boolean;
  current_location: {
    lng: number;
    lat: number;
  };
  created_at: string;
}

export interface Trip {
  id: string;
  bus_id: string;
  company_id: string;
  route_name: string;
  route_json: Array<{ lng: number; lat: number }>;
  departure_time: string;
  estimated_arrival_time: string | null;
  actual_arrival_time: string | null;
  status: TripStatus;
  assistant_id: string | null;
  travel_number: string | null;
  created_at: string;
  // Joined data
  bus?: Bus;
  stops?: Stop[];
  company?: Company;
  assistant?: User;
  bookings_count?: number;
}

export interface Stop {
  id: string;
  trip_id: string;
  location_name: string;
  coordinates: {
    lng: number;
    lat: number;
  };
  planned_arrival: string;
  actual_arrival: string | null;
  duration_minutes: number;
  stop_order: number;
  created_at: string;
}

export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string | null;
  pnr_code: string;
  seat_number: number | null;
  passenger_name: string | null;
  passenger_surname: string | null;
  passenger_phone: string | null;
  passenger_email: string | null;
  status: BookingStatus;
  created_at: string;
  // Joined data
  trip?: Trip;
}

export interface LoyaltyPoints {
  id: string;
  passenger_id: string;
  company_id: string;
  points_count: number;
  total_trips: number;
  created_at: string;
  company?: Company;
}

// PNR Tracking Response (Guest-safe, no personal data)
export interface PNRTrackingData {
  pnr_code: string;
  seat_number: number | null;
  status: BookingStatus;
  trip: {
    id: string;
    route_name: string;
    route_json: Array<{ lng: number; lat: number }>;
    departure_time: string;
    estimated_arrival_time: string | null;
    status: TripStatus;
    bus: {
      plate_number: string;
      model: string | null;
      current_location: { lng: number; lat: number };
    };
    stops: Stop[];
    company: {
      name: string;
      logo_url: string | null;
      theme_colors: { primary: string; secondary: string };
    };
  };
}

// Dashboard Analytics Types
export interface DashboardStats {
  activeBuses: number;
  currentPassengers: number;
  todayTrips: number;
  averageDelay: number;
}

export interface PassengerVolumeData {
  date: string;
  passengers: number;
  trips: number;
}

// ============================================
// MARKET / SNACK TYPES
// ============================================

export interface SnackProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: 'atistirmalik' | 'icecek';
  stock: number; // runtime stock managed by steward
}

export interface CartItem {
  product: SnackProduct;
  quantity: number;
}

export interface SnackOrder {
  id: string;
  trip_id: string;
  product_id: string;
  seat_number: number | null;
  quantity: number;
  total_price: number;
  status: 'pending' | 'preparing' | 'delivered';
  created_at: string;
  product?: SnackProduct;
}

// ============================================
// MUAVIN ACCOUNT
// ============================================

export interface MuavinAccount {
  id: string;
  fullName: string;
  username: string;
  password: string;
  companyId: string;
  companyName: string;
  createdAt: string;
}

// ============================================
// SALE RECORD
// ============================================

export interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  companyId: string;
  date: string;
}

// ============================================
// PASSENGER ACCOUNT (self-registration)
// ============================================

export interface PassengerAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  createdAt: string;
}

// ============================================
// ADMIN ACCOUNT (company-specific)
// ============================================

export interface AdminAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  companyId: string;
  companyName: string;
  createdAt: string;
}

// ============================================
// LOYALTY RECORD (passenger × company)
// ============================================

export interface LoyaltyRecord {
  id: string;
  passengerEmail: string;
  passengerName: string;
  companyId: string;
  companyName: string;
  pointsCount: number;
  totalTrips: number;
}
