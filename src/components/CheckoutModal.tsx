import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Schedule, getBusById, getRouteById, addMultipleBookings, Booking } from "@/lib/data";
import { MapPin, Calendar, Armchair, CreditCard } from "lucide-react";

const formSchema = z.object({
  passengerName: z.string().min(2, "Name must be at least 2 characters"),
  passengerEmail: z.string().email("Please enter a valid email"),
});

interface CheckoutModalProps {
  schedule: Schedule;
  selectedSeats: number[];
  open: boolean;
  onClose: () => void;
  onSuccess: (bookings: Booking[]) => void;
}

export function CheckoutModal({ schedule, selectedSeats, open, onClose, onSuccess }: CheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const bus = getBusById(schedule.busId);
  const route = getRouteById(schedule.routeId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengerName: "",
      passengerEmail: "",
    },
  });

  if (!bus || !route) return null;

  const totalPrice = selectedSeats.length * schedule.price;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const bookings = addMultipleBookings(
      schedule.id,
      selectedSeats,
      values.passengerName,
      values.passengerEmail
    );
    
    setIsLoading(false);
    onSuccess(bookings);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Complete Your Booking</DialogTitle>
        </DialogHeader>

        {/* Trip Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-card-foreground">{bus.name}</h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{route.source} → {route.destination}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{schedule.date} at {schedule.departureTime}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Armchair className="h-4 w-4" />
            <span>Seats: {selectedSeats.sort((a, b) => a - b).join(', ')}</span>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="font-medium text-card-foreground">Total Amount</span>
            <span className="text-xl font-bold text-primary">
              LKR {totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Passenger Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="passengerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passenger Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passengerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email for ticket" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                {isLoading ? 'Processing...' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
