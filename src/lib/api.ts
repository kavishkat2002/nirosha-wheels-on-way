import { supabase } from "@/integrations/supabase/client";

export interface Bus {
  id: string;
  name: string;
  number: string;
  type: string;
  total_seats: number;
}

export interface Route {
  id: string;
  source: string;
  destination: string;
  duration: string;
}

export interface Schedule {
  id: string;
  bus_id: string;
  route_id: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  date: string;
  bus?: Bus;
  route?: Route;
}

export interface Booking {
  id: string;
  user_id: string | null;
  schedule_id: string;
  seat_number: number;
  passenger_name: string;
  passenger_email: string;
  pickup_location?: string;
  dropoff_location?: string;
  status: string;
  created_at: string;
  schedule?: Schedule;
}

// ... existing code ...

// Fetch all buses
export async function fetchBuses(): Promise<Bus[]> {
  const { data, error } = await supabase.from("buses").select("*");
  if (error) throw error;
  return data || [];
}

// Fetch all routes
export async function fetchRoutes(): Promise<Route[]> {
  const { data, error } = await supabase.from("routes").select("*");
  if (error) throw error;
  return data || [];
}

// Fetch schedules with optional filters
export async function fetchSchedules(source?: string, destination?: string, date?: string): Promise<Schedule[]> {
  let query = supabase
    .from("schedules")
    .select(`
      *,
      bus:buses(*),
      route:routes(*)
    `);

  if (date) {
    query = query.eq("date", date);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Filter by source/destination if provided
  let results = data || [];
  if (source && destination) {
    results = results.filter(
      (s) =>
        s.route?.source.toLowerCase() === source.toLowerCase() &&
        s.route?.destination.toLowerCase() === destination.toLowerCase()
    );
  }

  return results;
}

// Fetch booked seats for a schedule
export async function fetchBookedSeats(scheduleId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("seat_number")
    .eq("schedule_id", scheduleId)
    .eq("status", "confirmed");

  if (error) throw error;
  return data?.map((b) => b.seat_number) || [];
}

// Create a booking
export async function createBooking(
  userId: string,
  scheduleId: string,
  seatNumber: number,
  passengerName: string,
  passengerEmail: string,
  pickupLocation?: string,
  dropoffLocation?: string
): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: userId,
      schedule_id: scheduleId,
      seat_number: seatNumber,
      passenger_name: passengerName,
      passenger_email: passengerEmail,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      status: "confirmed",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Create multiple bookings
export async function createMultipleBookings(
  userId: string,
  scheduleId: string,
  seatNumbers: number[],
  passengerName: string,
  passengerEmail: string,
  pickupLocation?: string,
  dropoffLocation?: string
): Promise<Booking[]> {
  const bookings = seatNumbers.map((seatNumber) => ({
    user_id: userId,
    schedule_id: scheduleId,
    seat_number: seatNumber,
    passenger_name: passengerName,
    passenger_email: passengerEmail,
    pickup_location: pickupLocation,
    dropoff_location: dropoffLocation,
    status: "confirmed",
  }));

  const { data, error } = await supabase
    .from("bookings")
    .insert(bookings)
    .select();

  if (error) throw error;
  return data || [];
}

// Get unique locations from routes
export async function fetchLocations(): Promise<string[]> {
  const routes = await fetchRoutes();
  const locations = new Set<string>();
  routes.forEach((route) => {
    locations.add(route.source);
    locations.add(route.destination);
  });
  return Array.from(locations).sort();
}

// Admin: Add bus
export async function addBus(bus: Omit<Bus, "id">): Promise<void> {
  const { error } = await supabase
    .from("buses")
    .insert([{
      name: bus.name,
      number: bus.number,
      total_seats: bus.total_seats,
      type: bus.type,
    }]);

  if (error) throw error;
}

// Admin: Remove bus
export async function removeBus(id: string): Promise<void> {
  const { error } = await supabase
    .from("buses")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Admin: Add route
export async function addRoute(route: Omit<Route, "id">): Promise<void> {
  const { error } = await supabase
    .from("routes")
    .insert([{
      source: route.source,
      destination: route.destination,
      duration: route.duration,
    }]);

  if (error) throw error;
}

// Admin: Remove route
export async function removeRoute(id: string): Promise<void> {
  const { error } = await supabase
    .from("routes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Admin: Add schedule
export async function addSchedule(schedule: Omit<Schedule, "id" | "bus" | "route">): Promise<void> {
  const { error } = await supabase
    .from("schedules")
    .insert([{
      bus_id: schedule.bus_id,
      route_id: schedule.route_id,
      departure_time: schedule.departure_time,
      arrival_time: schedule.arrival_time,
      price: schedule.price,
      date: schedule.date,
    }]);

  if (error) throw error;
}

// Admin: Remove schedule
export async function removeSchedule(id: string): Promise<void> {
  const { error } = await supabase
    .from("schedules")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Admin: Fetch all bookings
export async function fetchAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      schedule:schedules(
        *,
        bus:buses(*),
        route:routes(*)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch popular routes based on booking count
export async function fetchPopularRoutes(): Promise<{ from: string; to: string; duration: string; price: string; bookCount: number }[]> {
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
       schedule:schedules (
         price,
         route:routes (
           source,
           destination,
           duration
         )
       )
    `);

  if (error) throw error;
  if (!bookings) return [];

  // Count bookings per route
  const routeStats: Record<string, { from: string; to: string; duration: string; price: number; count: number }> = {};

  bookings.forEach((booking: any) => {
    if (booking.schedule?.route) {
      const route = booking.schedule.route;
      const key = `${route.source}-${route.destination}`;

      if (!routeStats[key]) {
        routeStats[key] = {
          from: route.source,
          to: route.destination,
          duration: route.duration,
          price: booking.schedule.price, // Use latest price encountered
          count: 0
        };
      }
      routeStats[key].count++;
    }
  });

  // Convert to array and sort by count desc
  return Object.values(routeStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3) // Top 3
    .map(r => ({
      from: r.from,
      to: r.to,
      duration: r.duration,
      price: `LKR ${r.price.toLocaleString()}`,
      bookCount: r.count
    }));
}
