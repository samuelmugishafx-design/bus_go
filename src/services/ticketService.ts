import { storageService } from './storageService';
import { Ticket, TicketStatus, User } from '../types';
import QRCode from 'qrcode';

export interface VerificationResult {
  status: 'valid' | 'already_boarded' | 'cancelled' | 'route_changed' | 'invalid';
  ticket?: Ticket;
  message: string;
}

export const ticketService = {
  generateTicketNumber(): string {
    const random = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    return `BG-RW-${year}-${random}`;
  },

  async generateQRCodeDataUrl(ticketNumber: string): Promise<string> {
    try {
      const qrData = JSON.stringify({
        system: 'BUSGO_RWANDA',
        ticketNumber,
        verifiedAt: new Date().toISOString(),
      });
      return await QRCode.toDataURL(qrData, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
    } catch (e) {
      console.error('Failed to generate QR code', e);
      return '';
    }
  },

  verifyTicket(ticketNumber: string): VerificationResult {
    if (!ticketNumber || !ticketNumber.trim()) {
      return { status: 'invalid', message: 'Please enter a ticket reference number.' };
    }

    const ticket = storageService.getTicketByNumber(ticketNumber.trim());

    if (!ticket) {
      return {
        status: 'invalid',
        message: `Ticket "${ticketNumber.trim()}" not found in BusGo Rwanda database.`,
      };
    }

    if (ticket.ticketStatus === 'cancelled') {
      return {
        status: 'cancelled',
        ticket,
        message: 'This ticket has been CANCELLED and is no longer valid for travel.',
      };
    }

    if (ticket.ticketStatus === 'route_changed') {
      return {
        status: 'route_changed',
        ticket,
        message: 'This ticket has been replaced by an updated route change ticket.',
      };
    }

    if (ticket.ticketStatus === 'boarded') {
      return {
        status: 'already_boarded',
        ticket,
        message: `DUPLICATE BOARDING ALERT: This ticket was already verified and boarded on ${new Date(
          ticket.boardedAt || ''
        ).toLocaleTimeString()} by inspector ${ticket.verifiedByStaffName || 'Staff'}. Cannot accept twice.`,
      };
    }

    return {
      status: 'valid',
      ticket,
      message: 'Ticket is VALID. Passenger cleared for boarding.',
    };
  },

  confirmBoarding(ticketNumber: string, staffUser?: User): { success: boolean; message: string; ticket?: Ticket } {
    const verification = this.verifyTicket(ticketNumber);
    if (verification.status !== 'valid' || !verification.ticket) {
      return { success: false, message: verification.message };
    }

    const ticket = verification.ticket;
    ticket.ticketStatus = 'boarded';
    ticket.boardedAt = new Date().toISOString();
    ticket.verifiedByStaffId = staffUser?.id || 'staff-terminal-1';
    ticket.verifiedByStaffName = staffUser?.name || 'Nyabugogo Platform Inspector';

    storageService.saveTicket(ticket);
    return {
      success: true,
      message: `Passenger ${ticket.passengerName} (Seat ${ticket.seatNumber}) successfully marked as BOARDED.`,
      ticket,
    };
  },

  cancelTicket(ticketNumber: string, reason = 'Passenger requested cancellation'): { success: boolean; message: string } {
    const ticket = storageService.getTicketByNumber(ticketNumber);
    if (!ticket) {
      return { success: false, message: 'Ticket not found.' };
    }

    if (ticket.ticketStatus === 'boarded') {
      return { success: false, message: 'Cannot cancel a ticket that has already been boarded.' };
    }

    ticket.ticketStatus = 'cancelled';
    storageService.saveTicket(ticket);

    // Release seat on schedule
    storageService.releaseSeatOnSchedule(ticket.scheduleId, ticket.seatNumber);

    // Update booking status if linked
    const booking = storageService.getBookings().find((b) => b.ticketNumber === ticket.ticketNumber);
    if (booking) {
      booking.status = 'cancelled';
      storageService.saveBooking(booking);
    }

    return { success: true, message: `Ticket ${ticketNumber} has been successfully cancelled.` };
  },
};
