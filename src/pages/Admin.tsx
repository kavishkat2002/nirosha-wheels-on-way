import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusManagement } from "@/components/admin/BusManagement";
import { ScheduleManagement } from "@/components/admin/ScheduleManagement";
import { BookingOverview } from "@/components/admin/BookingOverview";
import { RouteManagement } from "@/components/admin/RouteManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { BusLoader } from "@/components/BusLoader";
import { Bus, Calendar, ClipboardList, Loader2, ShieldX, LogIn, MapPin, Headset } from "lucide-react";
import { SupportDashboard } from "@/components/admin/SupportDashboard";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("buses");
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminCheck();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-20">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <BusLoader className="h-48 w-48" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <LogIn className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Please login to access the admin panel
              </p>
              <Button onClick={() => navigate("/auth")}>
                Login
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <ShieldX className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-6">
                You don't have permission to access the admin panel.
                Only administrators can manage buses and schedules.
              </p>
              <Button onClick={() => navigate("/")}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage buses, schedules, and view bookings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="buses" className="flex items-center gap-2">
              <Bus className="h-4 w-4" />
              <span className="hidden sm:inline">Buses</span>
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Routes</span>
            </TabsTrigger>
            <TabsTrigger value="schedules" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedules</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Headset className="h-4 w-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buses">
            <BusManagement />
          </TabsContent>

          <TabsContent value="routes">
            <RouteManagement />
          </TabsContent>

          <TabsContent value="schedules">
            <ScheduleManagement />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingOverview />
          </TabsContent>

          <TabsContent value="support">
            <SupportDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
