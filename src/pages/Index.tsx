import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuestCard } from "@/components/quests/QuestCard";
import { ListingCard } from "@/components/listings/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, MapPin, Sparkles } from "lucide-react";

const Index = () => {
  const [quests, setQuests] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [questsRes, listingsRes] = await Promise.all([
      supabase.from("quests").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("listings").select("*").eq("status", "approved").order("created_at", { ascending: false }),
    ]);
    setQuests(questsRes.data || []);
    setListings(listingsRes.data || []);
    setLoading(false);
  };

  const filteredQuests = quests.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.location_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredListings = listings.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.location_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Discover Good Deeds</h1>
            <p className="text-muted-foreground">Complete quests and help your community</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search quests & listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" title="Distance filter (coming soon)">
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="quests" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="quests" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Quests ({filteredQuests.length})
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-2">
              Listings ({filteredListings.length})
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="quests" className="mt-6">
                {filteredQuests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No quests found</div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredQuests.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        id={quest.id}
                        title={quest.title}
                        description={quest.description}
                        questType={quest.quest_type}
                        basePoints={quest.base_points}
                        locationName={quest.location_name}
                        impressions={quest.impressions}
                        createdAt={quest.created_at}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="listings" className="mt-6">
                {filteredListings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No listings found</div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        id={listing.id}
                        title={listing.title}
                        description={listing.description}
                        listingType={listing.listing_type}
                        locationName={listing.location_name}
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

export default Index;
