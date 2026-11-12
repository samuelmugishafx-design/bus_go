import React, { useState } from 'react';
import { RWANDA_CITIES, INITIAL_AGENCIES } from '../../data/demoData';
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  QrCode,
  Clock,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  PhoneCall,
  Headphones,
} from 'lucide-react';

interface HomePageProps {
  onSearchSubmit: (origin: string, destination: string) => void;
  onOpenUssd: () => void;
  onOpenScanner: () => void;
  onOpenAgencyCall?: (agencyId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSearchSubmit, onOpenUssd, onOpenScanner, onOpenAgencyCall }) => {
  const [origin, setOrigin] = useState('Kigali (Nyabugogo)');
  const [destination, setDestination] = useState('Musanze (Ruhengeri)');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(origin, destination);
  };

  const POPULAR_DESTINATIONS = [
    {
      name: 'Musanze (Ruhengeri)',
      tag: 'Northern Province · Volcanoes National Park',
      fare: '2,800 RWF',
      duration: '2h direct',
      origin: 'Kigali (Nyabugogo)',
      agencies: 'Virunga & RITCO',
    },
    {
      name: 'Rubavu (Gisenyi)',
      tag: 'Western Province · Lake Kivu Coast',
      fare: '4,500 RWF',
      duration: '3h 30m',
      origin: 'Kigali (Nyabugogo)',
      agencies: 'RITCO & Stella',
    },
    {
      name: 'Huye (Butare)',
      tag: 'Southern Province · National Museum & University',
      fare: '3,200 RWF',
      duration: '2h 45m',
      origin: 'Kigali (Nyabugogo)',
      agencies: 'Volcano Express',
    },
    {
      name: 'Muhanga',
      tag: 'Southern Province · Central Transport Hub',
      fare: '1,500 RWF',
      duration: '1h direct',
      origin: 'Kigali (Nyabugogo)',
      agencies: 'Horizon & Volcano',
    },
    {
      name: 'Rusizi (Cyangugu)',
      tag: 'Western Province · Nyungwe Forest & Border',
      fare: '7,500 RWF',
      duration: '5h 45m',
      origin: 'Kigali (Nyabugogo)',
      agencies: 'RITCO Intercity',
    },
    {
      name: 'Nyagatare',
      tag: 'Eastern Province · Savannah Plains',
      fare: '4,000 RWF',
      duration: '3h 15m',
      origin: 'Kigali (Remera)',
      agencies: 'Capital Express',
    },
  ];

  const FAQS = [
    {
      q: 'Can I change my travel route if my plans change?',
      a: 'Yes! BusGo allows you to modify BOTH your departure and destination location before the bus departs. Simply open "My Tickets" in your dashboard, click "Change Route", and pick your new route. Any fare difference is calculated automatically: you pay extra via MoMo if the new route is higher, or receive credit if lower.',
    },
    {
      q: 'Can I book a bus ticket if I do not have internet or a smartphone?',
      a: 'Yes, absolutely. BusGo provides an offline USSD service on *888# compatible with any mobile phone in Rwanda. You can search routes, choose departure times, pay with MTN MoMo (*182#) or Airtel Money (*500#), and receive an instant SMS ticket reference.',
    },
    {
      q: 'How does ticket verification work at Nyabugogo Bus Station?',
      a: 'Station staff use the BusGo Station Scanner to verify your digital QR code or 10-digit ticket reference. Each ticket is strictly one-time boarding; duplicate scans are automatically flagged to prevent unauthorized re-entry.',
    },
    {
      q: 'What payment methods are supported in Rwanda?',
      a: 'BusGo supports Rwanda’s two primary mobile money switches: MTN MoMo (*182#) and Airtel Money (*500#). Transactions are processed instantly in Rwandan Franc (RWF).',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        {/* Background Graphic / Image */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          <img
            src="/src/assets/images/hero_rwanda_bus_1794468826279.jpg"
            alt="Executive Bus Traveling Across Rwanda Hills"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Rwanda&apos;s Smart Intercity Bus Ticketing Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Travel Across Rwanda <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                  Without Long Queues
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Book express buses from Kigali, Musanze, Huye, Rubavu, and all provinces. Select your favorite seat, pay with MTN MoMo or Airtel Money, and change your travel route flexibly before departure.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onSearchSubmit(origin, destination)}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
                >
                  <span>Book Bus Ticket Online</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenUssd}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm border border-slate-700 transition-all flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Try USSD Dial *888#</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Zero Queue Waiting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Flexible Route Changes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Instant QR Boarding Pass</span>
                </div>
              </div>
            </div>

            {/* Right Column: Search Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-600" />
                    Quick Bus Finder
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    RWF Fares
                  </span>
                </div>

                <form onSubmit={handleHeroSearch} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Departure City / Station
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <select
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      >
                        {RWANDA_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Arrival Destination
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                      <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      >
                        {RWANDA_CITIES.filter((c) => c !== origin).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Travel Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Find Matching Buses</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Destinations in Rwanda */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Cross-Country Travel
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Popular Intercity Routes in Rwanda
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Frequent daily departures connecting Kigali to all four provinces.
            </p>
          </div>
          <button
            onClick={() => onSearchSubmit('Kigali (Nyabugogo)', 'Musanze (Ruhengeri)')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0"
          >
            <span>View all schedules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_DESTINATIONS.map((dest, idx) => (
            <div
              key={idx}
              onClick={() => onSearchSubmit(dest.origin, dest.name)}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>{dest.origin}</span>
                  <span className="font-semibold text-slate-700">{dest.duration}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                  <span>{dest.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">{dest.tag}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Operated by {dest.agencies}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Standard Fare</span>
                  <span className="font-mono font-bold text-emerald-700 text-base">
                    {dest.fare}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Book Now <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Terminal & Ticketing Spotlight (Using generated terminal image) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xl border border-slate-800">
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-6">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Nyabugogo & Regional Hubs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Eliminating Passenger Queues at Rwandan Bus Terminals
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every morning thousands of travelers rush to Nyabugogo Bus Park in Kigali. With BusGo, passengers book in advance, pick their seats, and walk directly to Platform Bays 1-8 without waiting in line at physical ticket counters.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-emerald-400 font-bold block text-sm">Under 60 Seconds</span>
                <span className="text-slate-400 mt-0.5 block">Average mobile ticket purchase</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-emerald-400 font-bold block text-sm">100% Guaranteed</span>
                <span className="text-slate-400 mt-0.5 block">Seat reserved upon payment</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenScanner}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Station Staff Ticket Verification Demo</span>
              </button>
            </div>
          </div>
          <div className="lg:col-span-6 relative min-h-[300px]">
            <img
              src="/src/assets/images/rwanda_bus_terminal_1794468827540.jpg"
              alt="Nyabugogo Bus Terminal in Kigali Rwanda"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* 4. How BusGo Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            How BusGo Works
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            From search to boarding your express coach in Rwanda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 relative">
            <span className="text-3xl font-black text-slate-200 font-mono block mb-2">01</span>
            <h3 className="text-base font-bold text-slate-900">Search Route</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Enter your departure town and destination in Rwanda, select travel date and view all available bus schedules.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 relative">
            <span className="text-3xl font-black text-slate-200 font-mono block mb-2">02</span>
            <h3 className="text-base font-bold text-slate-900">Select Seat</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              View the realistic bus layout, see open window or aisle seats, or let the system auto-assign an optimal seat.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 relative">
            <span className="text-3xl font-black text-slate-200 font-mono block mb-2">03</span>
            <h3 className="text-base font-bold text-slate-900">Pay via MoMo</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Authorize payment instantly using MTN Mobile Money (*182#) or Airtel Money (*500#) with zero hidden fees.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 relative">
            <span className="text-3xl font-black text-slate-200 font-mono block mb-2">04</span>
            <h3 className="text-base font-bold text-slate-900">Board with QR</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Show your digital QR boarding pass or SMS code at the terminal gate. Inspector scans and clears you immediately.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Route Change Feature Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-emerald-50 border border-amber-200 rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded">
              Exclusive BusGo Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Change Your Route & Destination Before Bus Departure
            </h2>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              Changed your travel plans? Unlike traditional ticket offices that refuse changes, BusGo empowers you to swap both departure station and arrival destination before bus departure.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-amber-200/70 shadow-sm">
                <span className="font-bold text-slate-900 block">Both Stations Flexible</span>
                <span className="text-slate-500 mt-1 block">Change Kigali → Huye to Muhanga → Musanze</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-amber-200/70 shadow-sm">
                <span className="font-bold text-slate-900 block">Instant Fare Difference</span>
                <span className="text-slate-500 mt-1 block">Pay surplus via MoMo or receive travel credit</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-amber-200/70 shadow-sm">
                <span className="font-bold text-slate-900 block">Auto Invalidation</span>
                <span className="text-slate-500 mt-1 block">Old ticket is cancelled and updated pass generated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Participating Bus Agencies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Multi-Agency Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Participating Bus Agencies in Rwanda
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Directly connected to agency fleet management and terminal dispatch.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {INITIAL_AGENCIES.map((agency) => (
            <div
              key={agency.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-emerald-400 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 mx-auto rounded-xl ${agency.bannerColor} text-white flex items-center justify-center font-black text-sm mb-2 shadow`}>
                  {agency.code}
                </div>
                <h4 className="font-bold text-slate-900 text-xs">{agency.name}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{agency.totalFleet} Buses</p>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                  ★ {agency.rating}
                </span>
              </div>
              {onOpenAgencyCall && (
                <button
                  onClick={() => onOpenAgencyCall(agency.id)}
                  className="mt-3 w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                  title={`Call ${agency.name} Dispatch Helpdesk`}
                >
                  <PhoneCall className="w-3 h-3 text-blue-600" />
                  <span>Call Desk</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Agency Direct Help & Luggage Support Banner */}
        <div className="mt-8 p-6 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Direct Agency Contact & Terminal Help</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                  Volcano · RITCO · Horizon · Virunga · Stella · Capital
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Have an urgent luggage inquiry, missed your scheduled departure, or need platform bay directions at Nyabugogo? Call any agency dispatch desk directly with zero wait time.
              </p>
            </div>
          </div>
          {onOpenAgencyCall && (
            <button
              onClick={() => onOpenAgencyCall()}
              className="shrink-0 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-slate-900" />
              <span>Call Any Agency Helpdesk</span>
            </button>
          )}
        </div>
      </section>

      {/* 7. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left px-6 py-4 flex items-center justify-between text-sm font-bold text-slate-800 hover:text-emerald-700 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
