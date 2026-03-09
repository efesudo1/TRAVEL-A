'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bus, MapPin, Search, Shield, Users, Zap, ArrowRight, BarChart3, Clock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HomePage() {
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
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-digibus-acid/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-digibus-orange/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-digibus-orange animate-pulse-glow">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Digi<span className="text-digibus-orange">bus</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/5"
            onClick={() => router.push('/login')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Girişi
          </Button>
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/5"
            onClick={() => router.push('/login?role=assistant')}
          >
            <Users className="w-4 h-4 mr-2" />
            Muavin Girişi
          </Button>
          <Button
            className="bg-digibus-orange hover:bg-digibus-orange-dark text-white"
            onClick={() => router.push('/market')}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Market
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-24 md:pt-24">
        {/* Badge */}
        <div className="mb-6 px-4 py-1.5 rounded-full glass text-sm text-digibus-orange font-medium flex items-center gap-2 animate-fade-in">
          <Zap className="w-3.5 h-3.5" />
          Gerçek Zamanlı Takip
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center max-w-4xl mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Yolculuğunuzu{' '}
          <span className="bg-gradient-to-r from-digibus-orange to-digibus-orange-light bg-clip-text text-transparent">
            Anlık Takip
          </span>{' '}
          Edin
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/50 text-center max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          PNR kodunuzla otobüsünüzün konumunu, tahmini varış süresini ve güzergah bilgilerini canlı olarak görüntüleyin.
        </p>

        {/* PNR Search Bar */}
        <form
          onSubmit={handleTrack}
          className="w-full max-w-lg animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="relative glass-strong rounded-2xl p-2 transition-all duration-300 hover:bg-white/[0.15]">
            <div className="flex items-center gap-2">
              <div className="pl-4">
                <Search className="w-5 h-5 text-white/40" />
              </div>
              <Input
                type="text"
                placeholder="PNR kodunuzu girin (örn: DEMO01)"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                className="flex-1 bg-transparent border-0 text-white placeholder:text-white/30 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 uppercase tracking-widest"
                maxLength={6}
                id="pnr-search"
              />
              <Button
                type="submit"
                size="lg"
                className="bg-digibus-orange hover:bg-digibus-orange-dark text-white rounded-xl px-6 font-semibold transition-all duration-200 hover:scale-105"
                disabled={!pnr.trim()}
                id="track-button"
              >
                Takip Et
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          <p className="text-center text-white/30 text-sm mt-3">
            Demo PNR kodları: DEMO01, DEMO02, DEMO03, DEMO04, DEMO05
          </p>
        </form>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 w-full max-w-4xl animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="glass rounded-2xl p-6 group hover:bg-white/[0.1] transition-all duration-300 cursor-default">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-digibus-orange/10 mb-4 group-hover:bg-digibus-orange/20 transition-colors">
              <MapPin className="w-6 h-6 text-digibus-orange" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Canlı Konum</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Otobüsünüzün anlık konumunu harita üzerinde takip edin. Güzergah ve durakları görüntüleyin.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 group hover:bg-white/[0.1] transition-all duration-300 cursor-default">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-digibus-acid/10 mb-4 group-hover:bg-digibus-acid/20 transition-colors">
              <Clock className="w-6 h-6 text-digibus-acid" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Dinamik ETA</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Trafik ve durak sürelerine göre güncellenen tahmini varış süresi. Gecikmeler anında bildirilir.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 group hover:bg-white/[0.1] transition-all duration-300 cursor-default">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-4 group-hover:bg-blue-500/20 transition-colors">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">7+1 Sadakat</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Her 7 yolculukta 1 ücretsiz bilet kazanın. Dijital damga sistemiyle puanlarınızı takip edin.
            </p>
          </div>

          {/* Market Button - Prominent */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => router.push('/market')}
              className="group glass-strong rounded-2xl px-8 py-4 flex items-center gap-4 hover:bg-white/[0.15] transition-all duration-300 mx-auto"
              id="market-button"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-digibus-orange/20 group-hover:bg-digibus-orange/30 transition-colors">
                <ShoppingBag className="w-6 h-6 text-digibus-orange" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-lg">Otobüs Marketi</h3>
                <p className="text-white/40 text-sm">Yolculuk boyunca atıştırmalık ve içecekler</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-digibus-orange transition-colors" />
            </button>
          </div>
        </div>

        {/* Mobile Auth Buttons */}
        <div className="flex md:hidden flex-col gap-3 mt-10 w-full max-w-sm">
          <Button
            variant="outline"
            className="w-full border-white/10 text-white/70 hover:text-white hover:bg-white/5 py-6"
            onClick={() => router.push('/login')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Girişi
          </Button>
          <Button
            variant="outline"
            className="w-full border-white/10 text-white/70 hover:text-white hover:bg-white/5 py-6"
            onClick={() => router.push('/login?role=assistant')}
          >
            <Users className="w-4 h-4 mr-2" />
            Muavin Girişi
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-white/20 text-sm">
        © 2026 Digibus — Next-Gen Bus Journey Management
      </footer>
    </div>
  );
}
