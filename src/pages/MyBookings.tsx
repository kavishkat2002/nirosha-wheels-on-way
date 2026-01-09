import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, MapPin, Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface BookingWithDetails {
  id: string;
  seat_number: number;
  passenger_name: string;
  status: string;
  created_at: string;
  schedule: {
    id: string;
    departure_time: string;
    arrival_time: string;
    price: number;
    date: string;
    bus: {
      name: string;
      type: string;
    };
    route: {
      source: string;
      destination: string;
      duration: string;
    };
  };
}

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        seat_number,
        passenger_name,
        status,
        created_at,
        schedule:schedules (
          id,
          departure_time,
          arrival_time,
          price,
          date,
          bus:buses (
            name,
            type
          ),
          route:routes (
            source,
            destination,
            duration
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
    } else {
      setBookings(data as unknown as BookingWithDetails[]);
    }
    setLoading(false);
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (error) {
      console.error("Error cancelling booking:", error);
    } else {
      fetchBookings();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.schedule.date) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "cancelled" || new Date(b.schedule.date) < new Date()
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 p-3 rounded-full">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your bus tickets</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">Start by booking your first bus ticket</p>
              <Button onClick={() => navigate("/")}>Book a Ticket</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {upcomingBookings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Trips</h2>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      onCancel={cancelBooking}
                      showCancel
                    />
                  ))}
                </div>
              </section>
            )}

            {pastBookings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4">Past & Cancelled</h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function BookingCard({ 
  booking, 
  onCancel, 
  showCancel 
}: { 
  booking: BookingWithDetails; 
  onCancel?: (id: string) => void;
  showCancel?: boolean;
}) {
  const { schedule } = booking;
  
  return (
    <Card className={booking.status === "cancelled" ? "opacity-60" : ""}>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">{schedule.bus.name}</h3>
              <Badge variant={schedule.bus.type === "AC" ? "default" : "secondary"}>
                {schedule.bus.type}
              </Badge>
              <Badge variant={booking.status === "confirmed" ? "default" : "destructive"}>
                {booking.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span>{schedule.route.source}</span>
              <ArrowRight className="h-4 w-4" />
              <span>{schedule.route.destination}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(schedule.date), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{schedule.departure_time}</span>
              </div>
              <div className="bg-muted px-2 py-1 rounded">
                Seat #{booking.seat_number}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                LKR {Number(schedule.price).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Booked {format(new Date(booking.created_at), "MMM dd")}
              </p>
            </div>
            
            {showCancel && booking.status === "confirmed" && onCancel && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onCancel(booking.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
