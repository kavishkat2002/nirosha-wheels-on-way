
import { useRef, useEffect, useState } from "react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import { Download, Check, MapPin, Calendar, Clock, Armchair, Phone, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Booking, Schedule } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface TicketProps {
    bookings: Booking[];
    schedule: Schedule;
    onClose: () => void;
}

export function TicketView({ bookings, schedule, onClose }: TicketProps) {
    const ticketRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    const handleDownloadPDF = async () => {
        try {
            toast.info("Generating A3 Premium Ticket...");
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a3",
            });

            // Colors
            const royalBlue = "#1e3a8a";
            const slate900 = "#0f172a";
            const slate500 = "#64748b";
            const white = "#ffffff";

            // Helper to draw centered text
            const centerText = (text: string, y: number, size: number, color: string, bold: boolean = false) => {
                doc.setTextColor(color);
                doc.setFontSize(size);
                doc.setFont("helvetica", bold ? "bold" : "normal");
                const textWidth = doc.getTextWidth(text);
                const pageWidth = doc.internal.pageSize.getWidth();
                doc.text(text, (pageWidth - textWidth) / 2, y);
            };

            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);

            // --- HEADER ---
            doc.setFillColor(royalBlue);
            doc.rect(0, 0, pageWidth, 40, 'F');

            // Bus Name
            doc.setTextColor(white);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            const busName = schedule.bus?.name || 'Nirosha Express';
            const busNumber = schedule.bus?.number ? ` [${schedule.bus.number}]` : '';
            doc.text(`${busName}${busNumber}`, margin, 20);

            // Class
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`${schedule.bus?.type || 'Standard'} Class`, margin, 27);

            // Booking Ref (Right Aligned)
            doc.setFontSize(8);
            doc.text("BOOKING REF", pageWidth - margin, 18, { align: "right" });
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text(bookings[0].id.slice(0, 8).toUpperCase(), pageWidth - margin, 26, { align: "right" });

            // --- ROUTE INFO ---
            let y = 60;

            // FROM
            doc.setTextColor(slate500);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("FROM", margin, y);

            doc.setTextColor(slate900);
            doc.setFontSize(16);
            doc.text(schedule.route?.source || "", margin, y + 8);

            doc.setTextColor(royalBlue);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(bookings[0].pickup_location || "Standard Pickup", margin, y + 15);

            // TO (Right Aligned)
            doc.setTextColor(slate500);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("TO", pageWidth - margin, y, { align: "right" });

            doc.setTextColor(slate900);
            doc.setFontSize(16);
            doc.text(schedule.route?.destination || "", pageWidth - margin, y + 8, { align: "right" });

            doc.setTextColor(royalBlue);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(bookings[0].dropoff_location || "Standard Drop-off", pageWidth - margin, y + 15, { align: "right" });

            // Duration Pill (Center)
            doc.setFillColor("#f1f5f9");
            doc.setDrawColor("#e2e8f0");
            const durText = schedule.route?.duration || "4h 30m";
            const durW = doc.getTextWidth(durText) + 10;
            doc.roundedRect((pageWidth - durW) / 2, y, durW, 8, 3, 3, 'FD');

            doc.setTextColor(slate500);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text(durText, pageWidth / 2, y + 5.5, { align: "center" });

            y += 30;
            doc.setDrawColor("#e2e8f0");
            doc.line(margin, y, pageWidth - margin, y);
            y += 15;

            // --- DETAILS GRID ---
            const col2 = pageWidth / 2 + 10;

            // Row 1
            doc.setTextColor(slate500);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");

            doc.text("DATE", margin, y);
            doc.text("TIME", col2, y);

            doc.setTextColor(slate900);
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");

            doc.text(format(new Date(schedule.date), "EEEE, d MMM yyyy"), margin, y + 7);
            doc.text(`${schedule.departure_time} - ${schedule.arrival_time}`, col2, y + 7);

            y += 20;

            // Row 2
            doc.setTextColor(slate500);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");

            doc.text("SEAT NO", margin, y);
            doc.text("MOBILE", col2, y);

            doc.setTextColor(slate900);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(bookings.map(b => b.seat_number).sort((a, b) => a - b).join(", "), margin, y + 7);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(bookings[0].passenger_phone || "N/A", col2, y + 7);

            y += 25;

            // --- PASSENGER & PRICE ---
            doc.setFillColor("#f8fafc");
            doc.setDrawColor("#e2e8f0");
            doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'FD');

            // Passenger
            doc.setTextColor(slate500);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("PASSENGER", margin + 10, y + 10);

            doc.setTextColor(slate900);
            doc.setFontSize(12);
            doc.text(bookings[0].passenger_name, margin + 10, y + 18);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(bookings[0].passenger_email, margin + 10, y + 24);

            // Amount
            doc.setTextColor(slate500);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("TOTAL AMOUNT", pageWidth - margin - 10, y + 10, { align: "right" });

            doc.setTextColor(royalBlue);
            doc.setFontSize(16);
            doc.text(`LKR ${(bookings.length * schedule.price).toLocaleString()}`, pageWidth - margin - 10, y + 22, { align: "right" });

            y += 45;

            // --- OR CODE & FOOTER ---

            // Try to find and capture QRCode
            if (ticketRef.current) {
                const svgs = ticketRef.current.getElementsByTagName('svg');
                // Assume the last SVG is the QR code
                const qrSvg = svgs[svgs.length - 1];
                if (qrSvg) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 200;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        const svgData = new XMLSerializer().serializeToString(qrSvg);
                        const img = new Image();
                        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(svgBlob);

                        await new Promise<void>((resolve) => {
                            img.onload = () => {
                                ctx.fillStyle = 'white';
                                ctx.fillRect(0, 0, 200, 200);
                                ctx.drawImage(img, 0, 0, 200, 200);
                                const imgData = canvas.toDataURL('image/png');
                                doc.addImage(imgData, 'PNG', (pageWidth - 40) / 2, y, 40, 40);
                                URL.revokeObjectURL(url);
                                resolve();
                            };
                            img.src = url;
                        });
                    }
                }
            }

            y += 50;
            centerText("Scan this QR code at boarding", y, 8, slate500);

            // Bottom Footer
            doc.setFillColor("#f1f5f9");
            doc.rect(0, 280, pageWidth, 17, 'F');
            doc.setTextColor(slate500);
            doc.setFontSize(8);
            doc.text("Nirosha Passenger Services", margin, 290);
            doc.text(bookings[0].id, pageWidth - margin, 290, { align: "right" });

            doc.save(`nirosha-ticket-${bookings[0].id.slice(0, 8)}.pdf`);
            toast.success("Ticket downloaded successfully!");

        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("Failed to generate PDF ticket");
        }
    };

    const booking = bookings[0];
    const bus = schedule.bus;
    const route = schedule.route;
    const seatNumbers = bookings.map(b => b.seat_number).sort((a, b) => a - b).join(", ");
    const totalAmount = bookings.length * schedule.price;

    if (!bus || !route) return null;

    return (
        <div className="max-w-xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
                <div className="bg-green-100 text-green-700 rounded-full p-4">
                    <Check className="w-8 h-8" />
                </div>
            </div>

            <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Booking Confirmed!</h2>
                <p className="text-muted-foreground">
                    Your ticket has been booked successfully.
                </p>
            </div>

            {/* Ticket Card - Designed to match the image exactly */}
            <div ref={ticketRef} className="bg-card shadow-xl rounded-xl overflow-hidden border border-border font-sans transition-colors duration-300">
                {/* Header - Dark Blue */}
                <div className="bg-primary p-6 text-primary-foreground">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                <Bus className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold leading-none mb-1 flex items-center gap-2">
                                    <span>{bus.name}</span>
                                    {bus.number && (
                                        <span className="text-base font-medium bg-white/20 px-2 py-0.5 rounded text-white">
                                            {bus.number}
                                        </span>
                                    )}
                                </h3>
                                <p className="opacity-80 text-sm font-medium">{bus.type} Class</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] opacity-70 uppercase tracking-widest font-semibold mb-1">BOOKING REF</p>
                            <p className="font-mono font-bold text-xl tracking-wide">{booking.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-8 bg-card">
                    {/* Route Section */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">FROM</p>
                            <h4 className="text-2xl font-bold text-card-foreground mb-1">{route.source}</h4>
                            <div className="flex items-center gap-1 text-sm text-primary font-medium">
                                <MapPin className="w-3 h-3" />
                                <span>{booking.pickup_location || "Standard Pickup"}</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full">
                                {route.duration}
                            </span>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">TO</p>
                            <h4 className="text-2xl font-bold text-card-foreground mb-1">{route.destination}</h4>
                            <div className="flex items-center gap-1 text-sm text-primary font-medium justify-end">
                                <span>{booking.dropoff_location || "Standard Drop-off"}</span>
                                <MapPin className="w-3 h-3" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-border mb-8" />

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-y-8 gap-x-12 mb-8">
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> DATE
                            </p>
                            <p className="text-lg font-bold text-card-foreground">
                                {format(new Date(schedule.date), "EEEE, d MMM yyyy")}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> TIME
                            </p>
                            <p className="text-lg font-bold text-card-foreground">
                                {schedule.departure_time} - {schedule.arrival_time}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                <Armchair className="w-3 h-3" /> SEAT NO
                            </p>
                            <p className="text-2xl font-bold text-card-foreground">
                                {seatNumbers}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                <Phone className="w-3 h-3" /> MOBILE
                            </p>
                            <p className="text-lg font-bold text-card-foreground">
                                {booking.passenger_phone || "N/A"}
                            </p>
                        </div>
                    </div>

                    {/* Passenger & Price Box */}
                    <div className="bg-muted/30 border border-border rounded-xl p-6 mb-8">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">PASSENGER</p>
                                <p className="text-lg font-bold text-card-foreground mb-0">{booking.passenger_name}</p>
                                <p className="text-sm text-muted-foreground">{booking.passenger_email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">TOTAL AMOUNT</p>
                                <h3 className="text-3xl font-bold text-primary">LKR {totalAmount.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm mb-2">
                            <QRCodeSVG
                                value={`REF:${booking.id}|SEATS:${seatNumbers}|PASSENGER:${booking.passenger_name}`}
                                size={120}
                                level="M"
                            />
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Scan this QR code at boarding</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button onClick={handleDownloadPDF} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
                <Button onClick={onClose} variant="outline" className="flex-1" size="lg">
                    Close
                </Button>
            </div>
        </div>
    );
}
