'use client';

import { Bus, Gift, Star } from 'lucide-react';

interface LoyaltyTrackerProps {
    points: number; // 0-7
    totalTrips: number;
    companyName: string;
}

export default function LoyaltyTracker({ points, totalTrips, companyName }: LoyaltyTrackerProps) {
    const maxPoints = 7;
    const progress = points / maxPoints;
    const isFreeRide = points >= maxPoints;

    // SVG circle parameters
    const size = 200;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="glass-strong rounded-3xl p-8 max-w-sm w-full">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-white text-xl font-bold mb-1">7+1 Sadakat</h2>
                <p className="text-white/40 text-sm">{companyName}</p>
            </div>

            {/* Circular Progress */}
            <div className="relative flex items-center justify-center mb-8">
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle with neon glow */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={isFreeRide ? '#FFFF33' : '#FF6B35'}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={isFreeRide ? 'animate-neon-glow' : ''}
                        style={{
                            transition: 'stroke-dashoffset 1s ease-out',
                            filter: `drop-shadow(0 0 8px ${isFreeRide ? '#FFFF3380' : '#FF6B3580'})`,
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {isFreeRide ? (
                        <div className="text-center animate-counter-up">
                            <Gift className="w-8 h-8 text-digibus-acid mx-auto mb-1 animate-bounce" />
                            <p className="text-digibus-acid text-lg font-bold">Ücretsiz!</p>
                            <p className="text-white/40 text-xs">Biletiniz hazır</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-4xl font-bold text-white">{points}</p>
                            <p className="text-white/40 text-sm">/ {maxPoints}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Digital Stamps */}
            <div className="grid grid-cols-7 gap-2 mb-6">
                {Array.from({ length: maxPoints }).map((_, i) => {
                    const isEarned = i < points;
                    return (
                        <div
                            key={i}
                            className={`
                aspect-square rounded-xl flex items-center justify-center
                transition-all duration-300
                ${isEarned
                                    ? 'bg-digibus-orange/20 border border-digibus-orange/40'
                                    : 'bg-white/5 border border-white/5'
                                }
              `}
                            style={{
                                animationDelay: `${i * 0.1}s`,
                            }}
                        >
                            {isEarned ? (
                                <Bus className="w-4 h-4 text-digibus-orange" />
                            ) : (
                                <Star className="w-3 h-3 text-white/10" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* +1 Free Ride indicator */}
            <div className={`
        rounded-2xl p-3 text-center border transition-all
        ${isFreeRide
                    ? 'bg-digibus-acid/10 border-digibus-acid/30'
                    : 'bg-white/5 border-white/5'
                }
      `}>
                <div className="flex items-center justify-center gap-2">
                    <Gift className={`w-4 h-4 ${isFreeRide ? 'text-digibus-acid' : 'text-white/20'}`} />
                    <span className={`text-sm font-semibold ${isFreeRide ? 'text-digibus-acid' : 'text-white/20'}`}>
                        +1 Ücretsiz Yolculuk
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between mt-6 pt-4 border-t border-white/5">
                <div className="text-center">
                    <p className="text-white text-lg font-bold">{totalTrips}</p>
                    <p className="text-white/30 text-xs">Toplam Yolculuk</p>
                </div>
                <div className="text-center">
                    <p className="text-white text-lg font-bold">{Math.floor(totalTrips / 8)}</p>
                    <p className="text-white/30 text-xs">Ücretsiz Kazanılan</p>
                </div>
                <div className="text-center">
                    <p className="text-digibus-orange text-lg font-bold">{maxPoints - points}</p>
                    <p className="text-white/30 text-xs">Kalan</p>
                </div>
            </div>
        </div>
    );
}
