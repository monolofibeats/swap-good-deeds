import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuestCard } from "@/components/quests/QuestCard";
import { ListingCard } from "@/components/listings/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Sparkles, X } from "lucide-react";
import { LocationFilter } from "@/components/filters/LocationFilter";
import { TypeFilter } from "@/components/filters/TypeFilter";

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const Index = () => {
  const [quests, setQuests] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("quests");
  const [locationFilter, setLocationFilter] = useState<{
    lat: number | null;
    lng: number | null;
    radiusKm: number;
    locationName: string;
  } | null>(null);
  const [questTypes, setQuestTypes] = useState<string[]>([]);
  const [listingTypes, setListingTypes] = useState<string[]>([]);

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

  // Sort promoted items first, then by date
  const sortByPromotion = (a: any, b: any) => {
    // Promoted items first (active promotions only)
    const aPromoted = a.is_promoted && a.promotion_expires_at && new Date(a.promotion_expires_at) > new Date();
    const bPromoted = b.is_promoted && b.promotion_expires_at && new Date(b.promotion_expires_at) > new Date();
    if (aPromoted && !bPromoted) return -1;
    if (!aPromoted && bPromoted) return 1;
    // Then by date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };

  const filteredQuests = quests.filter(q => {
    // Text search
    const matchesSearch = !searchQuery || 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.location_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = questTypes.length === 0 || questTypes.includes(q.quest_type);
    
    // Location filter
    let matchesLocation = true;
    if (locationFilter?.lat && locationFilter?.lng && q.lat && q.lng) {
      const distance = calculateDistance(locationFilter.lat, locationFilter.lng, q.lat, q.lng);
      matchesLocation = distance <= locationFilter.radiusKm;
    }
    
    return matchesSearch && matchesType && matchesLocation;
  }).sort(sortByPromotion);

  const filteredListings = listings.filter(l => {
    const matchesSearch = !searchQuery ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = listingTypes.length === 0 || listingTypes.includes(l.listing_type);
    
    let matchesLocation = true;
    if (locationFilter?.lat && locationFilter?.lng && l.lat && l.lng) {
      const distance = calculateDistance(locationFilter.lat, locationFilter.lng, l.lat, l.lng);
      matchesLocation = distance <= locationFilter.radiusKm;
    }
    
    return matchesSearch && matchesType && matchesLocation;
  }).sort(sortByPromotion);

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
            <LocationFilter
              currentFilter={locationFilter}
              onFilterChange={setLocationFilter}
            />
            <TypeFilter
              questTypes={questTypes}
              listingTypes={listingTypes}
              onQuestTypesChange={setQuestTypes}
              onListingTypesChange={setListingTypes}
              mode={activeTab as "quests" | "listings"}
            />
          </div>
        </div>

        {/* Active Filters */}
        {(locationFilter || questTypes.length > 0 || listingTypes.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {locationFilter && (
              <Badge variant="secondary" className="gap-1">
                📍 {locationFilter.locationName} ({locationFilter.radiusKm}km)
                <button onClick={() => setLocationFilter(null)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {questTypes.map(t => (
              <Badge key={t} variant="secondary" className="gap-1">
                {t.replace("_", " ")}
                <button onClick={() => setQuestTypes(questTypes.filter(x => x !== t))} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="quests" className="w-full" onValueChange={setActiveTab}>
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
                        locationAddress={quest.location_address}
                        lat={quest.lat}
                        lng={quest.lng}
                        impressions={quest.impressions}
                        createdAt={quest.created_at}
                        isPromoted={quest.is_promoted && quest.promotion_expires_at && new Date(quest.promotion_expires_at) > new Date()}
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
                        locationAddress={listing.location_address}
                        lat={listing.lat}
                        lng={listing.lng}
                        photoUrls={listing.photo_urls || []}
                        impressions={listing.impressions}
                        createdAt={listing.created_at}
                        isPromoted={listing.is_promoted && listing.promotion_expires_at && new Date(listing.promotion_expires_at) > new Date()}
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
