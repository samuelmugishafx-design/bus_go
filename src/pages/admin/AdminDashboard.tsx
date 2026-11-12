import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { ticketService } from '../../services/ticketService';
import { Bus, Route, Schedule, Agency, Ticket } from '../../types';
import { RWANDA_CITIES } from '../../data/demoData';
import { RwandaRouteMap } from '../../components/tracking/RwandaRouteMap';
import { trackingService } from '../../services/trackingService';
import {
  BarChart3,
  Bus as BusIcon,
  Navigation,
  Calendar,
  Ticket as TicketIcon,
  Users,
  CreditCard,
  QrCode,
  RefreshCw,
  Building2,
  PhoneCall,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenScanner: () => void;
  onOpenUssd: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenScanner, onOpenUssd }) => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'fleet_tracker'
    | 'buses'
    | 'routes'
    | 'schedules'
    | 'bookings'
    | 'tickets'
    | 'route_changes'
    | 'agencies'
    | 'ussd'
    | 'settings'
  >('overview');

  // Local state for management
  const agencies = storageService.getAgencies();
  const buses = storageService.getBuses();
  const routes = storageService.getRoutes();
  const schedules = storageService.getSchedules();
  const tickets = storageService.getTickets();
  const bookings = storageService.getBookings();
  const payments = storageService.getPayments();
  const users = storageService.getUsers();

  // Search & filter
  const [bookingSearch, setBookingSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');

  // Add Bus Modal / form state
  const [isAddBusOpen, setIsAddBusOpen] = useState(false);
  const [newBusPlate, setNewBusPlate] = useState('');
  const [newBusModel, setNewBusModel] = useState('Toyota Coaster Executive');
  const [newBusSeats, setNewBusSeats] = useState(28);
  const [newBusAgency, setNewBusAgency] = useState(agencies[0]?.id || 'agency-volcano');

  // Add Route Modal / form state
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [newRouteOrigin, setNewRouteOrigin] = useState('Kigali (Nyabugogo)');
  const [newRouteDest, setNewRouteDest] = useState('Huye (Butare)');
  const [newRoutePrice, setNewRoutePrice] = useState(3000);
  const [newRouteDistance, setNewRouteDistance] = useState(130);
  const [newRouteAgency, setNewRouteAgency] = useState(agencies[0]?.id || 'agency-volcano');

  // Role scoped data: if agency_admin, show only their agency's data
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAgencyAdmin = currentUser?.role === 'agency_admin';
  const myAgencyId = currentUser?.agencyId;

  const scopedBuses = useMemo(() => {
    if (isAgencyAdmin && myAgencyId) return buses.filter((b) => b.agencyId === myAgencyId);
    return buses;
  }, [buses, isAgencyAdmin, myAgencyId]);

  const scopedRoutes = useMemo(() => {
    if (isAgencyAdmin && myAgencyId) return routes.filter((r) => r.agencyId === myAgencyId);
    return routes;
  }, [routes, isAgencyAdmin, myAgencyId]);

  const scopedSchedules = useMemo(() => {
    if (isAgencyAdmin && myAgencyId) return schedules.filter((s) => s.agencyId === myAgencyId);
    return schedules;
  }, [schedules, isAgencyAdmin, myAgencyId]);

  const scopedBookings = useMemo(() => {
    if (isAgencyAdmin && myAgencyId) return bookings.filter((b) => b.agencyId === myAgencyId);
    return bookings;
  }, [bookings, isAgencyAdmin, myAgencyId]);

  // Calculations
  const totalRevenueRwf = payments.reduce((acc, p) => acc + p.amountRwf, 0);
  const momoRevenue = payments.filter((p) => p.provider === 'MTN_MOMO').reduce((acc, p) => acc + p.amountRwf, 0);
  const airtelRevenue = payments.filter((p) => p.provider === 'AIRTEL_MONEY').reduce((acc, p) => acc + p.amountRwf, 0);
  const webBookingsCount = bookings.filter((b) => b.channel === 'web').length;
  const ussdBookingsCount = bookings.filter((b) => b.channel === 'ussd').length;
  const routeChangesCount = tickets.reduce((acc, t) => acc + (t.routeChangeHistory?.length || 0), 0);

  const handleCreateBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusPlate.trim()) return;

    const newBus: Bus = {
      id: `bus-${Date.now()}`,
      agencyId: newBusAgency,
      plateNumber: newBusPlate.toUpperCase().trim(),
      model: newBusModel,
      totalSeats: newBusSeats,
      amenities: ['AC', 'Free Wi-Fi', 'Speed Governor'],
      status: 'active',
    };

    storageService.saveBus(newBus);
    setIsAddBusOpen(false);
    setNewBusPlate('');
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoute: Route = {
      id: `route-${Date.now()}`,
      agencyId: newRouteAgency,
      origin: newRouteOrigin,
      destination: newRouteDest,
      distanceKm: newRouteDistance,
      durationMinutes: Math.round(newRouteDistance * 1.2),
      basePriceRwf: newRoutePrice,
      isActive: true,
    };

    storageService.saveRoute(newRoute);
    setIsAddRouteOpen(false);
  };

  const handleCancelBooking = (bookingId: string, ticketNumber: string) => {
    if (window.confirm(`Cancel booking ${ticketNumber}? Seat will be released.`)) {
      ticketService.cancelTicket(ticketNumber);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 p-5 flex flex-col justify-between shrink-0 border-r border-slate-800 no-print">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <BusIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block">
                BusGo Console
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                {currentUser?.role === 'super_admin' ? 'Super Admin HQ' : currentUser?.role === 'agency_admin' ? 'Agency Manager' : 'Station Inspector'}
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview & Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('fleet_tracker')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'fleet_tracker' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Live Fleet & Route Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('buses')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'buses' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <BusIcon className="w-4 h-4" />
              <span>Bus Fleet ({scopedBuses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'routes' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Routes & Fares ({scopedRoutes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'schedules' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Schedules ({scopedSchedules.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'bookings' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <TicketIcon className="w-4 h-4" />
              <span>Bookings ({scopedBookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('route_changes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'route_changes' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Route Changes ({routeChangesCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('agencies')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'agencies' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Bus Agencies ({agencies.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('ussd')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'ussd' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>USSD Portal (*888#)</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'settings' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>System Settings</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button
            onClick={onOpenScanner}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Open Ticket Scanner</span>
          </button>
          <button
            onClick={onOpenUssd}
            className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>USSD Simulator</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Rwanda Transport Overview & Analytics'}
              {activeTab === 'fleet_tracker' && 'Rwanda National Fleet & Route Tracker'}
              {activeTab === 'buses' && 'Bus Fleet Management'}
              {activeTab === 'routes' && 'Intercity Routes & Fares'}
              {activeTab === 'schedules' && 'Daily Schedules & Dispatches'}
              {activeTab === 'bookings' && 'Booking Transactions & Records'}
              {activeTab === 'route_changes' && 'Route Change Audit & History'}
              {activeTab === 'agencies' && 'Registered Rwandan Bus Agencies'}
              {activeTab === 'ussd' && 'USSD Channel Management (*888#)'}
              {activeTab === 'settings' && 'Platform Governance & Booking Rules'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as <span className="font-semibold text-slate-800">{currentUser?.name}</span> ({currentUser?.role})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'buses' && (
              <button
                onClick={() => setIsAddBusOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Bus</span>
              </button>
            )}
            {activeTab === 'routes' && (
              <button
                onClick={() => setIsAddRouteOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Route</span>
              </button>
            )}
            <button
              onClick={onOpenScanner}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Verify Ticket</span>
            </button>
          </div>
        </div>

        {/* TAB: FLEET & ROUTE TRACKER */}
        {activeTab === 'fleet_tracker' && (
          <div className="space-y-6">
            <RwandaRouteMap
              buses={trackingService.getAllLiveBuses()}
            />

            {/* Live Buses Dispatch Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Active En-Route Buses (Live Rwanda Telemetry)</h3>
                  <p className="text-xs text-slate-500">
                    Realtime speed governor telemetry & intermediate waypoint monitoring
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  All Units Governed &le; 60 km/h
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Plate Number</th>
                      <th className="px-6 py-3 font-semibold">Agency</th>
                      <th className="px-6 py-3 font-semibold">Route</th>
                      <th className="px-6 py-3 font-semibold">Current Waypoint</th>
                      <th className="px-6 py-3 font-semibold">Next Stop</th>
                      <th className="px-6 py-3 font-semibold">Speed</th>
                      <th className="px-6 py-3 font-semibold">ETA</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trackingService.getAllLiveBuses().map((bus) => (
                      <tr key={bus.busId} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-mono font-bold text-slate-900">{bus.plateNumber}</td>
                        <td className="px-6 py-3 font-medium text-slate-700">{bus.agencyName}</td>
                        <td className="px-6 py-3 font-semibold text-slate-800">
                          {bus.origin} → {bus.destination}
                        </td>
                        <td className="px-6 py-3 font-medium text-emerald-700">{bus.currentLocationName}</td>
                        <td className="px-6 py-3 text-slate-500">{bus.nextStop}</td>
                        <td className="px-6 py-3 font-mono font-bold text-slate-900">{bus.speedKmh} km/h</td>
                        <td className="px-6 py-3 font-mono text-slate-600">~{bus.estimatedArrivalMinutes}m</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            EN-ROUTE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Bookings
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                    {bookings.length}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold">
                    {bookings.filter((b) => b.status === 'confirmed').length} confirmed
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Simulated Revenue
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                    {totalRevenueRwf.toLocaleString()} RWF
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Active Fleet & Agencies
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                    {buses.length} Buses
                  </span>
                  <span className="text-xs text-slate-500">across {agencies.length} agencies</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Route Changes Executed
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-amber-700 tabular-nums">
                    {routeChangesCount}
                  </span>
                  <span className="text-xs text-slate-500">origin & destination swaps</span>
                </div>
              </div>
            </div>

            {/* Analytics Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Split */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">
                  Mobile Money Revenue Distribution (Rwanda)
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-yellow-800 font-bold">MTN Mobile Money (*182#)</span>
                      <span className="font-mono font-bold text-slate-800">
                        {momoRevenue.toLocaleString()} RWF ({Math.round((momoRevenue / (totalRevenueRwf || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${(momoRevenue / (totalRevenueRwf || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-red-700 font-bold">Airtel Money (*500#)</span>
                      <span className="font-mono font-bold text-slate-800">
                        {airtelRevenue.toLocaleString()} RWF ({Math.round((airtelRevenue / (totalRevenueRwf || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${(airtelRevenue / (totalRevenueRwf || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Channel Distribution */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">
                  Booking Channel Distribution (Web vs USSD)
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-xs text-emerald-800 font-bold uppercase block">
                      Web Application
                    </span>
                    <span className="text-3xl font-black text-emerald-700 tabular-nums">
                      {webBookingsCount}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">Smartphones & Desktops</span>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <span className="text-xs text-amber-900 font-bold uppercase block">
                      USSD *888#
                    </span>
                    <span className="text-3xl font-black text-amber-700 tabular-nums">
                      {ussdBookingsCount}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">Feature Phones (Offline)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings Feed */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Recent Intercity Bookings</h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Ticket Ref</th>
                      <th className="px-6 py-3 font-semibold">Passenger</th>
                      <th className="px-6 py-3 font-semibold">Channel</th>
                      <th className="px-6 py-3 font-semibold">Amount</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-mono font-bold text-emerald-700">
                          {b.ticketNumber}
                        </td>
                        <td className="px-6 py-3 font-medium text-slate-900">{b.passengerName}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              b.channel === 'ussd' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {b.channel}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono font-bold text-slate-800 tabular-nums">
                          {b.totalPriceRwf.toLocaleString()} RWF
                        </td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {b.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BUSES */}
        {activeTab === 'buses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scopedBuses.map((bus) => {
                const agency = agencies.find((a) => a.id === bus.agencyId);
                return (
                  <div
                    key={bus.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-slate-900 text-base bg-slate-100 px-2 py-1 rounded">
                          {bus.plateNumber}
                        </span>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                        {bus.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{bus.model}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Operated by {agency?.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3">
                      <div>
                        <span className="text-slate-400 block">Total Capacity</span>
                        <span className="font-bold text-slate-800 text-sm">{bus.totalSeats} Seats</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Seat Layout</span>
                        <span className="font-bold text-slate-800 text-sm">2x2 Executive Aisle</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                      {bus.amenities.map((am) => (
                        <span key={am} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                          {am}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => storageService.deleteBus(bus.id)}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: ROUTES */}
        {activeTab === 'routes' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Origin</th>
                    <th className="px-6 py-3 font-semibold">Destination</th>
                    <th className="px-6 py-3 font-semibold">Agency</th>
                    <th className="px-6 py-3 font-semibold">Distance</th>
                    <th className="px-6 py-3 font-semibold">Duration</th>
                    <th className="px-6 py-3 font-semibold text-right">Standard Price (RWF)</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedRoutes.map((r) => {
                    const agency = agencies.find((a) => a.id === r.agencyId);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-bold text-slate-900">{r.origin}</td>
                        <td className="px-6 py-3 font-bold text-slate-900">{r.destination}</td>
                        <td className="px-6 py-3 font-medium text-slate-600">{agency?.name}</td>
                        <td className="px-6 py-3 text-slate-500">{r.distanceKm} km</td>
                        <td className="px-6 py-3 text-slate-500">{r.durationMinutes} mins</td>
                        <td className="px-6 py-3 font-mono font-bold text-emerald-700 text-right tabular-nums">
                          {r.basePriceRwf.toLocaleString()} RWF
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => storageService.deleteRoute(r.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SCHEDULES */}
        {activeTab === 'schedules' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Route</th>
                    <th className="px-6 py-3 font-semibold">Date & Time</th>
                    <th className="px-6 py-3 font-semibold">Bus Plate</th>
                    <th className="px-6 py-3 font-semibold">Agency</th>
                    <th className="px-6 py-3 font-semibold">Booked Seats</th>
                    <th className="px-6 py-3 font-semibold text-right">Price (RWF)</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedSchedules.map((s) => {
                    const bus = buses.find((b) => b.id === s.busId);
                    const route = routes.find((r) => r.id === s.routeId);
                    const agency = agencies.find((a) => a.id === s.agencyId);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-bold text-slate-900">
                          {route?.origin} → {route?.destination}
                        </td>
                        <td className="px-6 py-3 font-mono font-semibold text-slate-800">
                          {s.departureDate} at {s.departureTime}
                        </td>
                        <td className="px-6 py-3 font-mono text-slate-600">{bus?.plateNumber}</td>
                        <td className="px-6 py-3 font-medium text-slate-600">{agency?.name}</td>
                        <td className="px-6 py-3">
                          <span className="font-bold text-emerald-700">{s.bookedSeats.length}</span> / {bus?.totalSeats || 28} seats
                        </td>
                        <td className="px-6 py-3 font-mono font-bold text-emerald-700 text-right tabular-nums">
                          {s.priceRwf.toLocaleString()} RWF
                        </td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search passenger, phone, or ticket..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Total: {scopedBookings.length} Bookings
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Ticket Ref</th>
                    <th className="px-4 py-3 font-semibold">Passenger</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Channel</th>
                    <th className="px-4 py-3 font-semibold">Seats</th>
                    <th className="px-4 py-3 font-semibold text-right">Amount (RWF)</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedBookings
                    .filter(
                      (b) =>
                        b.ticketNumber.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                        b.passengerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                        b.passengerPhone.includes(bookingSearch)
                    )
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                          {b.ticketNumber}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{b.passengerName}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">{b.passengerPhone}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              b.channel === 'ussd' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {b.channel}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold">
                          Seat #{b.seats.join(', ')}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 text-right tabular-nums">
                          {b.totalPriceRwf.toLocaleString()} RWF
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {b.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelBooking(b.id, b.ticketNumber)}
                              className="text-red-500 hover:text-red-700 font-semibold"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ROUTE CHANGES */}
        {activeTab === 'route_changes' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Route Change Audit Trail</h3>
              <p className="text-xs text-slate-500 mt-1">
                Log of all passenger route adjustments (origin & destination swaps) executed prior to bus departure.
              </p>
            </div>

            <div className="space-y-4">
              {tickets
                .filter((t) => t.routeChangeHistory && t.routeChangeHistory.length > 0)
                .map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-emerald-700">
                        Ticket: {t.ticketNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        Passenger: <span className="font-semibold text-slate-800">{t.passengerName}</span> ({t.passengerPhone})
                      </span>
                    </div>

                    {t.routeChangeHistory?.map((change) => (
                      <div key={change.changeId} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <span className="text-slate-500">
                            Changed At: {new Date(change.changedAt).toLocaleString()}
                          </span>
                          <span className="font-mono font-bold text-amber-700">
                            {change.fareDifferenceRwf > 0
                              ? `+${change.fareDifferenceRwf.toLocaleString()} RWF (Difference Paid)`
                              : change.fareDifferenceRwf < 0
                              ? `${change.fareDifferenceRwf.toLocaleString()} RWF (Credit Issued)`
                              : '0 RWF Even Swap'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Original Route</span>
                            <span className="font-bold text-slate-800">
                              {change.previousRoute.origin} → {change.previousRoute.destination}
                            </span>
                            <p className="text-slate-500 mt-0.5">
                              Seat #{change.previousRoute.seatNumber} · Fare: {change.previousRoute.priceRwf} RWF
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-emerald-700 uppercase font-semibold block">New Route</span>
                            <span className="font-bold text-slate-900">
                              {change.newRoute.origin} → {change.newRoute.destination}
                            </span>
                            <p className="text-slate-500 mt-0.5">
                              Seat #{change.newRoute.seatNumber} · Fare: {change.newRoute.priceRwf} RWF
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB: AGENCIES */}
        {activeTab === 'agencies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencies.map((agency) => (
              <div
                key={agency.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${agency.bannerColor} text-white flex items-center justify-center font-extrabold text-base shadow`}>
                    {agency.code}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{agency.name}</h4>
                    <p className="text-xs text-slate-500">{agency.headquarters}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3">
                  <div>
                    <span className="text-slate-400 block">Fleet Count</span>
                    <span className="font-bold text-slate-800 text-sm">{agency.totalFleet} Buses</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Rating</span>
                    <span className="font-bold text-emerald-700 text-sm">★ {agency.rating} / 5.0</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold block mb-1">Key Corridors:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                    {agency.popularRoutes.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: USSD */}
        {activeTab === 'ussd' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">USSD Gateway Dashboard (*888#)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Offline passenger access logs connecting Rwandan telecom operators (MTN Rwanda & Airtel Rwanda).
                </p>
              </div>
              <button
                onClick={onOpenUssd}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow"
              >
                Launch USSD Simulator
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 block">Active USSD Shortcode</span>
                <span className="text-2xl font-black text-slate-900 font-mono">*888#</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 block">Total USSD Bookings</span>
                <span className="text-2xl font-black text-amber-700 font-mono">{ussdBookingsCount}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 block">Telecom Gateways</span>
                <span className="text-xs font-bold text-slate-800 block mt-1">MTN Rwanda & Airtel Rwanda</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-base">Rwanda Transport Policies</h3>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-sm">Currency & Denomination</span>
                <p className="text-slate-600">Configured to Rwandan Franc (RWF). All transactions round to whole units.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-sm">Route Change Cutoff Policy</span>
                <p className="text-slate-600">
                  Passengers are allowed to change destination and departure up to 15 minutes prior to scheduled departure. Changes after departure or after boarding verification are strictly blocked.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-sm">One-Time Boarding Verification</span>
                <p className="text-slate-600">
                  Each ticket QR code is valid for exactly one boarding scan. Attempted second scans trigger duplicate alerts to prevent re-use.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Bus Modal */}
      {isAddBusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Register New Bus to Fleet</h3>
            <form onSubmit={handleCreateBus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plate Number</label>
                <input
                  type="text"
                  required
                  value={newBusPlate}
                  onChange={(e) => setNewBusPlate(e.target.value)}
                  placeholder="e.g. RAD 990 K"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bus Model</label>
                <select
                  value={newBusModel}
                  onChange={(e) => setNewBusModel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Toyota Coaster Executive">Toyota Coaster Executive (28 Seats)</option>
                  <option value="Yutong Intercity Coach">Yutong Intercity Coach (35 Seats)</option>
                  <option value="Scania Touring Long-Haul">Scania Touring Long-Haul (45 Seats)</option>
                  <option value="Isuzu Executive Coach">Isuzu Executive Coach (30 Seats)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operating Agency</label>
                <select
                  value={newBusAgency}
                  onChange={(e) => setNewBusAgency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBusOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow"
                >
                  Save Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {isAddRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add Intercity Route</h3>
            <form onSubmit={handleCreateRoute} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Origin City</label>
                <select
                  value={newRouteOrigin}
                  onChange={(e) => setNewRouteOrigin(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {RWANDA_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination City</label>
                <select
                  value={newRouteDest}
                  onChange={(e) => setNewRouteDest(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {RWANDA_CITIES.filter((c) => c !== newRouteOrigin).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Ticket Fare (RWF)</label>
                <input
                  type="number"
                  required
                  value={newRoutePrice}
                  onChange={(e) => setNewRoutePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRouteOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
