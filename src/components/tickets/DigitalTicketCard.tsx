import React, { useEffect, useState } from 'react';
import { Ticket } from '../../types';
import { ticketService } from '../../services/ticketService';
import { Bus, Calendar, Clock, MapPin, Printer, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw, PhoneCall } from 'lucide-react';

interface DigitalTicketCardProps {
  ticket: Ticket;
  onOpenRouteChange?: (ticket: Ticket) => void;
  onCancelTicket?: (ticket: Ticket) => void;
  onTrackTicket?: (ticketNumber: string) => void;
  onCallAgency?: (agencyId: string, ticketNumber: string) => void;
  showActions?: boolean;
}

export const DigitalTicketCard: React.FC<DigitalTicketCardProps> = ({
  ticket,
  onOpenRouteChange,
  onCancelTicket,
  onTrackTicket,
  onCallAgency,
  showActions = true,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    ticketService.generateQRCodeDataUrl(ticket.ticketNumber).then((url) => {
      if (isMounted) setQrCodeUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [ticket.ticketNumber]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (ticket.ticketStatus) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            VALID TICKET
          </span>
        );
      case 'boarded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            BOARDED & VERIFIED
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            CANCELLED
          </span>
        );
      case 'route_changed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <RefreshCw className="w-3.5 h-3.5" />
            ROUTE CHANGED (REPLACED)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden max-w-2xl mx-auto my-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
            <Bus className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block">
              Official Rwanda Digital Boarding Pass
            </span>
            <span className="text-sm font-bold text-white tracking-tight">
              BusGo Rwanda Intercity Express
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase">Ticket Ref</span>
          <span className="font-mono font-bold text-base text-white tracking-wider">
            {ticket.ticketNumber}
          </span>
        </div>
      </div>

      {/* Main Ticket Body */}
      <div className="p-6">
        {/* Status & Channel */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium uppercase">
              Via {ticket.channel === 'ussd' ? 'USSD (*888#)' : 'Web App'}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Booked on {new Date(ticket.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Route Origin & Destination */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-dashed border-slate-200">
          <div className="text-center sm:text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Departure Station
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xl font-black text-slate-900">{ticket.origin}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-0.5 bg-slate-300 relative my-2">
              <ArrowRight className="w-4 h-4 text-emerald-600 absolute -top-2 left-1/2 -translate-x-1/2" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">Scheduled Direct</span>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Arrival Destination
            </span>
            <div className="flex items-center gap-1.5 mt-1 sm:justify-end">
              <span className="text-xl font-black text-slate-900">{ticket.destination}</span>
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
          </div>
        </div>

        {/* Schedule & Seat Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-medium">Travel Date</span>
            <div className="flex items-center gap-1 mt-1 font-bold text-slate-800 text-sm">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{ticket.departureDate}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-medium">Departure Time</span>
            <div className="flex items-center gap-1 mt-1 font-bold text-slate-800 text-sm font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{ticket.departureTime}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-medium">Assigned Seat</span>
            <div className="mt-1 font-extrabold text-emerald-700 text-base font-mono">
              Seat #{ticket.seatNumber}
            </div>
          </div>

          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-medium">Bus Plate & Model</span>
            <div className="mt-1 font-bold text-slate-800 text-sm">
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded mr-1">{ticket.busPlate}</span>
            </div>
          </div>
        </div>

        {/* Passenger, Payment & QR Code */}
        <div className="pt-5 flex flex-col-reverse sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1 w-full text-left">
            <div>
              <span className="text-xs text-slate-400 uppercase font-medium block">Passenger Name</span>
              <span className="font-bold text-slate-900 text-sm">{ticket.passengerName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-medium block">Phone Number</span>
              <span className="font-mono text-slate-700 font-semibold text-sm">{ticket.passengerPhone}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-medium block">Fare Paid</span>
              <span className="font-mono font-extrabold text-emerald-700 text-lg tabular-nums">
                {ticket.priceRwf.toLocaleString()} RWF
              </span>
              <span className="text-xs text-slate-500 ml-2">
                via {ticket.paymentMethod === 'MTN_MOMO' ? 'MTN MoMo' : 'Airtel Money'}
              </span>
            </div>

            {ticket.boardedAt && (
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
                <span className="font-bold">Boarding Inspected:</span>{' '}
                {new Date(ticket.boardedAt).toLocaleTimeString()} by inspector {ticket.verifiedByStaffName || 'Staff'}
              </div>
            )}
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center shrink-0 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt={`QR code for ticket ${ticket.ticketNumber}`}
                className="w-32 h-32 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-32 h-32 bg-slate-200 flex items-center justify-center text-xs text-slate-500 font-mono">
                Generating QR...
              </div>
            )}
            <span className="text-[10px] text-slate-500 font-mono mt-1">Scan at Gate / Station</span>
          </div>
        </div>

        {/* Route Change History if any */}
        {ticket.routeChangeHistory && ticket.routeChangeHistory.length > 0 && (
          <div className="mt-5 p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-2">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>Route Change Audit Trail</span>
            </div>
            {ticket.routeChangeHistory.map((rec, i) => (
              <div key={i} className="text-amber-800 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/60">
                <span>
                  Changed from <span className="font-bold">{rec.previousRoute.origin} → {rec.previousRoute.destination}</span> (Seat {rec.previousRoute.seatNumber}) to <span className="font-bold">{rec.newRoute.origin} → {rec.newRoute.destination}</span> (Seat {rec.newRoute.seatNumber})
                </span>
                <span className="font-mono font-semibold">
                  {rec.fareDifferenceRwf > 0 ? `+${rec.fareDifferenceRwf} RWF paid` : rec.fareDifferenceRwf < 0 ? `${rec.fareDifferenceRwf} RWF credit` : '0 RWF difference'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {showActions && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>

            {onTrackTicket && (
              <button
                onClick={() => onTrackTicket(ticket.ticketNumber)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Track Bus Live</span>
              </button>
            )}

            {onCallAgency && (
              <button
                onClick={() => onCallAgency(ticket.agencyId, ticket.ticketNumber)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-sm"
                title="Call agency support for luggage, delay, or bay assistance"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span>Call Agency Help</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {ticket.ticketStatus === 'valid' && onOpenRouteChange && (
              <button
                onClick={() => onOpenRouteChange(ticket)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors"
                title="Change departure and destination before bus leaves"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Route / Station
              </button>
            )}

            {ticket.ticketStatus === 'valid' && onCancelTicket && (
              <button
                onClick={() => onCancelTicket(ticket)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
              >
                Cancel Ticket
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
