import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MultiImageUpload } from "@/components/shared/MultiImageUpload";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { Plus, Loader2, Sparkles, MapPin, Camera } from "lucide-react";

interface CreatePostDialogProps {
  onPostCreated?: () => void;
}

export const CreatePostDialog = ({ onPostCreated }: CreatePostDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [wantsRewards, setWantsRewards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reward submission fields (only shown when wantsRewards is true)
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string | null>(null);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    locationName: string;
    locationAddress: string;
    lat: number | null;
    lng: number | null;
  }>({ locationName: "", locationAddress: "", lat: null, lng: null });

  const handleSubmit = async () => {
    if (!user) return;
    if (mediaUrls.length === 0) {
      toast({ title: "Please add at least one photo", variant: "destructive" });
      return;
    }

    // If requesting rewards, validate additional fields
    if (wantsRewards) {
      if (!beforePhotoUrl || !afterPhotoUrl) {
        toast({ title: "Please add before & after photos for reward review", variant: "destructive" });
        return;
      }
      if (!location.locationName || !location.lat) {
        toast({ title: "Please select a location for reward review", variant: "destructive" });
        return;
      }
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("social_posts").insert({
      user_id: user.id,
      caption: caption.trim() || null,
      media_urls: mediaUrls,
      wants_rewards: wantsRewards,
      // Always publish the post - if rewards requested, it goes to admin review too
      status: wantsRewards ? "pending_review" : "published",
      // Add reward submission details if requested
      before_photo_url: wantsRewards ? beforePhotoUrl : null,
      after_photo_url: wantsRewards ? afterPhotoUrl : null,
      location_name: wantsRewards ? location.locationName : null,
      location_address: wantsRewards ? location.locationAddress : null,
      lat: wantsRewards ? location.lat : null,
      lng: wantsRewards ? location.lng : null,
    });

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error creating post", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: "Post shared!",
        description: wantsRewards 
          ? "Your post is live! An admin will review it for rewards." 
          : undefined
      });
      // Reset form
      setCaption("");
      setMediaUrls([]);
      setWantsRewards(false);
      setBeforePhotoUrl(null);
      setAfterPhotoUrl(null);
      setLocation({ locationName: "", locationAddress: "", lat: null, lng: null });
      setOpen(false);
      onPostCreated?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Share a Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share with the community</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Media upload */}
          <div className="space-y-2">
            <Label>Photos & Videos</Label>
            <MultiImageUpload
              bucket="listings"
              values={mediaUrls}
              onChange={setMediaUrls}
              maxImages={10}
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              placeholder="Tell everyone about what you did..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>

          {/* Request rewards toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-swap-gold" />
                <Label htmlFor="wants-rewards" className="font-medium">Request Rewards</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Get points for good deeds! An admin will review and decide rewards.
              </p>
            </div>
            <Switch
              id="wants-rewards"
              checked={wantsRewards}
              onCheckedChange={setWantsRewards}
            />
          </div>

          {/* Additional fields for reward requests - Admin review only */}
          {wantsRewards && (
            <div className="space-y-4 p-4 rounded-lg border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Camera className="h-4 w-4" />
                Additional info for admin review
              </div>
              <p className="text-xs text-muted-foreground">
                These photos won't be shown publicly—they're just for admins to verify your contribution.
              </p>

              {/* Before & After Photos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Before Photo</Label>
                  <ImageUpload
                    bucket="listings"
                    value={beforePhotoUrl}
                    onChange={setBeforePhotoUrl}
                  />
                </div>
                <div className="space-y-2">
                  <Label>After Photo</Label>
                  <ImageUpload
                    bucket="listings"
                    value={afterPhotoUrl}
                    onChange={setAfterPhotoUrl}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <LocationPicker
                  value={location}
                  onChange={setLocation}
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || mediaUrls.length === 0}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Share Post"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};