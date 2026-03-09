// ============================================
// DEMO DATA - Used when Supabase is not connected
// Provides realistic Turkish bus route data
// ============================================

import type { Trip, Stop, Booking, Bus, Company, MuavinAccount, AdminAccount, PassengerAccount, LoyaltyRecord } from '@/lib/types';

const now = new Date();
const hour = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();

export const demoCompanies: Company[] = [
    {
        id: 'c1',
        name: 'Metro Turizm',
        logo_url: null,
        slug: 'metro-turizm',
        theme_colors: { primary: '#FF6B35', secondary: '#0A1628' },
        created_at: now.toISOString(),
    },
    {
        id: 'c2',
        name: 'Kamil Koç',
        logo_url: null,
        slug: 'kamil-koc',
        theme_colors: { primary: '#E31E24', secondary: '#1A1A2E' },
        created_at: now.toISOString(),
    },
];

export const demoBuses: Bus[] = [
    { id: 'b1', company_id: 'c1', plate_number: '34 MT 2024', capacity: 45, model: 'Mercedes Travego', is_active: true, current_location: { lng: 30.2, lat: 40.5 }, created_at: now.toISOString() },
    { id: 'b2', company_id: 'c1', plate_number: '34 MT 2025', capacity: 50, model: 'MAN Lions Coach', is_active: true, current_location: { lng: 32.0, lat: 39.9 }, created_at: now.toISOString() },
    { id: 'b3', company_id: 'c2', plate_number: '06 KK 1001', capacity: 45, model: 'Neoplan Tourliner', is_active: true, current_location: { lng: 29.5, lat: 40.3 }, created_at: now.toISOString() },
    { id: 'b4', company_id: 'c2', plate_number: '06 KK 1002', capacity: 40, model: 'Setra S 517 HD', is_active: false, current_location: { lng: 31.0, lat: 38.5 }, created_at: now.toISOString() },
];

export const demoTrips: Trip[] = [
    {
        id: 't1', bus_id: 'b1', company_id: 'c1',
        route_name: 'İstanbul → Ankara',
        route_json: [
            { lng: 29.0175, lat: 41.1055 }, { lng: 29.5, lat: 40.8 },
            { lng: 30.2, lat: 40.5 }, { lng: 31.0, lat: 40.2 },
            { lng: 31.8, lat: 40.0 }, { lng: 32.85, lat: 39.92 },
        ],
        departure_time: hour(-1), estimated_arrival_time: hour(4),
        actual_arrival_time: null, status: 'on_time', assistant_id: null, travel_number: 'MT-20260308-0900', created_at: now.toISOString(),
    },
    {
        id: 't2', bus_id: 'b2', company_id: 'c1',
        route_name: 'Ankara → İstanbul',
        route_json: [
            { lng: 32.85, lat: 39.92 }, { lng: 31.8, lat: 40.0 },
            { lng: 31.0, lat: 40.2 }, { lng: 30.2, lat: 40.5 },
            { lng: 29.5, lat: 40.8 }, { lng: 29.0175, lat: 41.1055 },
        ],
        departure_time: hour(1), estimated_arrival_time: hour(6),
        actual_arrival_time: null, status: 'scheduled', assistant_id: null, travel_number: 'MT-20260308-1100', created_at: now.toISOString(),
    },
    {
        id: 't3', bus_id: 'b3', company_id: 'c2',
        route_name: 'İstanbul → İzmir',
        route_json: [
            { lng: 29.0175, lat: 41.1055 }, { lng: 29.0, lat: 40.2 },
            { lng: 28.5, lat: 39.5 }, { lng: 27.8, lat: 38.9 },
            { lng: 27.14, lat: 38.42 },
        ],
        departure_time: hour(-2), estimated_arrival_time: hour(4),
        actual_arrival_time: null, status: 'delayed', assistant_id: null, travel_number: 'KK-20260308-0800', created_at: now.toISOString(),
    },
    {
        id: 't4', bus_id: 'b4', company_id: 'c2',
        route_name: 'Ankara → Antalya',
        route_json: [
            { lng: 32.85, lat: 39.92 }, { lng: 32.0, lat: 38.5 },
            { lng: 31.0, lat: 37.8 }, { lng: 30.71, lat: 36.89 },
        ],
        departure_time: hour(-3), estimated_arrival_time: hour(4),
        actual_arrival_time: null, status: 'delayed', assistant_id: null, travel_number: 'KK-20260308-0700', created_at: now.toISOString(),
    },
    {
        id: 't5', bus_id: 'b1', company_id: 'c1',
        route_name: 'İstanbul → Bursa',
        route_json: [
            { lng: 29.0175, lat: 41.1055 }, { lng: 29.3, lat: 40.6 },
            { lng: 29.0, lat: 40.2 },
        ],
        departure_time: hour(3), estimated_arrival_time: hour(5.5),
        actual_arrival_time: null, status: 'scheduled', assistant_id: null, travel_number: 'MT-20260308-1300', created_at: now.toISOString(),
    },
    {
        id: 't6', bus_id: 'b3', company_id: 'c2',
        route_name: 'Bursa → İstanbul',
        route_json: [
            { lng: 29.0, lat: 40.2 }, { lng: 29.3, lat: 40.6 },
            { lng: 29.0175, lat: 41.1055 },
        ],
        departure_time: hour(-4), estimated_arrival_time: hour(-1),
        actual_arrival_time: hour(-1), status: 'completed', assistant_id: null, travel_number: 'KK-20260308-0600', created_at: now.toISOString(),
    },
];

