import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { MultiImageUpload } from "@/components/shared/MultiImageUpload";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type ListingType = Database["public"]["Enums"]["listing_type"];

const CreateListing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState({ locationName: "", locationAddress: "", lat: null as number | null, lng: null as number | null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingType || !title || !description || !location.locationName) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("listings").insert({
      creator_user_id: user!.id,
      listing_type: listingType as ListingType,
      title,
      description,
      photo_urls: photos,
      location_name: location.locationName,
      location_address: location.locationAddress,
      lat: location.lat,
      lng: location.lng,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to create listing", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Listing submitted for approval!" });
    }
  };

  if (submitted) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto">
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Listing Submitted!</h3>
              <p className="text-muted-foreground text-center">Your listing is pending admin approval. It will appear in the feed once approved.</p>
              <Button onClick={() => navigate("/")} className="mt-4">Back to Feed</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create a Listing</CardTitle>
            <CardDescription>Request help from your community or offer a good deed opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Listing Type *</Label>
                <Select value={listingType} onValueChange={(v) => setListingType(v as ListingType)}>
                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="help_request">Help Request</SelectItem>
                    <SelectItem value="micro_job">Micro Job</SelectItem>
                    <SelectItem value="good_deed_request">Good Deed Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you need help with?" />
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the help you need..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Photos (optional)</Label>
                <MultiImageUpload bucket="listings" values={photos} onChange={setPhotos} />
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <LocationPicker value={location} onChange={setLocation} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Listing"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreateListing;
