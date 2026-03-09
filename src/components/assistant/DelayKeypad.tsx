'use client';

import { useState } from 'react';
import { X, Delete, Check } from 'lucide-react';

interface DelayKeypadProps {
    onSubmit: (minutes: number) => void;
    onClose: () => void;
}

export default function DelayKeypad({ onSubmit, onClose }: DelayKeypadProps) {
    const [value, setValue] = useState('');

    const handleKey = (key: string) => {
        if (value.length < 3) {
            setValue(prev => prev + key);
        }
    };

    const handleBackspace = () => {
        setValue(prev => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        const minutes = parseInt(value);
        if (minutes > 0 && minutes <= 180) {
            onSubmit(minutes);
        }
    };

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', 'OK'];

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b-4 border-digibus-acid">
                <button onClick={onClose} className="p-2">
                    <X className="w-8 h-8 text-white" />
                </button>
                <h2 className="font-black text-xl text-white uppercase tracking-wider font-mono">Gecikme Süresi</h2>
                <div className="w-12" />
            </div>

            {/* Display */}
            <div className="flex-1 flex flex-col items-center justify-center px-8">
                <p className="text-digibus-acid text-sm font-bold uppercase tracking-widest mb-4">DAKİKA GİRİN</p>
                <div className="bg-zinc-900 border-4 border-white w-full max-w-xs py-8 text-center" style={{ boxShadow: '6px 6px 0px #FFFF33' }}>
                    <span className="font-mono font-black text-7xl text-white">
                        {value || '0'}
                    </span>
                    <span className="text-white/30 font-mono font-bold text-3xl ml-2">dk</span>
                </div>
                {parseInt(value) > 180 && (
                    <p className="text-red-400 font-bold text-sm mt-3 uppercase">Maksimum 180 dakika</p>
                )}
            </div>

            {/* Keypad Grid */}
            <div className="p-4 pb-8">
                <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                    {keys.map((key) => {
                        if (key === 'DEL') {
                            return (
                                <button
                                    key={key}
                                    onClick={handleBackspace}
                                    className="bg-zinc-800 border-2 border-white/20 text-white font-bold text-lg
                             flex items-center justify-center rounded-none
                             active:bg-zinc-700 transition-colors"
                                    style={{ minHeight: '72px' }}
                                >
                                    <Delete className="w-7 h-7" />
                                </button>
                            );
                        }
                        if (key === 'OK') {
                            return (
                                <button
                                    key={key}
                                    onClick={handleSubmit}
                                    disabled={!value || parseInt(value) === 0 || parseInt(value) > 180}
                                    className="bg-digibus-acid text-black font-black text-xl
                             flex items-center justify-center rounded-none
                             disabled:opacity-30 disabled:cursor-not-allowed
                             active:bg-digibus-acid-dark transition-colors border-2 border-black"
                                    style={{ minHeight: '72px' }}
                                >
                                    <Check className="w-8 h-8" />
                                </button>
                            );
                        }
                        return (
                            <button
                                key={key}
                                onClick={() => handleKey(key)}
                                className="bg-zinc-900 border-2 border-white/10 text-white font-mono font-bold text-3xl
                           flex items-center justify-center rounded-none
                           active:bg-white active:text-black transition-colors"
                                style={{ minHeight: '72px' }}
                            >
                                {key}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
