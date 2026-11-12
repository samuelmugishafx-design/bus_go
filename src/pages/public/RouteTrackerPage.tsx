import React, { useState, useMemo } from 'react';
import { trackingService } from '../../services/trackingService';
import { storageService } from '../../services/storageService';
import { RwandaRouteMap } from '../../components/tracking/RwandaRouteMap';
import { BusLiveTracking, Route, RwandaProvince, Ticket } from '../../types';
import {
  Navigation,
  Search,
  MapPin,
  Clock,
  Bus,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Filter,
  Compass,
  Ticket as TicketIcon,
} from 'lucide-react';

interface RouteTrackerPageProps {
  initialTicketNumber?: string;
  onBookRoute: (origin: string, destination: string) => void;
  onOpenUssd: () => void;
}

export const RouteTrackerPage: React.FC<RouteTrackerPageProps> = ({
  initialTicketNumber = '',
  onBookRoute,
  onOpenUssd,
}) => {
  const [ticketSearchInput, setTicketSearchInput] = useState<string>(initialTicketNumber);
  const [activeTrackedTicket, setActiveTrackedTicket] = useState<Ticket | null>(() => {
    if (initialTicketNumber) {
      return storageService.getTicketByNumber(initialTicketNumber) || null;
    }
    return null;
  });

  const [selectedProvince, setSelectedProvince] = useState<RwandaProvince | 'All'>('All');
  const [routeQuery, setRouteQuery] = useState('');
  const [selectedBusPlate, setSelectedBusPlate] = useState<string | null>(null);

  // Live buses
  const liveBuses = useMemo(() => trackingService.getAllLiveBuses(), []);

  // Selected bus object
  const selectedBus = useMemo(() => {
    if (!selectedBusPlate) return liveBuses[0] || null;
    return liveBuses.find((b) => b.plateNumber === selectedBusPlate) || liveBuses[0] || null;
  }, [liveBuses, selectedBusPlate]);

  // All tracked routes in Rwanda
  const allRoutes = useMemo(() => trackingService.getAllRoutes(), []);

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    let list = allRoutes;
    if (selectedProvince !== 'All') {
      list = list.filter((r) => r.province === selectedProvince);
    }
    if (routeQuery.trim()) {
      const q = routeQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.origin.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q) ||
          (r.corridorCode && r.corridorCode.toLowerCase().includes(q)) ||
          (r.intermediateStops && r.intermediateStops.some((s) => s.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [allRoutes, selectedProvince, routeQuery]);

  const handleTrackTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSearchInput.trim()) return;

    const ticket = storageService.getTicketByNumber(ticketSearchInput.trim());
    if (ticket) {
      setActiveTrackedTicket(ticket);
      setSelectedBusPlate(ticket.busPlate);
    } else {
      alert(`Ticket "${ticketSearchInput}" not found. Try one of our demo tickets like BG-RW-2026-7841.`);
    }
  };

  const handleSelectBusFromMap = (bus: BusLiveTracking) => {
    setSelectedBusPlate(bus.plateNumber);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Rwanda Transit Network
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Track All Bus Routes Across Rwanda
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Monitor live intercity coach movements, national highway corridors (RN1, RN2, RN3, RN4, RN15 Kivu Belt), intermediate stops, and live GPS telemetry.
          </p>
        </div>

        {/* 1. Track By Ticket Quick Finder */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                <TicketIcon className="w-5 h-5 text-emerald-600" />
                Track Your Bus by Ticket Reference
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your 10-digit ticket number to see your bus&apos;s live location, next station, and estimated arrival.
              </p>
            </div>

            <form onSubmit={handleTrackTicket} className="flex gap-2">
              <input
                type="text"
                value={ticketSearchInput}
                onChange={(e) => setTicketSearchInput(e.target.value.toUpperCase())}
                placeholder="e.g. BG-RW-2026-7841"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm font-mono uppercase font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Track Bus</span>
              </button>
            </form>

            {/* Quick demo tickets */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 flex-wrap">
              <span>Quick Demos:</span>
              <button
                type="button"
                onClick={() => {
                  setTicketSearchInput('BG-RW-2026-7841');
                  const t = storageService.getTicketByNumber('BG-RW-2026-7841');
                  if (t) {
                    setActiveTrackedTicket(t);
                    setSelectedBusPlate(t.busPlate);
                  }
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[11px]"
              >
                BG-RW-2026-7841 (Kigali → Huye)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTicketSearchInput('BG-RW-2026-4402');
                  const t = storageService.getTicketByNumber('BG-RW-2026-4402');
                  if (t) {
                    setActiveTrackedTicket(t);
                    setSelectedBusPlate(t.busPlate);
                  }
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[11px]"
              >
                BG-RW-2026-4402 (Kigali → Rubavu)
              </button>
            </div>
          </div>

          {/* Active Ticket Live Telemetry Bar */}
          {activeTrackedTicket && (
            <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                      LIVE TRACKING · TICKET {activeTrackedTicket.ticketNumber}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {activeTrackedTicket.origin} → {activeTrackedTicket.destination}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase">Bus Plate</span>
                    <span className="font-bold text-slate-900">{activeTrackedTicket.busPlate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase">Your Seat</span>
                    <span className="font-bold text-emerald-700">Seat #{activeTrackedTicket.seatNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase">Speed</span>
                    <span className="font-bold text-slate-800">56 km/h</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="py-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {activeTrackedTicket.origin} (Departed {activeTrackedTicket.departureTime})
                  </span>
                  <span className="text-emerald-700 font-mono">
                    Current: Near Muhanga Highway (62% En-Route)
                  </span>
                  <span className="flex items-center gap-1">
                    {activeTrackedTicket.destination} (ETA {activeTrackedTicket.arrivalTime})
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '62%' }}></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Speed limit: 60 km/h</span>
                  <span>Estimated arrival: ~35 mins remaining</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Interactive National Transit Map */}
        <RwandaRouteMap
          buses={liveBuses}
          selectedBusPlate={selectedBusPlate}
          onSelectBus={handleSelectBusFromMap}
        />

        {/* 3. Selected Bus Detail Panel (if any) */}
        {selectedBus && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-base bg-slate-100 text-slate-900 px-2.5 py-1 rounded">
                  {selectedBus.plateNumber}
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  EN-ROUTE (ON SCHEDULE)
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {selectedBus.agencyName} · {selectedBus.origin} → {selectedBus.destination}
              </h3>
              <p className="text-xs text-slate-500">
                Departed at {selectedBus.departureTime} · Scheduled arrival: {selectedBus.arrivalTime}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Current Stop</span>
                <span className="font-bold text-slate-800">{selectedBus.currentLocationName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Next Stop</span>
                <span className="font-bold text-emerald-700">{selectedBus.nextStop}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Live Speed</span>
                <span className="font-bold text-slate-800">{selectedBus.speedKmh} km/h</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Passengers</span>
                <span className="font-bold text-slate-800">{selectedBus.passengersOnBoard} / {selectedBus.totalSeats}</span>
              </div>
            </div>

            <button
              onClick={() => onBookRoute(selectedBus.origin, selectedBus.destination)}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Book This Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 4. Complete Directory of Tracked Routes in Rwanda */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Comprehensive Highway Network
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                All Tracked Intercity Routes in Rwanda ({filteredRoutes.length})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Official RURA approved routes with standard fares, intermediate stops, and live coach dispatch.
              </p>
            </div>

            {/* Route Search Filter */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={routeQuery}
                onChange={(e) => setRouteQuery(e.target.value)}
                placeholder="Search town, highway or stop..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Province Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 text-xs font-medium overflow-x-auto">
            {(['All', 'Northern', 'Southern', 'Western', 'Eastern', 'Kigali City'] as const).map((prov) => (
              <button
                key={prov}
                onClick={() => setSelectedProvince(prov as any)}
                className={`px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                  selectedProvince === prov
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {prov === 'All' ? 'All Rwanda Network' : `${prov} Province`}
              </button>
            ))}
          </div>

          {/* Route Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((route) => {
              const matchingBuses = liveBuses.filter((b) => b.routeId === route.id);
              return (
                <div
                  key={route.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {route.corridorCode || 'National Road'}
                      </span>
                      {matchingBuses.length > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {matchingBuses.length} Bus{matchingBuses.length > 1 ? 'es' : ''} on road
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Scheduled Daily</span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                        <span>{route.origin}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{route.destination}</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {route.distanceKm} km · Approx {Math.floor(route.durationMinutes / 60)}h {route.durationMinutes % 60}m direct
                      </p>
                    </div>

                    {/* Intermediate Waypoints */}
                    {route.intermediateStops && route.intermediateStops.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Intermediate Stations & Stops
                        </span>
                        <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">
                          {route.intermediateStops.map((stop, sIdx) => (
                            <span key={sIdx} className="flex items-center gap-1">
                              <span>{stop}</span>
                              {sIdx < route.intermediateStops!.length - 1 && (
                                <span className="text-slate-300">→</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Ticket Price</span>
                      <span className="font-mono font-black text-emerald-700 text-base tabular-nums">
                        {route.basePriceRwf.toLocaleString()} RWF
                      </span>
                    </div>

                    <button
                      onClick={() => onBookRoute(route.origin, route.destination)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <span>Book Seat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
