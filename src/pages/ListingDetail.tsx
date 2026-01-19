import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreatorCard } from "@/components/shared/CreatorCard";
import { LocationMap } from "@/components/shared/LocationMap";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { ShareButton } from "@/components/shared/ShareButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, MapPin, Eye, HelpCircle, Briefcase, Heart, Check, HandHeart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatorInfo {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
}

const typeConfig: any = {
  help_request: { label: "Help Request", icon: HelpCircle, color: "bg-swap-gold/20 text-swap-gold" },
  micro_job: { label: "Micro Job", icon: Briefcase, color: "bg-swap-earth/20 text-swap-earth" },
  good_deed_request: { label: "Good Deed", icon: Heart, color: "bg-swap-sky/20 text-swap-sky" },
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<any>(null);
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    const { data } = await supabase.from("listings").select("*").eq("id", id).single();
    if (data) {
      setListing(data);
      await supabase.rpc("increment_listing_impressions", { listing_id: id });
      
      // Fetch creator profile
      const { data: creatorProfile } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .eq("user_id", data.creator_user_id)
        .single();
      
      if (creatorProfile) {
        setCreator(creatorProfile);
      }
      
      // Check if user already applied
      const { data: existing } = await supabase.from("listing_applications").select("id").eq("listing_id", id).eq("applicant_user_id", user?.id).maybeSingle();
      if (existing) setApplied(true);
    }
    setLoading(false);
  };

  const handleApply = async () => {
    setApplying(true);
    const { error } = await supabase.from("listing_applications").insert({
      listing_id: id,
      applicant_user_id: user!.id,
      message: message || null,
    });
    setApplying(false);
    if (error) {
      toast({ title: "Application failed", description: error.message, variant: "destructive" });
    } else {
      setApplied(true);
      setDialogOpen(false);
      toast({ title: "Applied successfully!" });
    }
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;
  if (!listing) return <AppLayout><div className="text-center py-20">Listing not found</div></AppLayout>;

  const config = typeConfig[listing.listing_type] || typeConfig.help_request;
  const Icon = config.icon;
  const photos = listing.photo_urls || [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr,280px]">
          {/* Main Content */}
          <div className="space-y-6">
            {photos.length > 0 && (
              <div className="grid gap-2 grid-cols-2">
                {photos.slice(0, 4).map((url: string, i: number) => (
                  <div key={i} className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary">{config.label}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <FavoriteButton listingId={id} />
                    <ShareButton title={listing.title} description={listing.description} />
                  </div>
                </div>
                <CardTitle className="text-2xl">{listing.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
                <LocationMap
                  locationName={listing.location_name}
                  locationAddress={listing.location_address}
                  lat={listing.lat}
                  lng={listing.lng}
                />
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {listing.impressions} views</span>
                  <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {applied ? (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="flex items-center gap-3 py-6">
                  <Check className="h-6 w-6 text-primary" />
                  <span className="font-medium">You've applied to help with this listing!</span>
                </CardContent>
              </Card>
            ) : (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full gap-2">
                    <HandHeart className="h-5 w-5" /> I Can Help
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Apply to Help</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <Textarea placeholder="Add an optional message..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
                    <Button onClick={handleApply} className="w-full" disabled={applying}>
                      {applying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Submit Application
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {creator && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Posted by</h3>
                <CreatorCard
                  creatorUserId={creator.user_id}
                  displayName={creator.display_name}
                  username={creator.username}
                  avatarUrl={creator.avatar_url}
                  itemType="listing"
                  itemId={id || ""}
                  itemTitle={listing.title}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ListingDetail;
