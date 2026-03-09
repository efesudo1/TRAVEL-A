'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Bus, Route, Users, Settings, LogOut,
    Menu, X, ChevronRight, FileSpreadsheet, UserPlus, Crown, Building2, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, isOwner } from '@/lib/auth-store';
import { useState, useEffect } from 'react';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, ownerOnly: false },
    { label: 'Otobüsler', href: '/dashboard/buses', icon: Bus, ownerOnly: false },
    { label: 'Seferler', href: '/dashboard/trips', icon: Route, ownerOnly: false },
    { label: 'Muavinler', href: '/dashboard/muavinler', icon: UserPlus, ownerOnly: false },
    { label: 'Yolcular', href: '/dashboard/yolcular', icon: Users, ownerOnly: false },
    { label: 'Satış Raporu', href: '/dashboard/satis-raporu', icon: FileSpreadsheet, ownerOnly: false },
    { label: 'Şirketler', href: '/dashboard/sirketler', icon: Building2, ownerOnly: true },
    { label: 'Sadakat', href: '/dashboard/sadakat', icon: Award, ownerOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Redirect to login if not logged in as admin/owner
    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
            // Allow demo access without full auth
        }
    }, [user]);

    const userIsOwner = isOwner(user);

    // Filter nav items based on role
    const filteredNavItems = navItems.filter(item => !item.ownerOnly || userIsOwner);

    const companyLabel = userIsOwner
        ? 'DiGibus — Tüm Şirketler'
        : user?.companyName
            ? `${user.companyName} · Yönetim`
            : 'Admin Panel';

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-digibus-navy flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-digibus-slate border-r border-white/5 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${userIsOwner ? 'bg-amber-500/20' : 'bg-digibus-orange/20'}`}>
                                {userIsOwner ? <Crown className="w-5 h-5 text-amber-400" /> : <Bus className="w-5 h-5 text-digibus-orange" />}
                            </div>
                            <div>
                                <h1 className={`text-lg font-bold ${userIsOwner ? 'text-amber-400' : 'text-white'}`}>Digibus</h1>
                                <p className="text-white/30 text-xs">{userIsOwner ? 'God Mode' : 'Admin Panel'}</p>
                            </div>
                        </div>
                        <button className="lg:hidden text-white/40" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    {filteredNavItems.map(item => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <button
                                key={item.href}
                                onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ${isActive
                                    ? 'bg-digibus-orange/10 text-digibus-orange'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                            </button>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/5 text-sm transition-all">
                        <LogOut className="w-4 h-4" />
                        Çıkış
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-digibus-navy/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
                        <div>
                            <h2 className="text-white font-semibold">{filteredNavItems.find(n => pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href)))?.label || 'Dashboard'}</h2>
                            <p className="text-white/30 text-xs">{companyLabel}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {user && (
                            <div className="flex items-center gap-2">
                                <span className="text-white/40 text-sm hidden md:block">{user.fullName}</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${userIsOwner ? 'bg-amber-500/20' : 'bg-digibus-orange/20'}`}>
                                    <Users className="w-4 h-4 text-white/60" />
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