export const demoStops: Record<string, Stop[]> = {
    t1: [
        { id: 's1', trip_id: 't1', location_name: 'İstanbul Otogar', coordinates: { lng: 29.0175, lat: 41.1055 }, planned_arrival: hour(-1), actual_arrival: hour(-1), duration_minutes: 15, stop_order: 1, created_at: now.toISOString() },
        { id: 's2', trip_id: 't1', location_name: 'Bolu Dağı Dinlenme', coordinates: { lng: 31.0, lat: 40.7 }, planned_arrival: hour(1), actual_arrival: null, duration_minutes: 20, stop_order: 2, created_at: now.toISOString() },
        { id: 's3', trip_id: 't1', location_name: 'Ankara Giriş', coordinates: { lng: 32.2, lat: 39.95 }, planned_arrival: hour(3), actual_arrival: null, duration_minutes: 0, stop_order: 3, created_at: now.toISOString() },
        { id: 's4', trip_id: 't1', location_name: 'Ankara AŞTİ', coordinates: { lng: 32.85, lat: 39.92 }, planned_arrival: hour(4), actual_arrival: null, duration_minutes: 0, stop_order: 4, created_at: now.toISOString() },
    ],
    t2: [
        { id: 's5', trip_id: 't2', location_name: 'Ankara AŞTİ', coordinates: { lng: 32.85, lat: 39.92 }, planned_arrival: hour(1), actual_arrival: null, duration_minutes: 15, stop_order: 1, created_at: now.toISOString() },
        { id: 's6', trip_id: 't2', location_name: 'Bolu Dinlenme', coordinates: { lng: 31.0, lat: 40.7 }, planned_arrival: hour(3), actual_arrival: null, duration_minutes: 20, stop_order: 2, created_at: now.toISOString() },
        { id: 's7', trip_id: 't2', location_name: 'İstanbul Otogar', coordinates: { lng: 29.0175, lat: 41.1055 }, planned_arrival: hour(6), actual_arrival: null, duration_minutes: 0, stop_order: 3, created_at: now.toISOString() },
    ],
    t3: [
        { id: 's8', trip_id: 't3', location_name: 'İstanbul Otogar', coordinates: { lng: 29.0175, lat: 41.1055 }, planned_arrival: hour(-2), actual_arrival: hour(-2), duration_minutes: 15, stop_order: 1, created_at: now.toISOString() },
        { id: 's9', trip_id: 't3', location_name: 'Bursa Terminali', coordinates: { lng: 29.0, lat: 40.2 }, planned_arrival: hour(0), actual_arrival: hour(0.4), duration_minutes: 20, stop_order: 2, created_at: now.toISOString() },
        { id: 's10', trip_id: 't3', location_name: 'Balıkesir', coordinates: { lng: 27.8, lat: 39.6 }, planned_arrival: hour(2), actual_arrival: null, duration_minutes: 15, stop_order: 3, created_at: now.toISOString() },
        { id: 's11', trip_id: 't3', location_name: 'İzmir Otogar', coordinates: { lng: 27.14, lat: 38.42 }, planned_arrival: hour(4), actual_arrival: null, duration_minutes: 0, stop_order: 4, created_at: now.toISOString() },
    ],
    t4: [
        { id: 's12', trip_id: 't4', location_name: 'Ankara AŞTİ', coordinates: { lng: 32.85, lat: 39.92 }, planned_arrival: hour(-3), actual_arrival: hour(-3), duration_minutes: 15, stop_order: 1, created_at: now.toISOString() },
        { id: 's13', trip_id: 't4', location_name: 'Konya', coordinates: { lng: 32.0, lat: 37.87 }, planned_arrival: hour(-1), actual_arrival: hour(-0.5), duration_minutes: 20, stop_order: 2, created_at: now.toISOString() },
        { id: 's14', trip_id: 't4', location_name: 'Isparta', coordinates: { lng: 30.29, lat: 37.76 }, planned_arrival: hour(1), actual_arrival: null, duration_minutes: 10, stop_order: 3, created_at: now.toISOString() },
        { id: 's15', trip_id: 't4', location_name: 'Antalya Otogar', coordinates: { lng: 30.71, lat: 36.89 }, planned_arrival: hour(4), actual_arrival: null, duration_minutes: 0, stop_order: 4, created_at: now.toISOString() },
    ],
    t5: [
        { id: 's16', trip_id: 't5', location_name: 'İstanbul Otogar', coordinates: { lng: 29.0175, lat: 41.1055 }, planned_arrival: hour(3), actual_arrival: null, duration_minutes: 15, stop_order: 1, created_at: now.toISOString() },
        { id: 's17', trip_id: 't5', location_name: 'Yalova', coordinates: { lng: 29.27, lat: 40.65 }, planned_arrival: hour(4), actual_arrival: null, duration_minutes: 10, stop_order: 2, created_at: now.toISOString() },
        { id: 's18', trip_id: 't5', location_name: 'Bursa Terminal', coordinates: { lng: 29.0, lat: 40.2 }, planned_arrival: hour(5.5), actual_arrival: null, duration_minutes: 0, stop_order: 3, created_at: now.toISOString() },
    ],
    t6: [
        { id: 's19', trip_id: 't6', location_name: 'Bursa Terminal', coordinates: { lng: 29.0, lat: 40.2 }, planned_arrival: hour(-4), actual_arrival: hour(-4), duration_minutes: 15, stop_order: 1, created_at: now.toISOString() },
        { id: 's20', trip_id: 't6', location_name: 'Yalova', coordinates: { lng: 29.27, lat: 40.65 }, planned_arrival: hour(-3), actual_arrival: hour(-3), duration_minutes: 10, stop_order: 2, created_at: now.toISOString() },
        { id: 's21', trip_id: 't6', location_name: 'İstanbul Otogar', coordinates: { lng: 29.0175, lat: 41.1055 }, planned_arrival: hour(-1), actual_arrival: hour(-1), duration_minutes: 0, stop_order: 3, created_at: now.toISOString() },
    ],
};

