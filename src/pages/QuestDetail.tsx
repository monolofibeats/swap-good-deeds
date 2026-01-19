import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Eye, Leaf, Trash2, Heart, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QuestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quest, setQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [location, setLocation] = useState({ locationName: "", locationAddress: "", lat: null as number | null, lng: null as number | null });

  useEffect(() => {
    if (id) fetchQuest();
  }, [id]);

  const fetchQuest = async () => {
    const { data } = await supabase.from("quests").select("*").eq("id", id).single();
    if (data) {
      setQuest(data);
      await supabase.rpc("increment_quest_impressions", { quest_id: id });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeImage || !afterImage || !location.locationName) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("submissions").insert({
      user_id: user!.id,
      quest_id: id,
      before_image_url: beforeImage,
      after_image_url: afterImage,
      location_name: location.locationName,
      location_address: location.locationAddress,
      lat: location.lat,
      lng: location.lng,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Proof submitted!", description: "Awaiting admin review." });
    }
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;
  if (!quest) return <AppLayout><div className="text-center py-20">Quest not found</div></AppLayout>;

  const isCleanup = quest.quest_type === "cleanup";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isCleanup ? "bg-swap-green/20 text-swap-green" : "bg-swap-sky/20 text-swap-sky"}`}>
                {isCleanup ? <Trash2 className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
              </div>
              <Badge variant="secondary">{isCleanup ? "Cleanup" : "Good Deed"}</Badge>
              <div className="ml-auto flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                <Leaf className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">+{quest.base_points}</span>
              </div>
            </div>
            <CardTitle className="text-2xl">{quest.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{quest.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {quest.location_name}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {quest.impressions} views</span>
              <span>{new Date(quest.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {submitted ? (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Proof Submitted!</h3>
              <p className="text-muted-foreground text-center">Your submission is pending admin review. You'll earn points once approved.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle>Submit Proof</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <LocationPicker value={location} onChange={setLocation} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Proof"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default QuestDetail;
