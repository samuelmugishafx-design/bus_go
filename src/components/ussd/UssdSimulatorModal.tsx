import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { bookingService } from '../../services/bookingService';
import { routeChangeService } from '../../services/routeChangeService';
import { ticketService } from '../../services/ticketService';
import { PaymentMethod } from '../../types';
import { X, Phone, PhoneOff, Delete, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UssdSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UssdState {
  screen:
    | 'dialpad'
    | 'main_menu'
    | 'book_phone'
    | 'book_origin'
    | 'book_dest'
    | 'book_date'
    | 'book_sched'
    | 'book_confirm'
    | 'book_payment_method'
    | 'book_pin'
    | 'book_success'
    | 'my_tickets_phone'
    | 'my_tickets_list'
    | 'my_tickets_detail'
    | 'change_route_ref'
    | 'change_route_origin'
    | 'change_route_dest'
    | 'change_route_sched'
    | 'change_route_confirm'
    | 'change_route_success'
    | 'check_ticket_ref'
    | 'check_ticket_result'
    | 'help';
  history: string[];
  input: string;
  data: {
    dialedCode?: string;
    phone?: string;
    origin?: string;
    destination?: string;
    date?: string;
    scheduleId?: string;
    scheduleDetails?: any;
    seatNumber?: number;
    paymentMethod?: PaymentMethod;
    ticketRef?: string;
    targetTicket?: any;
    newOrigin?: string;
    newDestination?: string;
    newScheduleId?: string;
    newScheduleDetails?: any;
    fareDiff?: number;
    smsMessage?: string;
  };
}

const POPULAR_USSD_CITIES = [
  'Kigali (Nyabugogo)',
  'Muhanga',
  'Huye (Butare)',
  'Musanze (Ruhengeri)',
  'Rubavu (Gisenyi)',
  'Rusizi (Cyangugu)',
  'Rwamagana',
  'Nyagatare',
];

export const UssdSimulatorModal: React.FC<UssdSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [ussd, setUssd] = useState<UssdState>({
    screen: 'dialpad',
    history: [],
    input: '*888#',
    data: {
      phone: '0788123456',
    },
  });

  if (!isOpen) return null;

  const resetUssd = () => {
    setUssd({
      screen: 'dialpad',
      history: [],
      input: '*888#',
      data: { phone: '0788123456' },
    });
  };

  const handleDial = () => {
    const code = ussd.input.trim();
    if (code === '*888#' || code === '*777#' || code === '*888' || code === '*777') {
      setUssd((prev) => ({
        ...prev,
        screen: 'main_menu',
        input: '',
        data: { ...prev.data, dialedCode: code },
      }));
    } else {
      alert('Unknown USSD code. Please dial *888# to access BusGo Rwanda.');
    }
  };

  const handleKeypadPress = (val: string) => {
    setUssd((prev) => ({ ...prev, input: prev.input + val }));
  };

  const handleBackspace = () => {
    setUssd((prev) => ({ ...prev, input: prev.input.slice(0, -1) }));
  };

  const handleUssdSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = ussd.input.trim();
    const currentScreen = ussd.screen;

    // MAIN MENU
    if (currentScreen === 'main_menu') {
      if (val === '1') {
        setUssd((prev) => ({
          ...prev,
          screen: 'book_origin',
          input: '',
        }));
      } else if (val === '2') {
        setUssd((prev) => ({
          ...prev,
          screen: 'my_tickets_phone',
          input: '',
        }));
      } else if (val === '3') {
        setUssd((prev) => ({
          ...prev,
          screen: 'change_route_ref',
          input: '',
        }));
      } else if (val === '4') {
        setUssd((prev) => ({
          ...prev,
          screen: 'check_ticket_ref',
          input: '',
        }));
      } else if (val === '5') {
        setUssd((prev) => ({
          ...prev,
          screen: 'help',
          input: '',
        }));
      } else {
        alert('Invalid selection. Enter 1 to 5.');
      }
      return;
    }

    // BOOKING: ORIGIN
    if (currentScreen === 'book_origin') {
      const idx = parseInt(val, 10) - 1;
      if (idx >= 0 && idx < POPULAR_USSD_CITIES.length) {
        const origin = POPULAR_USSD_CITIES[idx];
        setUssd((prev) => ({
          ...prev,
          screen: 'book_dest',
          input: '',
          data: { ...prev.data, origin },
        }));
      } else {
        alert(`Select 1 to ${POPULAR_USSD_CITIES.length}`);
      }
      return;
    }

    // BOOKING: DESTINATION
    if (currentScreen === 'book_dest') {
      const availableDests = POPULAR_USSD_CITIES.filter((c) => c !== ussd.data.origin);
      const idx = parseInt(val, 10) - 1;
      if (idx >= 0 && idx < availableDests.length) {
        const destination = availableDests[idx];
        setUssd((prev) => ({
          ...prev,
          screen: 'book_date',
          input: '',
          data: { ...prev.data, destination },
        }));
      } else {
        alert(`Select 1 to ${availableDests.length}`);
      }
      return;
    }

    // BOOKING: DATE
    if (currentScreen === 'book_date') {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const date = val === '2' ? tomorrow : today;

      // Find matching schedules
      const matches = bookingService.searchSchedules({
        origin: ussd.data.origin,
        destination: ussd.data.destination,
        travelDate: date,
      });

      if (matches.length === 0) {
        // Fallback to general schedules for demo
        const allScheds = bookingService.getEnrichedSchedules().slice(0, 3);
        setUssd((prev) => ({
          ...prev,
          screen: 'book_sched',
          input: '',
          data: { ...prev.data, date, schedulesList: allScheds },
        }));
      } else {
        setUssd((prev) => ({
          ...prev,
          screen: 'book_sched',
          input: '',
          data: { ...prev.data, date, schedulesList: matches.slice(0, 3) },
        }));
      }
      return;
    }

    // BOOKING: SCHEDULE
    if (currentScreen === 'book_sched') {
      const list = (ussd.data as any).schedulesList || [];
      const idx = parseInt(val, 10) - 1;
      if (idx >= 0 && idx < list.length) {
        const sched = list[idx];
        const assignedSeat = bookingService.autoAssignSeat(sched.id);
        setUssd((prev) => ({
          ...prev,
          screen: 'book_payment_method',
          input: '',
          data: {
            ...prev.data,
            scheduleId: sched.id,
            scheduleDetails: sched,
            seatNumber: assignedSeat,
          },
        }));
      } else {
        alert('Invalid bus selection.');
      }
      return;
    }

    // BOOKING: PAYMENT METHOD
    if (currentScreen === 'book_payment_method') {
      const method: PaymentMethod = val === '2' ? 'AIRTEL_MONEY' : 'MTN_MOMO';
      setUssd((prev) => ({
        ...prev,
        screen: 'book_pin',
        input: '',
        data: { ...prev.data, paymentMethod: method },
      }));
      return;
    }

    // BOOKING: PIN & COMPLETE
    if (currentScreen === 'book_pin') {
      const phone = ussd.data.phone || '0788123456';
      const sched = ussd.data.scheduleDetails;
      const seat = ussd.data.seatNumber || 1;
      const paymentMethod = ussd.data.paymentMethod || 'MTN_MOMO';

      bookingService
        .processBooking({
          scheduleId: sched.id,
          passengerName: 'USSD Passenger',
          passengerPhone: `+250 ${phone.replace(/^0/, '')}`,
          seatNumber: seat,
          paymentMethod,
          channel: 'ussd',
        })
        .then((res) => {
          if (res.success && res.ticket) {
            confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
            setUssd((prev) => ({
              ...prev,
              screen: 'book_success',
              input: '',
              data: {
                ...prev.data,
                ticketRef: res.ticket!.ticketNumber,
                smsMessage: `BusGo: Ticket ${res.ticket!.ticketNumber} confirmed! ${res.ticket!.origin} -> ${res.ticket!.destination}, Date: ${res.ticket!.departureDate} ${res.ticket!.departureTime}. Seat: #${res.ticket!.seatNumber}. Bus: ${res.ticket!.busPlate}. Paid: ${res.ticket!.priceRwf} RWF via ${paymentMethod}.`,
              },
            }));
          } else {
            alert('Booking failed. Please try again.');
          }
        });
      return;
    }

    // MY TICKETS: PHONE
    if (currentScreen === 'my_tickets_phone') {
      const phone = val || ussd.data.phone || '0788123456';
      const cleanPhone = phone.replace(/\D/g, '');
      const tickets = storageService.getTickets().filter((t) => t.passengerPhone.replace(/\D/g, '').includes(cleanPhone));
      setUssd((prev) => ({
        ...prev,
        screen: 'my_tickets_list',
        input: '',
        data: { ...prev.data, phone, userTickets: tickets },
      }));
      return;
    }

    // CHECK TICKET: REF
    if (currentScreen === 'check_ticket_ref') {
      const ref = val.toUpperCase().trim();
      const res = ticketService.verifyTicket(ref);
      setUssd((prev) => ({
        ...prev,
        screen: 'check_ticket_result',
        input: '',
        data: { ...prev.data, ticketRef: ref, verificationResult: res },
      }));
      return;
    }

    // CHANGE ROUTE: REF
    if (currentScreen === 'change_route_ref') {
      const ref = val.toUpperCase().trim();
      const eligibility = routeChangeService.checkEligibility(ref);
      if (!eligibility.eligible || !eligibility.ticket) {
        alert(eligibility.reason || 'Ticket not eligible for route change.');
        return;
      }
      setUssd((prev) => ({
        ...prev,
        screen: 'change_route_origin',
        input: '',
        data: { ...prev.data, targetTicket: eligibility.ticket },
      }));
      return;
    }

    // CHANGE ROUTE: ORIGIN
    if (currentScreen === 'change_route_origin') {
      const idx = parseInt(val, 10) - 1;
      if (idx >= 0 && idx < POPULAR_USSD_CITIES.length) {
        const newOrigin = POPULAR_USSD_CITIES[idx];
        setUssd((prev) => ({
          ...prev,
          screen: 'change_route_dest',
          input: '',
          data: { ...prev.data, newOrigin },
        }));
      }
      return;
    }

    // CHANGE ROUTE: DEST
    if (currentScreen === 'change_route_dest') {
      const availableDests = POPULAR_USSD_CITIES.filter((c) => c !== ussd.data.newOrigin);
      const idx = parseInt(val, 10) - 1;
      if (idx >= 0 && idx < availableDests.length) {
        const newDestination = availableDests[idx];
        // find schedule
        const matches = bookingService.searchSchedules({
          origin: ussd.data.newOrigin,
          destination: newDestination,
        });
        const sched = matches[0] || bookingService.getEnrichedSchedules()[0];
        const calc = routeChangeService.calculateFareDifference(ussd.data.targetTicket.priceRwf, sched.priceRwf);

        setUssd((prev) => ({
          ...prev,
          screen: 'change_route_confirm',
          input: '',
          data: {
            ...prev.data,
            newDestination,
            newScheduleId: sched.id,
            newScheduleDetails: sched,
            fareDiff: calc.differenceRwf,
          },
        }));
      }
      return;
    }

    // CHANGE ROUTE: CONFIRM
    if (currentScreen === 'change_route_confirm') {
      if (val === '1') {
        const newSeat = bookingService.autoAssignSeat(ussd.data.newScheduleId!);
        const res = routeChangeService.executeRouteChange({
          oldTicketNumber: ussd.data.targetTicket.ticketNumber,
          newOrigin: ussd.data.newOrigin!,
          newDestination: ussd.data.newDestination!,
          newScheduleId: ussd.data.newScheduleId!,
          newSeatNumber: newSeat,
          paymentMethod: 'MTN_MOMO',
          phoneNumber: ussd.data.targetTicket.passengerPhone,
        });

        if (res.success && res.updatedTicket) {
          confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
          setUssd((prev) => ({
            ...prev,
            screen: 'change_route_success',
            input: '',
            data: {
              ...prev.data,
              updatedTicket: res.updatedTicket,
            },
          }));
        } else {
          alert(res.message);
        }
      } else {
        resetUssd();
      }
      return;
    }

    // DEFAULT RESET
    resetUssd();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md no-print">
      <div className="bg-slate-900 rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl border-4 border-slate-700 relative text-slate-100 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Phone Earpiece */}
        <div className="w-16 h-1 bg-slate-700 rounded-full mb-4"></div>

        {/* Feature Phone Screen / USSD Display */}
        <div className="w-full bg-[#1b261b] border-2 border-[#2b3d2b] rounded-2xl p-4 shadow-inner min-h-[260px] flex flex-col justify-between font-mono text-emerald-400">
          <div className="text-[11px] pb-1 border-b border-[#2b3d2b] flex items-center justify-between text-emerald-600">
            <span>MTN-RW / AIRTEL</span>
            <span>USSD *888#</span>
          </div>

          {/* Screen Content based on state */}
          <div className="py-2 text-xs flex-1 space-y-1">
            {ussd.screen === 'dialpad' && (
              <div className="text-center py-6 space-y-3">
                <div className="text-lg font-bold text-white tracking-widest">{ussd.input || '_'}</div>
                <p className="text-[11px] text-emerald-500">Dial *888# or press Call</p>
                <p className="text-[10px] text-emerald-700">Offline ticketing for feature phones across Rwanda</p>
              </div>
            )}

            {ussd.screen === 'main_menu' && (
              <div className="space-y-1">
                <div className="font-bold text-emerald-300">WELCOME TO BUSGO RWANDA</div>
                <div>1. Book Ticket</div>
                <div>2. My Tickets</div>
                <div>3. Change Route (Before Bus Departs)</div>
                <div>4. Check Ticket Status</div>
                <div>5. Help & Station Locations</div>
                <div className="text-[10px] text-emerald-600 pt-1">Select option (1-5):</div>
              </div>
            )}

            {ussd.screen === 'book_origin' && (
              <div className="space-y-1">
                <div className="font-bold text-emerald-300">SELECT DEPARTURE:</div>
                {POPULAR_USSD_CITIES.slice(0, 6).map((city, idx) => (
                  <div key={city}>
                    {idx + 1}. {city}
                  </div>
                ))}
                <div className="text-[10px] text-emerald-600 pt-1">Select origin (1-6):</div>
              </div>
            )}

            {ussd.screen === 'book_dest' && (
              <div className="space-y-1">
                <div className="font-bold text-emerald-300">DESTINATION (FROM {ussd.data.origin}):</div>
                {POPULAR_USSD_CITIES.filter((c) => c !== ussd.data.origin)
                  .slice(0, 6)
                  .map((city, idx) => (
                    <div key={city}>
                      {idx + 1}. {city}
                    </div>
                  ))}
                <div className="text-[10px] text-emerald-600 pt-1">Select destination (1-6):</div>
              </div>
            )}

            {ussd.screen === 'book_date' && (
              <div className="space-y-1">
                <div className="font-bold text-emerald-300">TRAVEL DATE:</div>
                <div>1. Today</div>
                <div>2. Tomorrow</div>
                <div className="text-[10px] text-emerald-600 pt-1">Select date:</div>
              </div>
            )}

            {ussd.screen === 'book_sched' && (
              <div className="space-y-1">
                <div className="font-bold text-emerald-300">AVAILABLE BUSES:</div>
                {((ussd.data as any).schedulesList || []).map((s: any, idx: number) => (
                  <div key={s.id}>
                    {idx + 1}. {s.agency.name} {s.departureTime} ({s.priceRwf} RWF)
                  </div>
                ))}
                <div className="text-[10px] text-emerald-600 pt-1">Select bus:</div>
              </div>
            )}

            {ussd.screen === 'book_payment_method' && (
              <div className="space-y-1">
                <div className="font-bold text-emerald-300">
                  FARE: {ussd.data.scheduleDetails?.priceRwf} RWF (Seat #{ussd.data.seatNumber})
                </div>
                <div>CHOOSE MOBILE MONEY:</div>
                <div>1. MTN Mobile Money (*182#)</div>
                <div>2. Airtel Money (*500#)</div>
                <div className="text-[10px] text-emerald-600 pt-1">Select provider:</div>
              </div>
            )}

            {ussd.screen === 'book_pin' && (
              <div className="space-y-2 py-2">
                <div className="font-bold text-emerald-300">
                  CONFIRM {ussd.data.scheduleDetails?.priceRwf} RWF VIA {ussd.data.paymentMethod}
                </div>
                <div className="text-[11px]">Enter your Mobile Money PIN:</div>
                <div className="font-bold tracking-widest text-emerald-200">
                  {ussd.input ? '•'.repeat(ussd.input.length) : '_'}
                </div>
              </div>
            )}

            {ussd.screen === 'book_success' && (
              <div className="space-y-2 py-1">
                <div className="font-bold text-emerald-300">BOOKING CONFIRMED!</div>
                <div className="text-[11px] text-white">Ticket: {ussd.data.ticketRef}</div>
                <div className="text-[10px] text-emerald-400 leading-tight">
                  {ussd.data.smsMessage}
                </div>
                <div className="text-[10px] text-emerald-600">0. Main Menu</div>
              </div>
            )}

            {ussd.screen === 'my_tickets_phone' && (
              <div className="space-y-2 py-1">
                <div className="font-bold text-emerald-300">MY TICKETS</div>
                <div className="text-[11px]">Enter Phone (e.g. 0788123456) or press Send for {ussd.data.phone}:</div>
              </div>
            )}

            {ussd.screen === 'my_tickets_list' && (
              <div className="space-y-1">
                <div className="font-bold text-emerald-300">ACTIVE TICKETS:</div>
                {((ussd.data as any).userTickets || []).length === 0 ? (
                  <div className="text-[11px]">No active tickets found for this phone.</div>
                ) : (
                  ((ussd.data as any).userTickets || []).slice(0, 3).map((t: any, idx: number) => (
                    <div key={t.id} className="text-[10px]">
                      {idx + 1}. {t.ticketNumber}: {t.origin}→{t.destination} ({t.departureTime}) - {t.ticketStatus.toUpperCase()}
                    </div>
                  ))
                )}
                <div className="text-[10px] text-emerald-600 pt-1">0. Back to Main Menu</div>
              </div>
            )}

            {ussd.screen === 'check_ticket_ref' && (
              <div className="space-y-2 py-1">
                <div className="font-bold text-emerald-300">CHECK TICKET STATUS</div>
                <div className="text-[11px]">Enter Ticket Reference (e.g. BG-RW-2026-7841):</div>
              </div>
            )}

            {ussd.screen === 'check_ticket_result' && (
              <div className="space-y-1.5 py-1">
                <div className="font-bold text-emerald-300">
                  TICKET: {ussd.data.ticketRef}
                </div>
                <div className="text-[11px] text-white">
                  Status: {(ussd.data as any).verificationResult?.status?.toUpperCase()}
                </div>
                <div className="text-[10px] text-emerald-400">
                  {(ussd.data as any).verificationResult?.message}
                </div>
                <div className="text-[10px] text-emerald-600 pt-1">0. Back</div>
              </div>
            )}

            {ussd.screen === 'change_route_ref' && (
              <div className="space-y-2 py-1">
                <div className="font-bold text-emerald-300">CHANGE ROUTE</div>
                <div className="text-[11px]">Enter your confirmed Ticket Reference:</div>
              </div>
            )}

            {ussd.screen === 'change_route_origin' && (
              <div className="space-y-1">
                <div className="font-bold text-emerald-300">SELECT NEW DEPARTURE:</div>
                {POPULAR_USSD_CITIES.slice(0, 6).map((city, idx) => (
                  <div key={city}>
                    {idx + 1}. {city}
                  </div>
                ))}
              </div>
            )}

            {ussd.screen === 'change_route_dest' && (
              <div className="space-y-1">
                <div className="font-bold text-emerald-300">SELECT NEW DESTINATION:</div>
                {POPULAR_USSD_CITIES.filter((c) => c !== ussd.data.newOrigin).slice(0, 6).map((city, idx) => (
                  <div key={city}>
                    {idx + 1}. {city}
                  </div>
                ))}
              </div>
            )}

            {ussd.screen === 'change_route_confirm' && (
              <div className="space-y-1">
                <div className="font-bold text-emerald-300">CONFIRM ROUTE CHANGE:</div>
                <div className="text-[11px]">New: {ussd.data.newOrigin} → {ussd.data.newDestination}</div>
                <div className="text-[11px]">
                  Fare Diff:{' '}
                  {ussd.data.fareDiff! > 0
                    ? `+${ussd.data.fareDiff} RWF (To pay via MoMo)`
                    : ussd.data.fareDiff! < 0
                    ? `${ussd.data.fareDiff} RWF (Credit)`
                    : '0 RWF'}
                </div>
                <div className="pt-1">1. Confirm Change</div>
                <div>2. Cancel</div>
              </div>
            )}

            {ussd.screen === 'change_route_success' && (
              <div className="space-y-2 py-1">
                <div className="font-bold text-emerald-300">ROUTE CHANGED!</div>
                <div className="text-[11px] text-white">
                  New Ticket: {(ussd.data as any).updatedTicket?.ticketNumber}
                </div>
                <div className="text-[10px] text-emerald-400">
                  New Route: {(ussd.data as any).updatedTicket?.origin} → {(ussd.data as any).updatedTicket?.destination} (Seat #{(ussd.data as any).updatedTicket?.seatNumber})
                </div>
                <div className="text-[10px] text-emerald-600">0. Main Menu</div>
              </div>
            )}

            {ussd.screen === 'help' && (
              <div className="space-y-1 text-[11px]">
                <div className="font-bold text-emerald-300">RWANDA BUS AGENCY HOTLINES:</div>
                <div className="text-[10px] text-slate-300">
                  <div>1. Volcano: 0788 301 888 (Bay 4)</div>
                  <div>2. RITCO: 0788 380 480 (Bay 1)</div>
                  <div>3. Horizon: 0788 303 030 (Bay 8)</div>
                  <div>4. Virunga: 0788 304 040 (North Gate)</div>
                  <div>5. Stella: 0788 305 050 (Bay 12)</div>
                  <div>6. Capital: 0788 306 060 (East Bay)</div>
                </div>
                <div className="text-[10px] text-amber-300 pt-1">
                  National Toll-Free: 3020
                </div>
                <div className="text-[10px] text-emerald-600 pt-1">0. Back to Main Menu</div>
              </div>
            )}
          </div>

          {/* USSD Input Form inside Screen */}
          {ussd.screen !== 'dialpad' && (
            <form onSubmit={handleUssdSubmit} className="pt-2 border-t border-[#2b3d2b] flex gap-1">
              <input
                type="text"
                autoFocus
                value={ussd.input}
                onChange={(e) => setUssd((prev) => ({ ...prev, input: e.target.value }))}
                placeholder="Type here..."
                className="w-full bg-[#141d14] border border-[#2b3d2b] text-white px-2 py-1 text-xs rounded font-mono focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold rounded"
              >
                Send
              </button>
            </form>
          )}
        </div>

        {/* Feature Phone Keypad */}
        <div className="w-full mt-4 grid grid-cols-3 gap-2 px-2">
          {/* Action Row */}
          <button
            type="button"
            onClick={ussd.screen === 'dialpad' ? handleDial : () => handleUssdSubmit()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center text-xs shadow-md"
          >
            <Phone className="w-4 h-4 mr-1" />
            <span>{ussd.screen === 'dialpad' ? 'Call' : 'Send'}</span>
          </button>
          <button
            type="button"
            onClick={resetUssd}
            className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center justify-center text-xs shadow-md"
          >
            <PhoneOff className="w-4 h-4 mr-1" />
            <span>End</span>
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center justify-center text-xs"
          >
            <Delete className="w-4 h-4" />
          </button>

          {/* Numbers 1-9 */}
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleKeypadPress(k)}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-sm shadow-sm transition-colors active:scale-95"
            >
              {k}
            </button>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400">
            Realtime synchronization with Web & Admin portal.
          </p>
        </div>
      </div>
    </div>
  );
};
