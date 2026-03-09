'use server';

import { query } from '@/lib/db';
import { Company, AdminAccount } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getCompaniesAction() {
    try {
        const result = await query('SELECT * FROM companies ORDER BY created_at DESC');
        return { companies: result.rows as Company[] };
    } catch (error) {
        console.error('getCompaniesAction error:', error);
        return { error: 'Şirketler yüklenirken bir hata oluştu' };
    }
}

export async function getAdminsAction() {
    try {
        const result = await query("SELECT * FROM users WHERE role = 'admin'");
        return { admins: result.rows as any[] };
    } catch (error) {
        console.error('getAdminsAction error:', error);
        return { error: 'Adminler yüklenirken bir hata oluştu' };
    }
}

export async function createCompanyAction(data: {
    name: string;
    slug: string;
    theme_colors: { primary: string; secondary: string };
    admin: {
        email: string;
        password_hash: string;
        full_name: string;
    }
}) {
    try {
        // Start "transaction" (serial execution)
        // 1. Insert Company
        const companyResult = await query(
            'INSERT INTO companies (name, slug, theme_colors) VALUES ($1, $2, $3) RETURNING id',
            [data.name, data.slug, JSON.stringify(data.theme_colors)]
        );
        const companyId = companyResult.rows[0].id;

        // 2. Insert Admin User
        await query(
            'INSERT INTO users (email, password_hash, full_name, role, company_id) VALUES ($1, $2, $3, $4, $5)',
            [data.admin.email, data.admin.password_hash, data.admin.full_name, 'admin', companyId]
        );

        return { success: true, companyId };
    } catch (error: any) {
        console.error('createCompanyAction error:', error);
        if (error.code === '23505') {
            return { error: 'Bu şirket adı veya e-posta zaten kullanımda' };
        }
        return { error: 'Şirket oluşturulurken bir hata oluştu' };
    }
}

export async function getDashboardDataAction(companyId: string | null) {
    try {
        let tripsQuery = 'SELECT t.*, b.plate_number, b.model as bus_model, c.name as company_name FROM trips t LEFT JOIN buses b ON t.bus_id = b.id LEFT JOIN companies c ON t.company_id = c.id';
        let statsQuery = 'SELECT COUNT(*) as total_trips FROM trips';
        let params = [];

        if (companyId) {
            tripsQuery += ' WHERE t.company_id = $1';
            statsQuery += ' WHERE company_id = $1';
            params.push(companyId);
        }

        tripsQuery += ' ORDER BY departure_time DESC';

        const [tripsRes, statsRes] = await Promise.all([
            query(tripsQuery, params),
            query(statsQuery, params)
        ]);

        return {
            trips: tripsRes.rows,
            stats: {
                totalTrips: parseInt(statsRes.rows[0].total_trips) || 0,
                activeBuses: 0,
                passengersCount: 0
            }
        };
    } catch (error) {
        console.error('getDashboardDataAction error:', error);
        return { error: 'Dashboard verileri yüklenirken bir hata oluştu' };
    }
}

export async function getMuavinlerAction(companyId: string | null) {
    try {
        let q = "SELECT u.*, c.name as company_name FROM users u LEFT JOIN companies c ON u.company_id = c.id WHERE u.role = 'assistant'";
        let params = [];
        if (companyId) {
            q += " AND u.company_id = $1";
            params.push(companyId);
        }

        const result = await query(q, params);
        return { muavinler: result.rows };
    } catch (error) {
        console.error('getMuavinlerAction error:', error);
        return { error: 'Muavinler yüklenirken bir hata oluştu' };
    }
}

export async function createMuavinAction(data: {
    fullName: string;
    username: string;
    password_hash: string;
    companyId: string;
}) {
    try {
        const result = await query(
            'INSERT INTO users (full_name, username, password_hash, role, company_id, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [data.fullName, data.username, data.password_hash, 'assistant', data.companyId, `${data.username}@digibus.com`]
        );
        return { success: true, user: result.rows[0] };
    } catch (error: any) {
        console.error('createMuavinAction error:', error);
        if (error.code === '23505') {
            return { error: 'Bu kullanıcı adı zaten alınmış' };
        }
        return { error: 'Muavin oluşturulurken bir hata oluştu' };
    }
}

export async function deleteUserAction(userId: string) {
    try {
        await query('DELETE FROM users WHERE id = $1', [userId]);
        return { success: true };
    } catch (error) {
        console.error('deleteUserAction error:', error);
        return { error: 'Kullanıcı silinirken bir hata oluştu' };
    }
}

export async function getBookingsAction(companyId: string | null) {
    try {
        let q = `
            SELECT b.*, t.route_name, t.travel_number, c.name as company_name 
            FROM bookings b 
            JOIN trips t ON b.trip_id = t.id 
            JOIN companies c ON t.company_id = c.id
        `;
        let params = [];
        if (companyId) {
            q += " WHERE t.company_id = $1";
            params.push(companyId);
        }
        q += " ORDER BY b.created_at DESC";

        const result = await query(q, params);
        return { bookings: result.rows };
    } catch (error) {
        console.error('getBookingsAction error:', error);
        return { error: 'Yolcular yüklenirken bir hata oluştu' };
    }
}

export async function createBookingAction(data: any) {
    try {
        const result = await query(
            'INSERT INTO bookings (trip_id, passenger_name, passenger_phone, passenger_email, pnr_code, seat_number, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [data.trip_id, data.passenger_name, data.passenger_phone, data.passenger_email, data.pnr_code, data.seat_number, 'confirmed']
        );
        return { success: true, booking: result.rows[0] };
    } catch (error) {
        console.error('createBookingAction error:', error);
        return { error: 'Yolcu eklenirken bir hata oluştu' };
    }
}

