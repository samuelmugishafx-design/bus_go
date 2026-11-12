export type UserRole = 'super_admin' | 'agency_admin' | 'ticket_staff' | 'passenger';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  agencyId?: string; // For agency_admin
  stationLocation?: string; // For ticket_staff (e.g. 'Nyabugogo Bus Terminal')
}

export interface Agency {
  id: string;
  name: string;
  code: string;
  logoText: string;
  phone: string;
  email: string;
  headquarters: string;
  rating: number;
  totalFleet: number;
  activeRoutesCount: number;
  popularRoutes: string[];
  bannerColor: string;
  emergencyHotline?: string;
  lostAndFoundPhone?: string;
  whatsApp?: string;
  dispatchDesk?: string;
}

export interface Bus {
  id: string;
  agencyId: string;
  plateNumber: string; // e.g. 'RAD 482 B'
  model: string; // 'Toyota Coaster' | 'Scania Touring' | 'Yutong Intercity' | 'Isuzu Executive'
  totalSeats: number; // 28 | 35 | 45
  amenities: string[]; // 'AC', 'Wi-Fi', 'USB Charging', 'Luggage Space', 'Refreshments'
  status: 'active' | 'maintenance' | 'inactive';
}

export type RwandaProvince = 'Kigali City' | 'Northern' | 'Southern' | 'Eastern' | 'Western';

export interface Route {
  id: string;
  agencyId: string;
  origin: string; // 'Kigali (Nyabugogo)'
  destination: string; // 'Musanze', 'Huye', etc.
  distanceKm: number;
  durationMinutes: number; // e.g. 120 (2h)
  basePriceRwf: number; // e.g. 2800
  isActive: boolean;
  province?: RwandaProvince;
  corridorCode?: string; // 'RN1 - South Corridor', 'RN4 - Volcano Corridor', etc.
  intermediateStops?: string[];
}

export interface BusLiveTracking {
  busId: string;
  plateNumber: string;
  scheduleId: string;
  routeId: string;
  agencyId: string;
  agencyName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  currentLocationName: string;
  nextStop: string;
  progressPercent: number; // 0 - 100
  speedKmh: number; // e.g. 58 km/h
  estimatedArrivalMinutes: number;
  status: 'on_schedule' | 'boarding' | 'in_transit' | 'arrived' | 'delayed';
  totalSeats: number;
  passengersOnBoard: number;
  coordinates: { x: number; y: number }; // Percentage (0-100) for visual Rwanda map
}

export interface Schedule {
  id: string;
  agencyId: string;
  busId: string;
  routeId: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm (e.g. '08:30')
  arrivalTime: string; // HH:mm (e.g. '10:30')
  priceRwf: number;
  bookedSeats: number[];
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';
}

export type PaymentMethod = 'MTN_MOMO' | 'AIRTEL_MONEY';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  ticketNumber: string;
  passengerPhone: string;
  amountRwf: number;
  provider: PaymentMethod;
  status: PaymentStatus;
  timestamp: string;
  channel: 'web' | 'ussd';
  providerTransactionId: string;
}

export type TicketStatus = 'valid' | 'boarded' | 'cancelled' | 'route_changed';

export interface RouteChangeRecord {
  changeId: string;
  changedAt: string;
  previousRoute: {
    origin: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    seatNumber: number;
    priceRwf: number;
  };
  newRoute: {
    origin: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    seatNumber: number;
    priceRwf: number;
  };
  fareDifferenceRwf: number; // positive = customer paid extra, negative = credit refund
  status: 'approved' | 'completed';
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. 'BG-RW-2026-8910'
  bookingId: string;
  scheduleId: string;
  agencyId: string;
  passengerName: string;
  passengerPhone: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  seatNumber: number;
  busPlate: string;
  busModel: string;
  priceRwf: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  ticketStatus: TicketStatus;
  channel: 'web' | 'ussd';
  createdAt: string;
  boardedAt?: string;
  verifiedByStaffId?: string;
  verifiedByStaffName?: string;
  routeChangeHistory?: RouteChangeRecord[];
}

export interface Booking {
  id: string;
  ticketNumber: string;
  scheduleId: string;
  agencyId: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  seats: number[];
  totalPriceRwf: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  channel: 'web' | 'ussd';
  createdAt: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
}
