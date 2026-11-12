import { storageService } from './storageService';
import { BusLiveTracking, Route, Schedule, RwandaProvince } from '../types';
import { RWANDA_MAP_CITIES } from '../data/demoData';

export const trackingService = {
  getAllRoutes(): Route[] {
    return storageService.getRoutes();
  },

  getRoutesByProvince(province: RwandaProvince | 'All'): Route[] {
    const all = this.getAllRoutes();
    if (province === 'All') return all;
    return all.filter((r) => r.province === province);
  },

  getAllLiveBuses(): BusLiveTracking[] {
    const schedules = storageService.getSchedules();
    const buses = storageService.getBuses();
    const agencies = storageService.getAgencies();
    const routes = storageService.getRoutes();

    const liveBuses: BusLiveTracking[] = [];

    schedules.forEach((sched, index) => {
      const bus = buses.find((b) => b.id === sched.busId);
      const agency = agencies.find((a) => a.id === sched.agencyId);
      const route = routes.find((r) => r.id === sched.routeId);

      if (!bus || !agency || !route) return;

      const originNode = RWANDA_MAP_CITIES[route.origin] || { x: 50, y: 50 };
      const destNode = RWANDA_MAP_CITIES[route.destination] || { x: 50, y: 50 };

      // Calculate pseudo-live progress from schedule or deterministic index
      // Creates staggered active bus movements across the country
      const stops = route.intermediateStops && route.intermediateStops.length > 0
        ? route.intermediateStops
        : [route.origin, 'Intermediate Waypoint', route.destination];

      // Progress variation between 15% and 85% for buses on the road
      const baseProgress = ((index * 23 + 37) % 70) + 15;
      const progressPercent = Math.min(95, Math.max(5, baseProgress));

      // Current Stop & Next Stop calculation
      const stopIndex = Math.floor((progressPercent / 100) * stops.length);
      const currentLocationName = stops[Math.min(stopIndex, stops.length - 1)];
      const nextStop = stops[Math.min(stopIndex + 1, stops.length - 1)];

      // Interpolate coordinates on Rwanda map
      const t = progressPercent / 100;
      const currentX = originNode.x + (destNode.x - originNode.x) * t;
      const currentY = originNode.y + (destNode.y - originNode.y) * t;

      // Real Rwandan speed governed limit (52 - 58 km/h)
      const speedKmh = 50 + (index % 8);

      // Remaining minutes
      const totalDuration = route.durationMinutes || 120;
      const remainingMinutes = Math.max(5, Math.round(totalDuration * (1 - progressPercent / 100)));

      // Status
      let status: BusLiveTracking['status'] = 'in_transit';
      if (progressPercent < 10) status = 'boarding';
      else if (progressPercent > 90) status = 'on_schedule';

      liveBuses.push({
        busId: bus.id,
        plateNumber: bus.plateNumber,
        scheduleId: sched.id,
        routeId: route.id,
        agencyId: agency.id,
        agencyName: agency.name,
        origin: route.origin,
        destination: route.destination,
        departureTime: sched.departureTime,
        arrivalTime: sched.arrivalTime,
        currentLocationName,
        nextStop,
        progressPercent,
        speedKmh,
        estimatedArrivalMinutes: remainingMinutes,
        status,
        totalSeats: bus.totalSeats,
        passengersOnBoard: Math.min(bus.totalSeats, (sched.bookedSeats?.length || 0) + 14),
        coordinates: {
          x: Math.round(currentX * 10) / 10,
          y: Math.round(currentY * 10) / 10,
        },
      });
    });

    return liveBuses;
  },

  getLiveTrackingForSchedule(scheduleId: string): BusLiveTracking | null {
    const all = this.getAllLiveBuses();
    return all.find((b) => b.scheduleId === scheduleId) || null;
  },

  getLiveTrackingForTicket(ticketNumber: string): BusLiveTracking | null {
    const ticket = storageService.getTicketByNumber(ticketNumber);
    if (!ticket) return null;

    const live = this.getLiveTrackingForSchedule(ticket.scheduleId);
    if (live) return live;

    // Fallback: build tracking based on ticket route
    const routes = storageService.getRoutes();
    const route = routes.find((r) => r.origin === ticket.origin && r.destination === ticket.destination) || routes[0];
    const originNode = RWANDA_MAP_CITIES[ticket.origin] || { x: 50, y: 50 };
    const destNode = RWANDA_MAP_CITIES[ticket.destination] || { x: 50, y: 50 };
    const stops = route.intermediateStops || [ticket.origin, 'Intermediate Highway', ticket.destination];

    return {
      busId: `bus-${ticket.busPlate}`,
      plateNumber: ticket.busPlate,
      scheduleId: ticket.scheduleId,
      routeId: route.id,
      agencyId: ticket.agencyId,
      agencyName: 'BusGo Rwanda Fleet',
      origin: ticket.origin,
      destination: ticket.destination,
      departureTime: ticket.departureTime,
      arrivalTime: ticket.arrivalTime,
      currentLocationName: stops[1] || ticket.origin,
      nextStop: stops[stops.length - 1] || ticket.destination,
      progressPercent: 62,
      speedKmh: 56,
      estimatedArrivalMinutes: 38,
      status: 'in_transit',
      totalSeats: 28,
      passengersOnBoard: 22,
      coordinates: {
        x: (originNode.x + destNode.x) / 2,
        y: (originNode.y + destNode.y) / 2,
      },
    };
  },
};
