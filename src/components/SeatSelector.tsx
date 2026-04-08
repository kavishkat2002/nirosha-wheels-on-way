import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Schedule, fetchBookedSeats } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface SeatSelectorProps {
  schedule: Schedule;
  onConfirm: (seats: number[]) => void;
  onBack: () => void;
}

// Custom Steering Wheel Icon
const SteeringWheelIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 1.5a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5z" clipRule="evenodd" opacity="0.4" />
    <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 00-5.25 5.25v.75h10.5v-.75A5.25 5.25 0 0012 6.75zm-3 5.25a3 3 0 116 0v.75H9v-.75z" clipRule="evenodd" />
    <path d="M10.5 13.5h3v2.25a1.5 1.5 0 01-1.5 1.5 1.5 1.5 0 01-1.5-1.5v-2.25z" />
  </svg>
);

// Detailed Seat Icon Component
const SeatIcon = ({ status, className }: { status: 'available' | 'booked' | 'selected'; className?: string }) => {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm transition-colors duration-300">
        {/* Base Cushion */}
        <path
          d="M10,65 C10,75 15,85 50,85 C85,85 90,75 90,65 L90,55 C90,50 85,50 50,50 C15,50 10,50 10,55 Z"
          className={cn(
            "transition-colors duration-300",
            status === 'available' && "fill-gray-200 dark:fill-gray-700",
            status === 'booked' && "fill-gray-300 dark:fill-gray-800",
            status === 'selected' && "fill-primary"
          )}
        />
        {/* Backrest */}
        <path
          d="M15,10 C15,5 25,5 50,5 C75,5 85,5 85,10 L85,55 C85,60 80,60 50,60 C20,60 15,60 15,55 Z"
          className={cn(
            "transition-colors duration-300",
            status === 'available' && "fill-white stroke-gray-300 stroke-2 dark:fill-gray-600 dark:stroke-gray-500",
            status === 'booked' && "fill-gray-200 stroke-gray-300 dark:fill-gray-800 dark:stroke-gray-700",
            status === 'selected' && "fill-primary stroke-primary-foreground/20"
          )}
        />
        {/* Pillow/Headrest Detail */}
        <path
          d="M30,15 C30,12 35,12 50,12 C65,12 70,12 70,15 L70,25 C70,28 65,28 50,28 C35,28 30,28 30,25 Z"
          className={cn(
            "opacity-30",
            status === 'available' && "fill-gray-300",
            status === 'booked' && "fill-gray-400",
            status === 'selected' && "fill-primary-foreground"
          )}
        />
        {/* Armrests */}
        <rect x="5" y="40" width="8" height="35" rx="4"
          className={cn(
            "transition-colors duration-300",
             status === 'available' && "fill-gray-300 dark:fill-gray-700",
             status === 'booked' && "fill-gray-300 dark:fill-gray-800",
             status === 'selected' && "fill-primary-foreground/30"
          )}
        />
        <rect x="87" y="40" width="8" height="35" rx="4"
          className={cn(
             "transition-colors duration-300",
             status === 'available' && "fill-gray-300 dark:fill-gray-700",
             status === 'booked' && "fill-gray-300 dark:fill-gray-800",
             status === 'selected' && "fill-primary-foreground/30"
          )}
        />
      </svg>
      
      {/* Selection Checkmark */}
      <AnimatePresence>
        {status === 'selected' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-2"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white drop-shadow-md" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Booked X Mark */}
       <AnimatePresence>
        {status === 'booked' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center p-2 opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gray-500" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function SeatSelector({ schedule, onConfirm, onBack }: SeatSelectorProps) {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const bus = schedule.bus;
  const route = schedule.route;

  useEffect(() => {
    fetchBookedSeats(schedule.id)
      .then(setBookedSeats)
      .finally(() => setLoading(false));
  }, [schedule.id]);

  if (!bus || !route) return null;

  const toggleSeat = (seatNumber: number) => {
    if (bookedSeats.includes(seatNumber)) return;

    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const getSeatStatus = (seatNumber: number): 'available' | 'booked' | 'selected' => {
    if (bookedSeats.includes(seatNumber)) return 'booked';
    if (selectedSeats.includes(seatNumber)) return 'selected';
    return 'available';
  };

  const seatLayout: (number | null)[][] = [];
  let currentSeat = 1;

  while (currentSeat <= bus.total_seats) {
    const remainingSeats = bus.total_seats - currentSeat + 1;

    if (remainingSeats <= 5) {
      const lastRow: number[] = [];
      for (let i = 0; i < remainingSeats; i++) {
        lastRow.push(currentSeat + i);
      }
      seatLayout.push(lastRow);
      break;
    } else {
      seatLayout.push([
        currentSeat,
        currentSeat + 1,
        null, // aisle
        currentSeat + 2,
        currentSeat + 3,
      ]);
      currentSeat += 4;
    }
  }

  const totalPrice = selectedSeats.length * schedule.price;

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-xl p-12 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading seat map...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/50">
        {/* Header with detailed info */}
        <div className="bg-primary/5 p-6 md:p-8 border-b border-border/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-primary/20 text-primary">
                  {bus.type}
                </Badge>
                <span className="text-sm text-muted-foreground">{bus.number}</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1">{bus.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium text-foreground">{route.source}</span>
                <span className="text-primary">→</span>
                <span className="font-medium text-foreground">{route.destination}</span>
                <span className="mx-2">•</span>
                <span>{schedule.departure_time}</span>
              </div>
            </div>
            
            <div className="hidden md:block text-right">
              <p className="text-sm text-muted-foreground mb-1">Price per seat</p>
              <p className="text-2xl font-bold text-primary">
                LKR {schedule.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive content area */}
        <div className="flex flex-col lg:flex-row">
          {/* Left: Bus Diagram */}
          <div className="flex-1 p-8 bg-muted/10">
            <div className="max-w-[400px] mx-auto [perspective:1000px]">
              {/* Bus Container */}
              <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-6 shadow-xl border-2 border-gray-200 dark:border-gray-800 relative bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-60">
                {/* Windshield / Driver Area */}
                <div className="h-24 bg-gradient-to-b from-blue-100/50 to-transparent dark:from-blue-900/20 rounded-t-3xl mb-8 flex items-center justify-between px-8 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mt-2" />
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs text-muted-foreground font-mono">
                      Entry
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-primary shadow-inner">
                      <SteeringWheelIcon className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">Driver</span>
                  </div>
                </div>

                {/* Seats Grid */}
                <div className="space-y-4 relative z-10 px-2">
                  {seatLayout.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-between items-center gap-3">
                      {row.map((seat, seatIndex) => {
                        if (seat === null) {
                          return <div key={`aisle-${rowIndex}`} className="w-8 md:w-10 text-center text-xs text-muted-foreground/30 font-mono tracking-widest shrink-0">||</div>;
                        }
                        
                        const status = getSeatStatus(seat);
                        
                        return (
                          <Tooltip key={seat}>
                            <TooltipTrigger asChild>
                              <motion.button
                                whileHover={status !== 'booked' ? { scale: 1.1, zIndex: 10 } : {}}
                                whileTap={status !== 'booked' ? { scale: 0.95 } : {}}
                                onClick={() => toggleSeat(seat)}
                                disabled={status === 'booked'}
                                className={cn(
                                  "w-10 h-10 md:w-12 md:h-12 relative group focus:outline-none",
                                  status === 'booked' && "cursor-not-allowed opacity-60"
                                )}
                              >
                                <SeatIcon status={status} />
                                <span className={cn(
                                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold z-10",
                                  status === 'selected' ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors"
                                )}>
                                  {status === 'selected' ? '' : seat}
                                </span>
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-popover/95 backdrop-blur-sm border-primary/20">
                              <div className="text-center">
                                <p className="font-bold text-primary">Seat {seat}</p>
                                <p className="text-xs text-muted-foreground">
                                  {status === 'booked' ? 'Already Booked' : 'LKR ' + schedule.price}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                 {/* Back of bus */}
                 <div className="h-8 mt-8 border-t-2 border-dashed border-gray-200 dark:border-gray-800 rounded-b-xl flex justify-center pt-2">
                   <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Rear</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Right: Legend & Summary */}
          <div className="w-full lg:w-96 bg-background border-t lg:border-t-0 lg:border-l border-border/50 p-6 flex flex-col">
            <h3 className="font-semibold text-lg mb-6">Seat Legend</h3>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {[
                { status: 'available', label: 'Available', desc: 'Click to select' },
                { status: 'selected', label: 'Selected', desc: 'Your current selection' },
                { status: 'booked', label: 'Booked', desc: 'Already occupied' }
              ].map((item) => (
                <div key={item.status} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div className="w-10 h-10">
                    <SeatIcon status={item.status as any} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-6">
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Selected Seats</span>
                  <Badge variant="secondary" className="bg-background">{selectedSeats.length}</Badge>
                </div>
                <div className="font-medium text-foreground min-h-[1.5rem] mb-4">
                  {selectedSeats.length > 0 ? selectedSeats.sort((a, b) => a - b).join(', ') : 'No seats selected'}
                </div>
                <div className="border-t border-primary/10 pt-4 flex justify-between items-end">
                  <span className="text-sm text-muted-foreground">Total Price</span>
                  <span className="text-2xl font-bold text-primary">
                    LKR {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onBack} className="flex-1 h-12 text-base">
                  Back
                </Button>
                <Button
                  onClick={() => onConfirm(selectedSeats)}
                  disabled={selectedSeats.length === 0}
                  className="flex-[2] h-12 text-base font-semibold shadow-lg shadow-primary/20"
                >
                  Continue Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
