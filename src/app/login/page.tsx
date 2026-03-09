'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bus, Mail, Lock, ArrowLeft, Shield, Users, User, Crown, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/auth-store';
import { demoMuavinler, demoAdmins, demoOwner, demoPassengers } from '@/lib/demo-data';
import { loginAction, registerPassengerAction } from '@/app/actions/auth';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role');
    const { login } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    const isAssistant = roleParam === 'assistant';
    const isPassenger = roleParam === 'passenger';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let result;
            if (isPassenger && isRegister) {
                if (!fullName.trim()) { setError('Ad soyad gerekli'); setLoading(false); return; }
                result = await registerPassengerAction({
                    email: email.trim(),
                    fullName: fullName.trim(),
                    password_hash: password
                });
            } else {
                result = await loginAction({
                    email: isAssistant ? undefined : email,
                    username: isAssistant ? username : undefined,
                    password: password
                });
            }

            if (result.error) {
                setError(result.error);
                setLoading(false);
                return;
            }

            if (result.user) {
                login(result.user);

                // Redirect based on role
                if (result.user.role === 'assistant') {
                    router.push('/muavin');
                } else if (result.user.role === 'passenger') {
                    router.push('/yolcu');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err) {
            setError('Bir bağlantı hatası oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = (demoRole: 'owner' | 'admin-c1' | 'admin-c2' | 'assistant' | 'passenger') => {
        switch (demoRole) {
            case 'owner':
                login({ id: 'owner1', email: 'owner@digibus.com', fullName: 'DiGibus Yönetici', role: 'owner', companyId: null, companyName: null });
                router.push('/dashboard');
                break;
            case 'admin-c1':
                login({ id: 'a1', email: 'admin@metro.com', fullName: 'Can Demir', role: 'admin', companyId: 'c1000000-0000-0000-0000-000000000001', companyName: 'Metro Turizm' });
                router.push('/dashboard');
                break;
            case 'admin-c2':
                login({ id: 'a2', email: 'admin@kamilkoc.com', fullName: 'Berk Aydın', role: 'admin', companyId: 'c1000000-0000-0000-0000-000000000002', companyName: 'Kamil Koç' });
                router.push('/dashboard');
                break;
            case 'assistant':
                login({ id: 'm1', email: '', fullName: 'Hasan Demirci', role: 'assistant', companyId: 'c1000000-0000-0000-0000-000000000001', companyName: 'Metro Turizm' });
                router.push('/muavin');
                break;
            case 'passenger':
                login({ id: 'p1', email: 'ahmet@email.com', fullName: 'Ahmet Yılmaz', role: 'passenger', companyId: null, companyName: null });
                router.push('/yolcu');
                break;
        }
    };

    // Icon and title per role
    const getTitle = () => {
        if (isAssistant) return { icon: Users, title: 'Muavin Girişi', desc: 'Sefer paneline erişmek için giriş yapın' };
        if (isPassenger) return { icon: User, title: isRegister ? 'Yolcu Kaydı' : 'Yolcu Girişi', desc: isRegister ? 'Seyahatlerinizi takip etmek için kayıt olun' : 'Seyahatlerinizi takip edin' };
        return { icon: Shield, title: 'Yönetim Girişi', desc: 'Owner veya admin olarak giriş yapın' };
    };
    const titleInfo = getTitle();

    return (
        <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
            <div className="glass-strong rounded-3xl p-8 md:p-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-digibus-orange mb-4 animate-pulse-glow">
                        <titleInfo.icon className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{titleInfo.title}</h1>
                    <p className="text-white/40 text-sm">{titleInfo.desc}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {isAssistant ? (
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input type="text" placeholder="Kullanıcı adı (ör: metro-turizm-001)" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-digibus-orange" />
                        </div>
                    ) : (
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input type="email" placeholder="E-posta adresi" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-digibus-orange" />
                        </div>
                    )}
                    {isPassenger && isRegister && (
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input type="text" placeholder="Ad Soyad" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-digibus-orange" />
                        </div>
                    )}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-digibus-orange" />
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full h-12 bg-digibus-orange hover:bg-digibus-orange-dark text-white rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02]">
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {isRegister ? 'Kayıt yapılıyor...' : 'Giriş yapılıyor...'}
                            </div>
                        ) : isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
                    </Button>
                </form>

                {/* Passenger toggle register/login */}
                {isPassenger && (
                    <button onClick={() => setIsRegister(!isRegister)} className="w-full text-center text-digibus-orange text-sm mt-4 hover:underline">
                        {isRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun'}
                    </button>
                )}

                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/30 text-xs">veya demo ile devam et</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="space-y-2">
                    <Button type="button" variant="outline" className="w-full h-10 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-sm" onClick={() => handleDemoLogin('owner')}>
                        <Crown className="w-4 h-4 mr-2 text-amber-400" /> Owner (God Mode)
                    </Button>
                    <Button type="button" variant="outline" className="w-full h-10 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-sm" onClick={() => handleDemoLogin('admin-c1')}>
                        <Shield className="w-4 h-4 mr-2 text-digibus-orange" /> Metro Turizm Admin
                    </Button>
                    <Button type="button" variant="outline" className="w-full h-10 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-sm" onClick={() => handleDemoLogin('admin-c2')}>
                        <Shield className="w-4 h-4 mr-2 text-red-400" /> Kamil Koç Admin
                    </Button>
                    <Button type="button" variant="outline" className="w-full h-10 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-sm" onClick={() => handleDemoLogin('assistant')}>
                        <Users className="w-4 h-4 mr-2 text-digibus-acid" /> Demo Muavin
                    </Button>
                    <Button type="button" variant="outline" className="w-full h-10 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-sm" onClick={() => handleDemoLogin('passenger')}>
                        <User className="w-4 h-4 mr-2 text-blue-400" /> Demo Yolcu
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
                <Bus className="w-4 h-4 text-white/20" />
                <span className="text-white/20 text-sm font-medium">Digibus</span>
            </div>
        </div>
    );
}

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-digibus-navy overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-digibus-orange/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-digibus-acid/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <Button
                variant="ghost"
                className="absolute top-6 left-6 text-white/50 hover:text-white hover:bg-white/5 z-20"
                onClick={() => router.push('/')}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfa
            </Button>

            <Suspense fallback={
                <div className="relative z-10 w-full max-w-md mx-4">
                    <div className="glass-strong rounded-3xl p-8 md:p-10 h-96 animate-pulse" />
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
