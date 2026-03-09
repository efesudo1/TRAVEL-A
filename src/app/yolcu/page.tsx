'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LogOut, ArrowLeft, Bus, MapPin, Calendar, Compass, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LoyaltyTracker from '@/components/passenger/LoyaltyTracker';
import { formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getPassengerDataAction, getPassengerOrdersAction } from '@/app/actions/passenger';
import { ShoppingBag, CheckCircle2, XCircle, Clock as ClockIcon } from 'lucide-react';

export default function YolcuDashboardPage() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ bookings: any[], loyalty: any[], orders: any[] }>({
        bookings: [],
        loyalty: [],
        orders: []
    });

    const fetchData = async () => {
        if (!user || user.role !== 'passenger') return;
        setLoading(true);
        const [dataRes, ordersRes] = await Promise.all([
            getPassengerDataAction(user.email),
            getPassengerOrdersAction(user.id)
        ]);

        setData({
            bookings: dataRes.bookings || [],
            loyalty: dataRes.loyalty || [],
            orders: ordersRes.orders || []
        });
        setLoading(false);
    };

    useEffect(() => {
        if (!user || user.role !== 'passenger') {
            router.push('/login?role=passenger');
            return;
        }
        fetchData();
    }, [user, router]);

    if (!user || user.role !== 'passenger') return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-digibus-navy flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin text-digibus-orange mb-4" />
                <p className="font-bold uppercase tracking-widest opacity-40">Bilgileriniz Hazırlanıyor...</p>
            </div>
        );
    }

    const getOrderStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <ClockIcon className="w-4 h-4 text-amber-400" />;
            case 'confirmed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
            default: return <ClockIcon className="w-4 h-4 text-white/20" />;
        }
    };

    const getOrderStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Bekliyor';
            case 'confirmed': return 'Teslim Edildi';
            case 'rejected': return 'İptal Edildi';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-digibus-navy font-sans selection:bg-digibus-orange/30">
            {/* Passenger Header */}
            <header className="sticky top-0 z-50 bg-digibus-navy/80 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden text-white/50 hover:text-white" onClick={() => router.push('/')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Bus className="w-5 h-5 text-digibus-orange" />
                            <span className="text-white font-bold hidden sm:inline-block">DiGibus Seyahat</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-white/80 text-sm hidden sm:block">{user.fullName}</span>
                        </div>
                        <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:text-red-400" onClick={() => { logout(); router.push('/'); }}>
                            <LogOut className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Çıkış</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 animate-fade-in max-w-5xl">
                <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz, {user.fullName.split(' ')[0]}!</h1>
                        <p className="text-white/40">Seyahat geçmişinizi ve ayrıcalıklarınızı buradan takip edebilirsiniz.</p>
                    </div>
                    {data.bookings.length > 0 && (
                        <Button
                            className="bg-digibus-orange hover:bg-digibus-orange-dark text-white font-bold h-12 px-6 rounded-2xl shadow-lg shadow-orange-500/20"
                            onClick={() => router.push(`/market?tripId=${data.bookings[0].trip_id}&seat=${data.bookings[0].seat_number}`)}
                        >
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Marketten Sipariş Ver
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Travel History */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-digibus-acid" />
                                Biletlerim ve Seferlerim
                            </h2>

                            <div className="space-y-4">
                                {data.bookings.length > 0 ? data.bookings.map(b => (
                                    <Card key={b.id} className="bg-white/[0.03] border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors group cursor-pointer" onClick={() => router.push(`/track/${b.pnr_code}`)}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-digibus-navy flex items-center justify-center border border-white/5 group-hover:border-digibus-orange/30 transition-colors">
                                                    <Bus className="w-6 h-6 text-white/60 group-hover:text-digibus-orange transition-colors" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-white font-bold text-lg">{b.route_name}</h3>
                                                        <Badge variant="outline" className="border-digibus-orange/30 text-digibus-orange bg-digibus-orange/10 text-xs">
                                                            PNR: {b.pnr_code}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-white/40 text-sm">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(b.departure_time).toLocaleDateString('tr-TR')}</span>
                                                        <span>•</span>
                                                        <span>Kalkış: {formatTime(b.departure_time)}</span>
                                                        <span>•</span>
                                                        <span className="text-blue-400 font-bold">Koltuk: {b.seat_number}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <p className="text-white/30 text-xs uppercase font-bold mb-1">Firma</p>
                                                <p className="text-white font-bold">{b.company_name}</p>
                                            </div>
                                        </div>
                                    </Card>
                                )) : (
                                    <Card className="bg-white/5 border-white/10 p-8 text-center rounded-3xl">
                                        <Bus className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                        <h3 className="text-white font-medium mb-1">Henüz Biletiniz Yok</h3>
                                        <p className="text-white/40 text-sm mb-4">Size uygun seferimizi bularak ilk adımınızı atın.</p>
                                        <Button className="bg-digibus-orange text-white hover:bg-digibus-orange-dark" onClick={() => router.push('/')}>Sefer Ara</Button>
                                    </Card>
                                )}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-digibus-orange" />
                                Son Siparişlerim
                            </h2>

                            <div className="space-y-3">
                                {data.orders.length > 0 ? data.orders.map(o => (
                                    <div key={o.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                                <ShoppingBag className="w-5 h-5 text-white/20" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">{o.product_name}</p>
                                                <p className="text-white/30 text-xs">{o.route_name} • {new Date(o.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                            {getOrderStatusIcon(o.status)}
                                            <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">
                                                {getOrderStatusText(o.status)}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 bg-white/[0.02] border border-dashed border-white/5 rounded-3xl text-center">
                                        <ShoppingBag className="w-8 h-8 text-white/5 mx-auto mb-2" />
                                        <p className="text-white/20 text-sm font-bold uppercase tracking-widest">Henüz Siparişiniz Yok</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Loyalty Cards */}
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Compass className="w-5 h-5 text-digibus-orange" />
                            Sadakat Puanlarım
                        </h2>

                        {data.loyalty.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {data.loyalty.map(l => (
                                    <LoyaltyTracker
                                        key={l.id}
                                        points={l.points_count}
                                        totalTrips={l.total_trips}
                                        companyName={l.company_name}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-white/5 border-white/10 p-8 text-center rounded-3xl">
                                <Compass className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                <h3 className="text-white font-medium mb-1">Henüz Puanınız Yok</h3>
                                <p className="text-white/40 text-sm">Seyahatlerinize başladığınızda sadakat kartlarınız burada belirecek.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
