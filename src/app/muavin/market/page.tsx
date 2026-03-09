'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Package, Coffee, Cookie, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSnackInventoryAction, updateSnackStockAction } from '@/app/actions/muavin';

const categoryIcons: Record<string, React.ReactNode> = {
    atistirmalik: <Cookie className="w-5 h-5" />,
    icecek: <Coffee className="w-5 h-5" />,
};

const categoryLabels: Record<string, string> = {
    atistirmalik: 'ATIŞTIMALIK',
    icecek: 'İÇECEK',
};

// Emoji representations based on product names
const getEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('çikolata')) return '🍫';
    if (n.includes('bisküvi')) return '🍪';
    if (n.includes('kraker')) return '🥨';
    if (n.includes('su')) return '💧';
    if (n.includes('çay')) return '🍵';
    if (n.includes('kahve')) return '☕';
    return '📦';
};

function MarketContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const busId = searchParams.get('busId');

    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const fetchData = async () => {
        if (!busId) return;
        setLoading(true);
        const res = await getSnackInventoryAction(busId);
        if (res.inventory) setInventory(res.inventory);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [busId]);

    const handleUpdateStock = async (productId: string, change: number) => {
        if (!busId) return;
        const res = await updateSnackStockAction(busId, productId, change);
        if (res.success) {
            await fetchData();
        }
    };

    const filteredSnacks = activeCategory
        ? inventory.filter((s) => s.category === activeCategory)
        : inventory;

    const totalStock = inventory.reduce((sum, s) => sum + Number(s.stock), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-digibus-acid">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-black uppercase tracking-widest text-sm">Market Verileri Yükleniyor...</p>
            </div>
        );
    }

    if (!busId) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <p className="text-white/40 mb-4 font-bold uppercase">Otobüs bilgisi bulunamadı.</p>
                <Button onClick={() => router.push('/muavin')} className="bg-digibus-acid text-black rounded-none font-bold uppercase border-2 border-black" style={{ boxShadow: '4px 4px 0px #fff' }}>Geri Dön</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="bg-black border-b-4 border-digibus-acid px-4 py-4 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push('/muavin')}
                        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">GERİ</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-digibus-acid rounded-none flex items-center justify-center">
                            <Package className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-black text-lg tracking-tight font-mono">MARKET YÖNETİMİ</span>
                    </div>
                </div>
            </header>

            <div className="px-4 py-3 bg-zinc-900 border-b-2 border-white/10 sticky top-[76px] z-40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-digibus-acid/10 border border-digibus-acid/30 px-3 py-1.5 shadow-[2px_2px_0px_theme(colors.digibus-acid.DEFAULT)]">
                            <span className="text-digibus-acid text-[10px] font-black uppercase tracking-widest block leading-none mb-1">
                                Toplam Stok
                            </span>
                            <span className="text-white font-mono font-black text-2xl leading-none">{totalStock}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 transition-all ${activeCategory === null
                                ? 'bg-digibus-acid text-black border-digibus-acid'
                                : 'border-white/20 text-white/50 hover:border-white/40'
                                }`}
                        >
                            Tümü
                        </button>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key === activeCategory ? null : key)}
                                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 transition-all ${activeCategory === key
                                    ? 'bg-digibus-acid text-black border-digibus-acid'
                                    : 'border-white/20 text-white/50 hover:border-white/40'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
                {filteredSnacks.map((product) => (
                    <div
                        key={product.id}
                        className="bg-zinc-900 border-4 border-white p-0 overflow-hidden"
                        style={{ boxShadow: '6px 6px 0px #FFFF33' }}
                    >
                        <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between border-b-2 border-white/10 text-[10px] font-bold">
                            <div className="flex items-center gap-2">
                                {categoryIcons[product.category]}
                                <span className="uppercase tracking-widest text-digibus-acid">{categoryLabels[product.category]}</span>
                            </div>
                            <span className="text-digibus-acid font-mono">₺{Number(product.price).toFixed(0)}</span>
                        </div>

                        <div className="p-5">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-5xl">{getEmoji(product.name)}</span>
                                    <div>
                                        <h3 className="font-black text-xl tracking-tighter uppercase">{product.name}</h3>
                                        <p className="text-white/20 text-[10px] font-mono mt-1">ID: {product.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-black border-2 border-digibus-acid p-4">
                                <div>
                                    <p className="text-digibus-acid text-[10px] font-black uppercase tracking-widest mb-1">
                                        Mevcut Stok
                                    </p>
                                    <p className="text-white font-mono font-black text-4xl">{product.stock}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleUpdateStock(product.id, -1)}
                                        disabled={product.stock === 0}
                                        className={`w-14 h-14 flex items-center justify-center border-4 font-black transition-all ${product.stock === 0
                                            ? 'border-white/5 text-white/5 cursor-not-allowed'
                                            : 'border-white bg-red-600 text-white hover:bg-red-500 active:translate-x-1 active:translate-y-1 active:shadow-none'
                                            }`}
                                        style={product.stock > 0 ? { boxShadow: '4px 4px 0px #000' } : {}}
                                    >
                                        <Minus className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStock(product.id, 1)}
                                        className="w-14 h-14 flex items-center justify-center border-4 border-black bg-digibus-acid text-black font-black
                    hover:bg-digibus-acid-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                                        style={{ boxShadow: '4px 4px 0px #000' }}
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSnacks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-white/20">
                    <Package className="w-16 h-16 mb-4 opacity-10" />
                    <p className="font-bold uppercase tracking-widest">Bu kategoride ürün bulunamadı</p>
                </div>
            )}
        </div>
    );
}

export default function MuavinMarketPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-digibus-acid">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-black uppercase tracking-widest text-sm">Yükleniyor...</p>
            </div>
        }>
            <MarketContent />
        </Suspense>
    );
}
