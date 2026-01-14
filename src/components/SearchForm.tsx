import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, MapPin, ArrowRight, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchLocations } from "@/lib/api";

interface SearchFormProps {
  onSearch: (source: string, destination: string, date: string) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date>();
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations()
      .then(setLocations)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    if (source && destination && date) {
      onSearch(source, destination, format(date, "yyyy-MM-dd"));
    }
  };

  if (loading) {
    return (
      <motion.div
        className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 flex items-center justify-center border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Source */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            From
          </label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors">
              <SelectValue placeholder="Select departure city" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc} disabled={loc === destination}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Destination */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
            <div className="p-1.5 bg-secondary/20 rounded-lg">
              <MapPin className="h-4 w-4 text-secondary-foreground" />
            </div>
            To
          </label>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors">
              <SelectValue placeholder="Select arrival city" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc} disabled={loc === source}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Date */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-12 w-full justify-start text-left font-normal bg-background/50 border-border/50 hover:border-primary transition-colors",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </motion.div>

        {/* Search Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleSearch}
            className="h-12 w-full text-base font-semibold shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300"
            disabled={!source || !destination || !date}
          >
            <Search className="h-5 w-5 mr-2" />
            Search Buses
          </Button>
        </motion.div>
      </div>

      {source && destination && (
        <motion.div
          className="mt-6 flex items-center justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 px-6 py-3 bg-muted/50 rounded-full">
            <span className="font-semibold text-foreground">{source}</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="font-semibold text-foreground">{destination}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
