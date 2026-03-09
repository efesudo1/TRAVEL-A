'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { demoCompanies, demoAdmins } from './demo-data';
import type { Company, AdminAccount } from './types';

// ============================================
// AUTH STORE — Global session management
// Roles: owner (god mode), admin (company-specific), assistant (muavin), passenger
// ============================================

export type AuthRole = 'owner' | 'admin' | 'assistant' | 'passenger';

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    role: AuthRole;
    companyId: string | null;   // null for owner & passenger
    companyName: string | null; // null for owner & passenger
}

interface AuthState {
    user: AuthUser | null;
    isLoggedIn: boolean;
    login: (user: AuthUser) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoggedIn: false,

            login: (user: AuthUser) => set({ user, isLoggedIn: true }),
            logout: () => set({ user: null, isLoggedIn: false }),
        }),
        {
            name: 'digibus-auth-storage',
        }
    )
);

// Helpers
export function isOwner(user: AuthUser | null): boolean {
    return user?.role === 'owner';
}

export function isAdmin(user: AuthUser | null): boolean {
    return user?.role === 'admin';
}

export function isCompanyScoped(user: AuthUser | null): boolean {
    return user?.role === 'admin' || user?.role === 'assistant';
}

export function getCompanyFilter(user: AuthUser | null): string | null {
    if (!user) return null;
    if (user.role === 'owner') return null; // owner sees everything
    return user.companyId;
}
