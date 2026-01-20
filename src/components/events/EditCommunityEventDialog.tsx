import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Loader2, Heart, Target, Calendar, Camera, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CommunityEvent {
  id: string;
  title: string;
  cause: string;
  description: string | null;
  goal_type: "numeric" | "submissions";
  goal_target: number;
  goal_current: number;
  goal_unit: string;
  measurement_description: string;
  photo_url: string | null;
  status: "draft" | "active" | "completed" | "cancelled";
  starts_at: string | null;
  ends_at: string | null;
  contribution_method: string;
}

interface EditCommunityEventDialogProps {
  event: CommunityEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdated?: () => void;
}

type ContributionMethod = "single_photo" | "multiple_photos" | "numeric" | "both";

export const EditCommunityEventDialog = ({ 
  event, 
  open, 
  onOpenChange, 
  onEventUpdated 
}: EditCommunityEventDialogProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState(event.title);
  const [cause, setCause] = useState(event.cause);
  const [description, setDescription] = useState(event.description || "");
  const [goalType, setGoalType] = useState<"numeric" | "submissions">(event.goal_type);
  const [goalTarget, setGoalTarget] = useState<number>(event.goal_target);
  const [goalUnit, setGoalUnit] = useState(event.goal_unit);
  const [measurementDescription, setMeasurementDescription] = useState(event.measurement_description);
  const [photoUrl, setPhotoUrl] = useState(event.photo_url || "");
  const [hasEndDate, setHasEndDate] = useState(!!event.ends_at);
  const [endsAt, setEndsAt] = useState(event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : "");
  const [status, setStatus] = useState(event.status);
  const [contributionMethod, setContributionMethod] = useState<ContributionMethod>(
    (event.contribution_method as ContributionMethod) || "multiple_photos"
  );

  // Reset form when event changes
  useEffect(() => {
    setTitle(event.title);
    setCause(event.cause);
    setDescription(event.description || "");
    setGoalType(event.goal_type);
    setGoalTarget(event.goal_target);
    setGoalUnit(event.goal_unit);
    setMeasurementDescription(event.measurement_description);
    setPhotoUrl(event.photo_url || "");
    setHasEndDate(!!event.ends_at);
    setEndsAt(event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : "");
    setStatus(event.status);
    setContributionMethod((event.contribution_method as ContributionMethod) || "multiple_photos");
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !cause || !goalTarget || !goalUnit || !measurementDescription) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("community_events")
      .update({
        title,
        cause,
        description: description || null,
        goal_type: goalType,
        goal_target: goalTarget,
        goal_unit: goalUnit,
        measurement_description: measurementDescription,
        photo_url: photoUrl || null,
        status,
        starts_at: status === "active" && !event.starts_at ? new Date().toISOString() : event.starts_at,
        ends_at: hasEndDate && endsAt ? new Date(endsAt).toISOString() : null,
        contribution_method: contributionMethod,
      })
      .eq("id", event.id);

    setSubmitting(false);

    if (error) {
      toast({ title: "Failed to update event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event updated successfully!" });
      onOpenChange(false);
      onEventUpdated?.();
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    
    // Delete related submissions and contributions first
    await supabase.from("event_submissions").delete().eq("event_id", event.id);
    await supabase.from("event_contributions").delete().eq("event_id", event.id);
    
    const { error } = await supabase
      .from("community_events")
      .delete()
      .eq("id", event.id);

    setSubmitting(false);

    if (error) {
      toast({ title: "Failed to delete event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event deleted successfully" });
      onOpenChange(false);
      onEventUpdated?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Edit Community Event
          </DialogTitle>
          <DialogDescription>
            Update event details. Changes take effect immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Status */}
          <div className="space-y-2 p-4 rounded-lg border border-primary/30 bg-primary/5">
            <Label htmlFor="status" className="text-base font-medium">Event Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft (hidden from users)</SelectItem>
                <SelectItem value="active">Active (visible and accepting contributions)</SelectItem>
                <SelectItem value="completed">Completed (goal reached)</SelectItem>
                <SelectItem value="cancelled">Cancelled (taken down)</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">
                Current progress: <span className="font-semibold text-foreground">{event.goal_current}</span> / {goalTarget} {goalUnit}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="measurement">How to Measure / Participate *</Label>
              <Textarea
                id="measurement"
                value={measurementDescription}
                onChange={(e) => setMeasurementDescription(e.target.value)}
                placeholder="Instructions for participants..."
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

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Delete Event
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Community Event?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the event and all associated submissions and contributions. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex-1" />

            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
