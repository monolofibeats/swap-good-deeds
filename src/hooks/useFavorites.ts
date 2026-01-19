import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Favorite {
  id: string;
  quest_id: string | null;
  listing_id: string | null;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("id, quest_id, listing_id")
      .eq("user_id", user.id);

    if (!error && data) {
      setFavorites(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorited = useCallback(
    (questId?: string, listingId?: string) => {
      if (questId) {
        return favorites.some((f) => f.quest_id === questId);
      }
      if (listingId) {
        return favorites.some((f) => f.listing_id === listingId);
      }
      return false;
    },
    [favorites]
  );

  const toggleFavorite = async (questId?: string, listingId?: string) => {
    if (!user) {
      toast({ title: "Please log in to save favorites", variant: "destructive" });
      return;
    }

    const existing = favorites.find(
      (f) => (questId && f.quest_id === questId) || (listingId && f.listing_id === listingId)
    );

    if (existing) {
      // Remove favorite
      const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
      if (!error) {
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        toast({ title: "Removed from saved" });
      }
    } else {
      // Add favorite
      const insertData: any = { user_id: user.id };
      if (questId) insertData.quest_id = questId;
      if (listingId) insertData.listing_id = listingId;

      const { data, error } = await supabase
        .from("favorites")
        .insert(insertData)
        .select()
        .single();

      if (!error && data) {
        setFavorites((prev) => [...prev, data]);
        toast({ title: "Saved for later!" });
      }
    }
  };

  return { favorites, loading, isFavorited, toggleFavorite, refetch: fetchFavorites };
};
