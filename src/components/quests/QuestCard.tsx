import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, Leaf, Sparkles, Trash2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  questType: "cleanup" | "good_deed";
  basePoints: number;
  locationName: string;
  impressions: number;
  createdAt: string;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  id,
  title,
  description,
  questType,
  basePoints,
  locationName,
  impressions,
  createdAt,
}) => {
  const isCleanup = questType === "cleanup";
  
  return (
    <Link to={`/quests/${id}`}>
      <Card className="card-hover group cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  isCleanup
                    ? "bg-swap-green/20 text-swap-green"
                    : "bg-swap-sky/20 text-swap-sky"
                )}
              >
                {isCleanup ? (
                  <Trash2 className="h-5 w-5" />
                ) : (
                  <Heart className="h-5 w-5" />
                )}
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  isCleanup
                    ? "bg-swap-green/10 text-swap-green border-swap-green/20"
                    : "bg-swap-sky/10 text-swap-sky border-swap-sky/20"
                )}
              >
                {isCleanup ? "Cleanup" : "Good Deed"}
              </Badge>
            </div>
            
            {/* Points Badge */}
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm text-primary">
                +{basePoints}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{locationName}</span>
          </div>
        </CardContent>

        <CardFooter className="px-5 py-3 border-t border-border/50 bg-muted/30">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              <span>{impressions} views</span>
            </div>
            <span>
              {new Date(createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
