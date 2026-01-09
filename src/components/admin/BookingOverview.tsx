import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  getBookings, 
  getScheduleById, 
  getBusById, 
  getRouteById,
  Booking 
} from "@/lib/data";
import { ClipboardList, Users, Calendar } from "lucide-react";

export function BookingOverview() {
  const [bookings] = useState<Booking[]>(getBookings());

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, booking) => {
    const schedule = getScheduleById(booking.scheduleId);
    return sum + (schedule?.price || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{confirmedBookings.length}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {new Set(confirmedBookings.map(b => b.passengerEmail)).size}
                </p>
                <p className="text-sm text-muted-foreground">Unique Passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  LKR {totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            All Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No bookings yet
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => {
                    const schedule = getScheduleById(booking.scheduleId);
                    const bus = schedule ? getBusById(schedule.busId) : null;
                    const route = schedule ? getRouteById(schedule.routeId) : null;
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.passengerName}</TableCell>
                        <TableCell>{booking.passengerEmail}</TableCell>
                        <TableCell>
                          {route ? `${route.source} → ${route.destination}` : 'N/A'}
                        </TableCell>
                        <TableCell>{bus?.name || 'N/A'}</TableCell>
                        <TableCell>#{booking.seatNumber}</TableCell>
                        <TableCell>{schedule?.date || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={booking.status === 'confirmed' ? 'default' : 'destructive'}
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
