import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchForm } from "@/components/SearchForm";
import { BusCard } from "@/components/BusCard";
import { SeatSelector } from "@/components/SeatSelector";
import { CheckoutModal } from "@/components/CheckoutModal";
import { TicketDisplay } from "@/components/TicketDisplay";
import { Schedule, Booking, fetchSchedules } from "@/lib/api";
import { Bus, MapPin, Shield, Clock, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <Header />
      
      {step === 'ticket' && selectedSchedule ? (
        <main className="container mx-auto px-4 py-12">
          <TicketDisplay 
            bookings={confirmedBookings} 
            schedule={selectedSchedule}
            onBookAnother={handleBookAnother} 
          />
        </main>
      ) : (
        <>
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary via-primary to-primary/90 py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
                  Travel with Comfort & Safety
                </h1>
                <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                  Book your bus tickets online with Nirosha Passenger Services. 
                  Premium comfort, reliable schedules, and affordable prices.
                </p>
              </div>
              
              {step === 'search' && <SearchForm onSearch={handleSearch} />}
            </div>
          </section>

          {/* Features */}
          {step === 'search' && searchResults.length === 0 && !searchParams.source && (
            <section className="py-16 bg-muted/30">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4">
                      <Bus className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Modern Fleet</h3>
                    <p className="text-muted-foreground">AC and Non-AC buses with comfortable seating</p>
                  </div>
                  <div className="text-center p-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-secondary/20 rounded-full mb-4">
                      <Clock className="h-7 w-7 text-secondary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">On-Time Guarantee</h3>
                    <p className="text-muted-foreground">Punctual departures and arrivals</p>
                  </div>
                  <div className="text-center p-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-success/10 rounded-full mb-4">
                      <Shield className="h-7 w-7 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Safe Travel</h3>
                    <p className="text-muted-foreground">Experienced drivers and maintained vehicles</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Loading State */}
          {step === 'search' && isSearching && (
            <section className="py-16">
              <div className="container mx-auto px-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground mt-4">Searching for buses...</p>
              </div>
            </section>
          )}

          {/* Search Results */}
          {step === 'search' && !isSearching && searchResults.length > 0 && (
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    {searchResults.length} {searchResults.length === 1 ? 'bus' : 'buses'} found
                  </h2>
                  <span className="text-muted-foreground">
                    {searchParams.source} → {searchParams.destination} on {searchParams.date}
                  </span>
                </div>
                <div className="space-y-4">
                  {searchResults.map(schedule => (
                    <BusCard 
                      key={schedule.id} 
                      schedule={schedule} 
                      onSelect={handleSelectBus}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* No Results */}
          {step === 'search' && !isSearching && searchParams.source && searchResults.length === 0 && (
            <section className="py-16">
              <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                  <Bus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No buses found</h3>
                <p className="text-muted-foreground">
                  No buses available for {searchParams.source} to {searchParams.destination} on {searchParams.date}. 
                  Try a different date.
                </p>
              </div>
            </section>
          )}

          {/* Seat Selection */}
          {step === 'select-seat' && selectedSchedule && (
            <section className="py-12">
              <div className="container mx-auto px-4">
                <SeatSelector 
                  schedule={selectedSchedule}
                  onConfirm={handleConfirmSeats}
                  onBack={() => setStep('search')}
                />
              </div>
            </section>
          )}
        </>
      )}

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
    </div>
  );
};

export default Index;
