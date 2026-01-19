import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, HelpCircle, Briefcase, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocationMap } from "@/components/shared/LocationMap";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { ShareButton } from "@/components/shared/ShareButton";
import { formatDateShortEU } from "@/lib/dateUtils";

interface ListingCardProps {
  id: string;
  title: string;
  description: string;
  listingType: "help_request" | "micro_job" | "good_deed_request";
  locationName: string;
  locationAddress?: string;
  lat?: number | null;
  lng?: number | null;
  photoUrls: string[];
  impressions: number;
  createdAt: string;
}

const listingTypeConfig = {
  help_request: {
    label: "Help Request",
    icon: HelpCircle,
    color: "bg-swap-gold/10 text-swap-gold border-swap-gold/20",
    iconBg: "bg-swap-gold/20 text-swap-gold",
  },
  micro_job: {
    label: "Micro Job",
    icon: Briefcase,
    color: "bg-swap-earth/10 text-swap-earth border-swap-earth/20",
    iconBg: "bg-swap-earth/20 text-swap-earth",
  },
  good_deed_request: {
    label: "Good Deed",
    icon: Heart,
    color: "bg-swap-sky/10 text-swap-sky border-swap-sky/20",
    iconBg: "bg-swap-sky/20 text-swap-sky",
  },
};

export const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  description,
  listingType,
  locationName,
  locationAddress,
  lat,
  lng,
  photoUrls,
  impressions,
  createdAt,
}) => {
  const config = listingTypeConfig[listingType];
  const Icon = config.icon;
  const displayPhotos = photoUrls.slice(0, 4);
  
  return (
    <Card className="card-hover group overflow-hidden border-border/50 bg-card/50 backdrop-blur relative">
      <Link to={`/listings/${id}`} className="block">
        {/* Photo Grid */}
        {displayPhotos.length > 0 && (
          <div
            className={cn(
              "grid gap-1 p-1",
              displayPhotos.length === 1 && "grid-cols-1",
              displayPhotos.length === 2 && "grid-cols-2",
              displayPhotos.length >= 3 && "grid-cols-2"
            )}
          >
            {displayPhotos.map((url, index) => (
              <div
                key={index}
                className={cn(
                  "relative overflow-hidden rounded-md bg-muted",
                  displayPhotos.length === 1 && "aspect-video",
                  displayPhotos.length === 2 && "aspect-square",
                  displayPhotos.length >= 3 && index === 0 && displayPhotos.length === 3 && "row-span-2 aspect-square",
                  displayPhotos.length >= 3 && index > 0 && "aspect-square",
                  displayPhotos.length === 4 && "aspect-square"
                )}
              >
                <img
                  src={url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        <CardContent className={cn("p-5", displayPhotos.length > 0 && "pt-4")}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", config.iconBg)}>
              <Icon className="h-4 w-4" />
            </div>
            <Badge variant="secondary" className={cn("text-xs", config.color)}>
              {config.label}
            </Badge>
          </div>

          {/* Title & Description */}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>

          {/* Location - Clickable */}
          <LocationMap
            locationName={locationName}
            locationAddress={locationAddress}
            lat={lat}
            lng={lng}
          />
        </CardContent>
      </Link>

      <CardFooter className="px-5 py-3 border-t border-border/50 bg-muted/30">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <span>{impressions} views</span>
          </div>
          <div className="flex items-center gap-1">
            <FavoriteButton listingId={id} size="sm" variant="ghost" />
            <ShareButton title={title} description={description} url={`${window.location.origin}/listings/${id}`} />
            <span className="ml-2">
              {formatDateShortEU(createdAt)}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
