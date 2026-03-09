import { Pool } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ...(isProduction && {
        ssl: {
            rejectUnauthorized: false,
        },
    }),
});

pool.on('error', (err) => {
    console.error('Unexpected pool error:', err);
});

export default pool;

export const query = (text: string, params?: any[]) => pool.query(text, params);
