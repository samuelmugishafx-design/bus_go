import React from 'react';
import { Search, MapPin, Smartphone, CreditCard, QrCode, RefreshCw, Clock, ArrowRight } from 'lucide-react';

interface HowItWorksPageProps {
  onNavigateToBooking: () => void;
  onOpenUssd: () => void;
  onOpenScanner: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onNavigateToBooking,
  onOpenUssd,
  onOpenScanner,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Passenger Guide
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How BusGo Works Across Rwanda
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Eliminating long waiting queues at Nyabugogo and regional stations through modern digital ticketing and accessible USSD.
          </p>
        </div>

        {/* 2 Channels: Web vs USSD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Web Journey */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Web App Booking</h3>
                <span className="text-xs text-slate-500">For smartphones, tablets & laptops</span>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
              <li className="pl-1">
                <strong className="text-slate-800">Search route:</strong> Select your Rwandan departure station (e.g. Nyabugogo) and destination (Musanze, Huye, Rubavu, etc.).
              </li>
              <li className="pl-1">
                <strong className="text-slate-800">Pick bus & seat:</strong> View bus amenities (Wi-Fi, AC), departure times, and click your preferred seat in the interactive cabin layout.
              </li>
              <li className="pl-1">
                <strong className="text-slate-800">Instant MoMo push:</strong> Enter your MTN or Airtel mobile number and authorize payment on your handset.
              </li>
              <li className="pl-1">
                <strong className="text-slate-800">QR boarding pass:</strong> Receive an instant digital boarding pass with verifiable QR code.
              </li>
            </ol>

            <button
              onClick={onNavigateToBooking}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>Search Bus Schedules</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* USSD Journey */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">USSD *888# Booking</h3>
                <span className="text-xs text-slate-500">Works on all basic phones without internet</span>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
              <li className="pl-1">
                <strong className="text-slate-800">Dial *888#:</strong> Opens the BusGo Rwanda interactive USSD prompt from any local SIM.
              </li>
              <li className="pl-1">
                <strong className="text-slate-800">Select numbers:</strong> Choose 1 to Book Ticket, pick departure and arrival stations from numbered menus.
              </li>
              <li className="pl-1">
                <strong className="text-slate-800">Confirm payment:</strong> Authorize fare via MTN MoMo (*182#) or Airtel Money (*500#).
              </li>
              <li className="pl-1">
                <strong className="text-slate-800">SMS Confirmation:</strong> Receive an official SMS with ticket reference, bus plate, seat number, and departure time.
              </li>
            </ol>

            <button
              onClick={onOpenUssd}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>Launch USSD Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Route Change Policy Section */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Official Route Change Policy</h3>
              <p className="text-xs text-slate-400">Flexibility for Rwandan passengers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <h4 className="font-bold text-white text-sm mb-1">Departure Cutoff</h4>
              <p>
                Route changes are permitted at any time prior to bus departure. Once the bus has departed or the passenger has boarded, tickets become locked.
              </p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <h4 className="font-bold text-white text-sm mb-1">Fare Differences</h4>
              <p>
                If your new destination has a higher fare, you only pay the exact difference via Mobile Money. If it is lower, you receive travel credit.
              </p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <h4 className="font-bold text-white text-sm mb-1">Invalidation</h4>
              <p>
                Your previous seat and ticket reference are automatically cancelled so that other waiting passengers can book the released seat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
