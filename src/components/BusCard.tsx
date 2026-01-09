import { Clock, Bus as BusIcon, Armchair } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Schedule, getBusById, getRouteById, getBookedSeats } from "@/lib/data";

interface BusCardProps {
  schedule: Schedule;
  onSelect: (schedule: Schedule) => void;
}

export function BusCard({ schedule, onSelect }: BusCardProps) {
  const bus = getBusById(schedule.busId);
  const route = getRouteById(schedule.routeId);
  const bookedSeats = getBookedSeats(schedule.id);
  const availableSeats = bus ? bus.totalSeats - bookedSeats.length : 0;

  if (!bus || !route) return null;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left Section - Bus Info */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-card-foreground">{bus.name}</h3>
                <p className="text-sm text-muted-foreground">{bus.number}</p>
              </div>
              <Badge 
                variant={bus.type === 'AC' ? 'default' : 'secondary'}
                className="ml-2"
              >
                {bus.type}
              </Badge>
            </div>

            {/* Time and Route */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-card-foreground">{schedule.departureTime}</p>
                <p className="text-sm text-muted-foreground">{route.source}</p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex-1 border-t-2 border-dashed border-border"></div>
                <div className="mx-3 flex flex-col items-center">
                  <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">{route.duration}</span>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-border"></div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-card-foreground">{schedule.arrivalTime}</p>
                <p className="text-sm text-muted-foreground">{route.destination}</p>
              </div>
            </div>

            {/* Seats Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Armchair className="h-4 w-4" />
              <span>{availableSeats} seats available</span>
            </div>
          </div>

          {/* Right Section - Price and Action */}
          <div className="bg-muted/30 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-border min-w-[160px]">
            <p className="text-sm text-muted-foreground mb-1">Starting from</p>
            <p className="text-3xl font-bold text-primary mb-4">
              LKR {schedule.price.toLocaleString()}
            </p>
            <Button 
              onClick={() => onSelect(schedule)}
              disabled={availableSeats === 0}
              className="w-full"
            >
              {availableSeats > 0 ? 'Select Seats' : 'Sold Out'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
