import { QrCode, Check, MapPin, Calendar, Clock, Bus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Booking, getScheduleById, getBusById, getRouteById } from "@/lib/data";

interface TicketDisplayProps {
  bookings: Booking[];
  onBookAnother: () => void;
}

export function TicketDisplay({ bookings, onBookAnother }: TicketDisplayProps) {
  if (bookings.length === 0) return null;

  const firstBooking = bookings[0];
  const schedule = getScheduleById(firstBooking.scheduleId);
  const bus = schedule ? getBusById(schedule.busId) : null;
  const route = schedule ? getRouteById(schedule.routeId) : null;

  if (!schedule || !bus || !route) return null;

  const seatNumbers = bookings.map(b => b.seatNumber).sort((a, b) => a - b);
  const totalAmount = bookings.length * schedule.price;
  const bookingRef = `NPS-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success rounded-full mb-4">
          <Check className="h-8 w-8 text-success-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your e-ticket has been sent to {firstBooking.passengerEmail}
        </p>
      </div>

      {/* Ticket Card */}
      <Card className="overflow-hidden shadow-xl">
        <div className="bg-primary p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-secondary p-2 rounded-lg">
                <Bus className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-foreground">Nirosha</h3>
                <p className="text-xs text-primary-foreground/80">Passenger Services</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-primary-foreground/80">Booking Reference</p>
              <p className="text-lg font-mono font-bold text-secondary">{bookingRef}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="p-6 border-b border-dashed border-border">
            <div className="grid grid-cols-2 gap-6">
              {/* Route Info */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div className="w-0.5 h-16 bg-border"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-6">
                      <p className="text-xs text-muted-foreground">FROM</p>
                      <p className="font-semibold text-card-foreground">{route.source}</p>
                      <p className="text-sm text-muted-foreground">{schedule.departureTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">TO</p>
                      <p className="font-semibold text-card-foreground">{route.destination}</p>
                      <p className="text-sm text-muted-foreground">{schedule.arrivalTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="w-28 h-28 bg-foreground/10 rounded flex items-center justify-center">
                    <QrCode className="h-20 w-20 text-foreground/50" />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">Scan at boarding</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date
              </p>
              <p className="font-semibold text-card-foreground">{schedule.date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Duration
              </p>
              <p className="font-semibold text-card-foreground">{route.duration}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Bus className="h-3 w-3" /> Bus
              </p>
              <p className="font-semibold text-card-foreground">{bus.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seats</p>
              <p className="font-semibold text-card-foreground">{seatNumbers.join(', ')}</p>
            </div>
          </div>

          {/* Passenger Info */}
          <div className="px-6 pb-6">
            <div className="bg-muted/50 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Passenger</p>
                <p className="font-semibold text-card-foreground">{firstBooking.passengerName}</p>
                <p className="text-sm text-muted-foreground">{firstBooking.passengerEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">
                  LKR {totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Ticket
        </Button>
        <Button onClick={onBookAnother}>
          Book Another Trip
        </Button>
      </div>
    </div>
  );
}
