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
import { Loader2, Check, ArrowLeft, Building2, Briefcase, HandHeart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type ListingType = Database["public"]["Enums"]["listing_type"];

const SUPPORTER_LISTING_TYPES = [
  {
    value: "micro_job" as ListingType,
    label: "Task / Micro Job",
    description: "Hire changemakers for small tasks (cleaning, moving, deliveries)",
    icon: Briefcase,
  },
  {
    value: "help_request" as ListingType,
    label: "Help Request",
    description: "Request volunteers for your business event or cause",
    icon: HandHeart,
  },
  {
    value: "service_offer" as ListingType,
    label: "Service Offer",
    description: "Offer discounted or free services to changemakers",
    icon: Building2,
  },
];

const SupporterCreateListing = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState({ 
    locationName: "", 
    locationAddress: "", 
    lat: null as number | null, 
    lng: null as number | null 
  });

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
        <div className="max-w-lg mx-auto space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/supporter")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Listing Submitted!</h3>
              <p className="text-muted-foreground text-center">
                Your listing is pending admin approval. It will appear in the feed once approved.
              </p>
              <Button onClick={() => navigate("/supporter")} className="mt-4">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/supporter")}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create a Business Listing
            </CardTitle>
            <CardDescription>
              Post a task, request help, or offer services to our changemaker community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Listing Type Selection */}
              <div className="space-y-3">
                <Label>What would you like to post? *</Label>
                <div className="grid gap-3">
                  {SUPPORTER_LISTING_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = listingType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setListingType(type.value)}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all",
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{type.label}</p>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="What are you looking for or offering?" 
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe the task, requirements, and what you're offering in return..." 
                  rows={4} 
                />
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label>Photos (optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Add photos of your business or the task location
                </p>
                <MultiImageUpload bucket="listings" values={photos} onChange={setPhotos} />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Business Location *</Label>
                <LocationPicker value={location} onChange={setLocation} />
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Listing for Review"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SupporterCreateListing;