export const demoBookings: Booking[] = [
    { id: 'bk1', trip_id: 't1', passenger_id: null, pnr_code: 'DEMO01', seat_number: 12, passenger_name: 'Ahmet', passenger_surname: 'Yılmaz', passenger_phone: '+905551234567', passenger_email: 'ahmet@email.com', status: 'confirmed', created_at: now.toISOString() },
    { id: 'bk2', trip_id: 't1', passenger_id: null, pnr_code: 'DEMO02', seat_number: 15, passenger_name: 'Zeynep', passenger_surname: 'Kaya', passenger_phone: '+905559876543', passenger_email: 'zeynep@email.com', status: 'confirmed', created_at: now.toISOString() },
    { id: 'bk3', trip_id: 't2', passenger_id: null, pnr_code: 'DEMO03', seat_number: 8, passenger_name: 'Fatma', passenger_surname: 'Çelik', passenger_phone: null, passenger_email: 'fatma@email.com', status: 'confirmed', created_at: now.toISOString() },
    { id: 'bk4', trip_id: 't3', passenger_id: null, pnr_code: 'DEMO04', seat_number: 5, passenger_name: 'Ayşe', passenger_surname: 'Arslan', passenger_phone: null, passenger_email: null, status: 'confirmed', created_at: now.toISOString() },
    { id: 'bk5', trip_id: 't4', passenger_id: null, pnr_code: 'DEMO05', seat_number: 3, passenger_name: 'Elif', passenger_surname: 'Şahin', passenger_phone: null, passenger_email: null, status: 'confirmed', created_at: now.toISOString() },
    { id: 'bk6', trip_id: 't5', passenger_id: null, pnr_code: 'DEMO06', seat_number: 10, passenger_name: 'Selin', passenger_surname: 'Güneş', passenger_phone: null, passenger_email: null, status: 'confirmed', created_at: now.toISOString() },
    { id: 'bk7', trip_id: 't6', passenger_id: null, pnr_code: 'DEMO07', seat_number: 7, passenger_name: 'Yasemin', passenger_surname: 'Ak', passenger_phone: null, passenger_email: null, status: 'completed', created_at: now.toISOString() },
];

