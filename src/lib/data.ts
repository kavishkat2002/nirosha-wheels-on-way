// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Bus {
  id: string;
  name: string;
  number: string;
  type: 'AC' | 'Non-AC';
  totalSeats: number;
}

export interface Route {
  id: string;
  source: string;
  destination: string;
  duration: string;
}

export interface Schedule {
  id: string;
  busId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  date: string;
}

export interface Booking {
  id: string;
  userId: string;
  scheduleId: string;
  seatNumber: number;
  status: 'confirmed' | 'cancelled';
  passengerName: string;
  passengerEmail: string;
  bookingDate: string;
}

// Helper to get tomorrow's date
const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getDayAfterTomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().split('T')[0];
};

// Seed Data
const initialBuses: Bus[] = [
  { id: 'bus-1', name: 'Nirosha Express 1', number: 'NP-5678', type: 'AC', totalSeats: 40 },
  { id: 'bus-2', name: 'Nirosha King', number: 'NP-1234', type: 'Non-AC', totalSeats: 40 },
];

const initialRoutes: Route[] = [
  { id: 'route-1', source: 'Colombo', destination: 'Kandy', duration: '3h 30m' },
  { id: 'route-2', source: 'Colombo', destination: 'Galle', duration: '2h 15m' },
  { id: 'route-3', source: 'Kandy', destination: 'Colombo', duration: '3h 30m' },
  { id: 'route-4', source: 'Galle', destination: 'Colombo', duration: '2h 15m' },
];

const tomorrow = getTomorrowDate();
const dayAfter = getDayAfterTomorrow();

const initialSchedules: Schedule[] = [
  { id: 'sch-1', busId: 'bus-1', routeId: 'route-1', departureTime: '06:00', arrivalTime: '09:30', price: 1500, date: tomorrow },
  { id: 'sch-2', busId: 'bus-2', routeId: 'route-1', departureTime: '08:00', arrivalTime: '11:30', price: 800, date: tomorrow },
  { id: 'sch-3', busId: 'bus-1', routeId: 'route-2', departureTime: '14:00', arrivalTime: '16:15', price: 1200, date: tomorrow },
  { id: 'sch-4', busId: 'bus-2', routeId: 'route-2', departureTime: '10:00', arrivalTime: '12:15', price: 600, date: dayAfter },
  { id: 'sch-5', busId: 'bus-1', routeId: 'route-3', departureTime: '16:00', arrivalTime: '19:30', price: 1500, date: tomorrow },
];

const initialBookings: Booking[] = [
  { id: 'book-1', userId: 'user-1', scheduleId: 'sch-1', seatNumber: 3, status: 'confirmed', passengerName: 'John Doe', passengerEmail: 'john@example.com', bookingDate: new Date().toISOString() },
  { id: 'book-2', userId: 'user-1', scheduleId: 'sch-1', seatNumber: 4, status: 'confirmed', passengerName: 'Jane Doe', passengerEmail: 'jane@example.com', bookingDate: new Date().toISOString() },
];

// Storage keys
const STORAGE_KEYS = {
  buses: 'nirosha_buses',
  routes: 'nirosha_routes',
  schedules: 'nirosha_schedules',
  bookings: 'nirosha_bookings',
};

// Initialize data if not present
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.buses)) {
    localStorage.setItem(STORAGE_KEYS.buses, JSON.stringify(initialBuses));
  }
  if (!localStorage.getItem(STORAGE_KEYS.routes)) {
    localStorage.setItem(STORAGE_KEYS.routes, JSON.stringify(initialRoutes));
  }
  if (!localStorage.getItem(STORAGE_KEYS.schedules)) {
    localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(initialSchedules));
  }
  if (!localStorage.getItem(STORAGE_KEYS.bookings)) {
    localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(initialBookings));
  }
};

// Call initialization
initializeData();

// Data access functions
export const getBuses = (): Bus[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.buses) || '[]');
};

export const getRoutes = (): Route[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.routes) || '[]');
};

export const getSchedules = (): Schedule[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.schedules) || '[]');
};

export const getBookings = (): Booking[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings) || '[]');
};

export const getBusById = (id: string): Bus | undefined => {
  return getBuses().find(bus => bus.id === id);
};

export const getRouteById = (id: string): Route | undefined => {
  return getRoutes().find(route => route.id === id);
};

export const getScheduleById = (id: string): Schedule | undefined => {
  return getSchedules().find(schedule => schedule.id === id);
};

// Search schedules by route and date
export const searchSchedules = (source: string, destination: string, date: string): Schedule[] => {
  const routes = getRoutes();
  const schedules = getSchedules();
  
  const matchingRoutes = routes.filter(
    route => route.source.toLowerCase() === source.toLowerCase() && 
             route.destination.toLowerCase() === destination.toLowerCase()
  );
  
  return schedules.filter(schedule => 
    matchingRoutes.some(route => route.id === schedule.routeId) && 
    schedule.date === date
  );
};

// Get booked seats for a schedule
export const getBookedSeats = (scheduleId: string): number[] => {
  const bookings = getBookings();
  return bookings
    .filter(booking => booking.scheduleId === scheduleId && booking.status === 'confirmed')
    .map(booking => booking.seatNumber);
};

// Add a booking
export const addBooking = (booking: Omit<Booking, 'id' | 'bookingDate'>): Booking => {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: `book-${Date.now()}`,
    bookingDate: new Date().toISOString(),
  };
  bookings.push(newBooking);
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
  return newBooking;
};

// Add multiple bookings
export const addMultipleBookings = (
  scheduleId: string,
  seatNumbers: number[],
  passengerName: string,
  passengerEmail: string
): Booking[] => {
  const newBookings = seatNumbers.map(seatNumber => 
    addBooking({
      userId: 'guest',
      scheduleId,
      seatNumber,
      status: 'confirmed',
      passengerName,
      passengerEmail,
    })
  );
  return newBookings;
};

// Admin: Add bus
export const addBus = (bus: Omit<Bus, 'id'>): Bus => {
  const buses = getBuses();
  const newBus: Bus = {
    ...bus,
    id: `bus-${Date.now()}`,
  };
  buses.push(newBus);
  localStorage.setItem(STORAGE_KEYS.buses, JSON.stringify(buses));
  return newBus;
};

// Admin: Remove bus
export const removeBus = (id: string): void => {
  const buses = getBuses().filter(bus => bus.id !== id);
  localStorage.setItem(STORAGE_KEYS.buses, JSON.stringify(buses));
};

// Admin: Add schedule
export const addSchedule = (schedule: Omit<Schedule, 'id'>): Schedule => {
  const schedules = getSchedules();
  const newSchedule: Schedule = {
    ...schedule,
    id: `sch-${Date.now()}`,
  };
  schedules.push(newSchedule);
  localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));
  return newSchedule;
};

// Admin: Remove schedule
export const removeSchedule = (id: string): void => {
  const schedules = getSchedules().filter(schedule => schedule.id !== id);
  localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));
};

// Get unique locations for dropdowns
export const getLocations = (): string[] => {
  const routes = getRoutes();
  const locations = new Set<string>();
  routes.forEach(route => {
    locations.add(route.source);
    locations.add(route.destination);
  });
  return Array.from(locations).sort();
};

// Reset data to initial state
export const resetData = (): void => {
  localStorage.setItem(STORAGE_KEYS.buses, JSON.stringify(initialBuses));
  localStorage.setItem(STORAGE_KEYS.routes, JSON.stringify(initialRoutes));
  localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(initialSchedules));
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(initialBookings));
};
