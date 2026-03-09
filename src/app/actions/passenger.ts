'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getBookingByPNRAction(pnr: string) {
    try {
        const pnrUpper = pnr.toUpperCase();

        // 1. Get Booking and Trip info
        const bookingRes = await query(`
            SELECT b.*, t.bus_id, t.company_id, t.route_name, t.departure_time, t.status as trip_status,
                   c.name as company_name, c.logo_url as company_logo,
                   bus.plate_number as bus_plate, bus.current_location as bus_location
            FROM bookings b
            JOIN trips t ON b.trip_id = t.id
            JOIN companies c ON t.company_id = c.id
            LEFT JOIN buses bus ON t.bus_id = bus.id
            WHERE b.pnr_code = $1
        `, [pnrUpper]);

        if (bookingRes.rows.length === 0) {
            return { error: 'PNR bulunamadı' };
        }

        const booking = bookingRes.rows[0];

        // 2. Get Stops for the trip
        const stopsRes = await query(`
            SELECT * FROM stops 
            WHERE trip_id = $1 
            ORDER BY stop_order ASC
        `, [booking.trip_id]);

        // 3. Get Loyalty points if passenger_id exists
        let loyalty = null;
        if (booking.passenger_id) {
            const loyaltyRes = await query(`
                SELECT * FROM loyalty_points 
                WHERE passenger_id = $1 AND company_id = $2
            `, [booking.passenger_id, booking.company_id]);
            loyalty = loyaltyRes.rows[0] || null;
        }

        return {
            booking: {
                id: booking.id,
                pnr_code: booking.pnr_code,
                passenger_name: booking.passenger_name,
                passenger_surname: booking.passenger_surname,
                passenger_phone: booking.passenger_phone,
                seat_number: booking.seat_number,
                status: booking.status,
                passenger_id: booking.passenger_id
            },
            trip: {
                id: booking.trip_id,
                route_name: booking.route_name,
                departure_time: booking.departure_time,
                status: booking.trip_status,
                company: {
                    id: booking.company_id,
                    name: booking.company_name,
                    logo_url: booking.company_logo
                },
                bus: {
                    plate_number: booking.bus_plate,
                    current_location: booking.bus_location
                },
                stops: stopsRes.rows
            },
            loyalty
        };
    } catch (error) {
        console.error('getBookingByPNRAction error:', error);
        return { error: 'Sorgulama sırasında bir hata oluştu' };
    }
}

export async function createSnackOrderAction(tripId: string, seatNumber: string, tray: { productId: string, quantity: number, totalPrice: number }[], passengerId?: string) {
    try {
        for (const item of tray) {
            // Check stock
            const stockRes = await query(`
                SELECT stock_count
                FROM snack_inventory
                WHERE trip_id = $1 AND product_id = $2
            `, [tripId, item.productId]);

            if (stockRes.rows.length === 0 || stockRes.rows[0].stock_count < item.quantity) {
                return { error: 'Bazı ürünler stokta kalmadı.' };
            }

            // Create order
            await query(`
                INSERT INTO snack_orders (trip_id, product_id, quantity, total_price, seat_number, status, passenger_id)
                VALUES ($1, $2, $3, $4, $5, 'pending', $6)
            `, [tripId, item.productId, item.quantity, item.totalPrice, parseInt(seatNumber), passengerId]);

            // Update inventory
            await query(`
                UPDATE snack_inventory 
                SET stock_count = stock_count - $3, updated_at = NOW()
                WHERE trip_id = $1 AND product_id = $2
            `, [tripId, item.productId, item.quantity]);
        }

        revalidatePath('/muavin');
        return { success: true };
    } catch (error) {
        console.error('createSnackOrderAction error:', error);
        return { error: 'Sipariş oluşturulamadı' };
    }
}

export async function getPassengerDataAction(email: string) {
    try {
        const lowerEmail = email.toLowerCase().trim();

        // Fetch bookings with trip details using JOIN on passenger_email
        const bookingsRes = await query(`
            SELECT b.*, t.route_name, t.departure_time, c.name as company_name
            FROM bookings b
            JOIN trips t ON b.trip_id = t.id
            JOIN companies c ON t.company_id = c.id
            WHERE LOWER(b.passenger_email) = $1
            ORDER BY t.departure_time DESC
        `, [lowerEmail]);

        // Fetch loyalty points
        const loyaltyRes = await query(`
            SELECT lp.*, c.name as company_name
            FROM loyalty_points lp
            JOIN companies c ON lp.company_id = c.id
            JOIN users u ON lp.passenger_id = u.id
            WHERE LOWER(u.email) = $1
        `, [lowerEmail]);

        return {
            bookings: bookingsRes.rows,
            loyalty: loyaltyRes.rows
        };
    } catch (error) {
        console.error('getPassengerDataAction error:', error);
        return { error: 'Kullanıcı verileri alınamadı' };
    }
}

export async function getPassengerOrdersAction(passengerId: string) {
    try {
        const result = await query(`
            SELECT so.*, sp.name as product_name, t.route_name, t.travel_number
            FROM snack_orders so
            JOIN snack_products sp ON so.product_id = sp.id
            JOIN trips t ON so.trip_id = t.id
            WHERE so.passenger_id = $1
            ORDER BY so.created_at DESC
            LIMIT 10
        `, [passengerId]);
        return { orders: result.rows };
    } catch (error) {
        console.error('getPassengerOrdersAction error:', error);
        return { error: 'Sipariş geçmişi alınamadı' };
    }
}
