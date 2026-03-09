'use client';

import { useState, useEffect } from 'react';
import { Bus, Users, Route, Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ArrowUpRight, Crown, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusBadge, formatTime } from '@/lib/utils';
import PassengerChart from '@/components/admin/PassengerChart';
import { useAuthStore, isOwner } from '@/lib/auth-store';
import { getDashboardDataAction } from '@/app/actions/admin';

export default function DashboardPage() {
    const user = useAuthStore(s => s.user);
    const companyId = user?.role === 'owner' ? null : (user?.companyId || null);

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            const result = await getDashboardDataAction(companyId);
            if (result.trips) {
                setData(result);
            }
            setLoading(false);
        };
        fetchDashboardData();
    }, [companyId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Veriler yükleniyor...</p>
            </div>
        );
    }

    const { stats, trips } = data || { stats: { totalTrips: 0, activeBuses: 0, passengersCount: 0, averageDelay: 0 }, trips: [] };

    const kpis = [
        { label: 'Toplam Sefer', value: stats.totalTrips, icon: Route, color: 'text-digibus-orange', bg: 'bg-digibus-orange/10', trend: '+0', trendUp: true },
        { label: 'Gelecek Seferler', value: trips.filter((t: any) => t.status === 'scheduled').length, icon: Bus, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+0', trendUp: true },
        { label: 'Bugünkü Satış', value: '0', icon: Users, color: 'text-digibus-acid', bg: 'bg-digibus-acid/10', trend: '0', trendUp: true },
        { label: 'Ort. Gecikme', value: '0dk', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '0dk', trendUp: false },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Owner badge */}
            {isOwner(user) && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-sm font-medium">God Mode — Tüm şirketlerin verilerini görüntülüyorsunuz</span>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <Card key={kpi.label} className="bg-digibus-slate border-white/5 p-5 rounded-2xl hover:bg-digibus-slate-light transition-all group">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs ${kpi.trendUp ? 'text-green-400' : 'text-amber-400'}`}>
                                {kpi.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {kpi.trend}
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white animate-counter-up">{kpi.value}</p>
                        <p className="text-white/40 text-sm mt-1">{kpi.label}</p>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="bg-digibus-slate border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-white font-semibold">Yolcu Hacmi</h3>
                                <p className="text-white/30 text-sm">Son 7 gün</p>
                            </div>
                        </div>
                        <PassengerChart />
                    </Card>
                </div>

                <Card className="bg-digibus-slate border-white/5 rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-4">Sefer Durumu</h3>
                    <div className="space-y-4">
                        {[
                            { status: 'on_time', count: trips.filter((t: any) => t.status === 'on_time').length, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
                            { status: 'delayed', count: trips.filter((t: any) => t.status === 'delayed').length, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            { status: 'scheduled', count: trips.filter((t: any) => t.status === 'scheduled').length, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                            { status: 'completed', count: trips.filter((t: any) => t.status === 'completed').length, icon: CheckCircle2, color: 'text-white/40', bg: 'bg-white/5' },
                        ].map((item) => {
                            const badge = getStatusBadge(item.status);
                            return (
                                <div key={item.status} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}><item.icon className={`w-4 h-4 ${item.color}`} /></div>
                                        <span className="text-white/70 text-sm">{badge.label}</span>
                                    </div>
                                    <span className="text-white font-bold text-lg">{item.count}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-white/40 text-sm">Toplam</span>
                        <span className="text-white font-bold text-xl">{trips.length}</span>
                    </div>
                </Card>
            </div>

            {/* Recent Trips Table */}
            <Card className="bg-digibus-slate border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Son Seferler</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-white/30 font-medium py-3 px-2">Güzergah</th>
                                {isOwner(user) && <th className="text-left text-white/30 font-medium py-3 px-2">Şirket</th>}
                                <th className="text-left text-white/30 font-medium py-3 px-2">Otobüs</th>
                                <th className="text-left text-white/30 font-medium py-3 px-2">Kalkış</th>
                                <th className="text-left text-white/30 font-medium py-3 px-2">Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trips.map((trip: any) => {
                                const badge = getStatusBadge(trip.status);
                                return (
                                    <tr key={trip.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-2">
                                                <Route className="w-4 h-4 text-digibus-orange/60" />
                                                <span className="text-white font-medium">{trip.route_name}</span>
                                            </div>
                                        </td>
                                        {isOwner(user) && <td className="py-3 px-2 text-white/50 text-xs">{trip.company_name}</td>}
                                        <td className="py-3 px-2 text-white/50 font-mono text-xs">{trip.plate_number || 'Atanmamış'}</td>
                                        <td className="py-3 px-2 text-white/50">{formatTime(trip.departure_time)}</td>
                                        <td className="py-3 px-2">
                                            <Badge className={`${badge.className} border text-xs`}>{badge.label}</Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

