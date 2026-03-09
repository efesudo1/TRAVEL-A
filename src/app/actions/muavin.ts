'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getMuavinTripAction(userId: string) {
    try {
        // Find active trip where this user is the assistant
        const tripRes = await query(`
            SELECT t.*, b.plate_number, b.id as bus_id
            FROM trips t
            LEFT JOIN buses b ON t.bus_id = b.id
            WHERE t.assistant_id = $1 AND t.status IN ('scheduled', 'on_time', 'delayed')
            ORDER BY t.departure_time ASC
            LIMIT 1
        `, [userId]);

        if (tripRes.rows.length === 0) {
            return { error: 'Aktif sefer bulunamadı' };
        }

        const trip = tripRes.rows[0];

        const stopsRes = await query(`
            SELECT * FROM stops 
            WHERE trip_id = $1 
            ORDER BY stop_order ASC
        `, [trip.id]);

        return {
            trip,
            stops: stopsRes.rows
        };
    } catch (error) {
        console.error('getMuavinTripAction error:', error);
        return { error: 'Sefer bilgileri alınamadı' };
    }
}

export async function updateStopDelayAction(stopId: string, delayMinutes: number) {
    try {
        // Get the stop and trip
        const stopRes = await query('SELECT * FROM stops WHERE id = $1', [stopId]);
        if (stopRes.rows.length === 0) return { error: 'Durak bulunamadı' };

        const stop = stopRes.rows[0];
        const tripId = stop.trip_id;

        // Update this stop and all subsequent stops for this trip
        const plannedTime = new Date(stop.planned_arrival);
        plannedTime.setMinutes(plannedTime.getMinutes() + delayMinutes);

        await query(`
            UPDATE stops 
            SET actual_arrival = (planned_arrival + ($2 || ' minutes')::interval)
            WHERE trip_id = $1 AND stop_order >= $3
        `, [tripId, delayMinutes, stop.stop_order]);

        // Update trip status to 'delayed'
        await query(`
            UPDATE trips SET status = 'delayed' WHERE id = $1
        `, [tripId]);

        revalidatePath('/muavin');
        revalidatePath(`/track`); // Also revalidate track for passengers

        return { success: true };
    } catch (error) {
        console.error('updateStopDelayAction error:', error);
        return { error: 'Gecikme güncellenemedi' };
    }
}

export async function getSnackInventoryAction(tripId: string) {
    try {
        // Get all products and their stock for this trip
        const invRes = await query(`
            SELECT sp.*, COALESCE(si.stock_count, 0) as stock
            FROM snack_products sp
            LEFT JOIN snack_inventory si ON sp.id = si.product_id AND si.trip_id = $1
            ORDER BY sp.category, sp.name
        `, [tripId]);

        return { inventory: invRes.rows };
    } catch (error) {
        console.error('getSnackInventoryAction error:', error);
        return { error: 'Envanter alınamadı' };
    }
}

export async function updateSnackStockAction(tripId: string, productId: string, change: number) {
    try {
        await query(`
            INSERT INTO snack_inventory (trip_id, product_id, stock_count)
            VALUES ($1, $2, GREATEST(0, $3))
            ON CONFLICT (trip_id, product_id)
            DO UPDATE SET stock_count = GREATEST(0, snack_inventory.stock_count + $3), updated_at = NOW()
        `, [tripId, productId, change]);

        revalidatePath('/muavin/market');
        return { success: true };
    } catch (error) {
        console.error('updateSnackStockAction error:', error);
        return { error: 'Stok güncellenemedi' };
    }
}

export async function getPendingOrdersAction(tripId: string) {
    try {
        const result = await query(`
            SELECT so.*, sp.name as product_name, sp.price as unit_price
            FROM snack_orders so
            JOIN snack_products sp ON so.product_id = sp.id
            WHERE so.trip_id = $1 AND so.status = 'pending'
            ORDER BY so.created_at ASC
        `, [tripId]);
        return { orders: result.rows };
    } catch (error) {
        console.error('getPendingOrdersAction error:', error);
        return { error: 'Siparişler alınamadı' };
    }
}

export async function updateSnackOrderStatusAction(orderId: string, status: string) {
    try {
        await query('UPDATE snack_orders SET status = $1 WHERE id = $2', [status, orderId]);
        revalidatePath('/muavin');
        revalidatePath('/yolcu');
        return { success: true };
    } catch (error) {
        console.error('updateSnackOrderStatusAction error:', error);
        return { error: 'Sipariş durumu güncellenemedi' };
    }
}
