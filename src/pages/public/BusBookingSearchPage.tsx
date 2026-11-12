import React, { useState, useMemo } from 'react';
import { RWANDA_CITIES } from '../../data/demoData';
import { bookingService, EnrichedSchedule } from '../../services/bookingService';
import { storageService } from '../../services/storageService';
import { SeatSelector } from '../../components/booking/SeatSelector';
import { PaymentModal } from '../../components/booking/PaymentModal';
import { DigitalTicketCard } from '../../components/tickets/DigitalTicketCard';
import { Ticket, PaymentMethod } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Clock,
  Bus,
  Filter,
  ArrowUpDown,
  Check,
  Wifi,
  Zap,
  ArrowRight,
  ShieldCheck,
  X,
  PhoneCall,
} from 'lucide-react';

interface BusBookingSearchPageProps {
  initialOrigin?: string;
  initialDestination?: string;
  onNavigateToPassenger?: () => void;
  onOpenRouteChange?: (ticket: Ticket) => void;
  onCallAgency?: (agencyId: string, ticketNumber?: string) => void;
}

export const BusBookingSearchPage: React.FC<BusBookingSearchPageProps> = ({
  initialOrigin = 'Kigali (Nyabugogo)',
  initialDestination = 'Musanze (Ruhengeri)',
  onNavigateToPassenger,
  onOpenRouteChange,
  onCallAgency,
}) => {
  const { currentUser } = useAuth();

  // Search form state
  const [origin, setOrigin] = useState<string>(initialOrigin);
  const [destination, setDestination] = useState<string>(initialDestination);
  const [travelDate, setTravelDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [passengerCount, setPassengerCount] = useState<number>(1);

  // Filters & Sorting
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'seats'>('time');

  // Booking drawer / flow state
  const [activeSchedule, setActiveSchedule] = useState<EnrichedSchedule | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [passengerName, setPassengerName] = useState<string>(currentUser?.name || 'Samuel Mugisha');
  const [passengerPhone, setPassengerPhone] = useState<string>(currentUser?.phone || '+250 788 123 456');
  const [passengerEmail, setPassengerEmail] = useState<string>(currentUser?.email || 'samuel.mugisha@gmail.com');

  // Payment Modal state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState<Ticket | null>(null);

  const agencies = useMemo(() => storageService.getAgencies(), []);

  // Filtered schedules
  const searchResults = useMemo(() => {
    return bookingService.searchSchedules({
      origin: origin === 'all' ? undefined : origin,
      destination: destination === 'all' ? undefined : destination,
      agencyId: selectedAgency,
      sortBy,
    });
  }, [origin, destination, selectedAgency, sortBy]);

  const handleSelectScheduleForBooking = (sched: EnrichedSchedule) => {
    setActiveSchedule(sched);
    // Auto assign initial available seat
    const autoSeat = bookingService.autoAssignSeat(sched.id);
    setSelectedSeat(autoSeat);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchedule || !selectedSeat) return;
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async (method: PaymentMethod, phone: string) => {
    if (!activeSchedule || !selectedSeat) return;

    const res = await bookingService.processBooking({
      scheduleId: activeSchedule.id,
      passengerName,
      passengerPhone: phone.startsWith('+250') ? phone : `+250 ${phone.replace(/^0/, '')}`,
      passengerEmail,
      seatNumber: selectedSeat,
      paymentMethod: method,
      channel: 'web',
    });

    setIsPaymentOpen(false);
    if (res.success && res.ticket) {
      setConfirmedTicket(res.ticket);
      setActiveSchedule(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Title & Rwanda Context */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
            Verified Rwanda Intercity Express
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Search & Book Rwanda Bus Tickets
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Realtime schedules, interactive seat layout, and guaranteed reservations via MTN MoMo and Airtel Money.
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Origin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                From (Departure)
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Rwanda Stations</option>
                {RWANDA_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                To (Destination)
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Destinations</option>
                {RWANDA_CITIES.filter((c) => c !== origin).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Travel Date
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Passengers */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Passengers
              </label>
              <select
                value={passengerCount}
                onChange={(e) => setPassengerCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} Passenger{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Filter Bar & Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-3.5 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-bold text-slate-900 text-sm">
              {searchResults.length} Buses Available
            </span>
            <span>·</span>
            <span>Rwandan Franc (RWF)</span>
          </div>

          <div className="flex items-center flex-wrap gap-4">
            {/* Filter by Agency */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 font-medium">Agency:</span>
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-medium"
              >
                <option value="all">All Agencies</option>
                {agencies.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-medium"
              >
                <option value="time">Departure Time</option>
                <option value="price">Price (Lowest)</option>
                <option value="seats">Most Seats Available</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ticket Confirmed Banner / Card if booking just finished */}
        {confirmedTicket && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 shadow-sm text-center space-y-4 animate-in fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs">
              <Check className="w-3.5 h-3.5" />
              TICKET ISSUED & RESERVED
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Your BusGo Rwanda Ticket is Ready!
            </h3>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Ticket reference <span className="font-mono font-bold text-emerald-800">{confirmedTicket.ticketNumber}</span> has been confirmed. You can show this QR code at Nyabugogo or boarding station.
            </p>
            <DigitalTicketCard
              ticket={confirmedTicket}
              onOpenRouteChange={onOpenRouteChange}
              onCallAgency={onCallAgency}
            />
            <div className="pt-2 flex justify-center gap-4">
              <button
                onClick={() => setConfirmedTicket(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
              >
                Book Another Trip
              </button>
              {onNavigateToPassenger && (
                <button
                  onClick={onNavigateToPassenger}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700"
                >
                  Go to My Tickets
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results List */}
        {searchResults.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <Bus className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Schedules Matching Your Search</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We couldn&apos;t find an active bus from {origin} to {destination}. Try selecting &quot;All Rwanda Stations&quot; or popular routes like Kigali → Musanze or Kigali → Huye.
            </p>
            <button
              onClick={() => {
                setOrigin('all');
                setDestination('all');
              }}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
            >
              Show All Intercity Schedules
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map((sched) => (
              <div
                key={sched.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-emerald-300 transition-all flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6"
              >
                {/* Agency & Bus Info */}
                <div className="space-y-2 lg:max-w-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {sched.agency.code}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{sched.agency.name}</h4>
                      <p className="text-xs text-slate-500">
                        Fleet Plate: <span className="font-mono font-semibold text-slate-700">{sched.bus.plateNumber}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                      {sched.bus.model}
                    </span>
                    {sched.bus.amenities.includes('Free Wi-Fi') && (
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Wifi className="w-3 h-3" /> Wi-Fi
                      </span>
                    )}
                    {sched.bus.amenities.includes('USB Charging') && (
                      <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Zap className="w-3 h-3" /> USB
                      </span>
                    )}
                  </div>
                </div>

                {/* Route & Times */}
                <div className="flex items-center justify-between sm:justify-start gap-6 sm:gap-10 border-y lg:border-y-0 lg:border-x border-slate-100 py-4 lg:py-0 lg:px-8 flex-1">
                  <div>
                    <span className="text-xl font-black text-slate-900 font-mono">{sched.departureTime}</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{sched.route.origin}</p>
                    <span className="text-[11px] text-slate-400">{sched.departureDate}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-medium text-slate-400">
                      {Math.floor(sched.route.durationMinutes / 60)}h {sched.route.durationMinutes % 60}m direct
                    </span>
                    <div className="w-16 h-0.5 bg-slate-200 relative my-1">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 absolute -top-1.5 left-1/2 -translate-x-1/2" />
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">Nyabugogo Corridor</span>
                  </div>

                  <div className="text-right sm:text-left">
                    <span className="text-xl font-black text-slate-900 font-mono">{sched.arrivalTime}</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{sched.route.destination}</p>
                    <span className="text-[11px] text-slate-400">{sched.route.distanceKm} km</span>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 shrink-0">
                  <div className="text-left lg:text-right">
                    <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                      {sched.priceRwf.toLocaleString()} RWF
                    </span>
                    <p className="text-xs text-slate-500">
                      <span className="font-bold text-slate-800">{sched.availableSeatsCount}</span> seats remaining
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onCallAgency && (
                      <button
                        type="button"
                        onClick={() => onCallAgency(sched.agency.id)}
                        className="p-2.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors"
                        title={`Call ${sched.agency.name} Dispatch Desk`}
                        aria-label={`Call ${sched.agency.name} Dispatch Desk`}
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleSelectScheduleForBooking(sched)}
                      disabled={sched.availableSeatsCount === 0}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                    >
                      <span>{sched.availableSeatsCount === 0 ? 'Fully Booked' : 'Select Seat & Book'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interactive Booking & Seat Selection Modal / Drawer */}
        {activeSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto no-print">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Complete Booking & Seat Selection</h3>
                  <p className="text-xs text-slate-400">
                    {activeSchedule.agency.name} · {activeSchedule.route.origin} → {activeSchedule.route.destination}
                  </p>
                </div>
                <button
                  onClick={() => setActiveSchedule(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
                {/* Seat Selector */}
                <SeatSelector
                  totalSeats={activeSchedule.bus.totalSeats}
                  bookedSeats={activeSchedule.bookedSeats}
                  selectedSeat={selectedSeat}
                  onSelectSeat={(seatNum) => setSelectedSeat(seatNum)}
                  busModel={activeSchedule.bus.model}
                  plateNumber={activeSchedule.bus.plateNumber}
                />

                {/* Passenger Form */}
                <form onSubmit={handleProceedToPayment} className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Passenger Details (For SMS Ticket & MoMo Prompt)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Passenger Name
                      </label>
                      <input
                        type="text"
                        required
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="e.g. Samuel Mugisha"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Rwanda Mobile Number (+250)
                      </label>
                      <input
                        type="tel"
                        required
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="+250 788 123 456"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium font-mono focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={passengerEmail}
                      onChange={(e) => setPassengerEmail(e.target.value)}
                      placeholder="samuel.mugisha@gmail.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Summary & Checkout CTA */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500">Selected Seat: #{selectedSeat}</span>
                      <p className="text-sm font-bold text-slate-900">
                        {activeSchedule.departureTime} departure ({activeSchedule.departureDate})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block uppercase">Fare Due</span>
                      <span className="text-xl font-extrabold text-emerald-700 font-mono">
                        {activeSchedule.priceRwf.toLocaleString()} RWF
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveSchedule(null)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedSeat}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>Proceed to Mobile Payment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {activeSchedule && (
          <PaymentModal
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            amountRwf={activeSchedule.priceRwf}
            passengerName={passengerName}
            defaultPhone={passengerPhone}
            tripDescription={`${activeSchedule.route.origin} → ${activeSchedule.route.destination} (${activeSchedule.departureTime})`}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};
