import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Schedule, fetchBookedSeats } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface SeatSelectorProps {
  schedule: Schedule;
  onConfirm: (seats: number[]) => void;
  onBack: () => void;
}

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

  // Create seat layout: 4 columns with aisle, last row parallel (5 seats)
  const seatLayout: (number | null)[][] = [];
  let currentSeat = 1;

  while (currentSeat <= bus.total_seats) {
    const remainingSeats = bus.total_seats - currentSeat + 1;

    // If it's the last row (5 or fewer seats remaining), show them parallel
    if (remainingSeats <= 5) {
      const lastRow: number[] = [];
      for (let i = 0; i < remainingSeats; i++) {
        lastRow.push(currentSeat + i);
      }
      seatLayout.push(lastRow);
      break;
    } else {
      // Standard row: 2 seats, aisle, 2 seats
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
      <div className="bg-card rounded-xl shadow-xl p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary-foreground">{bus.name}</h2>
            <p className="text-primary-foreground/80">
              {route.source} → {route.destination} | {schedule.departure_time}
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            {bus.type}
          </Badge>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-success border-2 border-success"></div>
          <span className="text-sm text-card-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-booked border-2 border-booked"></div>
          <span className="text-sm text-card-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-selected border-2 border-selected"></div>
          <span className="text-sm text-card-foreground">Selected</span>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="p-6">
        <div className="max-w-md mx-auto">
          {/* Driver */}
          <div className="flex justify-end mb-4">
            <div className="px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
              Driver
            </div>
          </div>

          {/* Seats */}
          <div className="bg-muted/30 rounded-xl p-4 border-2 border-border">
            {seatLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-center gap-2 mb-2">
                {row.map((seat, seatIndex) => {
                  if (seat === null) {
                    return <div key={`aisle-${seatIndex}`} className="w-8" />;
                  }
                  const status = getSeatStatus(seat);
                  return (
                    <button
                      key={seat}
                      onClick={() => toggleSeat(seat)}
                      disabled={status === 'booked'}
                      className={cn(
                        "w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-200",
                        status === 'available' && "bg-success text-success-foreground hover:bg-success/80 cursor-pointer",
                        status === 'booked' && "bg-booked text-booked-foreground cursor-not-allowed opacity-70",
                        status === 'selected' && "bg-selected text-selected-foreground ring-2 ring-offset-2 ring-selected"
                      )}
                    >
                      {seat}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-muted/30 p-6 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            {selectedSeats.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground">Selected Seats</p>
                <p className="font-semibold text-card-foreground">
                  {selectedSeats.sort((a, b) => a - b).join(', ')}
                </p>
                <p className="text-lg font-bold text-primary mt-1">
                  Total: LKR {totalPrice.toLocaleString()}
                </p>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              Back to Results
            </Button>
            <Button
              onClick={() => onConfirm(selectedSeats)}
              disabled={selectedSeats.length === 0}
            >
              Continue ({selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