// Helper to find demo data by PNR
export function findBookingByPNR(pnr: string) {
    const booking = demoBookings.find(b => b.pnr_code.toUpperCase() === pnr.toUpperCase());
    if (!booking) return null;

    const trip = demoTrips.find(t => t.id === booking.trip_id);
    if (!trip) return null;

    const stops = demoStops[trip.id] || [];
    const bus = demoBuses.find(b => b.id === trip.bus_id);
    const company = demoCompanies.find(c => c.id === trip.company_id);

    return {
        booking,
        trip: { ...trip, stops, bus, company },
    };
}

// Get all trips with their stops for admin dashboard
export function getAllTripsWithDetails() {
    return demoTrips.map(trip => ({
        ...trip,
        stops: demoStops[trip.id] || [],
        bus: demoBuses.find(b => b.id === trip.bus_id),
        company: demoCompanies.find(c => c.id === trip.company_id),
        bookings_count: demoBookings.filter(b => b.trip_id === trip.id).length,
    }));
}

// Dashboard stats
export function getDashboardStats() {
    const activeTrips = demoTrips.filter(t => t.status !== 'completed' && t.status !== 'scheduled');
    return {
        activeBuses: demoBuses.filter(b => b.is_active).length,
        currentPassengers: demoBookings.filter(b => b.status === 'confirmed').length,
        todayTrips: demoTrips.length,
        averageDelay: 15,
    };
}

// Demo Muavin accounts
export const demoMuavinler: MuavinAccount[] = [
    { id: 'm1', fullName: 'Hasan Demirci', username: 'metro-turizm-001', password: 'DG4821', companyId: 'c1', companyName: 'Metro Turizm', createdAt: now.toISOString() },
    { id: 'm2', fullName: 'Mehmet Kara', username: 'metro-turizm-002', password: 'DG7392', companyId: 'c1', companyName: 'Metro Turizm', createdAt: now.toISOString() },
    { id: 'm3', fullName: 'Ali Yıldız', username: 'kamil-koc-001', password: 'DG5614', companyId: 'c2', companyName: 'Kamil Koç', createdAt: now.toISOString() },
];

// ============================================
// OWNER (God Mode) — Tek hesap
// ============================================
export const demoOwner = {
    id: 'owner1',
    email: 'owner@digibus.com',
    password: 'digibus2026',
    fullName: 'DiGibus Yönetici',
};

// ============================================
// ADMIN ACCOUNTS — Her şirket için bir admin
// ============================================
export const demoAdmins: AdminAccount[] = [
    { id: 'a1', email: 'admin@metro.com', password: 'metro123', fullName: 'Can Demir', companyId: 'c1', companyName: 'Metro Turizm', createdAt: now.toISOString() },
    { id: 'a2', email: 'admin@kamilkoc.com', password: 'kamil123', fullName: 'Berk Aydın', companyId: 'c2', companyName: 'Kamil Koç', createdAt: now.toISOString() },
];

// ============================================
// PASSENGER ACCOUNTS — E-posta/şifre ile kayıt
// ============================================
export const demoPassengers: PassengerAccount[] = [
    { id: 'p1', email: 'ahmet@email.com', password: 'yolcu123', fullName: 'Ahmet Yılmaz', createdAt: now.toISOString() },
    { id: 'p2', email: 'zeynep@email.com', password: 'yolcu123', fullName: 'Zeynep Kaya', createdAt: now.toISOString() },
    { id: 'p3', email: 'fatma@email.com', password: 'yolcu123', fullName: 'Fatma Çelik', createdAt: now.toISOString() },
];

