'use client';

import { useState, useMemo, useEffect } from 'react';
import { Download, Calendar, BarChart3, TrendingUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';
import { getSalesHistoryAction } from '@/app/actions/admin';
import type { SaleRecord } from '@/lib/types';

export default function SatisRaporuPage() {
    const user = useAuthStore(s => s.user);
    const companyId = user?.role === 'owner' ? null : (user?.companyId || null);

    const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const res = await getSalesHistoryAction(companyId);
        if (res.sales) setSalesHistory(res.sales);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [companyId]);

    // Filter by company context and date range
    const filteredSales = useMemo(() => {
        return salesHistory.filter(s => {
            const d = new Date(s.date);
            if (startDate && d < new Date(startDate)) return false;
            if (endDate && d > new Date(endDate + 'T23:59:59')) return false;
            return true;
        });
    }, [salesHistory, startDate, endDate]);

    // Aggregate by product
    const productSummary = useMemo(() => {
        const map: Record<string, { name: string; totalQty: number; totalRevenue: number; }> = {};
        filteredSales.forEach(s => {
            if (!map[s.productId]) {
                map[s.productId] = { name: s.productName, totalQty: 0, totalRevenue: 0 };
            }
            map[s.productId].totalQty += Number(s.quantity);
            map[s.productId].totalRevenue += Number(s.totalPrice);
        });
        return Object.entries(map)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.totalQty - a.totalQty);
    }, [filteredSales]);

    // Daily breakdown
    const dailyBreakdown = useMemo(() => {
        const map: Record<string, { date: string; totalSales: number; totalRevenue: number; topProduct: string; topQty: number; }> = {};
        filteredSales.forEach(s => {
            const day = new Date(s.date).toLocaleDateString('tr-TR');
            if (!map[day]) {
                map[day] = { date: day, totalSales: 0, totalRevenue: 0, topProduct: '', topQty: 0 };
            }
            map[day].totalSales += Number(s.quantity);
            map[day].totalRevenue += Number(s.totalPrice);
        });
        // Find top product per day
        Object.keys(map).forEach(day => {
            const dayProducts: Record<string, number> = {};
            filteredSales.filter(s => new Date(s.date).toLocaleDateString('tr-TR') === day).forEach(s => {
                dayProducts[s.productName] = (dayProducts[s.productName] || 0) + Number(s.quantity);
            });
            const top = Object.entries(dayProducts).sort((a, b) => b[1] - a[1])[0];
            if (top) {
                map[day].topProduct = top[0];
                map[day].topQty = top[1];
            }
        });
        return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
    }, [filteredSales]);

    const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
    const totalItems = filteredSales.reduce((sum, s) => sum + Number(s.quantity), 0);

    const handleExcelDownload = () => {
        const headers = 'Tarih,Ürün,Adet,Birim Fiyat (₺),Toplam (₺)\n';
        const rows = filteredSales.map(s =>
            `${new Date(s.date).toLocaleString('tr-TR')},${s.productName},${s.quantity},${Number(s.unitPrice).toFixed(2)},${Number(s.totalPrice).toFixed(2)}`
        ).join('\n');

        const summaryText = '\n\n--- GÜNLÜK ÖZET ---\nTarih,Toplam Satış,Toplam Gelir (₺),En Çok Satan,Adet\n' +
            dailyBreakdown.map(d => `${d.date},${d.totalSales},${d.totalRevenue.toFixed(2)},${d.topProduct},${d.topQty}`).join('\n');

        const csv = headers + rows + summaryText;
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digibus-satis-raporu-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white">Satış Raporu</h2>
                    <p className="text-white/40 text-sm mt-1">Market satışlarını analiz edin ve Excel olarak indirin</p>
                </div>
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    onClick={handleExcelDownload}
                    disabled={filteredSales.length === 0 || loading}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Excel İndir
                </Button>
            </div>

            <Card className="bg-digibus-slate border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <Calendar className="w-5 h-5 text-digibus-orange" />
                    <div className="flex items-center gap-2">
                        <label className="text-white/50 text-sm">Başlangıç:</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="bg-white/5 border-white/10 text-white w-44 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-white/50 text-sm">Bitiş:</label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="bg-white/5 border-white/10 text-white w-44 h-9"
                        />
                    </div>
                    {(startDate || endDate) && (
                        <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-white/30 hover:text-white text-xs underline">
                            Filtreyi temizle
                        </button>
                    )}
                </div>
            </Card>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/20">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>Raporlar hazırlanıyor...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-digibus-slate border-white/5 p-5 rounded-2xl">
                            <p className="text-white/40 text-sm">Toplam Satış</p>
                            <p className="text-2xl font-bold text-white mt-1">{totalItems}</p>
                        </Card>
                        <Card className="bg-digibus-slate border-white/5 p-5 rounded-2xl">
                            <p className="text-white/40 text-sm">Toplam Gelir</p>
                            <p className="text-2xl font-bold text-digibus-orange mt-1">₺{totalRevenue.toFixed(2)}</p>
                        </Card>
                        <Card className="bg-digibus-slate border-white/5 p-5 rounded-2xl">
                            <p className="text-white/40 text-sm">Ürün Çeşidi</p>
                            <p className="text-2xl font-bold text-white mt-1">{productSummary.length}</p>
                        </Card>
                        <Card className="bg-digibus-slate border-white/5 p-5 rounded-2xl">
                            <p className="text-white/40 text-sm">En Çok Satan</p>
                            <p className="text-lg font-bold text-digibus-acid mt-1 truncate">{productSummary[0]?.name || '-'}</p>
                        </Card>
                    </div>

                    <Card className="bg-digibus-slate border-white/5 rounded-2xl p-6 overflow-hidden">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-digibus-orange" />
                            Ürün Bazlı Satışlar
                        </h3>
                        {productSummary.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left text-white/30 font-medium py-3 px-2">#</th>
                                            <th className="text-left text-white/30 font-medium py-3 px-2">Ürün</th>
                                            <th className="text-left text-white/30 font-medium py-3 px-2">Toplam Adet</th>
                                            <th className="text-left text-white/30 font-medium py-3 px-2">Toplam Gelir</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {productSummary.map((p, i) => (
                                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3 px-2 text-white/30">{i + 1}</td>
                                                <td className="py-3 px-2 text-white font-medium">{p.name}</td>
                                                <td className="py-3 px-2 text-white/70">{p.totalQty}</td>
                                                <td className="py-3 px-2 text-digibus-orange font-mono">₺{p.totalRevenue.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-white/30 py-8 italic">Henüz satış kaydı bulunamadı.</p>
                        )}
                    </Card>

                    {dailyBreakdown.length > 0 && (
                        <Card className="bg-digibus-slate border-white/5 rounded-2xl p-6 overflow-hidden">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-digibus-acid" />
                                Günlük Analiz
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left text-white/30 font-medium py-3 px-2">Tarih</th>
                                            <th className="text-left text-white/30 font-medium py-3 px-2">Satış Adedi</th>
                                            <th className="text-left text-white/30 font-medium py-3 px-2">Gelir</th>
                                            <th className="text-left text-white/30 font-medium py-3 px-2">En Çok Satan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {dailyBreakdown.map((d) => (
                                            <tr key={d.date} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3 px-2 text-white font-medium">{d.date}</td>
                                                <td className="py-3 px-2 text-white/70">{d.totalSales}</td>
                                                <td className="py-3 px-2 text-digibus-orange font-mono">₺{d.totalRevenue.toFixed(2)}</td>
                                                <td className="py-3 px-2">
                                                    <Badge className="bg-digibus-acid/10 text-digibus-acid border-digibus-acid/20 text-xs font-normal">
                                                        {d.topProduct} ({d.topQty})
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
