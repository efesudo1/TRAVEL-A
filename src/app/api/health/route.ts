import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const result = await pool.query('SELECT NOW() as time');
        return NextResponse.json({
            status: 'ok',
            db: 'connected',
            timestamp: result.rows[0].time,
        });
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json(
            { status: 'error', db: 'disconnected' },
            { status: 503 }
        );
    }
}
