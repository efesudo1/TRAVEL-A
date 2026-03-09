'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Trash2, Pencil, Check, X, Plus, Search, UserPlus, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, isOwner } from '@/lib/auth-store';
import { getBookingsAction, getTripsAction, createBookingAction, updateBookingAction, deleteBookingAction } from '@/app/actions/admin';
import type { Booking, Trip } from '@/lib/types';

export default function YolcularPage() {
    const user = useAuthStore(s => s.user);
    const companyId = user?.role === 'owner' ? null : (user?.companyId || null);
    const userIsOwner = isOwner(user);

    const [passengers, setPassengers] = useState<any[]>([]);
    const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPassenger, setNewPassenger] = useState({
        passenger_name: '',
        passenger_surname: '',
        passenger_phone: '',
        passenger_email: '',
        pnr_code: '',
        seat_number: '',
        trip_id: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        setLoading(true);
        const [bookRes, tripRes] = await Promise.all([
            getBookingsAction(companyId),
            getTripsAction(companyId)
        ]);

        if (bookRes.bookings) setPassengers(bookRes.bookings);
        if (tripRes.trips) {
            setAvailableTrips(tripRes.trips);
            if (tripRes.trips.length > 0 && !newPassenger.trip_id) {
                setNewPassenger(prev => ({ ...prev, trip_id: tripRes.trips[0].id }));
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [companyId]);

    const filtered = useMemo(() => passengers.filter(p => {
        const term = searchTerm.toLowerCase();
        return (
            (p.passenger_name || '').toLowerCase().includes(term) ||
            (p.passenger_surname || '').toLowerCase().includes(term) ||
            (p.pnr_code || '').toLowerCase().includes(term)
        );
    }), [passengers, searchTerm]);

    const handleEdit = (p: any) => {
        setEditId(p.id);
        setEditData({ ...p });
    };

    const handleSaveEdit = async () => {
        if (!editId) return;
        setActionLoading(true);
        const result = await updateBookingAction(editId, editData);
        if (result.success) {
            await fetchData();
            setEditId(null);
        } else {
            alert(result.error);
        }
        setActionLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu yolcu kaydını silmek istediğinize emin misiniz?')) return;
        setActionLoading(true);
        const result = await deleteBookingAction(id);
        if (result.success) {
            await fetchData();
        } else {
            alert(result.error);
        }
        setActionLoading(false);
    };

    const handleAdd = async () => {
        if (!newPassenger.passenger_name || !newPassenger.trip_id) return;

        setActionLoading(true);
        const result = await createBookingAction({
            ...newPassenger,
            seat_number: newPassenger.seat_number ? parseInt(newPassenger.seat_number) : null,
            pnr_code: newPassenger.pnr_code || `PNR${Math.floor(100 + Math.random() * 900)}`
        });

        if (result.success) {
            await fetchData();
            setShowAddModal(false);
            setNewPassenger({
                passenger_name: '',
                passenger_surname: '',
                passenger_phone: '',
                passenger_email: '',
                pnr_code: '',
                seat_number: '',
                trip_id: availableTrips[0]?.id || ''
            });
        } else {
            alert(result.error);
        }
        setActionLoading(false);
    };

    const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const text = ev.target?.result as string;
            const lines = text.split('\n').filter(l => l.trim());

            setActionLoading(true);
            let successCount = 0;

            // Skip header row
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(/[,;\t]/);
                if (cols.length >= 4) {
                    await createBookingAction({
                        passenger_name: cols[0]?.trim() || '',
                        passenger_surname: cols[1]?.trim() || null,
                        passenger_phone: cols[2]?.trim() || null,
                        pnr_code: cols[3]?.trim() || `PNR${Math.floor(100 + Math.random() * 900)}`,
                        trip_id: cols[4]?.trim() || availableTrips[0]?.id || '',
                        seat_number: cols[5] ? parseInt(cols[5].trim()) : null,
                        passenger_email: cols[6]?.trim() || null,
                    });
                    successCount++;
                }
            }

            if (successCount > 0) {
                await fetchData();
                alert(`${successCount} yolcu başarıyla içe aktarıldı.`);
            }
            setActionLoading(false);
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white">Yolcu Yönetimi</h2>
                    <p className="text-white/40 text-sm mt-1">Yolcuları ekleyin, düzenleyin veya Excel ile içe aktarın</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleExcelImport}
                        accept=".csv,.tsv,.txt,.xlsx"
                        className="hidden"
                        id="excel-import"
                    />
                    <Button
                        variant="outline"
                        className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading || actionLoading}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Excel İçe Aktar
                    </Button>
                    <Button
                        className="bg-digibus-orange hover:bg-digibus-orange-dark text-white shadow-[0_0_15px_rgba(255,107,53,0.3)]"
                        onClick={() => setShowAddModal(true)}
                        disabled={loading || actionLoading}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Yolcu Ekle
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                    placeholder="İsim veya PNR ile ara..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus:border-digibus-orange/50 transition-colors"
                />
            </div>

            {/* Excel format info */}
            <Card className="bg-blue-500/5 border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-400 text-sm font-medium mb-1">Excel / CSV Formatı</p>
                <p className="text-white/40 text-xs">Sütunlar: Ad, Soyad, Telefon, PNR, Sefer ID, Koltuk No, E-posta (virgül veya tab ile ayrılmış)</p>
            </Card>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/20">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>Yolcular yükleniyor...</p>
                </div>
            ) : (
                <Card className="bg-digibus-slate border-white/5 rounded-2xl p-6 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left text-white/30 font-medium py-3 px-2">Ad</th>
                                    <th className="text-left text-white/30 font-medium py-3 px-2">Soyad</th>
                                    <th className="text-left text-white/30 font-medium py-3 px-2">PNR</th>
                                    <th className="text-left text-white/30 font-medium py-3 px-2">Sefer No</th>
                                    <th className="text-left text-white/30 font-medium py-3 px-2">Güzergah</th>
                                    <th className="text-left text-white/30 font-medium py-3 px-2">Koltuk</th>
                                    <th className="text-left text-white/30 font-medium py-3 px-2">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                        {editId === p.id ? (
                                            <>
                                                <td className="py-2 px-1"><Input value={editData.passenger_name || ''} onChange={e => setEditData({ ...editData, passenger_name: e.target.value })} className="bg-white/5 border-white/10 text-white text-xs h-8" /></td>
                                                <td className="py-2 px-1"><Input value={editData.passenger_surname || ''} onChange={e => setEditData({ ...editData, passenger_surname: e.target.value })} className="bg-white/5 border-white/10 text-white text-xs h-8" /></td>
                                                <td className="py-2 px-1"><Input value={editData.pnr_code || ''} onChange={e => setEditData({ ...editData, pnr_code: e.target.value })} className="bg-white/5 border-white/10 text-white text-xs h-8" /></td>
                                                <td className="py-3 px-2 text-white/40 font-mono text-xs">{p.travel_number}</td>
                                                <td className="py-3 px-2 text-white/50 text-xs">{p.route_name}</td>
                                                <td className="py-2 px-1"><Input value={editData.seat_number?.toString() || ''} onChange={e => setEditData({ ...editData, seat_number: parseInt(e.target.value) || null })} className="bg-white/5 border-white/10 text-white text-xs h-8 w-16" /></td>
                                                <td className="py-2 px-1 flex gap-2">
                                                    <button onClick={handleSaveEdit} className="text-green-400 hover:scale-110 transition-transform"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditId(null)} className="text-red-400 hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-3 px-2 text-white font-medium">{p.passenger_name}</td>
                                                <td className="py-3 px-2 text-white/70">{p.passenger_surname || '-'}</td>
                                                <td className="py-3 px-2"><code className="text-digibus-orange font-mono text-xs bg-digibus-orange/10 px-2 py-0.5 rounded">{p.pnr_code}</code></td>
                                                <td className="py-3 px-2 text-white/40 font-mono text-xs">{p.travel_number}</td>
                                                <td className="py-3 px-2 text-white/50 text-xs">{p.route_name}</td>
                                                <td className="py-3 px-2 text-white/60">{p.seat_number || '-'}</td>
                                                <td className="py-3 px-2">
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEdit(p)} className="text-blue-400/60 hover:text-blue-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(p.id)} className="text-red-400/60 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && <p className="text-center text-white/30 py-8 italic">Yolcu bulunamadı</p>}
                    <div className="mt-4 pt-3 border-t border-white/5 text-white/20 text-xs flex justify-between items-center">
                        <span>Toplam: {filtered.length} yolcu</span>
                        {userIsOwner && <span className="text-white/40 italic">God Mode: Tüm şirketlerin yolcularını görüyorsunuz</span>}
                    </div>
                </Card>
            )}

            {/* Add Passenger Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-digibus-slate border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                            <UserPlus className="w-6 h-6 text-digibus-orange" />
                            Yeni Yolcu Ekle
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-white/40 text-xs uppercase tracking-wider ml-1">Ad</label>
                                    <Input placeholder="Ad" value={newPassenger.passenger_name} onChange={e => setNewPassenger({ ...newPassenger, passenger_name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-white/40 text-xs uppercase tracking-wider ml-1">Soyad</label>
                                    <Input placeholder="Soyad" value={newPassenger.passenger_surname} onChange={e => setNewPassenger({ ...newPassenger, passenger_surname: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-white/40 text-xs uppercase tracking-wider ml-1">Telefon</label>
                                    <Input placeholder="Telefon" value={newPassenger.passenger_phone} onChange={e => setNewPassenger({ ...newPassenger, passenger_phone: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-white/40 text-xs uppercase tracking-wider ml-1">Koltuk No</label>
                                    <Input placeholder="Koltuk No" value={newPassenger.seat_number} onChange={e => setNewPassenger({ ...newPassenger, seat_number: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-white/40 text-xs uppercase tracking-wider ml-1">E-posta</label>
                                <Input placeholder="E-posta" value={newPassenger.passenger_email} onChange={e => setNewPassenger({ ...newPassenger, passenger_email: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-white/40 text-xs uppercase tracking-wider ml-1">PNR Kodu</label>
                                <Input placeholder="PNR (Otomatik için boş bırakın)" value={newPassenger.pnr_code} onChange={e => setNewPassenger({ ...newPassenger, pnr_code: e.target.value.toUpperCase() })} className="bg-white/5 border-white/10 text-white uppercase" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-white/40 text-xs uppercase tracking-wider ml-1">Sefer</label>
                                <select
                                    value={newPassenger.trip_id}
                                    onChange={e => setNewPassenger({ ...newPassenger, trip_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-digibus-orange"
                                >
                                    {availableTrips.map(t => (
                                        <option key={t.id} value={t.id} className="bg-digibus-navy">{t.route_name} ({t.travel_number})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" className="flex-1 text-white/50 hover:text-white" onClick={() => setShowAddModal(false)}>İptal</Button>
                                <Button
                                    className="flex-1 bg-digibus-orange hover:bg-digibus-orange-dark text-white font-bold shadow-lg"
                                    onClick={handleAdd}
                                    disabled={actionLoading || !newPassenger.passenger_name || !newPassenger.trip_id}
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Yolcuyu Kaydet'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
