import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchBuses, addBus, removeBus, Bus } from "@/lib/api";
import { Plus, Trash2, Bus as BusIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Bus name is required"),
  number: z.string().min(2, "Bus number is required"),
  type: z.enum(["AC", "Non-AC"]),
  total_seats: z.coerce.number().min(10).max(60),
});

export function BusManagement() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const data = await fetchBuses();
      setBuses(data);
    } catch (error) {
      toast.error("Failed to load buses");
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      number: "",
      type: "AC",
      total_seats: 40,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addBus(values as any);
      await loadBuses();
      form.reset();
      toast.success("Bus added successfully");
    } catch (error: any) {
      console.error("Add bus error:", error);
      toast.error(error.message || "Failed to add bus");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeBus(id);
      await loadBuses();
      toast.success("Bus removed successfully");
    } catch (error: any) {
      console.error("Remove bus error:", error);
      toast.error(error.message || "Failed to remove bus");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add Bus Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Bus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bus Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nirosha Deluxe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bus Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., NP-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bus Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="Non-AC">Non-AC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_seats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Seats</FormLabel>
                    <FormControl>
                      <Input type="number" min={10} max={60} {...field} />
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
                Add Bus
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Bus List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BusIcon className="h-5 w-5" />
            All Buses ({buses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground mt-2">Loading buses...</p>
                  </TableCell>
                </TableRow>
              ) : buses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No buses found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                buses.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell className="font-medium">{bus.name}</TableCell>
                    <TableCell>{bus.number}</TableCell>
                    <TableCell>
                      <Badge variant={bus.type === 'AC' ? 'default' : 'secondary'}>
                        {bus.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{bus.total_seats}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(bus.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
