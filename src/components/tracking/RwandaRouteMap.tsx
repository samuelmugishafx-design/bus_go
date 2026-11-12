import React, { useState } from 'react';
import { BusLiveTracking, Route } from '../../types';
import { RWANDA_MAP_CITIES } from '../../data/demoData';
import { Bus, MapPin, Navigation, Compass, Layers, ShieldCheck } from 'lucide-react';

interface RwandaRouteMapProps {
  buses: BusLiveTracking[];
  selectedBusPlate?: string | null;
  onSelectBus?: (bus: BusLiveTracking) => void;
  highlightRouteId?: string | null;
}

export const RwandaRouteMap: React.FC<RwandaRouteMapProps> = ({
  buses,
  selectedBusPlate,
  onSelectBus,
  highlightRouteId,
}) => {
  const [hoveredBus, setHoveredBus] = useState<BusLiveTracking | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  // Key transit corridors defined by SVG paths between normalized coordinates (0-100)
  const CORRIDOR_PATHS = [
    // RN4: Kigali -> Base/Gakenke -> Musanze -> Rubavu
    {
      id: 'RN4',
      name: 'RN4 - Volcano Corridor',
      d: 'M 50 48 Q 45 36 44 35 T 37 24 Q 28 26 18 28',
      color: '#10b981', // emerald
    },
    // RN1: Kigali -> Muhanga -> Ruhango -> Nyanza -> Huye -> Nyamagabe
    {
      id: 'RN1',
      name: 'RN1 - Southern Artery',
      d: 'M 50 48 Q 45 52 41 56 T 42 65 T 43 72 T 43 81 Q 38 81 32 81',
      color: '#3b82f6', // blue
    },
    // RN1 to Kibeho
    {
      id: 'RN1-Kibeho',
      name: 'RN1 - Kibeho Link',
      d: 'M 43 81 Q 40 86 38 92',
      color: '#3b82f6',
    },
    // RN7: Nyamagabe -> Nyungwe Rainforest -> Rusizi (Kamembe)
    {
      id: 'RN7',
      name: 'RN7 - Nyungwe Forest Highway',
      d: 'M 32 81 Q 22 84 12 88',
      color: '#059669', // dark green
    },
    // RN15: Kivu Belt: Rubavu -> Karongi -> Nyamasheke -> Rusizi
    {
      id: 'RN15',
      name: 'RN15 - Kivu Belt Coastal Highway',
      d: 'M 18 28 Q 20 40 22 55 Q 18 64 16 72 Q 14 80 12 88',
      color: '#06b6d4', // cyan
    },
    // RN10: Muhanga -> Karongi (via Ndiza)
    {
      id: 'RN10',
      name: 'RN10 - Central to Lake Kivu',
      d: 'M 41 56 Q 32 55 22 55',
      color: '#8b5cf6', // purple
    },
    // RN12: Muhanga -> Musanze (Trans-provincial)
    {
      id: 'RN12',
      name: 'RN12 - Trans-Provincial Link',
      d: 'M 41 56 Q 40 40 37 24',
      color: '#f59e0b', // amber
    },
    // RN3: Kigali -> Gicumbi
    {
      id: 'RN3',
      name: 'RN3 - Northern Mountain Corridor',
      d: 'M 50 48 Q 53 35 56 22',
      color: '#10b981',
    },
    // RN2: Kigali -> Rwamagana -> Kayonza -> Nyagatare
    {
      id: 'RN2',
      name: 'RN2 - Eastern Akagera Corridor',
      d: 'M 53.5 49.5 Q 60 50 67 50 T 76 49 Q 79 34 82 19',
      color: '#f97316', // orange
    },
    // RN5: Kayonza -> Ngoma -> Kirehe (Rusumo Border)
    {
      id: 'RN5',
      name: 'RN5 - Rusumo Border Corridor',
      d: 'M 76 49 Q 78 57 79 65 T 88 72',
      color: '#e11d48', // rose
    },
    // Kigali -> Bugesera
    {
      id: 'RN5-Airport',
      name: 'RN5 - Airport Highway',
      d: 'M 50 48 Q 52 55 55 62',
      color: '#e11d48',
    },
  ];

  return (
    <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden text-slate-100">
      {/* Map Control / Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white tracking-tight">
              Rwanda National Transit Highway Map
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              LIVE GPS TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Realtime positioning along Northern, Southern, Eastern, Western, and Kivu Belt corridors.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active Coach ({buses.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span>Central Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-cyan-400 rounded"></span>
            <span>Kivu Belt</span>
          </div>
        </div>
      </div>

      {/* Interactive Vector Map Canvas */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[580px] my-4 select-none bg-slate-900/60 rounded-2xl border border-slate-800/60 flex items-center justify-center p-2">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-md"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Ambient Background Grid */}
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.2" />
            </pattern>
            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <rect width="100" height="100" fill="url(#grid)" opacity="0.6" />

          {/* Lake Kivu Representation on West */}
          <path
            d="M 5 20 Q 12 35 15 50 Q 14 65 10 85 Q 5 95 2 98 L 0 98 L 0 20 Z"
            fill="#0284c7"
            fillOpacity="0.12"
            stroke="#0284c7"
            strokeWidth="0.4"
            strokeDasharray="1 1"
          />
          <text x="5" y="55" fill="#38bdf8" fontSize="2.2" opacity="0.4" transform="rotate(-70 5 55)">
            LAKE KIVU
          </text>

          {/* Rwanda Provincial Boundary Watermark */}
          <path
            d="M 25 15 Q 50 12 70 12 Q 92 18 94 35 Q 96 55 92 75 Q 85 85 70 95 Q 40 98 25 95 Q 8 92 8 82 Q 18 60 15 40 Q 15 20 25 15 Z"
            fill="#0f172a"
            fillOpacity="0.7"
            stroke="#334155"
            strokeWidth="0.5"
          />

          {/* National Transit Corridor Paths */}
          {CORRIDOR_PATHS.map((corridor) => (
            <g key={corridor.id}>
              {/* Casing */}
              <path
                d={corridor.d}
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Route line */}
              <path
                d={corridor.d}
                fill="none"
                stroke={corridor.color}
                strokeWidth="1.2"
                strokeOpacity="0.6"
                strokeLinecap="round"
                className="hover:stroke-white transition-colors cursor-pointer"
              />
            </g>
          ))}

          {/* Station / City Nodes */}
          {Object.entries(RWANDA_MAP_CITIES).map(([cityName, node]) => {
            const isHovered = hoveredCity === cityName;
            return (
              <g
                key={cityName}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredCity(cityName)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* Outer ring for main hubs */}
                {node.isMainHub && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHovered ? 2.5 : 1.8}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.3"
                    strokeDasharray="0.8 0.8"
                    className="animate-spin-slow origin-center"
                  />
                )}

                {/* City Dot */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.isMainHub ? 1.2 : 0.8}
                  fill={node.isMainHub ? '#ffffff' : '#94a3b8'}
                  className="transition-all"
                />

                {/* City Name Label */}
                <text
                  x={node.x + 1.6}
                  y={node.y + 0.6}
                  fill={isHovered ? '#34d399' : node.isMainHub ? '#f8fafc' : '#94a3b8'}
                  fontSize={node.isMainHub ? 2.2 : 1.7}
                  fontWeight={node.isMainHub ? 'bold' : 'normal'}
                  className="select-none pointer-events-none drop-shadow"
                >
                  {node.name.replace(/\s*\(.*\)/, '')}
                </text>
              </g>
            );
          })}

          {/* Live Buses along corridors */}
          {buses.map((bus) => {
            const isSelected = selectedBusPlate === bus.plateNumber;
            const isHovered = hoveredBus?.busId === bus.busId;

            return (
              <g
                key={bus.busId}
                className="cursor-pointer transition-all"
                onClick={() => onSelectBus && onSelectBus(bus)}
                onMouseEnter={() => setHoveredBus(bus)}
                onMouseLeave={() => setHoveredBus(null)}
              >
                {/* Pulse ring for active in-transit bus */}
                <circle
                  cx={bus.coordinates.x}
                  cy={bus.coordinates.y}
                  r={isSelected || isHovered ? 3.5 : 2.5}
                  fill="#10b981"
                  fillOpacity="0.25"
                  className="animate-ping"
                />

                {/* Bus marker */}
                <circle
                  cx={bus.coordinates.x}
                  cy={bus.coordinates.y}
                  r={isSelected ? 2.2 : 1.6}
                  fill={isSelected ? '#f59e0b' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  filter="url(#glow)"
                />

                {/* Plate small tag if selected */}
                {(isSelected || isHovered) && (
                  <g>
                    <rect
                      x={bus.coordinates.x - 7}
                      y={bus.coordinates.y - 4.5}
                      width="14"
                      height="3.2"
                      rx="0.8"
                      fill="#0f172a"
                      stroke="#10b981"
                      strokeWidth="0.3"
                    />
                    <text
                      x={bus.coordinates.x}
                      y={bus.coordinates.y - 2.4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="1.6"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {bus.plateNumber}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover / Detail Overlay Card */}
        {hoveredBus && (
          <div className="absolute bottom-4 left-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl max-w-xs text-xs space-y-2 pointer-events-none animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono font-bold text-white text-sm bg-slate-800 px-2 py-0.5 rounded">
                {hoveredBus.plateNumber}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                {hoveredBus.speedKmh} km/h (Governed)
              </span>
            </div>

            <div>
              <span className="font-extrabold text-white block">{hoveredBus.agencyName}</span>
              <p className="text-emerald-400 font-semibold mt-0.5">
                {hoveredBus.origin} → {hoveredBus.destination}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <div>
                <span>Current Stop:</span>
                <p className="text-white font-medium">{hoveredBus.currentLocationName}</p>
              </div>
              <div>
                <span>ETA Destination:</span>
                <p className="text-white font-medium">{hoveredBus.estimatedArrivalMinutes} mins remaining</p>
              </div>
            </div>
          </div>
        )}

        {/* Hover City Card */}
        {hoveredCity && !hoveredBus && (
          <div className="absolute top-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3 shadow-xl text-xs space-y-1 pointer-events-none animate-in fade-in">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              {RWANDA_MAP_CITIES[hoveredCity]?.province} Province
            </span>
            <h4 className="font-bold text-white text-sm">{hoveredCity}</h4>
            <p className="text-slate-400 text-[11px]">{RWANDA_MAP_CITIES[hoveredCity]?.terminalName}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <span>Click any active bus icon to inspect its speed, route, next stop, and passenger manifest.</span>
        <span className="text-emerald-400 font-mono">Rwanda National Police Speed Governor: 60 km/h Enforced</span>
      </div>
    </div>
  );
};
