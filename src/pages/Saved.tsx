import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuestCard } from "@/components/quests/QuestCard";
import { ListingCard } from "@/components/listings/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Star, Sparkles } from "lucide-react";

const Saved = () => {
  const { user } = useAuth();
  const [savedQuests, setSavedQuests] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSaved();
  }, [user]);

  const fetchSaved = async () => {
    setLoading(true);
    
    // Fetch favorites with quest data
    const { data: questFavorites } = await supabase
      .from("favorites")
      .select("quest_id, quests(*)")
      .eq("user_id", user!.id)
      .not("quest_id", "is", null);

    // Fetch favorites with listing data
    const { data: listingFavorites } = await supabase
      .from("favorites")
      .select("listing_id, listings(*)")
      .eq("user_id", user!.id)
      .not("listing_id", "is", null);

    setSavedQuests(questFavorites?.map(f => f.quests).filter(Boolean) || []);
    setSavedListings(listingFavorites?.map(f => f.listings).filter(Boolean) || []);
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Star className="h-8 w-8 text-swap-gold" />
            Saved for Later
          </h1>
          <p className="text-muted-foreground">Your bookmarked quests and listings</p>
        </div>

        <Tabs defaultValue="quests" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="quests" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Quests ({savedQuests.length})
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-2">
              Listings ({savedListings.length})
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="quests" className="mt-6">
                {savedQuests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No saved quests yet</p>
                    <p className="text-sm">Click the star on any quest to save it here</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {savedQuests.map((quest: any) => (
                      <QuestCard
                        key={quest.id}
                        id={quest.id}
                        title={quest.title}
                        description={quest.description}
                        questType={quest.quest_type}
                        basePoints={quest.base_points}
                        locationName={quest.location_name}
                        locationAddress={quest.location_address}
                        lat={quest.lat}
                        lng={quest.lng}
                        impressions={quest.impressions}
                        createdAt={quest.created_at}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="listings" className="mt-6">
                {savedListings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No saved listings yet</p>
                    <p className="text-sm">Click the star on any listing to save it here</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {savedListings.map((listing: any) => (
                      <ListingCard
                        key={listing.id}
                        id={listing.id}
                        title={listing.title}
                        description={listing.description}
                        listingType={listing.listing_type}
                        locationName={listing.location_name}
                        locationAddress={listing.location_address}
                        lat={listing.lat}
                        lng={listing.lng}
                        photoUrls={listing.photo_urls || []}
                        impressions={listing.impressions}
                        createdAt={listing.created_at}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Saved;
