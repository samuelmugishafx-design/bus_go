import { storageService } from './storageService';
import { Schedule, Bus, Agency, Route, Ticket, Booking, PaymentMethod } from '../types';
import { ticketService } from './ticketService';

export interface EnrichedSchedule extends Schedule {
  agency: Agency;
  bus: Bus;
  route: Route;
  availableSeatsCount: number;
}

export interface SearchFilterParams {
  origin?: string;
  destination?: string;
  travelDate?: string;
  agencyId?: string;
  sortBy?: 'time' | 'price' | 'seats';
  maxPrice?: number;
}

export const bookingService = {
  getEnrichedSchedules(): EnrichedSchedule[] {
    const schedules = storageService.getSchedules();
    const agencies = storageService.getAgencies();
    const buses = storageService.getBuses();
    const routes = storageService.getRoutes();

    return schedules.map((sched) => {
      const agency = agencies.find((a) => a.id === sched.agencyId) || {
        id: sched.agencyId,
        name: 'Express Rwanda',
        code: 'EXP',
        logoText: 'EXP',
        phone: '+250 788 000 000',
        email: 'info@express.rw',
        headquarters: 'Kigali',
        rating: 4.5,
        totalFleet: 20,
        activeRoutesCount: 5,
        popularRoutes: [],
        bannerColor: 'bg-emerald-600',
      };

      const bus = buses.find((b) => b.id === sched.busId) || {
        id: sched.busId,
        agencyId: sched.agencyId,
        plateNumber: 'RAD 100 A',
        model: 'Standard Bus',
        totalSeats: 28,
        amenities: ['AC'],
        status: 'active' as const,
      };

      const route = routes.find((r) => r.id === sched.routeId) || {
        id: sched.routeId,
        agencyId: sched.agencyId,
        origin: 'Kigali (Nyabugogo)',
        destination: 'Musanze (Ruhengeri)',
        distanceKm: 90,
        durationMinutes: 120,
        basePriceRwf: 2800,
        isActive: true,
      };

      const availableSeatsCount = Math.max(0, bus.totalSeats - (sched.bookedSeats?.length || 0));

      return {
        ...sched,
        agency,
        bus,
        route,
        availableSeatsCount,
      };
    });
  },

  searchSchedules(params: SearchFilterParams): EnrichedSchedule[] {
    let results = this.getEnrichedSchedules();

    if (params.origin) {
      results = results.filter((s) => s.route.origin.toLowerCase().includes(params.origin!.toLowerCase()));
    }

    if (params.destination) {
      results = results.filter((s) =>
        s.route.destination.toLowerCase().includes(params.destination!.toLowerCase())
      );
    }

    if (params.travelDate) {
      results = results.filter((s) => s.departureDate === params.travelDate);
    }

    if (params.agencyId && params.agencyId !== 'all') {
      results = results.filter((s) => s.agencyId === params.agencyId);
    }

    if (params.maxPrice) {
      results = results.filter((s) => s.priceRwf <= params.maxPrice!);
    }

    // Sorting
    if (params.sortBy === 'price') {
      results.sort((a, b) => a.priceRwf - b.priceRwf);
    } else if (params.sortBy === 'seats') {
      results.sort((a, b) => b.availableSeatsCount - a.availableSeatsCount);
    } else {
      // Default time sort
      results.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    return results;
  },

  autoAssignSeat(scheduleId: string): number {
    const enriched = this.getEnrichedSchedules().find((s) => s.id === scheduleId);
    if (!enriched) return 1;

    const totalSeats = enriched.bus.totalSeats;
    const booked = new Set(enriched.bookedSeats || []);

    for (let i = 1; i <= totalSeats; i++) {
      if (!booked.has(i)) {
        return i;
      }
    }
    return 1;
  },

  async processBooking(params: {
    scheduleId: string;
    passengerName: string;
    passengerPhone: string;
    passengerEmail?: string;
    seatNumber?: number; // if omitted, auto-assigned
    paymentMethod: PaymentMethod;
    channel?: 'web' | 'ussd';
  }): Promise<{ success: boolean; ticket?: Ticket; booking?: Booking; error?: string }> {
    const schedules = this.getEnrichedSchedules();
    const enriched = schedules.find((s) => s.id === params.scheduleId);

    if (!enriched) {
      return { success: false, error: 'Schedule not found' };
    }

    const assignedSeat = params.seatNumber || this.autoAssignSeat(params.scheduleId);

    // Validate seat availability
    if (enriched.bookedSeats.includes(assignedSeat)) {
      return { success: false, error: `Seat ${assignedSeat} is already booked. Please pick another seat.` };
    }

    // Mark seat as booked in storage
    storageService.bookSeatsOnSchedule(enriched.id, [assignedSeat]);

    const bookingId = `book-${Date.now()}`;
    const ticketNumber = ticketService.generateTicketNumber();
    const nowIso = new Date().toISOString();

    const booking: Booking = {
      id: bookingId,
      ticketNumber,
      scheduleId: enriched.id,
      agencyId: enriched.agencyId,
      passengerName: params.passengerName,
      passengerPhone: params.passengerPhone,
      passengerEmail: params.passengerEmail,
      seats: [assignedSeat],
      totalPriceRwf: enriched.priceRwf,
      status: 'confirmed',
      channel: params.channel || 'web',
      createdAt: nowIso,
      paymentStatus: 'completed',
      paymentMethod: params.paymentMethod,
    };

    const ticket: Ticket = {
      id: `ticket-${Date.now()}`,
      ticketNumber,
      bookingId,
      scheduleId: enriched.id,
      agencyId: enriched.agencyId,
      passengerName: params.passengerName,
      passengerPhone: params.passengerPhone,
      origin: enriched.route.origin,
      destination: enriched.route.destination,
      departureDate: enriched.departureDate,
      departureTime: enriched.departureTime,
      arrivalTime: enriched.arrivalTime,
      seatNumber: assignedSeat,
      busPlate: enriched.bus.plateNumber,
      busModel: enriched.bus.model,
      priceRwf: enriched.priceRwf,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'completed',
      ticketStatus: 'valid',
      channel: params.channel || 'web',
      createdAt: nowIso,
    };

    // Save payment record
    const paymentTxId = `${params.paymentMethod === 'MTN_MOMO' ? 'MTN' : 'AIR'}-RW-${Math.floor(10000 + Math.random() * 90000)}`;
    storageService.savePayment({
      id: `pay-${Date.now()}`,
      bookingId,
      ticketNumber,
      passengerPhone: params.passengerPhone,
      amountRwf: enriched.priceRwf,
      provider: params.paymentMethod,
      status: 'completed',
      timestamp: nowIso,
      channel: params.channel || 'web',
      providerTransactionId: paymentTxId,
    });

    storageService.saveBooking(booking);
    storageService.saveTicket(ticket);

    return {
      success: true,
      ticket,
      booking,
    };
  },
};
