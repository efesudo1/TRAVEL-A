'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Bus, MapPin, Clock, AlertTriangle, Navigation, Armchair, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBookingByPNRAction } from '@/app/actions/passenger';
import { formatTime, getMinutesUntil, formatMinutes, getStatusBadge } from '@/lib/utils';
import MapView from '@/components/passenger/MapView';
import JourneyPanel from '@/components/passenger/JourneyPanel';
import LoyaltyTracker from '@/components/passenger/LoyaltyTracker';
import type { Stop } from '@/lib/types';

export default function PNRTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const pnr = (params.pnr as string).toUpperCase();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPanel, setShowPanel] = useState(false);
    const [showLoyalty, setShowLoyalty] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await getBookingByPNRAction(pnr);
            if (res.booking) {
                setData(res);
                setTimeout(() => setShowPanel(true), 800);
            }
            setLoading(false);
        };
        fetchData();
    }, [pnr]);

    if (loading) {
        return (
            <div className="min-h-screen bg-digibus-navy flex flex-col items-center justify-center px-6">
                <Loader2 className="w-10 h-10 text-digibus-orange animate-spin mb-4" />
                <p className="text-white/40 animate-pulse">Yolculuk bilgileri yükleniyor...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-digibus-navy flex items-center justify-center px-6">
                <div className="text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">PNR Bulunamadı</h1>
                    <p className="text-white/40 mb-6">
                        &quot;<span className="font-mono text-digibus-orange">{pnr}</span>&quot; kodlu bir rezervasyon bulunamadı.
                    </p>
                    <Button
                        onClick={() => router.push('/track')}
                        className="bg-digibus-orange hover:bg-digibus-orange-dark text-white"
                    >
                        Tekrar Dene
                    </Button>
                </div>
            </div>
        );
    }

    const { booking, trip, loyalty } = data;
    const stops = trip.stops || [];
    const statusBadge = getStatusBadge(trip.status);

    // Calculate current/next stop
    const now = new Date();
    const currentStopIndex = stops.findIndex((s: Stop) => {
        const arrival = s.actual_arrival || s.planned_arrival;
        return new Date(arrival) > now;
    });
    const nextStop = currentStopIndex >= 0 ? stops[currentStopIndex] : stops[stops.length - 1];
    const origin = stops[0];
    const destination = stops[stops.length - 1];

    const etaMinutes = nextStop ? getMinutesUntil(nextStop.actual_arrival || nextStop.planned_arrival) : 0;

    // Calculate total delay
    const delayMinutes = stops.reduce((acc: number, s: Stop) => {
        if (s.actual_arrival && s.planned_arrival) {
            const diff = (new Date(s.actual_arrival).getTime() - new Date(s.planned_arrival).getTime()) / 60000;
            return Math.max(acc, diff);
        }
        return acc;
    }, 0);

    // Bus position for map (simulate between last completed stop and next stop)
    const busPosition = trip.bus?.current_location || (currentStopIndex > 0 ? {
        lng: (stops[currentStopIndex - 1].coordinates.lng + nextStop.coordinates.lng) / 2,
        lat: (stops[currentStopIndex - 1].coordinates.lat + nextStop.coordinates.lat) / 2,
    } : (stops[0] ? stops[0].coordinates : { lng: 29, lat: 41 }));

    return (
        <div className="relative min-h-screen bg-digibus-navy overflow-hidden">
            {/* Full-screen Map Background */}
            <div className="absolute inset-0 z-0">
                <MapView
                    routeCoordinates={trip.route_json || []}
                    stops={stops}
                    busPosition={busPosition}
                    currentStopIndex={currentStopIndex}
                />
                {/* Map gradient overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-digibus-navy via-transparent to-digibus-navy/60" />
            </div>

            {/* Top Bar */}
            <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="glass rounded-xl text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => router.push('/track')}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Geri
                </Button>

                <div className="flex items-center gap-2">
                    <Badge className={`${statusBadge.className} border rounded-lg px-3 py-1 font-medium shadow-lg`}>
                        {trip.status === 'delayed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {statusBadge.label}
                    </Badge>
                </div>

                <div className="glass rounded-xl px-3 py-1.5 flex items-center gap-2 border border-white/5">
                    <span className="text-white/40 text-xs">PNR</span>
                    <span className="text-digibus-orange font-mono font-bold text-sm tracking-widest">{pnr}</span>
                </div>
            </div>

            {/* Company & Route Bar */}
            <div className="relative z-10 px-4 mt-2">
                <div className="glass rounded-xl px-4 py-3 flex items-center justify-between border border-white/5 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-digibus-orange/20 to-digibus-orange/5 flex items-center justify-center border border-digibus-orange/20">
                            <Bus className="w-5 h-5 text-digibus-orange" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm tracking-tight">{trip.route_name}</p>
                            <p className="text-white/30 text-xs mt-0.5">{trip.company?.name} · {trip.bus?.plate_number || '06 DB 001'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/50 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        <Armchair className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">No {booking.seat_number}</span>
                    </div>
                </div>
            </div>

            {/* Passenger Welcome Card */}
            <div className="relative z-10 px-4 mt-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="glass rounded-xl px-4 py-3 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                            <UserCheck className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm">
                                Hoş Geldin, {booking.passenger_name}!
                            </p>
                            <p className="text-white/30 text-[10px] uppercase tracking-wider font-medium mt-0.5">
                                İyi yolculuklar dileriz
                            </p>
                        </div>
                        {loyalty && (
                            <div className="text-right">
                                <p className="text-digibus-acid font-bold text-xs">{loyalty.points_count}/7</p>
                                <p className="text-white/20 text-[9px] uppercase">Puan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Slide-up Journey Panel */}
            {showPanel && (
                <div className="fixed bottom-0 left-0 right-0 z-20">
                    <JourneyPanel
                        origin={origin}
                        destination={destination}
                        nextStop={nextStop}
                        etaMinutes={etaMinutes}
                        delayMinutes={Math.round(delayMinutes)}
                        stops={stops}
                        currentStopIndex={currentStopIndex}
                        tripStatus={trip.status}
                        onToggleLoyalty={() => setShowLoyalty(!showLoyalty)}
                    />
                </div>
            )}

            {/* Loyalty Modal */}
            {showLoyalty && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={() => setShowLoyalty(false)}>
                    <div className="w-full max-w-sm animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                        <LoyaltyTracker
                            points={loyalty?.points_count || 0}
                            totalTrips={loyalty?.total_trips || 0}
                            companyName={trip.company?.name || 'Digibus'}
                        />
                        <button
                            onClick={() => setShowLoyalty(false)}
                            className="w-full mt-4 text-white/20 hover:text-white transition-colors text-sm"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
