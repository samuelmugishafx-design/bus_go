import React, { useState, useMemo } from 'react';
import { Ticket, PaymentMethod } from '../../types';
import { routeChangeService } from '../../services/routeChangeService';
import { bookingService, EnrichedSchedule } from '../../services/bookingService';
import { RWANDA_CITIES } from '../../data/demoData';
import { SeatSelector } from '../booking/SeatSelector';
import { X, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RouteChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onRouteChangeSuccess: (updatedTicket: Ticket) => void;
}

export const RouteChangeModal: React.FC<RouteChangeModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onRouteChangeSuccess,
}) => {
  const eligibility = useMemo(() => routeChangeService.checkEligibility(ticket.ticketNumber), [ticket.ticketNumber]);

  const [newOrigin, setNewOrigin] = useState<string>(ticket.origin === 'Muhanga' ? 'Kigali (Nyabugogo)' : 'Muhanga');
  const [newDestination, setNewDestination] = useState<string>('Musanze (Ruhengeri)');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [paymentPhone, setPaymentPhone] = useState<string>(ticket.passengerPhone);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<Ticket | null>(null);

  // Available schedules for chosen origin and destination
  const matchingSchedules = useMemo(() => {
    return bookingService.searchSchedules({
      origin: newOrigin,
      destination: newDestination,
    });
  }, [newOrigin, newDestination]);

  const selectedSchedule = useMemo(() => {
    return matchingSchedules.find((s) => s.id === selectedScheduleId);
  }, [matchingSchedules, selectedScheduleId]);

  // Fare difference calculation
  const fareCalc = useMemo(() => {
    if (!selectedSchedule) return null;
    return routeChangeService.calculateFareDifference(ticket.priceRwf, selectedSchedule.priceRwf);
  }, [ticket.priceRwf, selectedSchedule]);

  if (!isOpen) return null;

  const handleConfirmChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId || !selectedSchedule) {
      setErrorMessage('Please select an available bus schedule for your new route.');
      return;
    }
    if (!selectedSeat) {
      setErrorMessage('Please select an available seat on the new bus.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const result = routeChangeService.executeRouteChange({
        oldTicketNumber: ticket.ticketNumber,
        newOrigin,
        newDestination,
        newScheduleId: selectedScheduleId,
        newSeatNumber: selectedSeat,
        paymentMethod: fareCalc && fareCalc.differenceRwf > 0 ? paymentMethod : undefined,
        phoneNumber: paymentPhone,
      });

      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.message);
      } else if (result.updatedTicket) {
        setSuccessResult(result.updatedTicket);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        onRouteChangeSuccess(result.updatedTicket);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto no-print">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Change Travel Route & Destination</h3>
              <p className="text-xs text-slate-400">
                Ticket: <span className="font-mono font-semibold text-amber-400">{ticket.ticketNumber}</span> · Current: {ticket.origin} → {ticket.destination}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {!eligibility.eligible ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Route Change Not Allowed</h4>
                <p className="text-sm text-red-600 mt-2 max-w-md mx-auto">{eligibility.reason}</p>
              </div>
              <p className="text-xs text-slate-500">
                According to Rwanda Transport Authority policy, route modifications are permitted only prior to scheduled departure.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-800 text-white font-semibold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          ) : successResult ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">Route Changed Successfully!</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Your journey has been updated to{' '}
                  <span className="font-bold text-slate-900">
                    {successResult.origin} → {successResult.destination}
                  </span>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">New Ticket Reference:</span>
                  <span className="font-mono font-bold text-emerald-700">{successResult.ticketNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Seat:</span>
                  <span className="font-bold text-slate-800">Seat #{successResult.seatNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Departure Time:</span>
                  <span className="font-bold text-slate-800">{successResult.departureDate} at {successResult.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bus Plate:</span>
                  <span className="font-mono font-bold text-slate-800">{successResult.busPlate}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                The previous ticket ({ticket.ticketNumber}) has been invalidated.
              </p>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  View Updated Ticket
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmChange} className="space-y-6">
              {/* Existing Journey Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Original Booking
                </span>
                <div className="mt-2 flex items-center justify-between flex-wrap gap-2 text-sm font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span>{ticket.origin}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span>{ticket.destination}</span>
                  </div>
                  <div className="text-xs font-mono text-emerald-700">
                    Paid: {ticket.priceRwf.toLocaleString()} RWF (Seat #{ticket.seatNumber})
                  </div>
                </div>
              </div>

              {/* Step 1: Select new Departure & Destination */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Select New Travel Route in Rwanda
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Departure Station
                    </label>
                    <select
                      value={newOrigin}
                      onChange={(e) => {
                        setNewOrigin(e.target.value);
                        setSelectedScheduleId('');
                        setSelectedSeat(null);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      {RWANDA_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Arrival Destination
                    </label>
                    <select
                      value={newDestination}
                      onChange={(e) => {
                        setNewDestination(e.target.value);
                        setSelectedScheduleId('');
                        setSelectedSeat(null);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      {RWANDA_CITIES.filter((c) => c !== newOrigin).map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Choose Schedule */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  2. Choose Available Bus Schedule
                </h4>

                {matchingSchedules.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                    No active buses found currently between {newOrigin} and {newDestination}. Try another destination (e.g. Musanze, Rubavu, Huye, or Kigali).
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {matchingSchedules.map((sched) => {
                      const isSelected = selectedScheduleId === sched.id;
                      return (
                        <div
                          key={sched.id}
                          onClick={() => {
                            setSelectedScheduleId(sched.id);
                            // Auto select first open seat
                            setSelectedSeat(bookingService.autoAssignSeat(sched.id));
                          }}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between text-xs ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{sched.agency.name}</span>
                              <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-1.5 py-0.5 rounded">
                                {sched.bus.plateNumber}
                              </span>
                            </div>
                            <div className="text-slate-500 mt-1">
                              Departs: <span className="font-semibold text-slate-800">{sched.departureTime}</span> ({sched.departureDate}) · Arrives: {sched.arrivalTime}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-sm text-emerald-700 block">
                              {sched.priceRwf.toLocaleString()} RWF
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {sched.availableSeatsCount} seats open
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 3: Seat Selection */}
              {selectedSchedule && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    3. Select Seat on New Bus
                  </h4>
                  <SeatSelector
                    totalSeats={selectedSchedule.bus.totalSeats}
                    bookedSeats={selectedSchedule.bookedSeats}
                    selectedSeat={selectedSeat}
                    onSelectSeat={(num) => setSelectedSeat(num)}
                    busModel={selectedSchedule.bus.model}
                    plateNumber={selectedSchedule.bus.plateNumber}
                  />
                </div>
              )}

              {/* Step 4: Fare Difference Calculation & Adjustment */}
              {fareCalc && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Fare Calculation & Settlement
                  </h4>

                  <div className="grid grid-cols-3 gap-2 text-xs border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-slate-400 block">Original Ticket</span>
                      <span className="font-mono font-bold text-slate-800">{fareCalc.originalFareRwf.toLocaleString()} RWF</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">New Route Fare</span>
                      <span className="font-mono font-bold text-slate-800">{fareCalc.newFareRwf.toLocaleString()} RWF</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Difference</span>
                      <span
                        className={`font-mono font-extrabold ${
                          fareCalc.differenceRwf > 0
                            ? 'text-amber-700'
                            : fareCalc.differenceRwf < 0
                            ? 'text-emerald-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {fareCalc.differenceRwf > 0
                          ? `+${fareCalc.differenceRwf.toLocaleString()} RWF`
                          : fareCalc.differenceRwf < 0
                          ? `${fareCalc.differenceRwf.toLocaleString()} RWF credit`
                          : '0 RWF (No change)'}
                      </span>
                    </div>
                  </div>

                  {fareCalc.differenceRwf > 0 && (
                    <div className="space-y-3 pt-1">
                      <p className="text-xs text-amber-800 font-medium">
                        The new route fare is higher. Please authorize payment of the difference ({fareCalc.differenceRwf.toLocaleString()} RWF).
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('MTN_MOMO')}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                            paymentMethod === 'MTN_MOMO'
                              ? 'border-yellow-500 bg-yellow-50 text-yellow-900'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          MTN MoMo (*182#)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('AIRTEL_MONEY')}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                            paymentMethod === 'AIRTEL_MONEY'
                              ? 'border-red-500 bg-red-50 text-red-900'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          Airtel Money (*500#)
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mobile Money Number (+250)
                        </label>
                        <input
                          type="text"
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                          placeholder="+250 788 123 456"
                        />
                      </div>
                    </div>
                  )}

                  {fareCalc.differenceRwf < 0 && (
                    <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                      The new route is cheaper. A travel credit refund of {Math.abs(fareCalc.differenceRwf).toLocaleString()} RWF will be credited to {ticket.passengerPhone}.
                    </p>
                  )}
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSchedule || !selectedSeat || isSubmitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Processing Route Update...</span>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Confirm & Update Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
