import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addRoute, removeRoute, fetchRoutes } from "@/lib/api";

const formSchema = z.object({
    source: z.string().min(2, "Source is required"),
    destination: z.string().min(2, "Destination is required"),
    duration: z.string().min(2, "Duration is required (e.g., 3h 30m)"),
});

export interface Route {
    id: string;
    source: string;
    destination: string;
    duration: string;
}

export function RouteManagement() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRoutes();
    }, []);

    const loadRoutes = async () => {
        try {
            setLoading(true);
            const data = await fetchRoutes();
            setRoutes(data || []);
        } catch (error) {
            toast.error("Failed to load routes");
        } finally {
            setLoading(false);
        }
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            source: "",
            destination: "",
            duration: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await addRoute(values as any);
            await loadRoutes();
            form.reset();
            toast.success("Route added successfully");
        } catch (error: any) {
            console.error("Add route error:", error);
            toast.error(error.message || "Failed to add route");
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await removeRoute(id);
            await loadRoutes();
            toast.success("Route removed successfully");
        } catch (error: any) {
            console.error("Remove route error:", error);
            toast.error(error.message || "Failed to remove route");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add New Route
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="source"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Colombo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="destination"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Destination</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Kandy" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 3h 30m" {...field} />
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
                                Add Route
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        All Routes ({routes.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Source</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : routes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No routes found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                routes.map((route) => (
                                    <TableRow key={route.id}>
                                        <TableCell className="font-medium">{route.source}</TableCell>
                                        <TableCell>{route.destination}</TableCell>
                                        <TableCell>{route.duration}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRemove(route.id)}
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
