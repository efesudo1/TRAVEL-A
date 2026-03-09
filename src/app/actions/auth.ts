'use server';

import { query } from '@/lib/db';
import { UserRole } from '@/lib/types';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function loginAction(credentials: { email?: string; username?: string; password?: string }) {
    try {
        if (!credentials.password) {
            return { error: 'Şifre gereklidir' };
        }

        let result;
        if (credentials.username) {
            // Assistant login
            result = await query(
                'SELECT u.*, c.name as company_name FROM users u LEFT JOIN companies c ON u.company_id = c.id WHERE u.username = $1 AND u.role = $2',
                [credentials.username.trim().toLowerCase(), 'assistant']
            );
        } else {
            // E-mail based login (owner, admin, passenger)
            if (!credentials.email) {
                return { error: 'E-posta gereklidir' };
            }
            result = await query(
                'SELECT u.*, c.name as company_name FROM users u LEFT JOIN companies c ON u.company_id = c.id WHERE u.email = $1',
                [credentials.email.trim().toLowerCase()]
            );
        }

        const user = result.rows[0];

        if (!user) {
            return { error: 'Kullanıcı bulunamadı' };
        }

        // Check password: try bcrypt first, then plain-text fallback for legacy demo users
        let passwordValid = false;
        if (user.password_hash && user.password_hash.startsWith('$2')) {
            // Bcrypt hashed password
            passwordValid = await bcrypt.compare(credentials.password, user.password_hash);
        } else {
            // Plain text fallback (legacy/demo) — migrate on successful login
            passwordValid = user.password_hash === credentials.password;
            if (passwordValid && user.password_hash) {
                // Auto-migrate to bcrypt
                const hashed = await bcrypt.hash(credentials.password, SALT_ROUNDS);
                await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, user.id]);
            }
        }

        if (!passwordValid) {
            return { error: 'Şifre hatalı' };
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role as UserRole,
                companyId: user.company_id,
                companyName: user.company_name
            }
        };
    } catch (error: any) {
        console.error('Login action error:', error);
        return { error: 'Giriş işlemi sırasında bir hata oluştu' };
    }
}

export async function registerPassengerAction(data: { email: string, fullName: string, password_hash: string }) {
    try {
        // Check if exists
        const check = await query('SELECT id FROM users WHERE email = $1', [data.email.trim().toLowerCase()]);
        if (check.rows.length > 0) {
            return { error: 'Bu e-posta adresi zaten kullanımda' };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(data.password_hash, SALT_ROUNDS);

        const result = await query(
            'INSERT INTO users (email, full_name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [data.email.trim().toLowerCase(), data.fullName.trim(), hashedPassword, 'passenger']
        );

        const user = result.rows[0];
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: 'passenger' as UserRole,
                companyId: null,
                companyName: null
            }
        };
    } catch (error: any) {
        console.error('Register action error:', error);
        return { error: 'Kayıt işlemi sırasında bir hata oluştu' };
    }
}