export async function updateBookingAction(id: string, data: any) {
    try {
        await query(
            'UPDATE bookings SET passenger_name = $1, pnr_code = $2, seat_number = $3, passenger_phone = $4, passenger_email = $5 WHERE id = $6',
            [data.passenger_name, data.pnr_code, data.seat_number, data.passenger_phone, data.passenger_email, id]
        );
        return { success: true };
    } catch (error) {
        console.error('updateBookingAction error:', error);
        return { error: 'Yolcu güncellenirken bir hata oluştu' };
    }
}

export async function deleteBookingAction(id: string) {
    try {
        await query('DELETE FROM bookings WHERE id = $1', [id]);
        return { success: true };
    } catch (error) {
        console.error('deleteBookingAction error:', error);
        return { error: 'Yolcu silinirken bir hata oluştu' };
    }
}

export async function getTripsAction(companyId: string | null) {
    try {
        let q = `
            SELECT t.*, b.plate_number, b.model as bus_model, c.name as company_name 
            FROM trips t 
            LEFT JOIN buses b ON t.bus_id = b.id 
            JOIN companies c ON t.company_id = c.id
        `;
        let params = [];
        if (companyId) {
            q += ' WHERE t.company_id = $1';
            params.push(companyId);
        }
        q += ' ORDER BY t.departure_time DESC';
        const result = await query(q, params);
        return { trips: result.rows };
    } catch (error) {
        console.error('getTripsAction error:', error);
        return { error: 'Seferler yüklenirken bir hata oluştu' };
    }
}

export async function getSalesHistoryAction(companyId: string | null) {
    try {
        let q = `
            SELECT 
                so.id, 
                so.product_id as "productId", 
                sp.name as "productName", 
                so.quantity, 
                sp.price as "unitPrice", 
                so.total_price as "totalPrice", 
                t.company_id as "companyId", 
                so.created_at as "date"
            FROM snack_orders so
            JOIN snack_products sp ON so.product_id = sp.id
            JOIN trips t ON so.trip_id = t.id
        `;
        let params = [];
        if (companyId) {
            q += " WHERE t.company_id = $1";
            params.push(companyId);
        }
        q += " ORDER BY so.created_at DESC";

        const result = await query(q, params);
        return { sales: result.rows };
    } catch (error) {
        console.error('getSalesHistoryAction error:', error);
        return { error: 'Satış geçmişi yüklenirken bir hata oluştu' };
    }
}

export async function getBusesAction(companyId: string | null) {
    try {
        let q = 'SELECT * FROM buses';
        let params = [];
        if (companyId) {
            q += ' WHERE company_id = $1';
            params.push(companyId);
        }
        q += ' ORDER BY created_at DESC';
        const result = await query(q, params);
        return { buses: result.rows };
    } catch (error) {
        console.error('getBusesAction error:', error);
        return { error: 'Otobüsler yüklenirken bir hata oluştu' };
    }
}

export async function createBusAction(data: {
    plate_number: string;
    model: string;
    capacity: number;
    company_id: string;
}) {
    try {
        const result = await query(
            'INSERT INTO buses (plate_number, model, capacity, company_id, current_location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [data.plate_number, data.model, data.capacity, data.company_id, JSON.stringify({ lat: 41.0, lng: 29.0 })]
        );
        revalidatePath('/dashboard/buses');
        return { success: true, bus: result.rows[0] };
    } catch (error) {
        console.error('createBusAction error:', error);
        return { error: 'Otobüs oluşturulurken bir hata oluştu' };
    }
}

export async function updateBusAction(id: string, data: {
    plate_number: string;
    model: string;
    capacity: number;
}) {
    try {
        await query(
            'UPDATE buses SET plate_number = $1, model = $2, capacity = $3 WHERE id = $4',
            [data.plate_number, data.model, data.capacity, id]
        );
        revalidatePath('/dashboard/buses');
        return { success: true };
    } catch (error) {
        console.error('updateBusAction error:', error);
        return { error: 'Otobüs güncellenirken bir hata oluştu' };
    }
}

export async function deleteBusAction(id: string) {
    try {
        await query('DELETE FROM buses WHERE id = $1', [id]);
        revalidatePath('/dashboard/buses');
        return { success: true };
    } catch (error) {
        console.error('deleteBusAction error:', error);
        return { error: 'Otobüs silinirken bir hata oluştu' };
    }
}

export async function createTripAction(data: {
    route_name: string;
    departure_time: string;
    bus_id: string;
    company_id: string;
    assistant_id: string;
    stops: { location_name: string; stop_order: number; planned_arrival: string }[];
}) {
    try {
        const travelNumber = `TRP-${Math.floor(100 + Math.random() * 899)}`;

        const tripRes = await query(
            'INSERT INTO trips (route_name, travel_number, departure_time, bus_id, company_id, assistant_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [data.route_name, travelNumber, data.departure_time, data.bus_id, data.company_id, data.assistant_id, 'scheduled']
        );
        const tripId = tripRes.rows[0].id;

        for (const stop of data.stops) {
            await query(
                'INSERT INTO stops (trip_id, location_name, stop_order, planned_arrival) VALUES ($1, $2, $3, $4)',
                [tripId, stop.location_name, stop.stop_order, stop.planned_arrival]
            );
        }

        return { success: true, tripId };
    } catch (error) {
        console.error('createTripAction error:', error);
        return { error: 'Sefer oluşturulurken bir hata oluştu' };
    }
}
