import { useState, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { SearchForm } from "@/components/SearchForm";
import { BusCard } from "@/components/BusCard";
import { SeatSelector } from "@/components/SeatSelector";
import { CheckoutModal } from "@/components/CheckoutModal";
import { TicketDisplay } from "@/components/TicketDisplay";
import { Footer } from "@/components/Footer";
import { Scene3D } from "@/components/Scene3D";
import {
  FadeInOnScroll,
  StaggerChildren,
  StaggerItem,
  ParallaxSection
} from "@/components/ScrollAnimations";
import { BusLoader } from "@/components/BusLoader";
import { Schedule, Booking, fetchSchedules, fetchPopularRoutes } from "@/lib/api";
import { Bus, MapPin, Shield, Clock, Loader2, Users, Star, Sparkles } from "lucide-react";

type BookingStep = 'search' | 'select-seat' | 'ticket';

const Index = () => {
  const [step, setStep] = useState<BookingStep>('search');
  const [searchResults, setSearchResults] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [searchParams, setSearchParams] = useState({ source: '', destination: '', date: '' });
  const [isSearching, setIsSearching] = useState(false);
  const [popularRoutes, setPopularRoutes] = useState<{ from: string; to: string; duration: string; price: string }[]>([]);

  useEffect(() => {
    // Load popular routes
    fetchPopularRoutes().then(setPopularRoutes);
  }, []);

  const handleSearch = async (source: string, destination: string, date: string) => {
    setSearchParams({ source, destination, date });
    setIsSearching(true);
    try {
      const results = await fetchSchedules(source, destination, date);
      setSearchResults(results);
      setSelectedSchedule(null);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBus = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setStep('select-seat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmSeats = (seats: number[]) => {
    setSelectedSeats(seats);
    setShowCheckout(true);
  };

  const handleBookingSuccess = (bookings: Booking[]) => {
    setConfirmedBookings(bookings);
    setShowCheckout(false);
    setStep('ticket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookAnother = () => {
    setStep('search');
    setSearchResults([]);
    setSelectedSchedule(null);
    setSelectedSeats([]);
    setConfirmedBookings([]);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <AnimatePresence mode="wait">
        {step === 'ticket' && selectedSchedule ? (
          <motion.main
            key="ticket"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container mx-auto px-4 pt-24 pb-12"
          >
            <TicketDisplay
              bookings={confirmedBookings}
              schedule={selectedSchedule}
              onBookAnother={handleBookAnother}
            />
          </motion.main>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Hero Section with 3D Background */}
            <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
              {/* 3D Scene Background */}
              {/* Image Background */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/cover_bus_4k.jpg')" }}
              >
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

              {/* Content */}
              <div className="container mx-auto px-4 relative z-10 py-12">
                <motion.div
                  className="text-center mb-10"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >


                  <motion.h1
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    Travel with
                    <span className="block bg-gradient-to-r from-secondary via-yellow-400 to-secondary bg-clip-text text-transparent">
                      Comfort & Safety
                    </span>
                  </motion.h1>

                  <motion.p
                    className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Book your bus tickets online with Nirosha Passenger Services.
                    Premium comfort, reliable schedules, and affordable prices.
                  </motion.p>
                </motion.div>

                {step === 'search' && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <SearchForm onSearch={handleSearch} />
                  </motion.div>
                )}
              </div>
            </section>

            {/* Statistics Section */}
            {step === 'search' && searchResults.length === 0 && !searchParams.source && (
              <section className="py-12 bg-gradient-to-b from-background to-muted/30">
                <div className="container mx-auto px-4">
                  <FadeInOnScroll>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { value: "50K+", label: "Happy Passengers", icon: Users },
                        { value: "100+", label: "Daily Trips", icon: Bus },
                        { value: "4.9", label: "Rating", icon: Star },
                        { value: "24/7", label: "Support", icon: Clock },
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                          whileHover={{ y: -5, scale: 1.02 }}
                        >
                          <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                          <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </FadeInOnScroll>
                </div>
              </section>
            )}

            {/* Features Section */}
            {step === 'search' && searchResults.length === 0 && !searchParams.source && (
              <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                  <FadeInOnScroll>
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Why Choose Nirosha?
                      </h2>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Experience the difference with our premium bus services
                      </p>
                    </div>
                  </FadeInOnScroll>

                  <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      {
                        icon: Bus,
                        title: "Modern Fleet",
                        description: "AC and Non-AC buses with comfortable seating, entertainment systems, and charging ports",
                        gradient: "from-primary/20 to-primary/5"
                      },
                      {
                        icon: Clock,
                        title: "On-Time Guarantee",
                        description: "Punctual departures and arrivals with real-time tracking and notifications",
                        gradient: "from-secondary/20 to-secondary/5"
                      },
                      {
                        icon: Shield,
                        title: "Safe Travel",
                        description: "Experienced drivers, well-maintained vehicles, and comprehensive insurance coverage",
                        gradient: "from-success/20 to-success/5"
                      }
                    ].map((feature, index) => (
                      <StaggerItem key={index}>
                        <motion.div
                          className={`relative p-8 rounded-3xl bg-gradient-to-br ${feature.gradient} border border-border/50 overflow-hidden group`}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 bg-card rounded-2xl shadow-lg mb-6"
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <feature.icon className="h-8 w-8 text-primary" />
                          </motion.div>
                          <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerChildren>
                </div>
              </section>
            )}

            {/* Popular Routes Section */}
            {step === 'search' && searchResults.length === 0 && !searchParams.source && (
              <ParallaxSection className="py-20 bg-gradient-to-br from-background via-secondary/5 to-primary/5" speed={0.3}>
                <div className="container mx-auto px-4">
                  <FadeInOnScroll>
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Popular Routes
                      </h2>
                      <p className="text-muted-foreground">
                        Discover our most traveled destinations
                      </p>
                    </div>
                  </FadeInOnScroll>

                  {popularRoutes.length > 0 ? (
                    <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {popularRoutes.map((route, index) => (
                        <StaggerItem key={index}>
                          <motion.div
                            className="relative p-6 rounded-2xl bg-card border border-border overflow-hidden group cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-3 h-3 rounded-full bg-primary" />
                                  <div className="w-0.5 h-8 bg-border" />
                                  <div className="w-3 h-3 rounded-full bg-secondary" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{route.from}</p>
                                  <p className="text-sm text-muted-foreground my-1">{route.duration}</p>
                                  <p className="font-semibold text-foreground">{route.to}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Starting from</p>
                                <p className="text-2xl font-bold text-primary">{route.price}</p>
                              </div>
                            </div>
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </StaggerChildren>
                  ) : (
                    <div className="text-center text-muted-foreground py-10">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>Loading popular routes...</p>
                    </div>
                  )}
                </div>
              </ParallaxSection>
            )}

            {/* Loading State */}
            {step === 'search' && isSearching && (
              <section className="py-16">
                <div className="container mx-auto px-4 text-center">
                  <motion.div
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <BusLoader className="h-48 w-48 mx-auto" />
                  </motion.div>
                  <motion.p
                    className="text-muted-foreground mt-4"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Searching for the best buses...
                  </motion.p>
                </div>
              </section>
            )}

            {/* Search Results */}
            {step === 'search' && !isSearching && searchResults.length > 0 && (
              <section className="py-12">
                <div className="container mx-auto px-4">
                  <motion.div
                    className="flex items-center gap-2 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">
                      {searchResults.length} {searchResults.length === 1 ? 'bus' : 'buses'} found
                    </h2>
                    <span className="text-muted-foreground">
                      {searchParams.source} → {searchParams.destination} on {searchParams.date}
                    </span>
                  </motion.div>
                  <div className="space-y-4">
                    {searchResults.map((schedule, index) => (
                      <motion.div
                        key={schedule.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <BusCard
                          schedule={schedule}
                          onSelect={handleSelectBus}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* No Results */}
            {step === 'search' && !isSearching && searchParams.source && searchResults.length === 0 && (
              <section className="py-16">
                <div className="container mx-auto px-4 text-center">
                  <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Bus className="h-10 w-10 text-muted-foreground" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">No buses found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    No buses available for {searchParams.source} to {searchParams.destination} on {searchParams.date}.
                    Try a different date or route.
                  </p>
                </div>
              </section>
            )}

            {/* Seat Selection */}
            {step === 'select-seat' && selectedSchedule && (
              <motion.section
                className="py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="container mx-auto px-4">
                  <SeatSelector
                    schedule={selectedSchedule}
                    onConfirm={handleConfirmSeats}
                    onBack={() => setStep('search')}
                  />
                </div>
              </motion.section>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      {selectedSchedule && (
        <CheckoutModal
          schedule={selectedSchedule}
          selectedSeats={selectedSeats}
          open={showCheckout}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      <Footer />
    </div>
  );
};

export default Index;
