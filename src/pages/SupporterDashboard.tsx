import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Gift, FileText, Users, Star, MessageSquare, ExternalLink, QrCode } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";

const SupporterDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myRewards, setMyRewards] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeListings: 0,
    totalApplications: 0,
    pendingRewards: 0,
    pointsAwarded: 0,
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch my listings
    const { data: listings } = await supabase
      .from("listings")
      .select("*")
      .eq("creator_user_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch applications for my listings
    const listingIds = (listings || []).map(l => l.id);
    let totalApps = 0;
    if (listingIds.length > 0) {
      const { count } = await supabase
        .from("listing_applications")
        .select("*", { count: "exact", head: true })
        .in("listing_id", listingIds);
      totalApps = count || 0;
    }

    // Fetch my rewards (as partner)
    const { data: rewards } = await supabase
      .from("rewards")
      .select("*")
      .eq("partner_name", profile?.display_name || "");

    const pendingRewards = (rewards || []).filter(r => !r.is_active).length;

    setMyListings(listings || []);
    setMyRewards(rewards || []);
    setStats({
      activeListings: (listings || []).filter(l => l.status === "approved").length,
      totalApplications: totalApps,
      pendingRewards: pendingRewards,
      pointsAwarded: 0, // Would need to track this separately
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Supporter Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your listings and rewards for changemakers
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.activeListings}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Applications Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-swap-green" />
                <span className="text-2xl font-bold">{stats.totalApplications}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-swap-gold" />
                <span className="text-2xl font-bold">{stats.pendingRewards}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-swap-sky" />
                <span className="text-2xl font-bold">{(profile as any)?.swap_points || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="rewards">My Rewards</TabsTrigger>
            <TabsTrigger value="verify">Verify Codes</TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Request help from changemakers for tasks like dishwashing, cleaning, etc.
              </p>
              <Button onClick={() => navigate("/create-listing")} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Listing
              </Button>
            </div>

            {myListings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-semibold mb-1">No listings yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a listing to request help from changemakers
                  </p>
                  <Button onClick={() => navigate("/create-listing")}>
                    Create Your First Listing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg line-clamp-1">{listing.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{listing.description}</CardDescription>
                        </div>
                        <Badge 
                          variant={listing.status === "approved" ? "default" : "secondary"}
                          className={listing.status === "pending" ? "bg-swap-gold/20 text-swap-gold" : ""}
                        >
                          {listing.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {listing.location_name}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-1"
                          onClick={() => navigate(`/listing/${listing.id}`)}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate("/messages")}
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Offer rewards like free meals, showers, or discounts to changemakers
              </p>
              <Button variant="outline" disabled className="gap-2">
                <Plus className="h-4 w-4" />
                Request New Reward
              </Button>
            </div>

            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-semibold mb-1">Rewards require admin approval</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  To offer rewards to changemakers, please contact our team. We'll work with you 
                  to set up reward offerings that benefit the community.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verify Codes Tab */}
          <TabsContent value="verify" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Verify reward codes presented by changemakers
              </p>
              <Button onClick={() => navigate("/verify-code")} className="gap-2">
                <QrCode className="h-4 w-4" />
                Open Code Scanner
              </Button>
            </div>

            <Card>
              <CardContent className="py-12 text-center">
                <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-semibold mb-1">Verify Changemaker Codes</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  When a changemaker presents a reward code, use the verification tool to confirm 
                  it's valid and mark it as redeemed after providing the service.
                </p>
                <Button onClick={() => navigate("/verify-code")}>
                  Verify a Code
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SupporterDashboard;
