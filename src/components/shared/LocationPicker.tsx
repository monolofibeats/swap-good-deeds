import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface LocationPickerProps {
  value: {
    locationName: string;
    locationAddress: string;
    lat: number | null;
    lng: number | null;
  };
  onChange: (location: {
    locationName: string;
    locationAddress: string;
    lat: number | null;
    lng: number | null;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Search for a location...",
  disabled = false,
}) => {
  const [query, setQuery] = useState(value.locationName || "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        )}&limit=5&addressdetails=1`
      );
      const data: LocationResult[] = await response.json();
      setResults(data);
      setIsOpen(true);
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

  const handleSelect = (result: LocationResult) => {
    const name = result.address
      ? [result.address.road, result.address.city].filter(Boolean).join(", ") || result.display_name.split(",")[0]
      : result.display_name.split(",")[0];

    onChange({
      locationName: name,
      locationAddress: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    });

    setQuery(name);
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    onChange({
      locationName: "",
      locationAddress: "",
      lat: null,
      lng: null,
    });
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-20"
          disabled={disabled}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted transition-colors",
                index === 0 && "rounded-t-lg",
                index === results.length - 1 && "rounded-b-lg"
              )}
              onClick={() => handleSelect(result)}
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

      {/* Selected Location Display */}
      {value.locationAddress && !isOpen && (
        <p className="mt-2 text-sm text-muted-foreground truncate">
          📍 {value.locationAddress}
        </p>
      )}
    </div>
  );
};
