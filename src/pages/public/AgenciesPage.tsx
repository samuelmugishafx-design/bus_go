import React from 'react';
import { INITIAL_AGENCIES } from '../../data/demoData';
import { Bus, MapPin, Phone, Mail, Star, ArrowRight, PhoneCall, Headphones, MessageCircle } from 'lucide-react';

interface AgenciesPageProps {
  onSelectAgency: (agencyId: string) => void;
  onCallAgency?: (agencyId: string) => void;
}

export const AgenciesPage: React.FC<AgenciesPageProps> = ({ onSelectAgency, onCallAgency }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Licensed Transport Companies
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Participating Bus Agencies in Rwanda
          </h1>
          <p className="text-sm text-slate-600">
            BusGo aggregates licensed passenger coach operators across Rwanda into a unified real-time booking and queue management system. Have an issue with luggage or bus boarding? Contact any agency dispatch desk directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_AGENCIES.map((agency) => (
            <div
              key={agency.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl ${agency.bannerColor} text-white flex items-center justify-center font-black text-lg shadow-md`}>
                    {agency.code}
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-emerald-600" />
                    <span>{agency.rating}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-extrabold text-slate-900">{agency.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{agency.headquarters}</span>
                  </p>
                  {agency.dispatchDesk && (
                    <div className="mt-2 text-[11px] text-blue-800 bg-blue-50/80 p-2 rounded-xl border border-blue-200">
                      <span className="font-bold">Station Desk:</span> {agency.dispatchDesk}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3 mt-4">
                  <div>
                    <span className="text-slate-400 block">Active Fleet</span>
                    <span className="font-bold text-slate-800 text-sm">{agency.totalFleet} Coaches</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Key Corridors</span>
                    <span className="font-bold text-slate-800 text-sm">{agency.activeRoutesCount} Districts</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                    Popular Routes
                  </span>
                  <ul className="space-y-1 text-slate-600">
                    {agency.popularRoutes.map((r, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hotlines info */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 text-[11px]">Main Dispatch:</span>
                    <a href={`tel:${agency.phone}`} className="font-mono font-semibold text-emerald-700 hover:underline">
                      {agency.phone}
                    </a>
                  </div>
                  {agency.emergencyHotline && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 text-[11px]">24/7 Hotline:</span>
                      <a href={`tel:${agency.emergencyHotline}`} className="font-mono font-semibold text-blue-700 hover:underline">
                        {agency.emergencyHotline}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onCallAgency && onCallAgency(agency.id)}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  title="Call agency support for luggage, delay, or bay queries"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Dispatch</span>
                </button>

                <button
                  onClick={() => onSelectAgency(agency.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>View Buses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
