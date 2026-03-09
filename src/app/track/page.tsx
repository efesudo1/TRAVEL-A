'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bus, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TrackPage() {
    const [pnr, setPnr] = useState('');
    const router = useRouter();

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (pnr.trim()) {
            router.push(`/track/${pnr.trim().toUpperCase()}`);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-digibus-navy">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-digibus-orange/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
                {/* Animated dots */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/10 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${3 + Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-4">
                <button onClick={() => router.push('/')} className="flex items-center gap-2 group">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-digibus-orange/10 group-hover:bg-digibus-orange/20 transition-colors">
                        <Bus className="w-4 h-4 text-digibus-orange" />
                    </div>
                    <span className="text-white font-semibold">Digi<span className="text-digibus-orange">bus</span></span>
                </button>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-24 min-h-[80vh]">
                {/* Icon */}
                <div className="mb-8 relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-digibus-orange to-digibus-orange-dark flex items-center justify-center animate-pulse-glow">
                        <MapPin className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-digibus-acid rounded-full flex items-center justify-center animate-bounce">
                        <div className="w-2 h-2 bg-digibus-navy rounded-full" />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-3 animate-fade-in">
                    Yolculuğunuzu Takip Edin
                </h1>
                <p className="text-white/40 text-center max-w-md mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    PNR kodunuz ile otobüsünüzün anlık konumunu ve tahmini varış süresini öğrenin.
                </p>

                {/* PNR Search */}
                <form
                    onSubmit={handleTrack}
                    className="w-full max-w-md animate-fade-in"
                    style={{ animationDelay: '0.2s' }}
                >
                    <div className="glass-strong rounded-2xl p-2">
                        <div className="flex items-center gap-2">
                            <div className="pl-4">
                                <Search className="w-5 h-5 text-white/40" />
                            </div>
                            <Input
                                type="text"
                                placeholder="PNR kodu"
                                value={pnr}
                                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                                className="flex-1 bg-transparent border-0 text-white placeholder:text-white/30 text-lg focus-visible:ring-0 uppercase tracking-widest font-mono"
                                maxLength={6}
                                autoFocus
                                id="pnr-input"
                            />
                            <Button
                                type="submit"
                                className="bg-digibus-orange hover:bg-digibus-orange-dark text-white rounded-xl px-6 h-11 font-semibold"
                                disabled={!pnr.trim()}
                                id="track-btn"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Demo codes */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    {['DEMO01', 'DEMO03', 'DEMO04', 'DEMO05'].map((code) => (
                        <button
                            key={code}
                            onClick={() => router.push(`/track/${code}`)}
                            className="px-3 py-1.5 rounded-lg glass text-white/40 text-xs font-mono hover:text-digibus-orange hover:bg-white/10 transition-all"
                        >
                            {code}
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}
