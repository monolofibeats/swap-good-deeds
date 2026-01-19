import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoriteButtonProps {
  questId?: string;
  listingId?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  questId,
  listingId,
  variant = "ghost",
  size = "icon",
  className,
}) => {
  const { isFavorited, toggleFavorite } = useFavorites();
  
  const favorited = isFavorited(questId, listingId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(questId, listingId);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "transition-all",
        favorited && "text-swap-gold",
        className
      )}
      title={favorited ? "Remove from saved" : "Save for later"}
    >
      <Star
        className={cn(
          "h-4 w-4 transition-all",
          favorited && "fill-swap-gold"
        )}
      />
    </Button>
  );
};
