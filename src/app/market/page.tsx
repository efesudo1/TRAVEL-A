'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, ShoppingCart, Plus, Minus, Trash2, X,
    Coffee, Cookie, ChevronRight, ShoppingBag, Sparkles, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';
import { getSnackInventoryAction } from '@/app/actions/muavin';
import { createSnackOrderAction } from '@/app/actions/passenger';

const categoryLabels: Record<string, string> = {
    atistirmalik: 'Atıştırmalıklar',
    icecek: 'İçecekler',
};

const categoryIcons: Record<string, React.ReactNode> = {
    atistirmalik: <Cookie className="w-4 h-4" />,
    icecek: <Coffee className="w-4 h-4" />,
};

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
    const tripId = searchParams.get('tripId');
    const busId = searchParams.get('busId');
    const seatNumber = searchParams.get('seat') || '1';

    const { user } = useAuthStore();
    const [inventory, setInventory] = useState<any[]>([]);
    const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [ordering, setOrdering] = useState(false);

    useEffect(() => {
        const loadInventory = async () => {
            if (!tripId) {
                setLoading(false);
                return;
            }
            const res = await getSnackInventoryAction(tripId);
            if (res.inventory) setInventory(res.inventory);
            setLoading(false);
        };
        loadInventory();
    }, [tripId]);

    const addToCart = (product: any) => {
        const existing = cart.find(c => c.product.id === product.id);
        if (existing) {
            if (existing.quantity >= product.stock) {
                alert('Stokta daha fazla ürün yok.');
                return;
            }
            setCart(cart.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId: string) => {
        const existing = cart.find(c => c.product.id === productId);
        if (existing && existing.quantity > 1) {
            setCart(cart.map(c => c.product.id === productId ? { ...c, quantity: c.quantity - 1 } : c));
        } else {
            setCart(cart.filter(c => c.product.id !== productId));
        }
    };

    const handleConfirmOrder = async () => {
        if (!tripId || cart.length === 0) return;
        setOrdering(true);
        const tray = cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            totalPrice: Number(item.product.price) * item.quantity
        }));

        const res = await createSnackOrderAction(tripId, seatNumber, tray, user?.id);
        setOrdering(false);
        if (res.success) {
            setCart([]);
            setShowCart(false);
            alert('Siparişiniz muavine iletildi!');
            router.push(user ? '/yolcu' : '/');
        } else {
            alert(res.error || 'Sipariş oluşturulamadı.');
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const filteredSnacks = activeCategory
        ? inventory.filter((s) => s.category === activeCategory)
        : inventory;

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                <p className="text-gray-400 font-medium">Market Hazırlanıyor...</p>
            </div>
        );
    }

    if (!tripId) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="w-20 h-20 text-gray-200 mb-6" />
                <h1 className="text-xl font-bold text-gray-900 mb-2">Market Erişilemez</h1>
                <p className="text-gray-500 mb-8">Marketi kullanmak için aktif bir seferiniz olması gerekmektedir.</p>
                <Button onClick={() => router.push('/')} className="bg-orange-500 hover:bg-orange-600 rounded-2xl px-8">Ana Sayfa</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 relative pb-24">
            <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Otobüs Marketi</h1>
                            <p className="text-xs text-gray-400">Koltuk: {seatNumber}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowCart(true)} className="relative p-2.5 rounded-2xl bg-orange-50 text-orange-600">
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>

                <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === null ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}
                    >
                        Tümü
                    </button>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key === activeCategory ? null : key)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${activeCategory === key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                            {categoryIcons[key]} {label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 grid grid-cols-2 gap-4">
                {filteredSnacks.map((product) => {
                    const cartItem = cart.find(c => c.product.id === product.id);
                    const qty = cartItem ? cartItem.quantity : 0;
                    const isOutOfStock = product.stock <= 0;

                    return (
                        <div key={product.id} className={`bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm transition-all ${isOutOfStock ? 'opacity-50' : 'hover:shadow-md'}`}>
                            <div className="aspect-square bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-5xl relative">
                                {getEmoji(product.name)}
                                {isOutOfStock && <Badge className="absolute top-2 right-2 bg-red-500">Tükendi</Badge>}
                                {!isOutOfStock && <Badge variant="secondary" className="absolute top-2 right-2 bg-white/80">{product.stock} Adet</Badge>}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
                                <p className="text-orange-600 font-black text-lg mt-1">₺{Number(product.price).toFixed(2)}</p>

                                {qty > 0 ? (
                                    <div className="flex items-center justify-between bg-orange-50 rounded-2xl p-1 mt-3">
                                        <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"><Minus className="w-4 h-4 text-orange-600" /></button>
                                        <span className="font-bold text-orange-700">{qty}</span>
                                        <button onClick={() => addToCart(product)} disabled={qty >= product.stock} className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm disabled:opacity-30"><Plus className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <Button onClick={() => addToCart(product)} disabled={isOutOfStock} className="w-full mt-3 rounded-2xl bg-orange-500 hover:bg-orange-600 font-bold h-10">
                                        Ekle
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {cartCount > 0 && !showCart && (
                <div className="fixed bottom-6 left-4 right-4 z-40">
                    <button onClick={() => setShowCart(true)} className="max-w-xl mx-auto w-full bg-orange-600 text-white rounded-3xl p-5 flex items-center justify-between shadow-2xl shadow-orange-500/40">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><ShoppingCart className="w-6 h-6" /></div>
                            <div className="text-left">
                                <p className="font-bold text-lg">{cartCount} Ürün</p>
                                <p className="text-white/60 text-xs">Sepeti onayla</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black">₺{cartTotal.toFixed(2)}</span>
                            <ChevronRight className="w-6 h-6" />
                        </div>
                    </button>
                </div>
            )}

            {showCart && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
                    <div className="relative bg-white rounded-t-[40px] max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-8 flex items-center justify-between border-b">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <ShoppingCart className="text-orange-500" /> Sepetim
                            </h2>
                            <button onClick={() => setShowCart(false)} className="p-3 bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {cart.map(item => (
                                <div key={item.product.id} className="flex items-center gap-6 p-4 bg-gray-50 rounded-[32px]">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-sm">{getEmoji(item.product.name)}</div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{item.product.name}</h4>
                                        <p className="text-orange-600 font-black">₺{(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => removeFromCart(item.product.id)} className="w-10 h-10 rounded-2xl bg-white border flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                        <span className="w-6 text-center font-bold text-lg">{item.quantity}</span>
                                        <button onClick={() => addToCart(item.product)} disabled={item.quantity >= item.product.stock} className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center disabled:opacity-30"><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 border-t bg-gray-50">
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-gray-500 font-bold text-lg">Toplam</span>
                                <span className="text-4xl font-black text-gray-900">₺{cartTotal.toFixed(2)}</span>
                            </div>
                            <Button
                                disabled={ordering}
                                onClick={handleConfirmOrder}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-[32px] py-10 text-xl font-black shadow-xl shadow-orange-500/25"
                            >
                                {ordering ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                                SİPARİŞİ TAMAMLA
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PassengerMarketPage() {
    return (
        <Suspense fallback={null}>
            <MarketContent />
        </Suspense>
    );
}
