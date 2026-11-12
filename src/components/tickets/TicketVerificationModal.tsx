import React, { useState } from 'react';
import { ticketService, VerificationResult } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import { X, QrCode, Search, CheckCircle2, AlertTriangle, ShieldCheck, Bus, User, MapPin } from 'lucide-react';

interface TicketVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTicketNumber?: string;
}

export const TicketVerificationModal: React.FC<TicketVerificationModalProps> = ({
  isOpen,
  onClose,
  initialTicketNumber = '',
}) => {
  const { currentUser } = useAuth();
  const [ticketInput, setTicketInput] = useState<string>(initialTicketNumber);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [boardingMessage, setBoardingMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleVerify = (refToVerify?: string) => {
    const ref = refToVerify || ticketInput;
    if (!ref.trim()) return;

    setBoardingMessage('');
    const res = ticketService.verifyTicket(ref);
    setResult(res);
  };

  const handleConfirmBoarding = () => {
    if (!result?.ticket) return;

    const res = ticketService.confirmBoarding(result.ticket.ticketNumber, currentUser || undefined);
    if (res.success && res.ticket) {
      setBoardingMessage(res.message);
      // Re-verify to show updated status
      setResult(ticketService.verifyTicket(res.ticket.ticketNumber));
    } else {
      setBoardingMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Station Ticket Verification</h3>
              <p className="text-[11px] text-slate-400">
                Staff: {currentUser?.name || 'Nyabugogo Inspector'} · {currentUser?.stationLocation || 'Gate 4'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Input & Search */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Enter or Scan Ticket Reference
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="e.g. BG-RW-2026-7841"
                  className="w-full pl-3 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono uppercase font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleVerify()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Verify</span>
              </button>
            </div>

            {/* Quick demo tickets shortcut */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex-wrap">
              <span>Quick Test:</span>
              <button
                type="button"
                onClick={() => {
                  setTicketInput('BG-RW-2026-7841');
                  handleVerify('BG-RW-2026-7841');
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono"
              >
                BG-RW-2026-7841 (Valid)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTicketInput('BG-RW-2026-9214');
                  handleVerify('BG-RW-2026-9214');
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono"
              >
                BG-RW-2026-9214 (Boarded)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTicketInput('BG-RW-2026-6188');
                  handleVerify('BG-RW-2026-6188');
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono"
              >
                BG-RW-2026-6188 (Route Changed)
              </button>
            </div>
          </div>

          {/* Verification Results */}
          {result && (
            <div className="space-y-4 pt-2">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border text-sm flex items-start gap-3 ${
                  result.status === 'valid'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : result.status === 'already_boarded'
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : result.status === 'cancelled'
                    ? 'bg-red-50 border-red-300 text-red-900'
                    : result.status === 'route_changed'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                {result.status === 'valid' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-base">
                    {result.status === 'valid'
                      ? 'VALID TICKET — CLEARED FOR BOARDING'
                      : result.status === 'already_boarded'
                      ? 'WARNING: ALREADY BOARDED (DUPLICATE ATTEMPT)'
                      : result.status === 'route_changed'
                      ? 'NOTICE: TICKET SUPERSEDED BY ROUTE CHANGE'
                      : result.status === 'cancelled'
                      ? 'INVALID: TICKET CANCELLED'
                      : 'INVALID TICKET REFERENCE'}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed">{result.message}</p>
                </div>
              </div>

              {/* Ticket Details Preview */}
              {result.ticket && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Passenger:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {result.ticket.passengerName} ({result.ticket.passengerPhone})
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Route:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {result.ticket.origin} → {result.ticket.destination}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Bus & Seat:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Bus className="w-3.5 h-3.5 text-slate-500" />
                      {result.ticket.busPlate} · <span className="text-emerald-700 font-extrabold font-mono">Seat #{result.ticket.seatNumber}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Departure Schedule:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {result.ticket.departureDate} at {result.ticket.departureTime}
                    </span>
                  </div>
                </div>
              )}

              {boardingMessage && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold text-center">
                  {boardingMessage}
                </div>
              )}

              {/* Confirm Boarding Button */}
              {result.status === 'valid' && (
                <button
                  type="button"
                  onClick={handleConfirmBoarding}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Passenger Boarding (Mark Boarded)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
