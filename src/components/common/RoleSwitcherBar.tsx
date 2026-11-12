import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck, User as UserIcon, Building2, QrCode, PhoneCall, RefreshCw } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface RoleSwitcherBarProps {
  onOpenUssd?: () => void;
  onOpenScanner?: () => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ onOpenUssd, onOpenScanner }) => {
  const { currentUser, switchDemoRole } = useAuth();

  const handleResetData = () => {
    if (window.confirm('Reset all BusGo demonstration data (schedules, seats, bookings) back to default?')) {
      storageService.resetToDefault();
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 no-print">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          Demo Role:
        </span>
        <span className="bg-slate-800 text-white font-medium px-2 py-0.5 rounded">
          {currentUser?.name} ({currentUser?.role === 'super_admin' ? 'Super Admin' : currentUser?.role === 'agency_admin' ? 'Agency Admin' : currentUser?.role === 'ticket_staff' ? 'Ticket Staff' : 'Passenger'})
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <span className="text-slate-400 hidden md:inline">Switch Role:</span>
        <button
          onClick={() => switchDemoRole('passenger')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            currentUser?.role === 'passenger' ? 'bg-emerald-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          Passenger
        </button>
        <button
          onClick={() => switchDemoRole('ticket_staff')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            currentUser?.role === 'ticket_staff' ? 'bg-amber-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          Station Staff
        </button>
        <button
          onClick={() => switchDemoRole('agency_admin', 'agency-volcano')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            currentUser?.role === 'agency_admin' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Volcano Admin
        </button>
        <button
          onClick={() => switchDemoRole('super_admin')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            currentUser?.role === 'super_admin' ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Super Admin
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>

        {onOpenUssd && (
          <button
            onClick={onOpenUssd}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded shadow-sm transition-all"
            title="Dial *888# to book or change route without internet"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>USSD *888#</span>
          </button>
        )}

        {onOpenScanner && (
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
            title="Verify ticket reference & barcode"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Verify Ticket</span>
          </button>
        )}

        <button
          onClick={handleResetData}
          className="p-1 hover:text-slate-100 text-slate-400 transition-colors"
          title="Reset demonstration data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
