import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Loader2, Plus, Heart, Target, Calendar, Camera } from "lucide-react";

interface CreateCommunityEventDialogProps {
  onEventCreated?: () => void;
}

type ContributionMethod = "single_photo" | "multiple_photos" | "numeric" | "both";

export const CreateCommunityEventDialog = ({ onEventCreated }: CreateCommunityEventDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [cause, setCause] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<"numeric" | "submissions">("numeric");
  const [goalTarget, setGoalTarget] = useState<number>(1000);
  const [goalUnit, setGoalUnit] = useState("");
  const [measurementDescription, setMeasurementDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endsAt, setEndsAt] = useState("");
  const [launchImmediately, setLaunchImmediately] = useState(false);
  const [contributionMethod, setContributionMethod] = useState<ContributionMethod>("multiple_photos");

  const resetForm = () => {
    setTitle("");
    setCause("");
    setDescription("");
    setGoalType("numeric");
    setGoalTarget(1000);
    setGoalUnit("");
    setMeasurementDescription("");
    setPhotoUrl("");
    setHasEndDate(false);
    setEndsAt("");
    setLaunchImmediately(false);
    setContributionMethod("multiple_photos");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !cause || !goalTarget || !goalUnit || !measurementDescription) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    // Create the event
    const { data: eventData, error } = await supabase
      .from("community_events")
      .insert({
        title,
        cause,
        description: description || null,
        goal_type: goalType,
        goal_target: goalTarget,
        goal_unit: goalUnit,
        measurement_description: measurementDescription,
        photo_url: photoUrl || null,
        status: launchImmediately ? "active" : "draft",
        starts_at: launchImmediately ? new Date().toISOString() : null,
        ends_at: hasEndDate && endsAt ? new Date(endsAt).toISOString() : null,
        created_by: user!.id,
        contribution_method: contributionMethod,
      })
      .select()
      .single();

    if (error) {
      setSubmitting(false);
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
      return;
    }

    // If launching immediately, send notifications to all users
    if (launchImmediately && eventData) {
      // Fetch all user IDs
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id");

      if (profiles && profiles.length > 0) {
        // Create notifications for all users
        const notifications = profiles.map(p => ({
          user_id: p.user_id,
          title: "🎉 New Community Event!",
          body: `${title} - ${cause}. Join the community and help us reach our goal!`,
          type: "community_event",
          related_id: eventData.id,
        }));

        await supabase.from("notifications").insert(notifications);
      }
    }

    setSubmitting(false);
    toast({ title: launchImmediately ? "Event launched! Notifications sent to all users." : "Event saved as draft!" });
    resetForm();
    setOpen(false);
    onEventCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Community Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Create Community Event
          </DialogTitle>
          <DialogDescription>
            Rally the community around a cause. Events appear as banners on everyone's feed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Holiday Food Drive 2026"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cause">Cause / Mission *</Label>
              <Input
                id="cause"
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                placeholder="e.g., Feed 500 families this holiday season"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more context about the event..."
                rows={3}
              />
            </div>
          </div>

          {/* Goal configuration */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-primary" />
              Goal Configuration
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalType">How is progress measured? *</Label>
              <Select value={goalType} onValueChange={(v) => setGoalType(v as "numeric" | "submissions")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numeric">Numeric target (e.g., items collected, dollars raised)</SelectItem>
                  <SelectItem value="submissions">Submission count (photos/actions submitted)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalTarget">Target Amount *</Label>
                <Input
                  id="goalTarget"
                  type="number"
                  min={1}
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalUnit">Unit Label *</Label>
                <Input
                  id="goalUnit"
                  value={goalUnit}
                  onChange={(e) => setGoalUnit(e.target.value)}
                  placeholder={goalType === "submissions" ? "actions" : "items, dollars, etc."}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="measurement">How to Measure / Participate *</Label>
              <Textarea
                id="measurement"
                value={measurementDescription}
                onChange={(e) => setMeasurementDescription(e.target.value)}
                placeholder={goalType === "submissions" 
                  ? "e.g., Submit a photo of your cleanup action to contribute" 
                  : "e.g., Donate canned goods to collection points or report your donations here"
                }
                rows={2}
              />
            </div>
          </div>

          {/* Contribution Method */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Camera className="h-4 w-4 text-primary" />
              How Can Users Contribute?
            </div>

            <div className="space-y-2">
              <Label htmlFor="contributionMethod">Contribution Method *</Label>
              <Select value={contributionMethod} onValueChange={(v) => setContributionMethod(v as ContributionMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_photo">Single photo submission</SelectItem>
                  <SelectItem value="multiple_photos">Before & after photos (multiple)</SelectItem>
                  <SelectItem value="numeric">Numeric contribution (e.g., report items donated)</SelectItem>
                  <SelectItem value="both">Both photos and numeric contributions</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                All contributions require admin approval before counting toward the goal.
              </p>
            </div>
          </div>

          {/* Event image */}
          <div className="space-y-2">
            <Label>Event Banner Image (optional)</Label>
            <ImageUpload
              bucket="listings"
              value={photoUrl}
              onChange={setPhotoUrl}
            />
          </div>

          {/* End date */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              Duration
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hasEndDate">Set an end date?</Label>
                <p className="text-xs text-muted-foreground">Optional - event can run indefinitely</p>
              </div>
              <Switch
                id="hasEndDate"
                checked={hasEndDate}
                onCheckedChange={setHasEndDate}
              />
            </div>

            {hasEndDate && (
              <div className="space-y-2">
                <Label htmlFor="endsAt">End Date</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Launch option */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
            <div className="space-y-0.5">
              <Label htmlFor="launch" className="text-base font-medium">Launch immediately?</Label>
              <p className="text-xs text-muted-foreground">
                This will send notifications to all users and display the event banner
              </p>
            </div>
            <Switch
              id="launch"
              checked={launchImmediately}
              onCheckedChange={setLaunchImmediately}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {launchImmediately ? "Launching..." : "Saving..."}
                </>
              ) : (
                launchImmediately ? "Launch Event" : "Save as Draft"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
