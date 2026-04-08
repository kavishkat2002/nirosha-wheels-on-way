import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Bus as BusIcon, Armchair, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Schedule, fetchBookedSeats } from "@/lib/api";

interface BusCardProps {
  schedule: Schedule;
  onSelect: (schedule: Schedule) => void;
}

export function BusCard({ schedule, onSelect }: BusCardProps) {
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const bus = schedule.bus;
  const route = schedule.route;

  useEffect(() => {
    fetchBookedSeats(schedule.id)
      .then(setBookedSeats)
      .finally(() => setLoading(false));
  }, [schedule.id]);

  if (!bus || !route) return null;

  const availableSeats = bus.total_seats - bookedSeats.length;
  const isAC = bus.type === 'AC';

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden transition-all duration-300 border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left Section - Bus Info */}
            <div className="flex-1 p-6 relative">
              {/* Decorative line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-primary" />

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-card-foreground">{bus.name}</h3>
                  <p className="text-sm text-muted-foreground">{bus.number}</p>
                </div>
                <Badge
                  variant={isAC ? 'default' : 'secondary'}
                  className={`ml-2 ${isAC ? 'bg-primary/90 hover:bg-primary' : ''}`}
                >
                  {bus.type}
                </Badge>
              </div>

              {/* Time and Route */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <div className="text-center min-w-[60px] sm:min-w-[80px]">
                  <motion.p
                    className="text-xl sm:text-2xl font-bold text-card-foreground"
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                  >
                    {schedule.departure_time}
                  </motion.p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground truncate">{route.source}</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex-1 border-t-2 border-dashed border-border relative hidden sm:block">
                    <motion.div
                      className="absolute left-0 top-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                      initial={{ width: "0%" }}
                      animate={{ width: isHovered ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="mx-1 sm:mx-3 flex flex-col items-center">
                    <motion.div
                      animate={{ x: isHovered ? [0, 5, 0] : 0 }}
                      transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
                    >
                      <ArrowRight className="h-4 w-4 text-primary mb-1" />
                    </motion.div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap">{route.duration}</span>
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-border hidden sm:block" />
                </div>
                <div className="text-center min-w-[60px] sm:min-w-[80px]">
                  <motion.p
                    className="text-xl sm:text-2xl font-bold text-card-foreground"
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                  >
                    {schedule.arrival_time}
                  </motion.p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground truncate">{route.destination}</p>
                </div>
              </div>

              {/* Seats Info */}
              <div className="flex items-center gap-2 text-sm">
                <Armchair className="h-4 w-4 text-success" />
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className={`font-medium ${availableSeats < 10 ? 'text-destructive' : 'text-success'}`}>
                    {availableSeats} seats available
                  </span>
                )}
              </div>
            </div>

            {/* Right Section - Price and Action */}
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-border min-w-[180px]">
              <p className="text-sm text-muted-foreground mb-1">Starting from</p>
              <motion.p
                className="text-3xl font-bold text-primary mb-4"
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                LKR {Number(schedule.price).toLocaleString()}
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full"
              >
                <Button
                  onClick={() => onSelect(schedule)}
                  disabled={!loading && availableSeats === 0}
                  className="w-full shadow-lg"
                >
                  {loading ? 'Loading...' : availableSeats > 0 ? 'Select Seats' : 'Sold Out'}
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
