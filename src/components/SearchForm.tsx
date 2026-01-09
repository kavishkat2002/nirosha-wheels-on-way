import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin, ArrowRight, Search } from "lucide-react";
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
import { getLocations } from "@/lib/data";

interface SearchFormProps {
  onSearch: (source: string, destination: string, date: string) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date>();
  const locations = getLocations();

  const handleSearch = () => {
    if (source && destination && date) {
      onSearch(source, destination, format(date, "yyyy-MM-dd"));
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-xl p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Source */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            From
          </label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="h-12 bg-background">
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
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-secondary" />
            To
          </label>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger className="h-12 bg-background">
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
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-12 w-full justify-start text-left font-normal bg-background",
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
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch} 
          className="h-12 text-base font-semibold"
          disabled={!source || !destination || !date}
        >
          <Search className="h-5 w-5 mr-2" />
          Search Buses
        </Button>
      </div>

      {source && destination && (
        <div className="mt-4 flex items-center justify-center text-muted-foreground">
          <span className="font-medium">{source}</span>
          <ArrowRight className="h-4 w-4 mx-2" />
          <span className="font-medium">{destination}</span>
        </div>
      )}
    </div>
  );
}
