
import { useRef, useEffect, useState } from "react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Mail, Check, MapPin, Calendar, Clock, Armchair, Phone, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Booking, Schedule } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface TicketDisplayProps {
  bookings: Booking[];
  schedule: Schedule;
  onBookAnother: () => void;
}

export function TicketDisplay({ bookings, schedule, onBookAnother }: TicketDisplayProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ticket-${bookings[0]?.id.slice(0, 8)}.pdf`);
      toast.success("Ticket downloaded successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF ticket");
    }
  };

  const handleEmailTicket = async () => {
    // In a real application, this would call a backend function to send the email
    toast.success(`Ticket sent to ${bookings[0]?.passenger_email}`);
  };

  if (bookings.length === 0 || !schedule.bus || !schedule.route) return null;

  const booking = bookings[0];
  const bus = schedule.bus;
  const route = schedule.route;
  const seatNumbers = bookings.map(b => b.seat_number).sort((a, b) => a - b).join(", ");
  const totalAmount = bookings.length * schedule.price;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 text-success rounded-full mb-2">
          <Check className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Booking Confirmed!</h2>
        <p className="text-muted-foreground text-lg">
          Your ticket has been successfully booked. A confirmation email has been sent.
        </p>
      </div>

      <div ref={ticketRef} className="bg-card text-card-foreground shadow-xl rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {bus.name} {bus.number && <span className="text-lg font-normal opacity-90">({bus.number})</span>}
                </h3>
                <p className="opacity-90 font-medium">{bus.type} Class</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80 uppercase tracking-wider">Booking Ref</p>
              <p className="font-mono font-bold text-2xl">{booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 bg-white dark:bg-card">
          {/* Route Info */}
          <div className="flex items-center justify-between relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-border -z-10" />

            <div className="bg-card pr-4">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">From</p>
              <p className="font-bold text-xl">{route.source}</p>
              <div className="flex items-center gap-1 text-sm text-primary mt-1">
                <MapPin className="w-3 h-3" />
                <span>{booking.pickup_location || "Standard Pickup"}</span>
              </div>
            </div>

            <div className="bg-card px-4 text-center">
              <div className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full border border-border">
                {route.duration}
              </div>
            </div>

            <div className="bg-card pl-4 text-right">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">To</p>
              <p className="font-bold text-xl">{route.destination}</p>
              <div className="flex items-center gap-1 text-sm text-primary mt-1 justify-end">
                <span>{booking.dropoff_location || "Standard Drop-off"}</span>
                <MapPin className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="h-px bg-border my-6" />

          {/* Schedule Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-bold uppercase flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Date
              </p>
              <p className="font-semibold text-lg">{format(new Date(schedule.date), "EEEE, d MMM yyyy")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-bold uppercase flex items-center gap-2">
                <Clock className="w-3 h-3" /> Time
              </p>
              <p className="font-semibold text-lg">{schedule.departure_time} - {schedule.arrival_time}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-bold uppercase flex items-center gap-2">
                <Armchair className="w-3 h-3" /> Seat No
              </p>
              <p className="font-semibold text-lg tracking-wide">{seatNumbers}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-bold uppercase flex items-center gap-2">
                <Phone className="w-3 h-3" /> Mobile
              </p>
              <p className="font-semibold text-lg">{booking.passenger_phone || "N/A"}</p>
            </div>
          </div>

          {/* Passenger & Price */}
          <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Passenger</p>
                <p className="font-bold text-lg">{booking.passenger_name}</p>
                <p className="text-sm text-muted-foreground">{booking.passenger_email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Total Amount</p>
                <p className="font-bold text-2xl text-primary">LKR {totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center pt-4 space-y-3">
            <div className="bg-white p-3 rounded-xl border-2 border-dashed border-muted-foreground/20 shadow-sm">
              <QRCodeSVG
                value={`REF:${booking.id}|SEATS:${seatNumbers}|PASSENGER:${booking.passenger_name}`}
                size={140}
                level="M"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center font-medium">Scan this QR code at boarding</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted px-8 py-4 text-center border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>Nirosha Passenger Services</span>
          <span className="font-mono">{booking.id}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={handleDownloadPDF} className="flex-1 sm:flex-none sm:w-48" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button onClick={handleEmailTicket} variant="outline" className="flex-1 sm:flex-none sm:w-48" size="lg">
          <Mail className="w-4 h-4 mr-2" />
          Email Ticket
        </Button>
        <Button onClick={onBookAnother} variant="secondary" className="flex-1 sm:flex-none sm:w-48" size="lg">
          Book Another
        </Button>
      </div>
    </div>
  );
}
