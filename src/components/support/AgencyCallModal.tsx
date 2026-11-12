import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { Agency } from '../../types';
import {
  PhoneCall,
  PhoneForwarded,
  X,
  MessageSquare,
  AlertCircle,
  Clock,
  MapPin,
  ShieldAlert,
  Headphones,
  CheckCircle2,
  Briefcase,
  PhoneOff,
} from 'lucide-react';

interface AgencyCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAgencyId?: string;
  ticketNumber?: string;
}

export const AgencyCallModal: React.FC<AgencyCallModalProps> = ({
  isOpen,
  onClose,
  initialAgencyId,
  ticketNumber,
}) => {
  const agencies = storageService.getAgencies();
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(
    initialAgencyId || agencies[0]?.id || 'agency-volcano'
  );

  useEffect(() => {
    if (initialAgencyId) {
      setSelectedAgencyId(initialAgencyId);
    }
  }, [initialAgencyId]);

  const [selectedIssue, setSelectedIssue] = useState<string>('delay');
  const [isSimulatingCall, setIsSimulatingCall] = useState<boolean>(false);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callTimer, setCallTimer] = useState<number>(0);

  const selectedAgency = agencies.find((a) => a.id === selectedAgencyId) || agencies[0];

  if (!isOpen) return null;

  const handleStartSimulatedCall = () => {
    setIsSimulatingCall(true);
    setCallState('calling');
    setCallTimer(0);

    // Ringing for 2 seconds then connect
    setTimeout(() => {
      setCallState('connected');
    }, 2000);
  };

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => {
      setIsSimulatingCall(false);
      setCallState('idle');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm no-print">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <PhoneCall className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Agency Support & Dispatch Line</h3>
              <p className="text-[11px] text-slate-400">
                Direct communication with bus operators across Rwanda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* In-Call Simulation Overlay */}
        {isSimulatingCall ? (
          <div className="p-8 text-center bg-slate-950 text-white space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center relative">
              <Headphones className="w-10 h-10 text-emerald-400 animate-pulse" />
              {callState === 'calling' && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
              )}
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                {callState === 'calling'
                  ? 'Connecting to Dispatcher...'
                  : callState === 'connected'
                  ? 'Call Connected (HD Audio)'
                  : 'Call Ended'}
              </span>
              <h4 className="text-xl font-black mt-1">{selectedAgency?.name}</h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedAgency?.phone}</p>
            </div>

            {callState === 'connected' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Dispatcher: Jean-Paul (Nyabugogo Bay 4 Counter)</span>
                </div>
                <p className="text-slate-300 italic">
                  &ldquo;Muraho! Volcano Express Nyabugogo terminal desk. I see you are inquiring regarding ticket {ticketNumber || 'reference'}. Your coach is on schedule, currently passing Muhanga. How can I assist you?&rdquo;
                </p>
              </div>
            )}

            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={handleEndCall}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Ticket Context if provided */}
            {ticketNumber && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs flex items-center justify-between">
                <span className="text-slate-600 font-medium">Inquiry for Ticket:</span>
                <span className="font-mono font-bold text-emerald-800">{ticketNumber}</span>
              </div>
            )}

            {/* Step 1: Select Agency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Bus Agency to Call
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {agencies.map((agency) => {
                  const isSelected = selectedAgencyId === agency.id;
                  return (
                    <button
                      key={agency.id}
                      type="button"
                      onClick={() => setSelectedAgencyId(agency.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span className="text-xs block truncate">{agency.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {agency.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Reason for Calling */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. What problem do you need help with?
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedIssue('delay')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedIssue === 'delay'
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 mb-1 text-emerald-600" />
                  <span>Bus Delay / ETA Inquiry</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIssue('luggage')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedIssue === 'luggage'
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 mb-1 text-amber-600" />
                  <span>Lost Luggage / Item</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIssue('terminal')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedIssue === 'terminal'
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 mb-1 text-blue-600" />
                  <span>Platform / Gate Bay Location</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIssue('urgent_change')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedIssue === 'urgent_change'
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 mb-1 text-red-600" />
                  <span>Emergency Assistance</span>
                </button>
              </div>
            </div>

            {/* Agency Contact Card & Direct Buttons */}
            {selectedAgency && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-base">{selectedAgency.name}</h4>
                    <p className="text-xs text-slate-500">{selectedAgency.headquarters}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    DISPATCH OPEN 24/7
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Dispatch Desk:</span>
                    <span className="font-semibold text-slate-800">{selectedAgency.dispatchDesk || 'Nyabugogo Terminal'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Main Hotline:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedAgency.phone}</span>
                  </div>
                  {selectedAgency.lostAndFoundPhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lost & Found Desk:</span>
                      <span className="font-mono font-bold text-amber-700">{selectedAgency.lostAndFoundPhone}</span>
                    </div>
                  )}
                </div>

                {/* Direct Dial Buttons */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Real Click to Dial */}
                  <a
                    href={`tel:${selectedAgency.phone.replace(/\s+/g, '')}`}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Hotline Now</span>
                  </a>

                  {/* WhatsApp Support Link */}
                  <a
                    href={`https://wa.me/${selectedAgency.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(
                      selectedAgency.name
                    )},%20I%20need%20help%20with%20my%20BusGo%20booking%20${ticketNumber || ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Support</span>
                  </a>
                </div>

                {/* Browser Simulation Button */}
                <button
                  type="button"
                  onClick={handleStartSimulatedCall}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Headphones className="w-4 h-4 text-emerald-400" />
                  <span>Simulate Call in Browser (Audio Demo)</span>
                </button>
              </div>
            )}

            {/* National Central BusGo Hotline */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <span className="font-bold block">National Rwanda Transport Hotline:</span>
                <span className="text-slate-600">Toll-free 24/7 passenger assistance</span>
              </div>
              <a
                href="tel:3020"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 font-mono"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>3020</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
