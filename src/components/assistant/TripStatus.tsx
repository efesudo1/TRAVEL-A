'use client';

import { CheckCircle2, Circle, Navigation } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import type { Stop } from '@/lib/types';

interface TripStatusProps {
    stops: Stop[];
    currentStopIndex: number;
}

export default function TripStatus({ stops, currentStopIndex }: TripStatusProps) {
    return (
        <div className="bg-zinc-900 border-4 border-white/20 p-5" style={{ boxShadow: '4px 4px 0px rgba(255,255,255,0.1)' }}>
            <h3 className="font-black text-sm uppercase tracking-widest text-digibus-acid mb-4">DURAK DURUMU</h3>

            <div className="space-y-0">
                {stops.map((stop, index) => {
                    const isCompleted = stop.actual_arrival !== null;
                    const isCurrent = index === currentStopIndex;
                    const isLast = index === stops.length - 1;

                    return (
                        <div key={stop.id} className="flex items-start gap-4">
                            {/* Timeline */}
                            <div className="flex flex-col items-center">
                                {isCompleted ? (
                                    <div className="w-8 h-8 bg-green-500 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-black" />
                                    </div>
                                ) : isCurrent ? (
                                    <div className="w-8 h-8 bg-digibus-acid flex items-center justify-center animate-pulse">
                                        <Navigation className="w-5 h-5 text-black" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 border-2 border-white/20 flex items-center justify-center">
                                        <Circle className="w-4 h-4 text-white/20" />
                                    </div>
                                )}
                                {!isLast && (
                                    <div className={`w-1 h-8 ${isCompleted ? 'bg-green-500/40' : 'bg-white/10'}`} />
                                )}
                            </div>

                            {/* Stop Details */}
                            <div className={`flex-1 flex items-center justify-between pb-4 ${isCurrent ? 'border-l-0' : ''}`}>
                                <div>
                                    <p className={`font-bold ${isCompleted ? 'text-white/40' : isCurrent ? 'text-white text-lg' : 'text-white/30'}`}>
                                        {stop.location_name}
                                    </p>
                                    {stop.duration_minutes > 0 && (
                                        <p className="text-white/20 text-xs font-mono">{stop.duration_minutes} dk mola</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className={`font-mono font-bold text-lg ${isCompleted ? 'text-green-400/60' : isCurrent ? 'text-digibus-acid' : 'text-white/20'}`}>
                                        {formatTime(stop.actual_arrival || stop.planned_arrival)}
                                    </p>
                                    {isCompleted && stop.actual_arrival && stop.planned_arrival && (
                                        (() => {
                                            const diff = Math.round((new Date(stop.actual_arrival).getTime() - new Date(stop.planned_arrival).getTime()) / 60000);
                                            return diff > 0 ? (
                                                <p className="text-amber-400 text-xs font-mono">+{diff}dk</p>
                                            ) : null;
                                        })()
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
