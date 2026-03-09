'use client';

import { useState } from 'react';
import { MapPin, Clock, AlertTriangle, Navigation, ChevronUp, Award, CheckCircle2, Circle, Info, Train, BusFront, Car } from 'lucide-react';
import { formatTime, formatMinutes } from '@/lib/utils';
import type { Stop, TripStatus } from '@/lib/types';
import { findGuideForStop } from '@/lib/terminal-guides';

interface JourneyPanelProps {
    origin: Stop;
    destination: Stop;
    nextStop: Stop;
    etaMinutes: number;
    delayMinutes: number;
    stops: Stop[];
    currentStopIndex: number;
    tripStatus: TripStatus;
    onToggleLoyalty: () => void;
}

export default function JourneyPanel({
    origin,
    destination,
    nextStop,
    etaMinutes,
    delayMinutes,
    stops,
    currentStopIndex,
    tripStatus,
    onToggleLoyalty,
}: JourneyPanelProps) {
    const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

    return (
        <div className="px-4 pb-6 pt-2">
            {/* Drag Handle */}
            <div className="flex justify-center mb-3">
                <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Main Stats Glass Card */}
            <div className="glass-strong rounded-3xl p-5 mb-3">
                {/* Route Info Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-digibus-orange" />
                            <div className="w-0.5 h-6 bg-gradient-to-b from-digibus-orange to-digibus-acid opacity-40" />
                            <div className="w-3 h-3 rounded-full border-2 border-digibus-acid bg-transparent" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{origin.location_name}</p>
                            <p className="text-white/20 text-xs my-1">{stops.length - 2} ara durak</p>
                            <p className="text-white text-sm font-medium truncate">{destination.location_name}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Next Stop */}
                    <div className="bg-white/5 rounded-2xl p-3 text-center">
                        <Navigation className="w-4 h-4 text-digibus-orange mx-auto mb-1" />
                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Sonraki</p>
                        <p className="text-white text-xs font-semibold truncate">{nextStop.location_name}</p>
                    </div>

                    {/* ETA */}
                    <div className="bg-white/5 rounded-2xl p-3 text-center">
                        <Clock className="w-4 h-4 text-digibus-acid mx-auto mb-1" />
                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">ETA</p>
                        <p className="text-white text-lg font-bold">{formatMinutes(etaMinutes)}</p>
                    </div>

                    {/* Delay */}
                    <div className={`rounded-2xl p-3 text-center ${delayMinutes > 0 ? 'bg-amber-500/10' : 'bg-white/5'}`}>
                        <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${delayMinutes > 0 ? 'text-amber-400' : 'text-green-400'}`} />
                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Gecikme</p>
                        <p className={`text-lg font-bold ${delayMinutes > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                            {delayMinutes > 0 ? `+${delayMinutes}dk` : '0'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stops Timeline */}
            <div className="glass rounded-2xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Duraklar</p>
                    <p className="text-white/30 text-xs">{stops.filter(s => s.actual_arrival).length}/{stops.length}</p>
                </div>
                <div className="space-y-0">
                    {stops.map((stop, index) => {
                        const isCompleted = stop.actual_arrival !== null;
                        const isCurrent = index === currentStopIndex;
                        const isLast = index === stops.length - 1;
                        const guide = findGuideForStop(stop.location_name);

                        return (
                            <div key={stop.id} className="flex items-start gap-3">
                                {/* Timeline dot & line */}
                                <div className="flex flex-col items-center">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                                    ) : isCurrent ? (
                                        <div className="w-4 h-4 rounded-full border-2 border-digibus-orange bg-digibus-orange/20 shrink-0 animate-pulse" />
                                    ) : (
                                        <Circle className="w-4 h-4 text-white/20 shrink-0" />
                                    )}
                                    {!isLast && (
                                        <div className={`w-0.5 ${expandedGuide === stop.id ? 'h-auto min-h-[24px]' : 'h-6'} ${isCompleted ? 'bg-green-400/30' : 'bg-white/10'}`} />
                                    )}
                                </div>
                                {/* Stop Info */}
                                <div className="flex-1 pb-2">
                                    <div className="flex justify-between items-baseline">
                                        <span className={`text-sm ${isCompleted ? 'text-white/50' : isCurrent ? 'text-white font-semibold' : 'text-white/40'}`}>
                                            {stop.location_name}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {guide && (
                                                <button
                                                    onClick={() => setExpandedGuide(expandedGuide === stop.id ? null : stop.id)}
                                                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${expandedGuide === stop.id ? 'bg-digibus-orange/20 text-digibus-orange' : 'bg-white/5 text-white/30 hover:text-white/60'
                                                        }`}
                                                >
                                                    <Info className="w-3 h-3" />
                                                </button>
                                            )}
                                            <span className={`text-xs font-mono ${isCompleted ? 'text-green-400/60' : isCurrent ? 'text-digibus-orange' : 'text-white/20'}`}>
                                                {formatTime(stop.actual_arrival || stop.planned_arrival)}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Terminal Guide Dropdown */}
                                    {expandedGuide === stop.id && guide && (
                                        <div className="mt-2 bg-white/5 rounded-lg p-3 space-y-2 animate-fade-in">
                                            <p className="text-white/60 text-xs font-semibold">Ula&#x15F;&#x131;m Rehberi</p>
                                            {guide.metro && (
                                                <div className="flex items-start gap-2">
                                                    <Train className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                                    <p className="text-white/50 text-[11px] leading-relaxed">{guide.metro}</p>
                                                </div>
                                            )}
                                            {guide.bus && (
                                                <div className="flex items-start gap-2">
                                                    <BusFront className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                                                    <p className="text-white/50 text-[11px] leading-relaxed">{guide.bus}</p>
                                                </div>
                                            )}
                                            {guide.tram && (
                                                <div className="flex items-start gap-2">
                                                    <Train className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                                    <p className="text-white/50 text-[11px] leading-relaxed">{guide.tram}</p>
                                                </div>
                                            )}
                                            {guide.taxi && (
                                                <div className="flex items-start gap-2">
                                                    <Car className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                                                    <p className="text-white/50 text-[11px] leading-relaxed">{guide.taxi}</p>
                                                </div>
                                            )}
                                            {guide.general && (
                                                <p className="text-white/30 text-[10px] pt-1 border-t border-white/5">{guide.general}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Loyalty Button */}
            <button
                onClick={onToggleLoyalty}
                className="w-full glass rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-digibus-orange/10 flex items-center justify-center group-hover:bg-digibus-orange/20 transition-colors">
                        <Award className="w-5 h-5 text-digibus-orange" />
                    </div>
                    <div className="text-left">
                        <p className="text-white text-sm font-medium">7+1 Sadakat Program&#x131;</p>
                        <p className="text-white/30 text-xs">Puanlar&#x131;n&#x131;z&#x131; g&#xF6;r&#xFC;nt&#xFC;leyin</p>
                    </div>
                </div>
                <ChevronUp className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
            </button>
        </div>
    );
}
