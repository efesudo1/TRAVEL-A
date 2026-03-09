'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Users, Route, Award, Crown, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore, isOwner } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { getCompaniesAction, getAdminsAction, createCompanyAction } from '@/app/actions/admin';
import type { Company } from '@/lib/types';

export default function SirketlerPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newCompany, setNewCompany] = useState({
        name: '',
        slug: '',
        theme_colors: { primary: '#FF6B35', secondary: '#0A1628' },
        adminName: '',
        adminEmail: '',
        adminPassword: ''
    });

    const fetchData = async () => {
        setLoading(true);
        const [companiesRes, adminsRes] = await Promise.all([
            getCompaniesAction(),
            getAdminsAction()
        ]);

        if (companiesRes.companies) setCompanies(companiesRes.companies);
        if (adminsRes.admins) setAdmins(adminsRes.admins);

        setLoading(false);
    };

    useEffect(() => {
        if (isOwner(user)) {
            fetchData();
        }
    }, [user]);

    const handleCreateCompany = async () => {
        if (!newCompany.name || !newCompany.adminEmail || !newCompany.adminPassword) return;

        setCreateLoading(true);
        setError('');

        const result = await createCompanyAction({
            name: newCompany.name,
            slug: newCompany.slug || newCompany.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            theme_colors: newCompany.theme_colors,
            admin: {
                email: newCompany.adminEmail,
                password_hash: newCompany.adminPassword,
                full_name: newCompany.adminName || `${newCompany.name} Admin`
            }
        });

        if (result.error) {
            setError(result.error);
            setCreateLoading(false);
            return;
        }

        // Success
        await fetchData();
        setShowAddModal(false);
        setNewCompany({
            name: '', slug: '', theme_colors: { primary: '#FF6B35', secondary: '#0A1628' },
            adminName: '', adminEmail: '', adminPassword: ''
        });
        setCreateLoading(false);
    };

    if (!isOwner(user)) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Crown className="w-16 h-16 text-white/10 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Erişim Engellendi</h2>
                <p className="text-white/40">Bu sayfayı sadece God Mode yetkisine sahip kullanıcılar görebilir.</p>
                <Button className="mt-6 bg-white/10 text-white" onClick={() => router.push('/dashboard')}>Dashboard'a Dön</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-amber-400" />
                        Şirket Yönetimi
                    </h2>
                    <p className="text-white/40 text-sm mt-1">Sistemdeki tüm şirketleri ve adminlerini yönetin</p>
                </div>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]" onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Şirket Ekle
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/20">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>Şirketler yükleniyor...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {companies.map(company => {
                        const companyAdmin = admins.find(a => a.company_id === company.id);

                        return (
                            <Card key={company.id} className="bg-digibus-slate border-white/5 p-6 rounded-2xl flex flex-col hover:border-amber-500/20 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center shadow-inner">
                                            <Building2 className="w-6 h-6 text-white/70" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{company.name}</h3>
                                            <p className="text-white/40 text-sm">{company.slug}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-3 mb-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <Crown className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-xs">Şirket Admini</p>
                                        <p className="text-white text-sm font-medium">{companyAdmin?.full_name || 'Atanmamış'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mt-auto">
                                    <div className="bg-white/[0.02] border border-white/[0.03] rounded-xl p-3 text-center">
                                        <Route className="w-4 h-4 text-digibus-orange mx-auto mb-1 flex-shrink-0" />
                                        <p className="text-white font-bold">-</p>
                                        <p className="text-white/30 text-[10px] uppercase">Sefer</p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.03] rounded-xl p-3 text-center">
                                        <Users className="w-4 h-4 text-blue-400 mx-auto mb-1 flex-shrink-0" />
                                        <p className="text-white font-bold">-</p>
                                        <p className="text-white/30 text-[10px] uppercase">Kapasite</p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.03] rounded-xl p-3 text-center">
                                        <Award className="w-4 h-4 text-digibus-acid mx-auto mb-1 flex-shrink-0" />
                                        <p className="text-white font-bold">-</p>
                                        <p className="text-white/30 text-[10px] uppercase">Sadakat</p>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add Company Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-digibus-slate border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-amber-500" />
                                Yeni Şirket ve Admin Ekle
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-6">
                            {error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Company Details */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-amber-500/80 mb-2 border-b border-amber-500/10 pb-2">Şirket Bilgileri</h4>
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">Şirket Adı *</label>
                                        <Input placeholder="Örn: Pamukkale Turizm" value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">Şirket Slug (URL)</label>
                                        <Input placeholder="pamukkale-turizm" value={newCompany.slug} onChange={e => setNewCompany({ ...newCompany, slug: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-white/50 mb-1 block">Ana Renk</label>
                                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md p-1 pr-3">
                                                <input type="color" value={newCompany.theme_colors.primary} onChange={e => setNewCompany({ ...newCompany, theme_colors: { ...newCompany.theme_colors, primary: e.target.value } })} className="w-8 h-8 rounded shrink-0 cursor-pointer bg-transparent border-0 p-0" />
                                                <span className="text-white/70 text-xs font-mono">{newCompany.theme_colors.primary}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-white/50 mb-1 block">İkincil Renk</label>
                                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md p-1 pr-3">
                                                <input type="color" value={newCompany.theme_colors.secondary} onChange={e => setNewCompany({ ...newCompany, theme_colors: { ...newCompany.theme_colors, secondary: e.target.value } })} className="w-8 h-8 rounded shrink-0 cursor-pointer bg-transparent border-0 p-0" />
                                                <span className="text-white/70 text-xs font-mono">{newCompany.theme_colors.secondary}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Details */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-amber-500/80 mb-2 border-b border-amber-500/10 pb-2">İlk Admin Hesabı</h4>
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">Admin E-posta *</label>
                                        <Input type="email" placeholder="admin@pamukkale.com" value={newCompany.adminEmail} onChange={e => setNewCompany({ ...newCompany, adminEmail: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">Geçici Şifre *</label>
                                        <Input type="password" placeholder="••••••••" value={newCompany.adminPassword} onChange={e => setNewCompany({ ...newCompany, adminPassword: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">Admin Ad Soyad</label>
                                        <Input placeholder="Örn: Ali Yılmaz" value={newCompany.adminName} onChange={e => setNewCompany({ ...newCompany, adminName: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white">İptal</Button>
                            <Button onClick={handleCreateCompany} disabled={createLoading || !newCompany.name || !newCompany.adminEmail || !newCompany.adminPassword} className="bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                {createLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Oluşturuluyor...
                                    </div>
                                ) : 'Kaydet ve Oluştur'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

