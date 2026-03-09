'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Copy, Check, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, isOwner } from '@/lib/auth-store';
import { getMuavinlerAction, getCompaniesAction, createMuavinAction, deleteUserAction } from '@/app/actions/admin';
import type { Company } from '@/lib/types';

export default function MuavinlerPage() {
    const { user } = useAuthStore();
    const companyId = user?.role === 'owner' ? null : (user?.companyId || null);
    const userIsOwner = isOwner(user);

    const [muavinler, setMuavinler] = useState<any[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [muavinRes, compRes] = await Promise.all([
            getMuavinlerAction(companyId),
            userIsOwner ? getCompaniesAction() : Promise.resolve({ companies: [] })
        ]);

        if (muavinRes.muavinler) setMuavinler(muavinRes.muavinler);
        if (compRes.companies) setCompanies(compRes.companies);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [companyId]);

    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [createdAccount, setCreatedAccount] = useState<any | null>(null);
    const [copied, setCopied] = useState('');
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (userIsOwner && companies.length > 0) {
            setSelectedCompany(companies[0].id);
        } else if (companyId) {
            setSelectedCompany(companyId);
        }
    }, [companies, companyId, userIsOwner]);

    const generateUsername = (compId: string) => {
        const company = userIsOwner ? companies.find(c => c.id === compId) : { slug: user?.companyName?.toLowerCase().replace(/\s+/g, '-') || 'digibus' };
        const slug = company?.slug || 'digibus';
        const count = muavinler.filter(m => m.company_id === compId).length + 1;
        return `${slug}-${String(count).padStart(3, '0')}`;
    };

    const generatePassword = () => {
        return `DG${Math.floor(1000 + Math.random() * 9000)}`;
    };

    const handleCreate = async () => {
        if (!newName.trim() || !selectedCompany) return;

        setActionLoading(true);
        setError('');

        const username = generateUsername(selectedCompany);
        const password = generatePassword();

        const result = await createMuavinAction({
            fullName: newName.trim(),
            username,
            password_hash: password,
            companyId: selectedCompany
        });

        if (result.error) {
            setError(result.error);
            setActionLoading(false);
            return;
        }

        // Success - result.user actually has password_hash which is what we need for the success display
        const account = { ...result.user, password: password }; // Keep plain password for display once
        await fetchData();
        setCreatedAccount(account);
        setNewName('');
        setActionLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu muavin hesabını silmek istediğinize emin misiniz?')) return;

        const result = await deleteUserAction(id);
        if (result.success) {
            await fetchData();
        } else {
            alert(result.error);
        }
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Muavin Yönetimi</h2>
                    <p className="text-white/40 text-sm mt-1">Muavin hesaplarını oluşturun ve yönetin</p>
                </div>
                <Button
                    className="bg-digibus-orange hover:bg-digibus-orange-dark text-white shadow-[0_0_15px_rgba(255,107,53,0.3)]"
                    onClick={() => { setShowModal(true); setCreatedAccount(null); setError(''); }}
                    disabled={loading}
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Muavin Ekle
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/20">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>Muavinler yükleniyor...</p>
                </div>
            ) : (
                <Card className="bg-digibus-slate border-white/5 rounded-2xl p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left text-white/30 font-medium py-3 px-2">Ad Soyad</th>
                                    <th className="text-left text-white/30 font-medium py-3 px-2">Kullanıcı Adı</th>
                                    <th className="text-left text-white/30 font-medium py-3 px-2">Şifre</th>
                                    <th className="text-left text-white/30 font-medium py-3 px-2">Şirket</th>
                                    <th className="text-left text-white/30 font-medium py-3 px-2">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {muavinler.map((m) => (
                                    <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-2 text-white font-medium">{m.full_name}</td>
                                        <td className="py-3 px-2">
                                            <code className="text-digibus-orange font-mono text-xs bg-digibus-orange/10 px-2 py-1 rounded">
                                                {m.username}
                                            </code>
                                        </td>
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-2">
                                                <code className="text-white/60 font-mono text-xs">
                                                    {showPasswords[m.id] ? m.password_hash : '••••••'}
                                                </code>
                                                <button
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                                                    className="text-white/30 hover:text-white/60"
                                                >
                                                    {showPasswords[m.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2">
                                            <Badge variant="outline" className="text-xs border-white/10 text-white/50">{m.company_name}</Badge>
                                        </td>
                                        <td className="py-3 px-2">
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className="text-red-400/60 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {muavinler.length === 0 && (
                        <p className="text-center text-white/30 py-8 italic font-light">Henüz muavin eklenmedi</p>
                    )}
                </Card>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-digibus-slate border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        {!createdAccount ? (
                            <>
                                <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-digibus-orange" />
                                    Yeni Muavin Ekle
                                </h3>

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Ad Soyad</label>
                                        <Input
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder="Muavin adı soyadı"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11"
                                        />
                                    </div>

                                    {userIsOwner && (
                                        <div>
                                            <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Şirket</label>
                                            <select
                                                value={selectedCompany}
                                                onChange={e => setSelectedCompany(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 text-sm h-11 focus:outline-none focus:ring-1 focus:ring-digibus-orange"
                                            >
                                                {companies.map(c => (
                                                    <option key={c.id} value={c.id} className="bg-digibus-navy">{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {!userIsOwner && (
                                        <div>
                                            <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Şirket</label>
                                            <div className="w-full bg-white/5 border border-white/10 text-white/40 rounded-md px-3 py-2 text-sm h-11 flex items-center">
                                                {user?.companyName}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <Button variant="ghost" className="flex-1 text-white/50 hover:text-white" onClick={() => setShowModal(false)}>İptal</Button>
                                        <Button
                                            className="flex-1 bg-digibus-orange hover:bg-digibus-orange-dark text-white font-semibold"
                                            onClick={handleCreate}
                                            disabled={actionLoading || !newName.trim() || !selectedCompany}
                                        >
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Oluştur'}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                                    <Check className="w-6 h-6 text-green-400" />
                                    Muavin Oluşturuldu!
                                </h3>
                                <p className="text-white/40 text-sm mb-6">Bu bilgileri muavine iletin:</p>
                                <div className="space-y-4 bg-white/5 rounded-2xl p-5 border border-white/5">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <span className="text-white/50 text-sm">Ad Soyad</span>
                                        <span className="text-white font-medium">{createdAccount.full_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <span className="text-white/50 text-sm">Kullanıcı Adı</span>
                                        <div className="flex items-center gap-2">
                                            <code className="text-digibus-orange font-mono bg-digibus-orange/10 px-2 py-0.5 rounded text-sm">{createdAccount.username}</code>
                                            <button onClick={() => handleCopy(createdAccount.username, 'user')} className="text-white/30 hover:text-white transition-colors">
                                                {copied === 'user' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/50 text-sm">Şifre</span>
                                        <div className="flex items-center gap-2">
                                            <code className="text-digibus-acid font-mono font-bold bg-digibus-acid/10 px-2 py-0.5 rounded text-sm">{createdAccount.password}</code>
                                            <button onClick={() => handleCopy(createdAccount.password, 'pass')} className="text-white/30 hover:text-white transition-colors">
                                                {copied === 'pass' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-6 bg-digibus-orange hover:bg-digibus-orange-dark text-white font-bold h-12 rounded-xl transition-all" onClick={() => setShowModal(false)}>Anladım, Kapat</Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

