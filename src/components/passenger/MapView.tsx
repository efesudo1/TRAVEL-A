'use client';

import { useEffect, useRef, useState } from 'react';
import type { Stop } from '@/lib/types';

interface MapViewProps {
    routeCoordinates: Array<{ lng: number; lat: number }>;
    stops: Stop[];
    busPosition: { lng: number; lat: number };
    currentStopIndex: number;
}

export default function MapView({ routeCoordinates, stops, busPosition, currentStopIndex }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);

    useEffect(() => {
        if (!mapContainer.current || mapRef.current) return;

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token || token === 'your_mapbox_token_here') {
            setMapError(true);
            return;
        }

        const initMap = async () => {
            try {
                const mapboxgl = (await import('mapbox-gl')).default;
                // Load mapbox CSS via link tag
                if (!document.querySelector('link[href*="mapbox-gl"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';
                    document.head.appendChild(link);
                }

                mapboxgl.accessToken = token;

                const bounds = routeCoordinates.reduce(
                    (b, coord) => {
                        return {
                            minLng: Math.min(b.minLng, coord.lng),
                            maxLng: Math.max(b.maxLng, coord.lng),
                            minLat: Math.min(b.minLat, coord.lat),
                            maxLat: Math.max(b.maxLat, coord.lat),
                        };
                    },
                    { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
                );

                const center: [number, number] = [
                    (bounds.minLng + bounds.maxLng) / 2,
                    (bounds.minLat + bounds.maxLat) / 2,
                ];

                const map = new mapboxgl.Map({
                    container: mapContainer.current!,
                    style: 'mapbox://styles/mapbox/dark-v11',
                    center,
                    zoom: 6,
                    pitch: 20,
                    attributionControl: false,
                });

                mapRef.current = map;

                map.on('load', () => {
                    // Route line
                    map.addSource('route', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: routeCoordinates.map(c => [c.lng, c.lat]),
                            },
                        },
                    });

                    // Route line glow
                    map.addLayer({
                        id: 'route-glow',
                        type: 'line',
                        source: 'route',
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: {
                            'line-color': '#FF6B35',
                            'line-width': 8,
                            'line-opacity': 0.3,
                            'line-blur': 4,
                        },
                    });

                    // Route line main
                    map.addLayer({
                        id: 'route-line',
                        type: 'line',
                        source: 'route',
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: {
                            'line-color': '#FF6B35',
                            'line-width': 3,
                            'line-opacity': 0.9,
                        },
                    });

                    // Stop markers
                    stops.forEach((stop, index) => {
                        const isCompleted = stop.actual_arrival !== null;
                        const isCurrent = index === currentStopIndex;
                        const isFirst = index === 0;
                        const isLast = index === stops.length - 1;

                        const el = document.createElement('div');
                        el.className = 'stop-marker';
                        el.style.cssText = `
              width: ${isFirst || isLast ? 20 : 14}px;
              height: ${isFirst || isLast ? 20 : 14}px;
              border-radius: 50%;
              border: 2px solid ${isCompleted ? '#22C55E' : isCurrent ? '#FF6B35' : '#64748B'};
              background: ${isCompleted ? '#22C55E' : isCurrent ? '#FF6B35' : '#1E293B'};
              box-shadow: 0 0 ${isCurrent ? '12px' : '6px'} ${isCompleted ? '#22C55E40' : isCurrent ? '#FF6B3580' : 'transparent'};
              cursor: pointer;
              transition: all 0.3s ease;
            `;

                        const popup = new mapboxgl.Popup({
                            offset: 15,
                            closeButton: false,
                            className: 'digibus-popup',
                        }).setHTML(`
              <div style="padding: 8px 12px; font-family: Inter, sans-serif;">
                <div style="font-weight: 600; font-size: 13px; color: #F1F5F9;">${stop.location_name}</div>
                <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">
                  ${isCompleted ? '✅ Geçildi' : isCurrent ? '🔶 Sonraki durak' : '⏳ Bekliyor'}
                </div>
              </div>
            `);

                        new mapboxgl.Marker({ element: el })
                            .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
                            .setPopup(popup)
                            .addTo(map);
                    });

                    // Bus marker
                    const busEl = document.createElement('div');
                    busEl.innerHTML = `
            <div style="
              width: 36px; height: 36px;
              background: linear-gradient(135deg, #FF6B35, #E05520);
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 0 20px #FF6B3580, 0 0 40px #FF6B3530;
              animation: pulse 2s ease-in-out infinite;
              border: 2px solid #FF8F5E;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M8 6v6m4-6v6m4-6v6M2 12h20M6 18h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                <circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>
              </svg>
            </div>
          `;
                    busEl.style.cssText = 'cursor: pointer;';

                    new mapboxgl.Marker({ element: busEl })
                        .setLngLat([busPosition.lng, busPosition.lat])
                        .addTo(map);

                    // Fit bounds
                    const mapBounds = new mapboxgl.LngLatBounds();
                    routeCoordinates.forEach(c => mapBounds.extend([c.lng, c.lat]));
                    map.fitBounds(mapBounds, { padding: { top: 80, bottom: 300, left: 40, right: 40 }, duration: 1500 });

                    setMapLoaded(true);
                });
            } catch (err) {
                console.error('Map init error:', err);
                setMapError(true);
            }
        };

        initMap();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [routeCoordinates, stops, busPosition, currentStopIndex]);

    // Fallback static map when Mapbox is not available
    if (mapError) {
        return (
            <div className="w-full h-full bg-digibus-navy relative">
                {/* Static route visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-full h-full max-w-lg max-h-96 opacity-30" viewBox="0 0 400 300" fill="none">
                        {routeCoordinates.length > 1 && (
                            <path
                                d={routeCoordinates.map((c, i) => {
                                    const x = ((c.lng - 27) / 7) * 380 + 10;
                                    const y = 290 - ((c.lat - 36) / 6) * 280;
                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ')}
                                stroke="#FF6B35"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray="8 4"
                                opacity="0.6"
                            />
                        )}
                        {stops.map((stop, i) => {
                            const x = ((stop.coordinates.lng - 27) / 7) * 380 + 10;
                            const y = 290 - ((stop.coordinates.lat - 36) / 6) * 280;
                            const isCompleted = stop.actual_arrival !== null;
                            return (
                                <g key={i}>
                                    <circle cx={x} cy={y} r="6" fill={isCompleted ? '#22C55E' : '#FF6B35'} opacity="0.8" />
                                    <text x={x} y={y - 12} textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="Inter">
                                        {stop.location_name}
                                    </text>
                                </g>
                            );
                        })}
                        {/* Bus position */}
                        <circle
                            cx={((busPosition.lng - 27) / 7) * 380 + 10}
                            cy={290 - ((busPosition.lat - 36) / 6) * 280}
                            r="10"
                            fill="#FF6B35"
                            opacity="0.9"
                        >
                            <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                </div>
                <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-1.5 text-white/30 text-xs">
                    Harita: Mapbox token gerekli
                </div>
            </div>
        );
    }

    return (
        <>
            <div ref={mapContainer} className="w-full h-full" />
            {!mapLoaded && (
                <div className="absolute inset-0 bg-digibus-navy flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-digibus-orange border-t-transparent rounded-full animate-spin" />
                        <span className="text-white/30 text-sm">Harita yükleniyor...</span>
                    </div>
                </div>
            )}
            <style jsx global>{`
        .mapboxgl-popup-content {
          background: #132240 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
          padding: 0 !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: #132240 !important;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px #FF6B3580, 0 0 40px #FF6B3530; }
          50% { box-shadow: 0 0 30px #FF6B35A0, 0 0 60px #FF6B3550; }
        }
      `}</style>
        </>
    );
}
