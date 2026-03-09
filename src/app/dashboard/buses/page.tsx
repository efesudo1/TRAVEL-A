'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Bus, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuthStore } from '@/lib/auth-store';
import { getBusesAction, createBusAction, updateBusAction, deleteBusAction } from '@/app/actions/admin';
import type { Bus as BusType } from '@/lib/types';

export default function BusesPage() {
    const user = useAuthStore(s => s.user);
    const companyId = user?.role === 'owner' ? null : (user?.companyId || null);

    const [buses, setBuses] = useState<BusType[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editBus, setEditBus] = useState<BusType | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Form state
    const [formPlate, setFormPlate] = useState('');
    const [formModel, setFormModel] = useState('');
    const [formCapacity, setFormCapacity] = useState('45');

    const fetchData = async () => {
        setLoading(true);
        const res = await getBusesAction(companyId);
        if (res.buses) setBuses(res.buses);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [companyId]);

    const filteredBuses = buses.filter(b =>
        b.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.model || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        setEditBus(null);
        setFormPlate('');
        setFormModel('');
        setFormCapacity('45');
        setDialogOpen(true);
    };

    const handleEdit = (bus: BusType) => {
        setEditBus(bus);
        setFormPlate(bus.plate_number);
        setFormModel(bus.model || '');
        setFormCapacity(String(bus.capacity));
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formPlate || !formModel || !formCapacity) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }

        setActionLoading(true);
        if (editBus) {
            const res = await updateBusAction(editBus.id, {
                plate_number: formPlate,
                model: formModel,
                capacity: parseInt(formCapacity)
            });
            if (res.success) {
                await fetchData();
                setDialogOpen(false);
            } else {
                alert(res.error);
            }
        } else {
            if (!companyId && user?.role !== 'owner') {
                alert('Şirket bilgisi bulunamadı.');
                setActionLoading(false);
                return;
            }
            const res = await createBusAction({
                plate_number: formPlate,
                model: formModel,
                capacity: parseInt(formCapacity),
                company_id: companyId || '' // Owners might need to select a company, but for now we fallback
            });
            if (res.success) {
                await fetchData();
                setDialogOpen(false);
            } else {
                alert(res.error);
            }
        }
        setActionLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu otobüsü silmek istediğinize emin misiniz?')) return;
        const res = await deleteBusAction(id);
        if (res.success) {
            await fetchData();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-white text-xl font-bold">Otobüs Yönetimi</h2>
                    <p className="text-white/40 text-sm">{buses.length} otobüs kayıtlı</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAdd} className="bg-digibus-orange hover:bg-digibus-orange-dark text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Otobüs
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-digibus-slate border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">{editBus ? 'Otobüs Düzenle' : 'Yeni Otobüs Ekle'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="text-white/50 text-sm mb-1 block">Plaka</label>
                                <Input
                                    value={formPlate}
                                    onChange={(e) => setFormPlate(e.target.value.toUpperCase())}
                                    placeholder="34 XX 1234"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                />
                            </div>
                            <div>
                                <label className="text-white/50 text-sm mb-1 block">Model</label>
                                <Input
                                    value={formModel}
                                    onChange={(e) => setFormModel(e.target.value)}
                                    placeholder="Mercedes Travego"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                />
                            </div>
                            <div>
                                <label className="text-white/50 text-sm mb-1 block">Kapasite</label>
                                <Input
                                    type="number"
                                    value={formCapacity}
                                    onChange={(e) => setFormCapacity(e.target.value)}
                                    placeholder="45"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                />
                            </div>
                            <Button onClick={handleSave} disabled={actionLoading} className="w-full bg-digibus-orange hover:bg-digibus-orange-dark text-white">
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {editBus ? 'Güncelle' : 'Ekle'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Plaka veya model ara..."
                    className="pl-10 bg-digibus-slate border-white/10 text-white placeholder:text-white/30"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-digibus-orange" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredBuses.map((bus) => (
                        <Card key={bus.id} className="bg-digibus-slate border-white/5 p-5 rounded-2xl hover:border-white/10 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-xl ${bus.is_active ? 'bg-digibus-orange/10' : 'bg-white/5'} flex items-center justify-center`}>
                                        <Bus className={`w-5 h-5 ${bus.is_active ? 'text-digibus-orange' : 'text-white/20'}`} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold font-mono">{bus.plate_number}</p>
                                        <p className="text-white/40 text-sm">{bus.model}</p>
                                    </div>
                                </div>
                                <div className="p-1">
                                    {bus.is_active ? (
                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 border text-xs">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Aktif
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-white/5 text-white/30 border-white/10 border text-xs">
                                            <XCircle className="w-3 h-3 mr-1" />
                                            Pasif
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <div className="flex items-center gap-4 text-xs text-white/30">
                                    <span>Kapasite: <span className="text-white/60 font-medium">{bus.capacity}</span></span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/30 hover:text-white hover:bg-white/5" onClick={() => handleEdit(bus)}>
                                        <Edit className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/30 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(bus.id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
