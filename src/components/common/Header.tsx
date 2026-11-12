import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bus, Menu, X, Ticket, Shield, User, PhoneCall, QrCode } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenUssd: () => void;
  onOpenScanner: () => void;
  onOpenAgencyCall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, onOpenUssd, onOpenScanner, onOpenAgencyCall }) => {
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminOrStaff = currentUser?.role === 'super_admin' || currentUser?.role === 'agency_admin' || currentUser?.role === 'ticket_staff';

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:bg-emerald-700 transition-colors">
                <Bus className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  BusGo<span className="text-emerald-600">.rw</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  RWANDA TRANSPORT
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap ${
                currentTab === 'home' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-1' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('search')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap ${
                currentTab === 'search' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-1' : ''
              }`}
            >
              Book a Ticket
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap ${
                currentTab === 'how-it-works' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-1' : ''
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('tracker')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'tracker' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-1' : ''
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Route Tracker
            </button>
            <button
              onClick={() => handleNavClick('agencies')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap ${
                currentTab === 'agencies' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-1' : ''
              }`}
            >
              Bus Agencies
            </button>
            <button
              onClick={() => handleNavClick('passenger')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'passenger' ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-1' : ''
              }`}
            >
              <Ticket className="w-4 h-4 text-emerald-600" />
              My Tickets
            </button>
            {isAdminOrStaff && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`hover:text-purple-700 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'admin' ? 'text-purple-700 font-bold border-b-2 border-purple-600 pb-1' : ''
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                Admin Portal
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Action buttons */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {onOpenAgencyCall && (
              <button
                onClick={onOpenAgencyCall}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap"
                title="Call agency support for delays, luggage, or platform questions"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span>Call Agency Help</span>
              </button>
            )}
            <button
              onClick={onOpenUssd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
              USSD *888#
            </button>
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-700" />
              Verify Ticket
            </button>
            <button
              onClick={() => handleNavClick('search')}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/30 transition-all whitespace-nowrap"
            >
              Find Buses
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {onOpenAgencyCall && (
              <button
                onClick={onOpenAgencyCall}
                className="p-1.5 text-blue-800 bg-blue-100 rounded-lg"
                title="Call Agency Support"
              >
                <PhoneCall className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenUssd}
              className="p-1.5 text-amber-800 bg-amber-100 rounded-lg"
              title="USSD *888#"
            >
              <PhoneCall className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => handleNavClick('home')}
            className="block w-full text-left py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('search')}
            className="block w-full text-left py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
          >
            Book a Ticket
          </button>
          <button
            onClick={() => handleNavClick('passenger')}
            className="block w-full text-left py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
          >
            Passenger Portal & My Tickets
          </button>
          <button
            onClick={() => handleNavClick('admin')}
            className="block w-full text-left py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
          >
            Administration Dashboard
          </button>
          <button
            onClick={() => handleNavClick('tracker')}
            className="block w-full text-left py-2 px-3 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-md"
          >
            Live Routes & GPS Tracker
          </button>
          <button
            onClick={() => handleNavClick('how-it-works')}
            className="block w-full text-left py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('agencies')}
            className="block w-full text-left py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
          >
            Bus Agencies
          </button>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {onOpenAgencyCall && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAgencyCall();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-blue-900 bg-blue-100 rounded-lg"
              >
                <PhoneCall className="w-4 h-4 text-blue-700" />
                Call Any Agency Helpdesk
              </button>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenScanner();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-slate-800 bg-slate-100 rounded-lg"
            >
              <QrCode className="w-4 h-4" />
              Ticket Scanner / Verification
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenUssd();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold text-slate-900 bg-amber-400 rounded-lg"
            >
              <PhoneCall className="w-4 h-4" />
              Open USSD Simulator (*888#)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
