import React from 'react';
import { Bus, MapPin, Phone, Mail, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenUssd: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenUssd }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Rwanda Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Bus className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                BusGo<span className="text-emerald-400">.rw</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Rwanda&apos;s smart bus ticket booking and queue management system. Connecting Kigali, Musanze, Huye, Rubavu, Rusizi, and all provinces via Web and USSD.
            </p>
            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                Supported Mobile Money
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-yellow-400 text-slate-950 font-bold rounded text-xs">
                  MTN MoMo (*182#)
                </span>
                <span className="px-2.5 py-1 bg-red-600 text-white font-bold rounded text-xs">
                  Airtel Money (*500#)
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-400 transition-colors">
                  Book a Ticket
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('passenger')} className="hover:text-emerald-400 transition-colors">
                  Passenger Portal & Tickets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracker')} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1">
                  <span>Live Route Tracker</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-emerald-400 transition-colors">
                  Administration Dashboard
                </button>
              </li>
              <li>
                <button onClick={onOpenUssd} className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                  USSD Simulator (*888#)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-emerald-400 transition-colors">
                  How Route Changes Work
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Hubs & Agencies */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Transport Hubs
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Nyabugogo Central Bus Terminal, Kigali</li>
              <li>Remera Eastern Bus Park, Kigali</li>
              <li>Musanze (Ruhengeri) Modern Park</li>
              <li>Huye (Butare) Bus Terminal</li>
              <li>Rubavu (Gisenyi) Border Station</li>
              <li>Rusizi (Kamembe) Intercity Gate</li>
              <li>Muhanga Interchange</li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Helpdesk & Stations
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>KN 1 Rd, Nyabugogo Bus Station, Kigali, Rwanda</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+250 788 123 456 / Toll-free: 3020</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@busgo.rw</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Demonstration frontend system for Rwandan passenger transport.</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} BusGo Rwanda. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Rwandan Franc (RWF)</span>
            <span>·</span>
            <span>English / Ikinyarwanda Ready</span>
            <span>·</span>
            <span>Zero Long Queues</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
