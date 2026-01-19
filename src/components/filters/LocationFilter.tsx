import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MapPin, Search, Loader2, X, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationFilterProps {
  onFilterChange: (filter: {
    lat: number | null;
    lng: number | null;
    radiusKm: number;
    locationName: string;
  } | null) => void;
  currentFilter: {
    lat: number | null;
    lng: number | null;
    radiusKm: number;
    locationName: string;
  } | null;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  onFilterChange,
  currentFilter,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(currentFilter ? { lat: currentFilter.lat!, lng: currentFilter.lng!, name: currentFilter.locationName } : null);
  const [radiusKm, setRadiusKm] = useState(currentFilter?.radiusKm || 50);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );
      const data: LocationResult[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Location search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(newQuery);
    }, 300);
  };

  const handleSelectLocation = (result: LocationResult) => {
    const name = result.display_name.split(",")[0];
    setSelectedLocation({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name,
    });
    setQuery(name);
    setResults([]);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get location name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const name = data.address?.city || data.address?.town || data.address?.village || "Current Location";
          
          setSelectedLocation({
            lat: latitude,
            lng: longitude,
            name,
          });
          setQuery(name);
        } catch {
          setSelectedLocation({
            lat: latitude,
            lng: longitude,
            name: "Current Location",
          });
          setQuery("Current Location");
        }
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
      }
    );
  };

  const applyFilter = () => {
    if (selectedLocation) {
      onFilterChange({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        radiusKm,
        locationName: selectedLocation.name,
      });
    }
    setOpen(false);
  };

  const clearFilter = () => {
    setSelectedLocation(null);
    setQuery("");
    setRadiusKm(50);
    onFilterChange(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={currentFilter ? "default" : "outline"}
          size="icon"
          title="Location filter"
          className={cn(currentFilter && "bg-primary")}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location Filter
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Location Search */}
          <div className="space-y-2">
            <Label>Search Location</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="Search any location..."
                  className="pl-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                title="Use current location"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {results.length > 0 && (
              <div className="rounded-lg border border-border bg-popover shadow-lg">
                {results.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted transition-colors",
                      index === 0 && "rounded-t-lg",
                      index === results.length - 1 && "rounded-b-lg"
                    )}
                    onClick={() => handleSelectLocation(result)}
                  >
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {result.display_name.split(",")[0]}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.display_name.split(",").slice(1).join(",").trim()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Location */}
          {selectedLocation && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium flex-1 truncate">
                {selectedLocation.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => {
                  setSelectedLocation(null);
                  setQuery("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Radius Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Search Radius</Label>
              <span className="text-sm font-medium text-primary">{radiusKm} km</span>
            </div>
            <Slider
              value={[radiusKm]}
              onValueChange={([value]) => setRadiusKm(value)}
              min={5}
              max={500}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 km</span>
              <span>250 km</span>
              <span>500 km</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearFilter}
              className="flex-1"
            >
              Clear Filter
            </Button>
            <Button
              onClick={applyFilter}
              disabled={!selectedLocation}
              className="flex-1"
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