// ============================================
// LOYALTY RECORDS — Yolcu × Şirket
// ============================================
export const demoLoyalty: LoyaltyRecord[] = [
    // Ahmet: Metro 5 sefer, Kamil Koç 1 sefer
    { id: 'l1', passengerEmail: 'ahmet@email.com', passengerName: 'Ahmet Yılmaz', companyId: 'c1', companyName: 'Metro Turizm', pointsCount: 5, totalTrips: 5 },
    { id: 'l2', passengerEmail: 'ahmet@email.com', passengerName: 'Ahmet Yılmaz', companyId: 'c2', companyName: 'Kamil Koç', pointsCount: 1, totalTrips: 1 },
    // Zeynep: Metro 3 sefer
    { id: 'l3', passengerEmail: 'zeynep@email.com', passengerName: 'Zeynep Kaya', companyId: 'c1', companyName: 'Metro Turizm', pointsCount: 3, totalTrips: 3 },
    // Fatma: Metro 2 sefer, Kamil Koç 4 sefer
    { id: 'l4', passengerEmail: 'fatma@email.com', passengerName: 'Fatma Çelik', companyId: 'c1', companyName: 'Metro Turizm', pointsCount: 2, totalTrips: 2 },
    { id: 'l5', passengerEmail: 'fatma@email.com', passengerName: 'Fatma Çelik', companyId: 'c2', companyName: 'Kamil Koç', pointsCount: 4, totalTrips: 4 },
];

// ============================================
// COMPANY-SCOPED HELPERS
// ============================================

// Get trips filtered by company (null = all)
export function getTripsForCompany(companyId: string | null) {
    const trips = companyId ? demoTrips.filter(t => t.company_id === companyId) : demoTrips;
    return trips.map(trip => ({
        ...trip,
        stops: demoStops[trip.id] || [],
        bus: demoBuses.find(b => b.id === trip.bus_id),
        company: demoCompanies.find(c => c.id === trip.company_id),
        bookings_count: demoBookings.filter(b => b.trip_id === trip.id).length,
    }));
}

// Get stats filtered by company
export function getStatsForCompany(companyId: string | null) {
    const trips = companyId ? demoTrips.filter(t => t.company_id === companyId) : demoTrips;
    const buses = companyId ? demoBuses.filter(b => b.company_id === companyId) : demoBuses;
    const tripIds = trips.map(t => t.id);
    const bookings = demoBookings.filter(b => tripIds.includes(b.trip_id));
    return {
        activeBuses: buses.filter(b => b.is_active).length,
        currentPassengers: bookings.filter(b => b.status === 'confirmed').length,
        todayTrips: trips.length,
        averageDelay: 15,
    };
}

// Get bookings filtered by company
export function getBookingsForCompany(companyId: string | null) {
    if (!companyId) return demoBookings;
    const tripIds = demoTrips.filter(t => t.company_id === companyId).map(t => t.id);
    return demoBookings.filter(b => tripIds.includes(b.trip_id));
}

// Get muavinler filtered by company
export function getMuavinlerForCompany(companyId: string | null) {
    if (!companyId) return demoMuavinler;
    return demoMuavinler.filter(m => m.companyId === companyId);
}

// Get loyalty records filtered by company
export function getLoyaltyForCompany(companyId: string | null) {
    if (!companyId) return demoLoyalty;
    return demoLoyalty.filter(l => l.companyId === companyId);
}

// Get loyalty records for a passenger email
export function getLoyaltyForPassenger(email: string) {
    return demoLoyalty.filter(l => l.passengerEmail === email);
}

// Get bookings for a passenger email
export function getBookingsForPassenger(email: string) {
    return demoBookings
        .filter(b => b.passenger_email === email)
        .map(b => {
            const trip = demoTrips.find(t => t.id === b.trip_id);
            const company = trip ? demoCompanies.find(c => c.id === trip.company_id) : null;
            return { ...b, trip: trip ? { ...trip, company } : undefined };
        });
}
