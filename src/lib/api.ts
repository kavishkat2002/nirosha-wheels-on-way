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
  status: string;
  created_at: string;
}

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
  passengerEmail: string
): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: userId,
      schedule_id: scheduleId,
      seat_number: seatNumber,
      passenger_name: passengerName,
      passenger_email: passengerEmail,
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
  passengerEmail: string
): Promise<Booking[]> {
  const bookings = seatNumbers.map((seatNumber) => ({
    user_id: userId,
    schedule_id: scheduleId,
    seat_number: seatNumber,
    passenger_name: passengerName,
    passenger_email: passengerEmail,
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
