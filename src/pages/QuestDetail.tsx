import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { LocationMap } from "@/components/shared/LocationMap";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { ShareButton } from "@/components/shared/ShareButton";
import { CreatorCard } from "@/components/shared/CreatorCard";
import { PromoteModal } from "@/components/promotions/PromoteModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Leaf, Trash2, Heart, Check, Camera, Sparkles, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDateEU } from "@/lib/dateUtils";

interface CreatorInfo {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
}

const QuestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quest, setQuest] = useState<any>(null);
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [showOptionalUpload, setShowOptionalUpload] = useState(false);

  useEffect(() => {
    if (id) fetchQuest();
  }, [id]);

  const fetchQuest = async () => {
    const { data } = await supabase.from("quests").select("*").eq("id", id).single();
    if (data) {
      setQuest(data);
      await supabase.rpc("increment_quest_impressions", { quest_id: id });
      
      // Quests are created by admins, so we'll show "SWAP Team" as creator
      setCreator({
        user_id: "",
        display_name: "SWAP Team",
        username: "swap",
        avatar_url: null,
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeImage || !afterImage) {
      toast({ title: "Please upload both photos", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("submissions").insert({
      user_id: user!.id,
      quest_id: id,
      before_image_url: beforeImage,
      after_image_url: afterImage,
      location_name: quest.location_name,
      location_address: quest.location_address,
      lat: quest.lat,
      lng: quest.lng,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Contribution submitted!", description: "Awaiting review." });
    }
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;
  if (!quest) return <AppLayout><div className="text-center py-20">Quest not found</div></AppLayout>;

  const isCleanup = quest.quest_type === "cleanup";
  const isPromoted = quest.is_promoted && new Date(quest.promotion_expires_at) > new Date();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr,280px]">
          {/* Main Content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isCleanup ? "bg-swap-green/20 text-swap-green" : "bg-swap-sky/20 text-swap-sky"}`}>
                      {isCleanup ? <Trash2 className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
                    </div>
                    <Badge variant="secondary">{isCleanup ? "Cleanup" : "Good Deed"}</Badge>
                    {isPromoted && (
                      <Badge className="bg-gradient-to-r from-swap-gold to-swap-earth text-background gap-1">
                        <Sparkles className="h-3 w-3" /> Promoted
                      </Badge>
                    )}
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                      <Leaf className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary">+{quest.base_points}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <FavoriteButton questId={id} />
                    <ShareButton title={quest.title} description={quest.description} />
                  </div>
                </div>
                <CardTitle className="text-2xl">{quest.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{quest.description}</p>
                <LocationMap
                  locationName={quest.location_name}
                  locationAddress={quest.location_address}
                  lat={quest.lat}
                  lng={quest.lng}
                />
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {quest.impressions} views</span>
                  <span>{formatDateEU(quest.created_at)}</span>
                </div>
              </CardContent>
            </Card>

            {submitted ? (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="flex flex-col items-center gap-3 py-8">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Contribution Submitted!</h3>
                  <p className="text-muted-foreground text-center">Your submission is pending review. You'll earn points and XP once approved.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Submit Your Contribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      Upload before and after photos to show your impact. Location will be automatically set from the quest.
                    </p>
                    
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Before Photo</label>
                        <ImageUpload bucket="submissions" value={beforeImage} onChange={setBeforeImage} label="Before" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">After Photo</label>
                        <ImageUpload bucket="submissions" value={afterImage} onChange={setAfterImage} label="After" />
                      </div>
                    </div>

                    {/* Optional confirmation toggle */}
                    <div className="border border-border/50 rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Add a confirmation note (optional)</p>
                          <p className="text-xs text-muted-foreground">Share anything extra about your experience</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowOptionalUpload(!showOptionalUpload)}
                        >
                          {showOptionalUpload ? "Hide" : "Add"}
                        </Button>
                      </div>
                      {showOptionalUpload && (
                        <div className="mt-4">
                          <textarea
                            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Share your experience, who you helped, or any details you'd like to add..."
                          />
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Contribution"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {creator && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Created by</h3>
                <CreatorCard
                  creatorUserId={creator.user_id}
                  displayName={creator.display_name}
                  username={creator.username}
                  avatarUrl={creator.avatar_url}
                  itemType="quest"
                  itemId={id || ""}
                  itemTitle={quest.title}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default QuestDetail;
