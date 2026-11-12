import {
  Agency,
  Bus,
  Route,
  Schedule,
  Ticket,
  Booking,
  PaymentTransaction,
  User,
  RouteChangeRecord,
} from '../types';
import {
  INITIAL_AGENCIES,
  INITIAL_BUSES,
  INITIAL_ROUTES,
  INITIAL_SCHEDULES,
  INITIAL_TICKETS,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  DEMO_USERS,
} from '../data/demoData';

const STORAGE_KEYS = {
  AGENCIES: 'busgo_agencies_rw',
  BUSES: 'busgo_buses_rw',
  ROUTES: 'busgo_routes_rw',
  SCHEDULES: 'busgo_schedules_rw',
  TICKETS: 'busgo_tickets_rw',
  BOOKINGS: 'busgo_bookings_rw',
  PAYMENTS: 'busgo_payments_rw',
  USERS: 'busgo_users_rw',
  CURRENT_USER: 'busgo_current_user_rw',
};

// Custom event to sync UI in real time
const DATA_UPDATE_EVENT = 'busgo_data_updated';

export const storageService = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.AGENCIES)) {
      localStorage.setItem(STORAGE_KEYS.AGENCIES, JSON.stringify(INITIAL_AGENCIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUSES)) {
      localStorage.setItem(STORAGE_KEYS.BUSES, JSON.stringify(INITIAL_BUSES));
    }
    const storedRoutes = localStorage.getItem(STORAGE_KEYS.ROUTES);
    if (!storedRoutes || JSON.parse(storedRoutes).length < INITIAL_ROUTES.length) {
      localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(INITIAL_ROUTES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS[0]));
    }
  },

  notifyChange() {
    window.dispatchEvent(new CustomEvent(DATA_UPDATE_EVENT));
  },

  onDataChange(callback: () => void) {
    const handler = () => callback();
    window.addEventListener(DATA_UPDATE_EVENT, handler);
    return () => window.removeEventListener(DATA_UPDATE_EVENT, handler);
  },

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.AGENCIES, JSON.stringify(INITIAL_AGENCIES));
    localStorage.setItem(STORAGE_KEYS.BUSES, JSON.stringify(INITIAL_BUSES));
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(INITIAL_ROUTES));
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
    this.notifyChange();
  },

  // USERS
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : DEMO_USERS;
  },

  getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : DEMO_USERS[0];
  },

  setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notifyChange();
  },

  registerUser(userData: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  },

  updateUserProfile(updatedUser: User) {
    const users = this.getUsers().map((u) => (u.id === updatedUser.id ? updatedUser : u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    const current = this.getCurrentUser();
    if (current.id === updatedUser.id) {
      this.setCurrentUser(updatedUser);
    }
    this.notifyChange();
  },

  // AGENCIES
  getAgencies(): Agency[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AGENCIES);
    return raw ? JSON.parse(raw) : INITIAL_AGENCIES;
  },

  saveAgency(agency: Agency) {
    const list = this.getAgencies();
    const index = list.findIndex((a) => a.id === agency.id);
    if (index >= 0) {
      list[index] = agency;
    } else {
      list.push(agency);
    }
    localStorage.setItem(STORAGE_KEYS.AGENCIES, JSON.stringify(list));
    this.notifyChange();
  },

  // BUSES
  getBuses(): Bus[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BUSES);
    return raw ? JSON.parse(raw) : INITIAL_BUSES;
  },

  saveBus(bus: Bus) {
    const list = this.getBuses();
    const index = list.findIndex((b) => b.id === bus.id);
    if (index >= 0) {
      list[index] = bus;
    } else {
      list.push(bus);
    }
    localStorage.setItem(STORAGE_KEYS.BUSES, JSON.stringify(list));
    this.notifyChange();
  },

  deleteBus(busId: string) {
    const list = this.getBuses().filter((b) => b.id !== busId);
    localStorage.setItem(STORAGE_KEYS.BUSES, JSON.stringify(list));
    this.notifyChange();
  },

  // ROUTES
  getRoutes(): Route[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTES);
    return raw ? JSON.parse(raw) : INITIAL_ROUTES;
  },

  saveRoute(route: Route) {
    const list = this.getRoutes();
    const index = list.findIndex((r) => r.id === route.id);
    if (index >= 0) {
      list[index] = route;
    } else {
      list.push(route);
    }
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(list));
    this.notifyChange();
  },

  deleteRoute(routeId: string) {
    const list = this.getRoutes().filter((r) => r.id !== routeId);
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(list));
    this.notifyChange();
  },

  // SCHEDULES
  getSchedules(): Schedule[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return raw ? JSON.parse(raw) : INITIAL_SCHEDULES;
  },

  saveSchedule(sched: Schedule) {
    const list = this.getSchedules();
    const index = list.findIndex((s) => s.id === sched.id);
    if (index >= 0) {
      list[index] = sched;
    } else {
      list.push(sched);
    }
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(list));
    this.notifyChange();
  },

  deleteSchedule(schedId: string) {
    const list = this.getSchedules().filter((s) => s.id !== schedId);
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(list));
    this.notifyChange();
  },

  bookSeatsOnSchedule(scheduleId: string, seatNumbers: number[]) {
    const list = this.getSchedules();
    const schedule = list.find((s) => s.id === scheduleId);
    if (schedule) {
      const set = new Set([...schedule.bookedSeats, ...seatNumbers]);
      schedule.bookedSeats = Array.from(set);
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(list));
      this.notifyChange();
    }
  },

  releaseSeatOnSchedule(scheduleId: string, seatNumber: number) {
    const list = this.getSchedules();
    const schedule = list.find((s) => s.id === scheduleId);
    if (schedule) {
      schedule.bookedSeats = schedule.bookedSeats.filter((num) => num !== seatNumber);
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(list));
      this.notifyChange();
    }
  },

  // TICKETS
  getTickets(): Ticket[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return raw ? JSON.parse(raw) : INITIAL_TICKETS;
  },

  getTicketByNumber(ticketNumber: string): Ticket | undefined {
    return this.getTickets().find((t) => t.ticketNumber.toUpperCase() === ticketNumber.trim().toUpperCase());
  },

  saveTicket(ticket: Ticket) {
    const list = this.getTickets();
    const index = list.findIndex((t) => t.id === ticket.id || t.ticketNumber === ticket.ticketNumber);
    if (index >= 0) {
      list[index] = ticket;
    } else {
      list.unshift(ticket);
    }
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(list));
    this.notifyChange();
  },

  // BOOKINGS
  getBookings(): Booking[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return raw ? JSON.parse(raw) : INITIAL_BOOKINGS;
  },

  saveBooking(booking: Booking) {
    const list = this.getBookings();
    const index = list.findIndex((b) => b.id === booking.id);
    if (index >= 0) {
      list[index] = booking;
    } else {
      list.unshift(booking);
    }
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));
    this.notifyChange();
  },

  // PAYMENTS
  getPayments(): PaymentTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return raw ? JSON.parse(raw) : INITIAL_PAYMENTS;
  },

  savePayment(payment: PaymentTransaction) {
    const list = this.getPayments();
    list.unshift(payment);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(list));
    this.notifyChange();
  },
};

// Initialize immediately upon import
storageService.init();
