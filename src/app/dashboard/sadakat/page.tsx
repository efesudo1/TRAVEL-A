'use client';

import { useState } from 'react';
import { Award, Search, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { demoLoyalty } from '@/lib/demo-data';
import { useAuthStore, isOwner } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

export default function SadakatPage() {
    const user = useAuthStore(s => s.user);
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredLoyalty = demoLoyalty.filter(l =>
        l.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.passengerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Award className="w-6 h-6 text-amber-400" />
                        Tüm Sadakat Puanları
                    </h2>
                    <p className="text-white/40 text-sm mt-1">Sistemdeki tüm yolcuların şirket bazlı sadakat durumları</p>
                </div>
            </div>

            <Card className="bg-digibus-slate border-white/5 rounded-2xl p-6">
                <div className="mb-6 relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                        placeholder="Yolcu veya şirket ara..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left py-3 px-4 text-white/40 font-medium">Yolcu</th>
                                <th className="text-left py-3 px-4 text-white/40 font-medium">E-posta</th>
                                <th className="text-left py-3 px-4 text-white/40 font-medium">Şirket</th>
                                <th className="text-left py-3 px-4 text-white/40 font-medium whitespace-nowrap">Mevcut Puan</th>
                                <th className="text-left py-3 px-4 text-white/40 font-medium whitespace-nowrap">Toplam Sefer</th>
                                <th className="text-left py-3 px-4 text-white/40 font-medium">Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLoyalty.map(record => {
                                const isFreeRide = record.pointsCount >= 7;
                                return (
                                    <tr key={record.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                                        <td className="py-4 px-4 text-white font-medium">{record.passengerName}</td>
                                        <td className="py-4 px-4 text-white/50">{record.passengerEmail}</td>
                                        <td className="py-4 px-4">
                                            <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-white/70 text-xs">
                                                {record.companyName}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-digibus-orange/10 border border-digibus-orange/20 flex items-center justify-center text-digibus-orange font-bold">
                                                    {record.pointsCount}
                                                </div>
                                                <span className="text-white/30 text-xs">/ 7</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-white/60 font-mono pl-8">{record.totalTrips}</td>
                                        <td className="py-4 px-4">
                                            {isFreeRide ? (
                                                <span className="text-digibus-acid text-xs font-bold border border-digibus-acid/30 bg-digibus-acid/10 px-2 py-1 rounded-full inline-flex items-center gap-1">
                                                    <Award className="w-3 h-3" /> Ücretsiz Kazandı
                                                </span>
                                            ) : (
                                                <span className="text-white/30 text-xs">Devam Ediyor</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredLoyalty.length === 0 && (
                    <div className="text-center py-12 text-white/30">
                        <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Kayıt bulunamadı.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
