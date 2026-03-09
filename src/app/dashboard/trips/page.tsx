'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Route, Clock, Users, Bus, MapPin, Loader2, X, Calendar, User, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';
import { getTripsAction, getBusesAction, getMuavinlerAction, createTripAction, updateTripAction, deleteTripAction, getTripStopsAction } from '@/app/actions/admin';
import { getStatusBadge, formatTime } from '@/lib/utils';
import type { Trip } from '@/lib/types';
import { Pencil, Trash2 } from 'lucide-react';

export default function TripsPage() {
    const user = useAuthStore(s => s.user);
    const companyId = user?.role === 'owner' ? null : (user?.companyId || null);

    const [trips, setTrips] = useState<any[]>([]);
    const [buses, setBuses] = useState<any[]>([]);
    const [muavinler, setMuavinler] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTripId, setEditingTripId] = useState<string | null>(null);
    const [newTrip, setNewTrip] = useState({
        route_name: '',
        departure_time: '',
        bus_id: '',
        assistant_id: '',
        status: 'scheduled',
        stops: [
            { location_name: '', stop_order: 1, planned_arrival: '' },
            { location_name: '', stop_order: 2, planned_arrival: '' }
        ]
    });

    const fetchData = async () => {
        setLoading(true);
        const [tripsRes, busesRes, muavinRes] = await Promise.all([
            getTripsAction(companyId),
            getBusesAction(companyId),
            getMuavinlerAction(companyId)
        ]);

        if (tripsRes.trips) setTrips(tripsRes.trips);
        if (busesRes.buses) setBuses(busesRes.buses);
        if (muavinRes.muavinler) setMuavinler(muavinRes.muavinler);

        // Pick defaults for modal
        if (busesRes.buses && busesRes.buses.length > 0) {
            setNewTrip(prev => ({ ...prev, bus_id: busesRes.buses![0].id }));
        }
        if (muavinRes.muavinler && muavinRes.muavinler.length > 0) {
            setNewTrip(prev => ({ ...prev, assistant_id: muavinRes.muavinler![0].id }));
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [companyId]);

    const filteredTrips = trips.filter(t => {
        const matchesSearch = t.route_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.plate_number || t.bus?.plate_number || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusFilters = [
        { label: 'Tümü', value: 'all' },
        { label: 'Zamanında', value: 'on-time' },
        { label: 'Gecikmeli', value: 'delayed' },
        { label: 'Planlandı', value: 'scheduled' },
        { label: 'Tamamlandı', value: 'completed' },
    ];

    const handleAddTrip = async () => {
        if (!newTrip.route_name || !newTrip.departure_time || !newTrip.bus_id || !newTrip.assistant_id) {
            alert('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }

        setActionLoading(true);
        const res = await createTripAction({
            ...newTrip,
            company_id: companyId || user?.companyId || '',
            // Ensure stops have correct times if empty (use departure as fallback for now or simple offset)
            stops: newTrip.stops.map(s => ({
                ...s,
                planned_arrival: s.planned_arrival || newTrip.departure_time
            }))
        });

        if (res.success) {
            await fetchData();
            setShowAddModal(false);
            setNewTrip({
                route_name: '',
                departure_time: '',
                bus_id: buses[0]?.id || '',
                assistant_id: muavinler[0]?.id || '',
                status: 'scheduled',
                stops: [
                    { location_name: '', stop_order: 1, planned_arrival: '' },
                    { location_name: '', stop_order: 2, planned_arrival: '' }
                ]
            });
        } else {
            alert(res.error);
        }
        setActionLoading(false);
    };

    const addStop = () => {
        setNewTrip(prev => ({
            ...prev,
            stops: [...prev.stops, { location_name: '', stop_order: prev.stops.length + 1, planned_arrival: '' }]
        }));
    };

    const updateStop = (index: number, field: string, value: any) => {
        const updatedStops = [...newTrip.stops];
        updatedStops[index] = { ...updatedStops[index], [field]: value };
        setNewTrip({ ...newTrip, stops: updatedStops });
    };

    const handleEditTrip = async (tripId: string) => {
        setEditingTripId(tripId);
        const trip = trips.find(t => t.id === tripId);
        if (!trip) return;

        const stopsRes = await getTripStopsAction(tripId);
        const tripStops = stopsRes.stops || [];

        setNewTrip({
            route_name: trip.route_name,
            departure_time: trip.departure_time ? new Date(trip.departure_time).toISOString().slice(0, 16) : '',
            bus_id: trip.bus_id || buses[0]?.id || '',
            assistant_id: trip.assistant_id || muavinler[0]?.id || '',
            status: trip.status || 'scheduled',
            stops: tripStops.length > 0 ? tripStops.map((s: any) => ({
                id: s.id,
                location_name: s.location_name,
                stop_order: s.stop_order,
                planned_arrival: s.planned_arrival ? new Date(s.planned_arrival).toISOString().slice(0, 16) : ''
            })) : [
                { location_name: '', stop_order: 1, planned_arrival: '' },
                { location_name: '', stop_order: 2, planned_arrival: '' }
            ]
        });
        setShowEditModal(true);
    };

    const handleUpdateTrip = async () => {
        if (!editingTripId || !newTrip.route_name || !newTrip.departure_time) {
            alert('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }
        setActionLoading(true);
        const res = await updateTripAction(editingTripId, {
            ...newTrip,
            stops: newTrip.stops.map(s => ({
                ...s,
                planned_arrival: s.planned_arrival || newTrip.departure_time
            }))
        });
        if (res.success) {
            await fetchData();
            setShowEditModal(false);
            setEditingTripId(null);
        } else {
            alert(res.error);
        }
        setActionLoading(false);
    };

    const handleDeleteTrip = async (tripId: string) => {
        if (!confirm('Bu seferi silmek istediğinize emin misiniz?')) return;
        setActionLoading(true);
        const res = await deleteTripAction(tripId);
        if (res.success) {
            await fetchData();
        } else {
            alert(res.error);
        }
        setActionLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-white text-2xl font-bold">Sefer Yönetimi</h2>
                    <p className="text-white/40 text-sm mt-1">{trips.length} aktif sefer kayıtlı</p>
                </div>
                <Button
                    className="bg-digibus-orange hover:bg-digibus-orange-dark text-white shadow-lg shadow-orange-500/20"
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Sefer Oluştur
                </Button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Güzergah veya plaka ara..."
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus:border-digibus-orange/50 transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    {statusFilters.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setStatusFilter(f.value)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === f.value
                                ? 'bg-digibus-orange text-white shadow-md'
                                : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-white/20">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-digibus-orange" />
                    <p className="font-bold uppercase tracking-widest text-xs">Seferler Yükleniyor...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredTrips.map((trip) => {
                        const badge = getStatusBadge(trip.status);
                        // In real DB, trip might already have stops joined or needs fetching
                        return (
                            <Card key={trip.id} className="bg-digibus-slate border-white/5 rounded-[24px] overflow-hidden hover:border-white/20 transition-all group">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-digibus-orange/10 group-hover:border-digibus-orange/20 transition-all">
                                                <Route className="w-6 h-6 text-white/40 group-hover:text-digibus-orange transition-all" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-white font-bold text-xl">{trip.route_name}</h3>
                                                    <Badge className={`${badge.className} border text-[10px] px-2 py-0 h-5`}>
                                                        {badge.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-white/30 text-xs mt-1 font-mono tracking-tight">{trip.travel_number} • {trip.company_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" className="text-white/20 hover:text-digibus-orange h-10 w-10 rounded-xl" onClick={() => handleEditTrip(trip.id)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" className="text-white/20 hover:text-red-400 h-10 w-10 rounded-xl" onClick={() => handleDeleteTrip(trip.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Bus className="w-5 h-5 text-white/20" />
                                            <div>
                                                <p className="text-white/20 text-[10px] uppercase font-black">Plaka</p>
                                                <p className="text-white/80 text-sm font-bold">{trip.plate_number || 'Bilinmiyor'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-white/20" />
                                            <div>
                                                <p className="text-white/20 text-[10px] uppercase font-black">Kalkış</p>
                                                <p className="text-white/80 text-sm font-bold">{formatTime(trip.departure_time)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-white/20" />
                                            <div>
                                                <p className="text-white/20 text-[10px] uppercase font-black">Muavin</p>
                                                <p className="text-white/80 text-sm font-bold">Atanmış</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-white/20" />
                                            <div>
                                                <p className="text-white/20 text-[10px] uppercase font-black">Doluluk</p>
                                                <p className="text-white/80 text-sm font-bold">-%-</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {!loading && filteredTrips.length === 0 && (
                <div className="text-center py-24 bg-white/[0.01] rounded-[32px] border border-dashed border-white/5">
                    <Route className="w-16 h-16 text-white/5 mx-auto mb-4" />
                    <p className="text-white/30 text-lg font-medium">Herhangi bir sefer bulunamadı.</p>
                </div>
            )}

            {/* Add Trip Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}>
                    <div className="bg-digibus-slate border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-digibus-slate p-8 border-b border-white/5 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-white font-black text-2xl flex items-center gap-3">
                                    <div className="w-10 h-10 bg-digibus-orange rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                        <Plus className="w-6 h-6 text-white" />
                                    </div>
                                    Yeni Sefer Tanımla
                                </h3>
                                <p className="text-white/30 text-sm mt-1">Sefer bilgilerini ve güzergah duraklarını girin.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-white/40 text-[10px] uppercase font-black ml-1 tracking-widest">Güzergah Adı</label>
                                    <Input
                                        placeholder="Örn: İstanbul - Ankara"
                                        value={newTrip.route_name}
                                        onChange={e => setNewTrip({ ...newTrip, route_name: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white h-12 rounded-2xl focus:border-digibus-orange/50 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-white/40 text-[10px] uppercase font-black ml-1 tracking-widest">Kalkış Saati</label>
                                    <Input
                                        type="datetime-local"
                                        value={newTrip.departure_time}
                                        onChange={e => setNewTrip({ ...newTrip, departure_time: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white h-12 rounded-2xl focus:border-digibus-orange/50 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-white/40 text-[10px] uppercase font-black ml-1 tracking-widest text-white/40">Otobüs Seçimi</label>
                                    <select
                                        value={newTrip.bus_id}
                                        onChange={e => setNewTrip({ ...newTrip, bus_id: e.target.value })}
                                        className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-digibus-orange font-bold transition-all"
                                    >
                                        <option value="" disabled className="bg-digibus-navy">Bir otobüs seçin</option>
                                        {buses.map(b => (
                                            <option key={b.id} value={b.id} className="bg-digibus-navy">{b.plate_number} ({b.model})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-white/40 text-[10px] uppercase font-black ml-1 tracking-widest">Muavin Seçimi</label>
                                    <select
                                        value={newTrip.assistant_id}
                                        onChange={e => setNewTrip({ ...newTrip, assistant_id: e.target.value })}
                                        className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-digibus-orange font-bold transition-all"
                                    >
                                        <option value="" disabled className="bg-digibus-navy">Bir muavin seçin</option>
                                        {muavinler.map(m => (
                                            <option key={m.id} value={m.id} className="bg-digibus-navy">{m.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Stops Management */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white/50 text-xs font-black uppercase tracking-[0.2em]">Güzergah Durakları</h4>
                                    <Button variant="ghost" size="sm" onClick={addStop} className="text-digibus-orange hover:text-digibus-orange hover:bg-digibus-orange/5 font-bold h-8 px-3 rounded-xl border border-digibus-orange/20">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Durak Ekle
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {newTrip.stops.map((stop, index) => (
                                        <div key={index} className="flex gap-3 items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex-1 space-y-1.5">
                                                <label className="text-[10px] text-white/20 font-black uppercase tracking-widest ml-1">{index + 1}. Durak</label>
                                                <Input
                                                    placeholder="Şehir / Terminal"
                                                    value={stop.location_name}
                                                    onChange={e => updateStop(index, 'location_name', e.target.value)}
                                                    className="bg-transparent border-white/10 text-white h-10 rounded-xl focus:border-digibus-orange/50 font-bold"
                                                />
                                            </div>
                                            <div className="w-48 space-y-1.5">
                                                <label className="text-[10px] text-white/20 font-black uppercase tracking-widest ml-1">Varış Saati</label>
                                                <Input
                                                    type="datetime-local"
                                                    value={stop.planned_arrival}
                                                    onChange={e => updateStop(index, 'planned_arrival', e.target.value)}
                                                    className="bg-transparent border-white/10 text-white h-10 rounded-xl focus:border-digibus-orange/50 font-bold"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 text-white/10 hover:text-red-400 rounded-xl hover:bg-red-400/5"
                                                onClick={() => {
                                                    const updated = newTrip.stops.filter((_, i) => i !== index);
                                                    setNewTrip({ ...newTrip, stops: updated });
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex gap-4">
                            <Button variant="ghost" className="flex-1 text-white/40 hover:text-white h-14 rounded-2xl font-bold" onClick={() => setShowAddModal(false)}>İptal</Button>
                            <Button
                                className="flex-1 bg-digibus-orange hover:bg-digibus-orange-dark text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20"
                                onClick={handleAddTrip}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Seferi Başlat'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Trip Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setShowEditModal(false)}>
                    <div className="bg-digibus-slate border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-digibus-slate p-8 border-b border-white/5 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-white font-black text-2xl flex items-center gap-3">
                                    <div className="w-10 h-10 bg-digibus-orange rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                        <Pencil className="w-5 h-5 text-white" />
                                    </div>
                                    Seferi Düzenle
                                </h3>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-white/40 text-[10px] uppercase font-black ml-1 tracking-widest">Güzergah Adı</label>
                                    <Input placeholder="Örn: İstanbul - Ankara" value={newTrip.route_name} onChange={e => setNewTrip({ ...newTrip, route_name: e.target.value })} className="bg-white/5 border-white/10 text-white h-12 rounded-2xl focus:border-digibus-orange/50 transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-white/40 text-[10px] uppercase font-black ml-1 tracking-widest">Kalkış Saati</label>
                                    <Input type="datetime-local" value={newTrip.departure_time} onChange={e => setNewTrip({ ...newTrip, departure_time: e.target.value })} className="bg-white/5 border-white/10 text-white h-12 rounded-2xl focus:border-digibus-orange/50 transition-all font-bold" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-white/40 text-[10px] uppercase font-black ml-1 tracking-widest">Otobüs</label>
                                    <select value={newTrip.bus_id} onChange={e => setNewTrip({ ...newTrip, bus_id: e.target.value })} className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-digibus-orange font-bold transition-all">
                                        {buses.map(b => (<option key={b.id} value={b.id} className="bg-digibus-navy">{b.plate_number} ({b.model})</option>))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-white/40 text-[10px] uppercase font-black ml-1 tracking-widest">Muavin</label>
                                    <select value={newTrip.assistant_id} onChange={e => setNewTrip({ ...newTrip, assistant_id: e.target.value })} className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-digibus-orange font-bold transition-all">
                                        <option value="" className="bg-digibus-navy">Muavin Yok</option>
                                        {muavinler.map(m => (<option key={m.id} value={m.id} className="bg-digibus-navy">{m.full_name}</option>))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-white/40 text-[10px] uppercase font-black ml-1 tracking-widest">Durum</label>
                                    <select value={newTrip.status} onChange={e => setNewTrip({ ...newTrip, status: e.target.value })} className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-digibus-orange font-bold transition-all">
                                        <option value="scheduled" className="bg-digibus-navy">Planlandı</option>
                                        <option value="on_time" className="bg-digibus-navy">Zamanında</option>
                                        <option value="delayed" className="bg-digibus-navy">Gecikmeli</option>
                                        <option value="completed" className="bg-digibus-navy">Tamamlandı</option>
                                    </select>
                                </div>
                            </div>

                            {/* Stops */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white/50 text-xs font-black uppercase tracking-[0.2em]">Güzergah Durakları</h4>
                                    <Button variant="ghost" size="sm" onClick={addStop} className="text-digibus-orange hover:text-digibus-orange hover:bg-digibus-orange/5 font-bold h-8 px-3 rounded-xl border border-digibus-orange/20">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Durak Ekle
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {newTrip.stops.map((stop, index) => (
                                        <div key={index} className="flex gap-3 items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex-1 space-y-1.5">
                                                <label className="text-[10px] text-white/20 font-black uppercase tracking-widest ml-1">{index + 1}. Durak</label>
                                                <Input placeholder="Şehir / Terminal" value={stop.location_name} onChange={e => updateStop(index, 'location_name', e.target.value)} className="bg-transparent border-white/10 text-white h-10 rounded-xl focus:border-digibus-orange/50 font-bold" />
                                            </div>
                                            <div className="w-48 space-y-1.5">
                                                <label className="text-[10px] text-white/20 font-black uppercase tracking-widest ml-1">Varış Saati</label>
                                                <Input type="datetime-local" value={stop.planned_arrival} onChange={e => updateStop(index, 'planned_arrival', e.target.value)} className="bg-transparent border-white/10 text-white h-10 rounded-xl focus:border-digibus-orange/50 font-bold" />
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-white/10 hover:text-red-400 rounded-xl hover:bg-red-400/5" onClick={() => { const updated = newTrip.stops.filter((_, i) => i !== index); setNewTrip({ ...newTrip, stops: updated }); }}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex gap-4">
                            <Button variant="ghost" className="flex-1 text-white/40 hover:text-white h-14 rounded-2xl font-bold" onClick={() => setShowEditModal(false)}>İptal</Button>
                            <Button className="flex-1 bg-digibus-orange hover:bg-digibus-orange-dark text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20" onClick={handleUpdateTrip} disabled={actionLoading}>
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Değişiklikleri Kaydet'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
