import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";

interface LocationMapProps {
  locationName: string;
  locationAddress?: string;
  lat?: number | null;
  lng?: number | null;
  className?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  locationName,
  locationAddress,
  lat,
  lng,
  className,
}) => {
  const [open, setOpen] = useState(false);

  // Create OpenStreetMap embed URL
  const hasCoords = lat !== null && lat !== undefined && lng !== null && lng !== undefined;
  const mapUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`
    : null;
  
  const fullMapUrl = hasCoords
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(locationAddress || locationName)}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer ${className}`}
        >
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate hover:underline">{locationName}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {locationName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {locationAddress && (
            <p className="text-sm text-muted-foreground">{locationAddress}</p>
          )}
          
          {mapUrl ? (
            <div className="relative w-full h-80 rounded-lg overflow-hidden border border-border">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${locationName}`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 rounded-lg bg-muted/50 border border-border">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                Map preview not available.<br />
                Click below to view on OpenStreetMap.
              </p>
            </div>
          )}
          
          <Button asChild className="w-full">
            <a href={fullMapUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in OpenStreetMap
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
