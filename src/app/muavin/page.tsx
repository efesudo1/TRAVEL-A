'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertTriangle, Clock, MapPin, Users, Bus, ArrowLeft,
    ChevronRight, CheckCircle2, Circle, Navigation, ShoppingBag, HelpCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';
import { getMuavinTripAction, updateStopDelayAction, getPendingOrdersAction, updateSnackOrderStatusAction } from '@/app/actions/muavin';
import { XCircle } from 'lucide-react';
import { formatTime, getMinutesUntil, formatMinutes, getStatusBadge } from '@/lib/utils';
import DelayKeypad from '@/components/assistant/DelayKeypad';
import TripStatus from '@/components/assistant/TripStatus';

export default function MuavinPage() {
    const router = useRouter();
    const user = useAuthStore(s => s.user);
    const [showKeypad, setShowKeypad] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ trip: any; stops: any[]; orders: any[] } | null>(null);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        const res = await getMuavinTripAction(user.id);
        if (res.trip) {
            const ordersRes = await getPendingOrdersAction(res.trip.id);
            setData({
                trip: res.trip,
                stops: res.stops || [],
                orders: ordersRes.orders || []
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            if (data?.trip?.id) {
                getPendingOrdersAction(data.trip.id).then(res => {
                    if (res.orders) setData(prev => prev ? { ...prev, orders: res.orders } : null);
                });
            }
        }, 15000);
        return () => clearInterval(interval);
    }, [user?.id, data?.trip?.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-digibus-acid">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-black uppercase tracking-widest">Sefer Bilgileri Yükleniyor...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-zinc-900 border-4 border-white flex items-center justify-center mb-6" style={{ boxShadow: '6px 6px 0px #FFFF33' }}>
                    <Bus className="w-10 h-10 text-white/20" />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Aktif Sefer Yok</h1>
                <p className="text-white/40 mb-8 max-w-xs mx-auto">Şu anda üzerinize tanımlı aktif bir sefer bulunmamaktadır. Lütfen yönetim ile iletişime geçin.</p>
                <Button
                    onClick={() => router.push('/')}
                    className="bg-white text-black font-black uppercase rounded-none border-4 border-black px-8 py-6 h-auto text-lg"
                    style={{ boxShadow: '6px 6px 0px #FFFF33' }}
                >
                    Ana Menüye Dön
                </Button>
            </div>
        );
    }

    const { trip, stops } = data;
    const statusBadge = getStatusBadge(trip.status);

    // Calculate next stop
    const now = new Date();
    const currentStopIndex = stops.findIndex(s => {
        const arrival = s.actual_arrival || s.planned_arrival;
        return new Date(arrival) > now;
    });
    const nextStop = currentStopIndex >= 0 ? stops[currentStopIndex] : stops[stops.length - 1];
    const etaMinutes = nextStop ? getMinutesUntil(nextStop.actual_arrival || nextStop.planned_arrival) : 0;

    // Count passengers (this would normally be count(*) from bookings where trip_id = trip.id)
    const passengerCount = '-'; // In a real app we'd fetch this count too

    const handleDelaySubmit = async (minutes: number) => {
        if (currentStopIndex < 0) return;
        const currentStop = stops[currentStopIndex];

        const res = await updateStopDelayAction(currentStop.id, minutes);
        if (res.success) {
            await fetchData();
            setShowKeypad(false);
        } else {
            alert('Gecikme güncellenirken hata oluştu.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="bg-black border-b-4 border-digibus-acid px-4 py-4 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white/50">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">Çıkış</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-digibus-acid rounded-none flex items-center justify-center">
                            <Bus className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-black text-lg tracking-tight font-mono">MUAVİN</span>
                    </div>
                </div>
            </header>

            <div className="p-4">
                <div className="bg-zinc-900 border-4 border-white p-5" style={{ boxShadow: '6px 6px 0px #FFFF33' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-black text-2xl tracking-tight uppercase">{trip.route_name}</h2>
                        <Badge className={`${statusBadge.className} border-2 text-sm font-black uppercase rounded-none px-3 py-1`}>
                            {statusBadge.label}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-black p-3 border border-white/20">
                            <p className="text-digibus-acid text-[10px] font-bold uppercase tracking-widest">Plaka</p>
                            <p className="text-white font-mono font-bold text-sm mt-1">{trip.plate_number || '-'}</p>
                        </div>
                        <div className="bg-black p-3 border border-white/20">
                            <p className="text-digibus-acid text-[10px] font-bold uppercase tracking-widest">Yolcu</p>
                            <p className="text-white font-mono font-bold text-2xl mt-1">{passengerCount}</p>
                        </div>
                        <div className="bg-black p-3 border border-white/20">
                            <p className="text-digibus-acid text-[10px] font-bold uppercase tracking-widest">Sonraki</p>
                            <p className="text-white font-bold text-sm mt-1 truncate">{nextStop?.location_name || '-'}</p>
                        </div>
                    </div>

                    <div className="bg-black border-2 border-digibus-acid p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="w-8 h-8 text-digibus-acid" />
                            <div>
                                <p className="text-digibus-acid text-[10px] font-bold uppercase">Tahmini Varış</p>
                                <p className="text-white font-mono font-black text-2xl">{formatMinutes(etaMinutes)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white/30 text-[10px] uppercase font-bold">Saat</p>
                            <p className="text-white font-mono font-black text-lg">{nextStop ? formatTime(nextStop.actual_arrival || nextStop.planned_arrival) : '--:--'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Orders Section */}
            {data.orders.length > 0 && (
                <div className="px-4 mb-6">
                    <div className="bg-amber-500/10 border-4 border-amber-500 p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <ShoppingBag className="w-6 h-6 text-amber-500" />
                            <h3 className="font-black text-xl uppercase tracking-tight text-amber-500">Bekleyen Siparişler</h3>
                        </div>
                        <div className="space-y-3">
                            {data.orders.map(order => (
                                <div key={order.id} className="bg-black border border-white/20 p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-digibus-acid text-[10px] font-bold uppercase tracking-widest mb-1">Koltuk {order.seat_number}</p>
                                            <p className="text-white font-black text-lg leading-tight">{order.product_name}</p>
                                            <p className="text-white/40 text-xs mt-1">{order.quantity} Adet • {order.total_price} TL</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    const res = await updateSnackOrderStatusAction(order.id, 'confirmed');
                                                    if (res.success) fetchData();
                                                }}
                                                className="bg-green-500 text-black p-2 hover:bg-green-400 transition-colors"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const res = await updateSnackOrderStatusAction(order.id, 'rejected');
                                                    if (res.success) fetchData();
                                                }}
                                                className="bg-red-500 text-black p-2 hover:bg-red-400 transition-colors"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="px-4 mb-4">
                <button
                    onClick={() => setShowKeypad(true)}
                    className="w-full bg-digibus-acid text-black font-black text-2xl uppercase tracking-wider
                     border-4 border-black brutal-btn flex items-center justify-center gap-4 py-6
                     hover:bg-digibus-acid-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                    style={{ boxShadow: '6px 6px 0px #000' }}
                    id="report-delay-btn"
                >
                    <AlertTriangle className="w-8 h-8" />
                    GECİKME BİLDİR
                </button>
            </div>

            <div className="px-4 mb-4">
                <button
                    onClick={() => router.push(`/muavin/market?tripId=${trip.id}`)}
                    className="w-full bg-white text-black font-black text-xl uppercase tracking-wider
                     border-4 border-black flex items-center justify-center gap-4 py-4
                     hover:bg-gray-100 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                    style={{ boxShadow: '6px 6px 0px #FFFF33' }}
                    id="market-management-btn"
                >
                    <ShoppingBag className="w-7 h-7" />
                    MARKET YÖNETİMİ
                </button>
            </div>

            <div className="px-4 pb-12">
                <TripStatus stops={stops} currentStopIndex={currentStopIndex} />
            </div>

            {showKeypad && (
                <DelayKeypad
                    onSubmit={handleDelaySubmit}
                    onClose={() => setShowKeypad(false)}
                />
            )}
        </div>
    );
}
