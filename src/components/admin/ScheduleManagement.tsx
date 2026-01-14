import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchSchedules,
  fetchBuses,
  fetchRoutes,
  addSchedule,
  removeSchedule,
  Schedule,
  Bus,
  Route
} from "@/lib/api";
import { Plus, Trash2, Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  bus_id: z.string().min(1, "Select a bus"),
  route_id: z.string().min(1, "Select a route"),
  departure_time: z.string().min(1, "Enter departure time"),
  arrival_time: z.string().min(1, "Enter arrival time"),
  price: z.coerce.number().min(1, "Price is required"),
  date: z.date({ required_error: "Select a date" }),
});

export function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [schedulesData, busesData, routesData] = await Promise.all([
        fetchSchedules(),
        fetchBuses(),
        fetchRoutes()
      ]);
      setSchedules(schedulesData);
      setBuses(busesData);
      setRoutes(routesData);
    } catch (error) {
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const data = await fetchSchedules();
      setSchedules(data);
    } catch (error) {
      toast.error("Failed to load schedules");
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bus_id: "",
      route_id: "",
      departure_time: "",
      arrival_time: "",
      price: 1500,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const scheduleData = {
        ...values,
        date: format(values.date, "yyyy-MM-dd"),
      };
      await addSchedule(scheduleData as any);
      await loadInitialData();
      form.reset();
      toast.success("Schedule added successfully");
    } catch (error: any) {
      console.error("Add schedule error:", error);
      toast.error(error.message || "Failed to add schedule");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeSchedule(id);
      await loadInitialData();
      toast.success("Schedule removed successfully");
    } catch (error: any) {
      console.error("Remove schedule error:", error);
      toast.error(error.message || "Failed to remove schedule");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add Schedule Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="bus_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bus</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {buses.map((bus) => (
                          <SelectItem key={bus.id} value={bus.id}>
                            {bus.name} ({bus.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="route_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route.id} value={route.id}>
                            {route.source} → {route.destination}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value as any}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departure_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure</FormLabel>
                      <FormControl>
                        <Input type="time" {...field as any} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="arrival_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival</FormLabel>
                      <FormControl>
                        <Input type="time" {...field as any} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (LKR)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field as any} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Schedule
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Schedule List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            All Schedules ({schedules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No schedules found
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{schedule.bus?.name}</span>
                          <Badge variant="outline" className="ml-2">{schedule.bus?.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {schedule.route?.source} → {schedule.route?.destination}
                      </TableCell>
                      <TableCell>{schedule.date}</TableCell>
                      <TableCell>
                        {schedule.departure_time} - {schedule.arrival_time}
                      </TableCell>
                      <TableCell>LKR {schedule.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemove(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
