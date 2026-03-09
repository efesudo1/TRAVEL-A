'use client';

import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Bus, AlertTriangle, ShoppingBag, MapPin,
    Clock, CheckCircle2, HelpCircle, ChevronDown, ChevronUp,
    Hand, Plus, Minus, Package
} from 'lucide-react';
import { useState } from 'react';

interface StepCardProps {
    stepNumber: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    details?: string[];
}

function StepCard({ stepNumber, title, description, icon, color, details }: StepCardProps) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="bg-zinc-900 border-4 border-white mb-4"
            style={{ boxShadow: '5px 5px 0px ' + color }}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left p-5 flex items-start gap-4"
            >
                {/* Step Number */}
                <div
                    className="w-12 h-12 shrink-0 flex items-center justify-center font-black text-2xl font-mono border-2"
                    style={{ borderColor: color, color: color }}
                >
                    {stepNumber}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span style={{ color: color }}>{icon}</span>
                        <h3 className="font-black text-lg tracking-tight text-white">{title}</h3>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">{description}</p>
                </div>

                <div className="shrink-0 mt-1 text-white/30">
                    {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            {/* Expanded Details */}
            {open && details && (
                <div className="px-5 pb-5 border-t-2 border-white/10 pt-4">
                    <ul className="space-y-3">
                        {details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: color }} />
                                <span className="text-white/70 text-sm leading-relaxed">{detail}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function MuavinKullanimPage() {
    const router = useRouter();

    const steps: StepCardProps[] = [
        {
            stepNumber: 1,
            title: 'Giriş Yapın',
            description: 'Ana sayfadaki "Muavin Girişi" butonuna basarak sisteme girin.',
            icon: <Bus className="w-5 h-5" />,
            color: '#FFFF33',
            details: [
                'Tarayıcınızda (Chrome, Safari vb.) adres çubuğuna uygulama adresini yazın.',
                'Ana sayfada sağ üstte "Muavin Girişi" yazısına tıklayın.',
                'Size verilen kullanıcı adı ve şifre ile giriş yapın.',
                'Giriş yaptıktan sonra otomatik olarak muavin paneline yönlendirileceksiniz.',
            ],
        },
        {
            stepNumber: 2,
            title: 'Seferinizi Görün',
            description: 'Giriş yaptıktan sonra atandığınız güncel seferi ve durakları göreceksiniz.',
            icon: <MapPin className="w-5 h-5" />,
            color: '#FFFF33',
            details: [
                'Üstteki kutuda seferinizin adı yazılıdır (örneğin: İstanbul → Ankara).',
                '"Otobüs" bölümünde otobüsünüzün plaka numarası görünür.',
                '"Yolcu" bölümünde o anki yolcu sayısı gösterilir.',
                '"Sonraki" bölümünde bir sonraki durağın adı yazar.',
                'Altta yeşil çizgiyle duraklar sırayla gösterilir.',
            ],
        },
        {
            stepNumber: 3,
            title: 'Gecikme Bildirin',
            description: 'Büyük sarı "GECİKME BİLDİR" butonuna basarak gecikme süresi girin.',
            icon: <AlertTriangle className="w-5 h-5" />,
            color: '#EF4444',
            details: [
                'Eğer otobüs gecikmişse, ekrandaki büyük sarı "GECİKME BİLDİR" butonuna basın.',
                'Açılan ekranda tuşlarla gecikme süresini dakika olarak girin (örneğin 15 dakika).',
                '"Onayla" butonuna basın.',
                'Sistem otomatik olarak yolculara gecikme bildirecek ve tahmini varış sürelerini güncelleyecektir.',
                'Her durak geçişinde tekrar gecikme yaşanıyorsa yeniden bildirim yapmanız gerekir.',
            ],
        },
        {
            stepNumber: 4,
            title: 'Market Yönetimi — Stok Ekleyin',
            description: '"MARKET YÖNETİMİ" butonuna basarak atıştırmalık stoklarını yönetin.',
            icon: <ShoppingBag className="w-5 h-5" />,
            color: '#22C55E',
            details: [
                '"MARKET YÖNETİMİ" yazılı beyaz butona basın.',
                'Açılan ekranda tüm ürünleri (çikolata, bisküvi, su, çay vb.) göreceksiniz.',
                'Yanınızda bulunan her ürün için sarı "+" butonuna basın.',
                'Örneğin: 5 adet çikolata varsa, "+" butonuna 5 kez basın.',
                'Stok sayısı ekranda anlık olarak güncellenir.',
                'Eğer yanlış girerseniz, kırmızı "−" butonuyla azaltabilirsiniz.',
                'Yolcular yalnızca sizin eklediğiniz ürünleri satın alabilir.',
            ],
        },
        {
            stepNumber: 5,
            title: 'Durak Takibi',
            description: 'Hangi durakta olduğunuzu ve kalan süreyi ekrandan takip edin.',
            icon: <Clock className="w-5 h-5" />,
            color: '#FFFF33',
            details: [
                'Ekranın alt tarafında tüm duraklar sırayla gösterilir.',
                'Geçilmiş duraklar yeşil tik işaretiyle gösterilir.',
                'Bir sonraki durak büyük yazıyla vurgulanır.',
                '"Tahmini Varış" bölümünde kalan süre dakika olarak gösterilir.',
                'Gecikme bildirdiğinizde bu süreler otomatik güncellenir.',
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="bg-black border-b-4 border-digibus-acid px-4 py-4">
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
                            <HelpCircle className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-black text-lg tracking-tight font-mono">NASIL KULLANILIR</span>
                    </div>
                </div>
            </header>

            {/* Welcome Section */}
            <div className="p-4">
                <div
                    className="bg-zinc-900 border-4 border-digibus-acid p-6 mb-6"
                    style={{ boxShadow: '6px 6px 0px #FFFF33' }}
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-digibus-acid mx-auto mb-4 flex items-center justify-center">
                            <Hand className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="font-black text-2xl tracking-tight mb-2">
                            Hoş Geldiniz, Muavin!
                        </h1>
                        <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto">
                            Bu kılavuz size uygulamayı nasıl kullanacağınızı adım adım anlatmaktadır.
                            Her adıma tıklayarak detayları görebilirsiniz.
                        </p>
                    </div>
                </div>

                {/* Steps */}
                <div className="mb-6">
                    <h2 className="font-black text-sm uppercase tracking-widest text-digibus-acid mb-4 px-1">
                        Adım Adım Kullanım
                    </h2>
                    {steps.map((step) => (
                        <StepCard key={step.stepNumber} {...step} />
                    ))}
                </div>

                {/* Quick Tips */}
                <div
                    className="bg-zinc-900 border-4 border-white p-5 mb-6"
                    style={{ boxShadow: '5px 5px 0px #EF4444' }}
                >
                    <h2 className="font-black text-lg tracking-tight mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Önemli Hatırlatmalar
                    </h2>
                    <ul className="space-y-2">
                        {[
                            'Gecikme olduğunda mutlaka "GECİKME BİLDİR" butonunu kullanın.',
                            'Market stoğunu yolculuk başlamadan önce ekleyin.',
                            'Sorun yaşarsanız şirket yöneticinize başvurun.',
                            'Uygulama internet bağlantısı gerektirir.',
                            'Sayfayı yenilediğinizde stok bilgileri sıfırlanabilir.',
                        ].map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-red-500 font-mono font-bold text-sm mt-0.5">!</span>
                                <span className="text-white/60 text-sm">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => router.push('/muavin')}
                    className="w-full bg-digibus-acid text-black font-black text-xl uppercase tracking-wider
                     border-4 border-black flex items-center justify-center gap-3
                     hover:bg-digibus-acid-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all mb-8"
                    style={{ boxShadow: '6px 6px 0px #000', minHeight: '70px' }}
                >
                    <ArrowLeft className="w-6 h-6" />
                    PANELE DÖN
                </button>
            </div>
        </div>
    );
}
