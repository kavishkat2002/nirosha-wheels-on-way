import { useState, useEffect } from "react";
import { TicketView } from "@/components/TicketView";
import { BusLoader } from "@/components/BusLoader";
import { useNavigate } from "react-router-dom";
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
import { Schedule, Booking, createMultipleBookings } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Check, ChevronsUpDown, MapPin, Calendar, Armchair, CreditCard, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SRI_LANKA_CITIES = [
  "Alawwa", "Ambepussa", "Anuradhapura", "Colombo (Fort / Bastian Mawatha)", "Dambulla", "Galewela",
  "Galkulama", "Habarana", "Kadawatha", "Kantale", "Kekirawa", "Kiribathgoda",
  "Kurunegala", "Madawachchiya", "Malsiripura", "Maradankadawala", "Mihinthale",
  "Nittambuwa", "Pasyala", "Polgahawela", "Poonewa", "Rambewa", "Trincomalee",
  "Vavuniya", "Warakapola", "Yakkala"
].sort();

const formSchema = z.object({
  passengerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  passengerEmail: z.string().email("Please enter a valid email").max(255),
  passengerMobile: z.string().min(9, "Please enter a valid mobile number").max(15),
  pickupLocation: z.string().min(1, "Please select a pickup location"),
  dropoffLocation: z.string().min(1, "Please select a drop-off location"),
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
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[] | null>(null);
  const [openPickup, setOpenPickup] = useState(false);
  const [openDropoff, setOpenDropoff] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const bus = schedule.bus;
  const route = schedule.route;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengerName: "",
      passengerEmail: user?.email || "",
      passengerMobile: "",
      pickupLocation: "",
      dropoffLocation: "",
    },
  });

  // Fetch user profile on mount/user change
  // Fetch user profile on mount/user change
  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .single();

        // @ts-ignore
        if (data?.phone) {
          // @ts-ignore
          form.setValue('passengerMobile', data.phone);
        }
      }
    }
    fetchProfile();
  }, [user, form]);

  if (!bus || !route) return null;

  const totalPrice = selectedSeats.length * schedule.price;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("Please login to complete your booking");
      return;
    }

    setIsLoading(true);
    try {
      // Update profile with phone number
      if (values.passengerMobile) {
        const { error: profileError } = await supabase
          .from('profiles')
          // @ts-ignore
          .update({ phone: values.passengerMobile })
          .eq('id', user.id);

        if (profileError) {
          console.error("Error updating phone:", profileError);
          // We continue anyway as booking is more important
        }
      }

      const bookings = await createMultipleBookings(
        user.id,
        schedule.id,
        selectedSeats,
        values.passengerName,
        values.passengerEmail,
        values.passengerMobile,
        values.pickupLocation,
        values.dropoffLocation
      );
      toast.success("Booking confirmed!");
      setConfirmedBookings(bookings);
      onSuccess(bookings);
    } catch (error: any) {
      toast.error(error.message || "Failed to complete booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    onClose();
    navigate("/auth");
  };

  // Reset confirmed bookings when valid opens again or closes
  if (!open && confirmedBookings) {
    setTimeout(() => setConfirmedBookings(null), 300);
  }

  const handleClose = () => {
    setConfirmedBookings(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn("sm:max-w-[500px]", confirmedBookings && "sm:max-w-2xl")}>
        <DialogHeader>
          <DialogTitle className="text-xl">{confirmedBookings ? "Your E-Ticket" : "Complete Your Booking"}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <BusLoader className="h-32 w-32" />
            <p className="text-muted-foreground mt-4 font-medium animate-pulse">Confirming your booking...</p>
          </div>
        ) : confirmedBookings ? (
          <TicketView bookings={confirmedBookings} schedule={schedule} onClose={handleClose} />
        ) : (
          /* Trip Summary */
          <>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-card-foreground">
                {bus.name} {bus.number && <span className="text-sm font-normal text-muted-foreground">({bus.number})</span>}
              </h3>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{route.source} → {route.destination}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{schedule.date} at {schedule.departure_time}</span>
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

            {!user ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Please login to complete your booking</p>
                <Button onClick={handleLoginClick} className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login to Continue
                </Button>
              </div>
            ) : (
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="passengerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="passengerMobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input placeholder="07XXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pickupLocation"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Pickup Location</FormLabel>
                          <Popover open={openPickup} onOpenChange={setOpenPickup} modal={true}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openPickup}
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? SRI_LANKA_CITIES.find(
                                      (city) => city === field.value
                                    )
                                    : "Select pickup..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[var(--radix-popover-trigger-width)] p-0"
                              sideOffset={4}
                              collisionPadding={10}
                            >
                              <Command shouldFilter={true}>
                                <CommandInput placeholder="Search city..." />
                                <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden overscroll-y-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                  <CommandEmpty>No city found.</CommandEmpty>
                                  <CommandGroup>
                                    {SRI_LANKA_CITIES.map((city) => (
                                      <CommandItem
                                        value={city}
                                        key={city}
                                        onSelect={(currentValue) => {
                                          const selectedCity = SRI_LANKA_CITIES.find(
                                            (c) => c.toLowerCase() === currentValue.toLowerCase()
                                          );
                                          if (selectedCity) {
                                            form.setValue("pickupLocation", selectedCity);
                                          }
                                          setOpenPickup(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            city === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {city}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dropoffLocation"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Drop-off Location</FormLabel>
                          <Popover open={openDropoff} onOpenChange={setOpenDropoff} modal={true}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openDropoff}
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? SRI_LANKA_CITIES.find(
                                      (city) => city === field.value
                                    )
                                    : "Select drop-off..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[var(--radix-popover-trigger-width)] p-0"
                              sideOffset={4}
                              collisionPadding={10}
                            >
                              <Command shouldFilter={true}>
                                <CommandInput placeholder="Search city..." />
                                <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden overscroll-y-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                  <CommandEmpty>No city found.</CommandEmpty>
                                  <CommandGroup>
                                    {SRI_LANKA_CITIES.map((city) => (
                                      <CommandItem
                                        value={city}
                                        key={city}
                                        onSelect={(currentValue) => {
                                          const selectedCity = SRI_LANKA_CITIES.find(
                                            (c) => c.toLowerCase() === currentValue.toLowerCase()
                                          );
                                          if (selectedCity) {
                                            form.setValue("dropoffLocation", selectedCity);
                                          }
                                          setOpenDropoff(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            city === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {city}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
            )}
          </>
        )}
      </DialogContent>
    </Dialog >
  );
}
