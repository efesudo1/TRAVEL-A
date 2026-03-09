'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart, ComposedChart } from 'recharts';

// Demo data for last 7 days
const data = [
    { date: 'Pzt', passengers: 186, trips: 12 },
    { date: 'Sal', passengers: 215, trips: 14 },
    { date: 'Çar', passengers: 198, trips: 11 },
    { date: 'Per', passengers: 245, trips: 16 },
    { date: 'Cum', passengers: 310, trips: 18 },
    { date: 'Cmt', passengers: 380, trips: 22 },
    { date: 'Paz', passengers: 290, trips: 15 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-digibus-navy border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
                <p className="text-white/60 text-xs mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${entry.name === 'passengers' ? 'bg-digibus-orange' : 'bg-digibus-acid'}`} />
                        <span className="text-white/40">{entry.name === 'passengers' ? 'Yolcu' : 'Sefer'}:</span>
                        <span className="text-white font-medium">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function PassengerChart() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="h-64 bg-white/[0.02] rounded-xl animate-pulse" />;
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="passengers"
                        stroke="#FF6B35"
                        strokeWidth={2}
                        fill="url(#orangeGradient)"
                    />
                    <Bar
                        dataKey="trips"
                        fill="#FFFF33"
                        opacity={0.3}
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
