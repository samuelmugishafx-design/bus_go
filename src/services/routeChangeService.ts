import { storageService } from './storageService';
import { Ticket, Schedule, RouteChangeRecord, PaymentMethod } from '../types';
import { ticketService } from './ticketService';

export interface RouteChangeEligibility {
  eligible: boolean;
  reason?: string;
  ticket?: Ticket;
}

export interface RouteChangeCalculation {
  originalFareRwf: number;
  newFareRwf: number;
  differenceRwf: number; // positive = pay more, negative = credit
  actionRequired: 'pay_difference' | 'receive_credit' | 'even_swap';
}

export const routeChangeService = {
  checkEligibility(ticketNumber: string): RouteChangeEligibility {
    const ticket = storageService.getTicketByNumber(ticketNumber);
    if (!ticket) {
      return { eligible: false, reason: 'Ticket not found in the system.' };
    }

    if (ticket.ticketStatus === 'cancelled') {
      return { eligible: false, reason: 'Cancelled tickets cannot be modified.' };
    }

    if (ticket.ticketStatus === 'route_changed') {
      return { eligible: false, reason: 'This ticket has already been modified to a different route.' };
    }

    if (ticket.ticketStatus === 'boarded') {
      return { eligible: false, reason: 'A passenger who has already boarded or checked in cannot change routes.' };
    }

    // Check departure cutoff: Departure date & time
    const sched = storageService.getSchedules().find((s) => s.id === ticket.scheduleId);
    if (sched && sched.status === 'departed') {
      return { eligible: false, reason: 'The bus has already departed. Route changes are strictly blocked after departure.' };
    }

    // Parse departure date and time
    try {
      const departureDateTimeStr = `${ticket.departureDate}T${ticket.departureTime}:00`;
      const departureTime = new Date(departureDateTimeStr).getTime();
      const now = Date.now();

      // If departure was more than 15 minutes ago on today's date
      if (departureTime < now - 15 * 60 * 1000) {
        return {
          eligible: false,
          reason: `Bus scheduled departure (${ticket.departureDate} at ${ticket.departureTime}) has passed. Modifications are closed.`,
        };
      }
    } catch {
      // In case of parsing issue, default to schedule status check
    }

    return { eligible: true, ticket };
  },

  calculateFareDifference(originalPriceRwf: number, newSchedulePriceRwf: number): RouteChangeCalculation {
    const differenceRwf = newSchedulePriceRwf - originalPriceRwf;
    let actionRequired: RouteChangeCalculation['actionRequired'] = 'even_swap';

    if (differenceRwf > 0) {
      actionRequired = 'pay_difference';
    } else if (differenceRwf < 0) {
      actionRequired = 'receive_credit';
    }

    return {
      originalFareRwf: originalPriceRwf,
      newFareRwf: newSchedulePriceRwf,
      differenceRwf,
      actionRequired,
    };
  },

  executeRouteChange(params: {
    oldTicketNumber: string;
    newOrigin: string;
    newDestination: string;
    newScheduleId: string;
    newSeatNumber: number;
    paymentMethod?: PaymentMethod;
    phoneNumber?: string;
  }): { success: boolean; message: string; updatedTicket?: Ticket; fareDiff: number } {
    const eligibility = this.checkEligibility(params.oldTicketNumber);
    if (!eligibility.eligible || !eligibility.ticket) {
      return { success: false, message: eligibility.reason || 'Not eligible for route change.', fareDiff: 0 };
    }

    const oldTicket = eligibility.ticket;
    const newSchedule = storageService.getSchedules().find((s) => s.id === params.newScheduleId);

    if (!newSchedule) {
      return { success: false, message: 'Selected new schedule was not found.', fareDiff: 0 };
    }

    // Check if new seat is available
    if (newSchedule.bookedSeats.includes(params.newSeatNumber)) {
      return { success: false, message: `Seat ${params.newSeatNumber} on the new bus is already booked. Please pick an open seat.`, fareDiff: 0 };
    }

    const calc = this.calculateFareDifference(oldTicket.priceRwf, newSchedule.priceRwf);

    // Release seat on old schedule
    storageService.releaseSeatOnSchedule(oldTicket.scheduleId, oldTicket.seatNumber);

    // Book seat on new schedule
    storageService.bookSeatsOnSchedule(newSchedule.id, [params.newSeatNumber]);

    // Lookup bus and agency info for new schedule
    const newBus = storageService.getBuses().find((b) => b.id === newSchedule.busId);
    const newAgency = storageService.getAgencies().find((a) => a.id === newSchedule.agencyId);

    // Generate updated ticket reference for trace
    const newTicketNumber = ticketService.generateTicketNumber();

    const changeRecord: RouteChangeRecord = {
      changeId: `chg-${Date.now()}`,
      changedAt: new Date().toISOString(),
      previousRoute: {
        origin: oldTicket.origin,
        destination: oldTicket.destination,
        departureDate: oldTicket.departureDate,
        departureTime: oldTicket.departureTime,
        seatNumber: oldTicket.seatNumber,
        priceRwf: oldTicket.priceRwf,
      },
      newRoute: {
        origin: params.newOrigin,
        destination: params.newDestination,
        departureDate: newSchedule.departureDate,
        departureTime: newSchedule.departureTime,
        seatNumber: params.newSeatNumber,
        priceRwf: newSchedule.priceRwf,
      },
      fareDifferenceRwf: calc.differenceRwf,
      status: 'approved',
    };

    // If there is an additional payment, log payment transaction
    if (calc.differenceRwf > 0 && params.paymentMethod) {
      storageService.savePayment({
        id: `pay-chg-${Date.now()}`,
        bookingId: oldTicket.bookingId,
        ticketNumber: newTicketNumber,
        passengerPhone: params.phoneNumber || oldTicket.passengerPhone,
        amountRwf: calc.differenceRwf,
        provider: params.paymentMethod,
        status: 'completed',
        timestamp: new Date().toISOString(),
        channel: oldTicket.channel,
        providerTransactionId: `${params.paymentMethod === 'MTN_MOMO' ? 'MTN' : 'AIR'}-CHG-${Math.floor(10000 + Math.random() * 90000)}`,
      });
    }

    // Invalidate old ticket
    oldTicket.ticketStatus = 'route_changed';
    storageService.saveTicket(oldTicket);

    // Create the updated active ticket
    const updatedTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      ticketNumber: newTicketNumber,
      bookingId: oldTicket.bookingId,
      scheduleId: newSchedule.id,
      agencyId: newSchedule.agencyId,
      passengerName: oldTicket.passengerName,
      passengerPhone: oldTicket.passengerPhone,
      origin: params.newOrigin,
      destination: params.newDestination,
      departureDate: newSchedule.departureDate,
      departureTime: newSchedule.departureTime,
      arrivalTime: newSchedule.arrivalTime,
      seatNumber: params.newSeatNumber,
      busPlate: newBus?.plateNumber || 'RAD 500 B',
      busModel: newBus?.model || 'Executive Coach',
      priceRwf: newSchedule.priceRwf,
      paymentMethod: params.paymentMethod || oldTicket.paymentMethod,
      paymentStatus: 'completed',
      ticketStatus: 'valid',
      channel: oldTicket.channel,
      createdAt: new Date().toISOString(),
      routeChangeHistory: [...(oldTicket.routeChangeHistory || []), changeRecord],
    };

    storageService.saveTicket(updatedTicket);

    // Update booking record
    const booking = storageService.getBookings().find((b) => b.ticketNumber === oldTicket.ticketNumber || b.id === oldTicket.bookingId);
    if (booking) {
      booking.ticketNumber = newTicketNumber;
      booking.scheduleId = newSchedule.id;
      booking.seats = [params.newSeatNumber];
      booking.totalPriceRwf = newSchedule.priceRwf;
      storageService.saveBooking(booking);
    }

    return {
      success: true,
      message: `Route successfully changed from ${oldTicket.origin} → ${oldTicket.destination} to ${params.newOrigin} → ${params.newDestination}. New Ticket: ${newTicketNumber}`,
      updatedTicket,
      fareDiff: calc.differenceRwf,
    };
  },
};
