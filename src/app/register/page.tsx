'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bus, ArrowLeft, Mail, Lock, User, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { registerPassengerAction } from '@/app/actions/auth';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
        confirmPassword: ''
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setLoading(true);
        const res = await registerPassengerAction({
            email: formData.email,
            fullName: formData.fullName,
            password_hash: formData.password // In demo we use plain or simple hash
        });

        if (res.user) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/login?role=passenger');
            }, 2000);
        } else {
            setError(res.error || 'Kayıt işlemi başarısız.');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-digibus-navy flex items-center justify-center p-4">
                <Card className="bg-white/5 border-white/10 p-12 text-center rounded-[32px] max-w-md w-full animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-white text-3xl font-black mb-4">Başarıyla Kayıt Oldunuz!</h2>
                    <p className="text-white/40 mb-2">Hesabınız oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-digibus-navy flex items-center justify-center p-4 selection:bg-digibus-orange/30">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Logo & Back */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-all border border-white/5 group-hover:border-white/20">
                            <Bus className="w-6 h-6 text-digibus-orange" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white">DiGibus</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Hesap Oluştur</h1>
                        <p className="text-white/40 mt-2 font-medium">Seyahatlerinizi yönetin ve puan kazanın.</p>
                    </div>
                </div>

                <Card className="p-8 bg-white/5 border-white/10 rounded-[32px] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-12 h-12 text-digibus-orange" />
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Tam Ad Soyad</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <Input
                                    required
                                    placeholder="Ahmet Yılmaz"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="h-12 bg-white/5 border-white/10 pl-11 rounded-2xl text-white placeholder:text-white/20 focus:border-digibus-orange/50 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">E-posta Adresi</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <Input
                                    required
                                    type="email"
                                    placeholder="yolcu@ornek.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="h-12 bg-white/5 border-white/10 pl-11 rounded-2xl text-white placeholder:text-white/20 focus:border-digibus-orange/50 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Şifre</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        required
                                        type="password"
                                        placeholder="••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="h-12 bg-white/5 border-white/10 pl-11 rounded-2xl text-white placeholder:text-white/20 focus:border-digibus-orange/50 transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Şifre Tekrar</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        required
                                        type="password"
                                        placeholder="••••••"
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="h-12 bg-white/5 border-white/10 pl-11 rounded-2xl text-white placeholder:text-white/20 focus:border-digibus-orange/50 transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-in fade-in zoom-in-95 duration-200">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-digibus-orange hover:bg-digibus-orange-dark text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Hesap Oluştur'}
                        </Button>
                    </form>
                </Card>

                <p className="text-center text-white/30 text-sm font-medium">
                    Zaten hesabınız var mı?{' '}
                    <Link href="/login?role=passenger" className="text-digibus-orange hover:text-white transition-colors font-bold underline underline-offset-4 decoration-2">
                        Giriş Yapın
                    </Link>
                </p>

                <div className="pt-8 flex justify-center">
                    <Button variant="ghost" className="text-white/20 hover:text-white hover:bg-white/5 rounded-full px-6" onClick={() => router.push('/')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Vazgeç
                    </Button>
                </div>
            </div>
        </div>
    );
}
