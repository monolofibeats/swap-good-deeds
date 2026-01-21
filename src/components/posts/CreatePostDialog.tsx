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
import { Plus, Loader2, Sparkles } from "lucide-react";

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

  const handleSubmit = async () => {
    if (!user) return;
    if (mediaUrls.length === 0) {
      toast({ title: "Please add at least one photo", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("social_posts").insert({
      user_id: user.id,
      caption: caption.trim() || null,
      media_urls: mediaUrls,
      wants_rewards: wantsRewards,
      status: wantsRewards ? "pending_review" : "published",
    });

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error creating post", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: wantsRewards ? "Post submitted for review!" : "Post published!",
        description: wantsRewards ? "An admin will review your post and decide on rewards." : undefined
      });
      setCaption("");
      setMediaUrls([]);
      setWantsRewards(false);
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
      <DialogContent className="max-w-lg">
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
                An admin will review your post and decide how many points you earn
              </p>
            </div>
            <Switch
              id="wants-rewards"
              checked={wantsRewards}
              onCheckedChange={setWantsRewards}
            />
          </div>

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
            ) : wantsRewards ? (
              "Submit for Review"
            ) : (
              "Share Post"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};