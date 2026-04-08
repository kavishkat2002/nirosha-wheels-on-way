import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAllBookings, Booking } from "@/lib/api";
import { ClipboardList, Users, Loader2, Calendar as CalendarIcon, Phone, Mail, MapPin, Download, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Custom LKR icon since it's common in this app
const LKRIconComponent = () => <span className="font-bold text-xs">LKR</span>;

export function BookingOverview() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumbers, setPhoneNumbers] = useState<Record<string, string>>({});
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchAllBookings();
      setBookings(data);

      // No need to fetch profiles mapping anymore as phone is stored on booking
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (date: string, dateBookings: Booking[]) => {
    try {
      console.log("Generating PDF for date:", date);
      const doc = new jsPDF({ orientation: 'landscape' });

      // Title
      doc.setFontSize(18);
      doc.text(`Bookings for ${new Date(date).toLocaleDateString()}`, 14, 20);

      // Define headers
      const headers = [[
        "Ref ID",
        "Passenger",
        "Email",
        "Phone",
        "Route",
        "Pickup / Drop-off",
        "Bus",
        "Seat",
        "Time",
        "Status",
        "Price"
      ]];

      // Map data rows
      const rows = dateBookings.map(b => {
        const phone = b.passenger_phone || 'N/A';
        const route = b.schedule?.route ? `${b.schedule.route.source} - ${b.schedule.route.destination}` : 'N/A';
        const bus = b.schedule?.bus ? `${b.schedule.bus.name}${b.schedule.bus.number ? ` (${b.schedule.bus.number})` : ''}` : 'N/A';
        const locations = `${b.pickup_location || 'Standard'} / ${b.dropoff_location || 'Standard'}`;

        return [
          b.id.slice(0, 8).toUpperCase(),
          b.passenger_name,
          b.passenger_email,
          phone,
          route,
          locations,
          bus,
          b.seat_number,
          b.schedule?.departure_time || 'N/A',
          b.status,
          `LKR ${b.schedule?.price || 0}`
        ];
      });

      // Generate table
      // @ts-ignore - autoTable type definition might not match sometimes
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Save PDF
      doc.save(`bookings_${date.replace(/\s/g, '_')}_${new Date().getTime()}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  // Get unique routes
  const uniqueRoutes = Array.from(new Set(bookings.map(b =>
    b.schedule?.route ? `${b.schedule.route.source} - ${b.schedule.route.destination}` : null
  ).filter(Boolean))) as string[];

  // Filter bookings based on selection
  const filteredBookings = bookings.filter(b => {
    // 1. Route Filter
    if (selectedRoute !== "all") {
      const routeString = b.schedule?.route ? `${b.schedule.route.source} - ${b.schedule.route.destination}` : null;
      if (routeString !== selectedRoute) return false;
    }

    // 2. Date Filter
    if (date) {
      if (!b.schedule?.date) return false;
      const bookingDateStr = b.schedule.date;
      const filterDateStr = format(date, 'yyyy-MM-dd');

      if (bookingDateStr !== filterDateStr) return false;
    }

    return true;
  });

  const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, booking) => {
    return sum + (booking.schedule?.price || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* Header is handled by parent or just implied */}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Filter by date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {date && (
              <Button variant="ghost" size="icon" onClick={() => setDate(undefined)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Route Filter */}
          <div className="w-full md:w-[300px]">
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger className="w-full">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by Route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                {uniqueRoutes.map((route) => (
                  <SelectItem key={route} value={route}>
                    {route}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
                <p className="text-sm text-muted-foreground">Confirmed Bookings</p>
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
                  {new Set(confirmedBookings.map(b => b.passenger_email)).size}
                </p>
                <p className="text-sm text-muted-foreground">Unique Passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <LKRIconComponent />
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

      {/* Bookings grouped by Date */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-xl font-bold text-foreground">
          {selectedRoute === 'all' ? 'All Bookings by Date' : `Bookings for ${selectedRoute}`}
        </h2>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No bookings found for this selection
          </CardContent>
        </Card>
      ) : (
        Object.keys(filteredBookings.reduce((acc, booking) => {
          const date = booking.schedule?.date || 'Unknown Date';
          if (!acc[date]) acc[date] = [];
          acc[date].push(booking);
          return acc;
        }, {} as Record<string, Booking[]>))
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort newest first
          .map((date) => {
            const dateBookings = filteredBookings.filter(b => (b.schedule?.date || 'Unknown Date') === date);

            return (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {date === 'Unknown Date' ? date : new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <Badge variant="secondary" className="ml-2">
                    {dateBookings.length} bookings
                  </Badge>

                  <div className="flex-1" />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF(date, dateBookings)}
                    className="gap-2 h-8"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                </div>

                <Card className="overflow-hidden border-l-4 border-l-primary/20">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="w-[80px]">Ref ID</TableHead>
                            <TableHead className="w-[150px]">Passenger</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Pickup / Drop-off</TableHead>
                            <TableHead>Bus</TableHead>
                            <TableHead>Seat</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dateBookings.map((booking) => (
                            <TableRow key={booking.id} className="hover:bg-muted/30">
                              <TableCell>
                                <span className="font-mono text-xs font-bold text-muted-foreground">
                                  {booking.id.slice(0, 8).toUpperCase()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{booking.passenger_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1 text-sm">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span>{booking.passenger_email}</span>
                                  </div>
                                  {booking.passenger_phone ? (
                                    <div className="flex items-center gap-1 text-primary font-medium">
                                      <Phone className="h-3 w-3" />
                                      <span>{booking.passenger_phone}</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground pl-4 italic">No phone</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {booking.schedule?.route ? (
                                  <div className="flex flex-col text-sm">
                                    <span className="font-medium">{booking.schedule.route.source}</span>
                                    <span className="text-muted-foreground text-xs">to {booking.schedule.route.destination}</span>
                                  </div>
                                ) : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col text-sm max-w-[150px]">
                                  <div className="flex items-center gap-1 text-primary/80">
                                    <span className="font-medium truncate" title={booking.pickup_location || 'Standard'}>
                                      From: {booking.pickup_location || 'Standard'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <span className="truncate" title={booking.dropoff_location || 'Standard'}>
                                      To: {booking.dropoff_location || 'Standard'}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {booking.schedule?.bus ? (
                                  <div className="flex flex-col">
                                    <span>
                                      {booking.schedule.bus.name}
                                      {booking.schedule.bus.number && <span className="opacity-80 ml-1">({booking.schedule.bus.number})</span>}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{booking.schedule.bus.type}</span>
                                  </div>
                                ) : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  #{booking.seat_number}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {booking.schedule?.departure_time || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={booking.status === 'confirmed' ? 'default' : 'destructive'}>
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                LKR {Number(booking.schedule?.price || 0).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })
      )}
    </div>
  );
}
