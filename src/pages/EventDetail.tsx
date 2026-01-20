import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiImageUpload } from "@/components/shared/MultiImageUpload";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { 
  Loader2, 
  Heart, 
  Target, 
  Users, 
  ArrowLeft, 
  Clock, 
  Camera, 
  Check,
  Calendar,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

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
  created_at: string;
  contribution_method: string;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Contribution form (numeric)
  const [contributionAmount, setContributionAmount] = useState<number>(1);
  const [contributionNote, setContributionNote] = useState("");
  
  // Submission form (photos)
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [singlePhotoUrl, setSinglePhotoUrl] = useState("");
  const [submissionDescription, setSubmissionDescription] = useState("");
  const [contributionValue, setContributionValue] = useState<number>(1);

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from("community_events")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error || !data) {
      navigate("/home");
      return;
    }
    
    setEvent(data as CommunityEvent);
    setLoading(false);
  };

  const handleNumericContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) return;
    
    setSubmitting(true);
    
    const { error } = await supabase.from("event_contributions").insert({
      event_id: event.id,
      user_id: user.id,
      amount: contributionAmount,
      note: contributionNote || null,
      status: "pending",
    });
    
    setSubmitting(false);
    
    if (error) {
      toast({ title: "Failed to record contribution", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Contribution submitted for review! 🎉", description: "An admin will review and approve your contribution soon." });
    }
  };

  const handlePhotoSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) return;
    
    const method = event.contribution_method || "multiple_photos";
    const hasPhotos = method === "single_photo" ? singlePhotoUrl : photoUrls.length > 0;
    
    if (!hasPhotos) {
      toast({ title: "Please upload at least one photo", variant: "destructive" });
      return;
    }
    
    setSubmitting(true);
    
    const photosToSubmit = method === "single_photo" ? [singlePhotoUrl] : photoUrls;
    
    const { error } = await supabase.from("event_submissions").insert({
      event_id: event.id,
      user_id: user.id,
      photo_url: photosToSubmit[0], // Keep for backwards compatibility
      photo_urls: photosToSubmit,
      description: submissionDescription || null,
      contribution_value: contributionValue,
      status: "pending",
    });
    
    setSubmitting(false);
    
    if (error) {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Submission received! 🎉", description: "An admin will review and approve your contribution soon." });
    }
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

  if (!event) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Event not found</p>
        </div>
      </AppLayout>
    );
  }

  const progressPercent = Math.min((event.goal_current / event.goal_target) * 100, 100);
  const contributionMethod = event.contribution_method || "multiple_photos";
  const showPhotoForm = contributionMethod === "single_photo" || contributionMethod === "multiple_photos" || contributionMethod === "both";
  const showNumericForm = contributionMethod === "numeric" || contributionMethod === "both";
  const isMultiplePhotos = contributionMethod === "multiple_photos" || contributionMethod === "both";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/home")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Button>

        {/* Event Header */}
        <Card className="overflow-hidden">
          {event.photo_url && (
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={event.photo_url} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                <Heart className="h-3 w-3 mr-1" />
                Community Event
              </Badge>
              {event.status === "completed" && (
                <Badge className="bg-green-500/20 text-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Goal Reached!
                </Badge>
              )}
              {event.ends_at && (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Ends {formatDistanceToNow(new Date(event.ends_at), { addSuffix: true })}
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <CardDescription className="text-base">{event.cause}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {event.description && (
              <p className="text-muted-foreground">{event.description}</p>
            )}

            {/* Progress Section */}
            <div className="p-4 rounded-lg bg-muted/30 border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Progress
                </span>
                <span className="text-2xl font-bold text-primary">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <Progress value={progressPercent} className="h-4" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {event.goal_current.toLocaleString()} {event.goal_unit}
                </span>
                <span className="text-muted-foreground">
                  Goal: {event.goal_target.toLocaleString()} {event.goal_unit}
                </span>
              </div>
            </div>

            {/* How to participate */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                How to Participate
              </h4>
              <p className="text-sm text-muted-foreground">{event.measurement_description}</p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                All contributions are reviewed by admins before counting toward the goal.
              </p>
            </div>

            {event.starts_at && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Started {format(new Date(event.starts_at), "PPP")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Participation Form */}
        {!submitted ? (
          <Card>
            <CardHeader>
              <CardTitle>Make Your Contribution</CardTitle>
              <CardDescription>
                {contributionMethod === "both" 
                  ? "Submit photos or record a numeric contribution"
                  : showPhotoForm 
                    ? `Submit ${isMultiplePhotos ? "before & after photos" : "a photo"} to show your participation`
                    : "Record your contribution to the cause"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contributionMethod === "both" ? (
                <Tabs defaultValue="photos" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="photos" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Photo Submission
                    </TabsTrigger>
                    <TabsTrigger value="numeric" className="gap-2">
                      <Package className="h-4 w-4" />
                      Numeric Contribution
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="photos">
                    <PhotoSubmissionForm
                      isMultiplePhotos={true}
                      photoUrls={photoUrls}
                      setPhotoUrls={setPhotoUrls}
                      singlePhotoUrl={singlePhotoUrl}
                      setSinglePhotoUrl={setSinglePhotoUrl}
                      submissionDescription={submissionDescription}
                      setSubmissionDescription={setSubmissionDescription}
                      contributionValue={contributionValue}
                      setContributionValue={setContributionValue}
                      goalUnit={event.goal_unit}
                      submitting={submitting}
                      onSubmit={handlePhotoSubmission}
                    />
                  </TabsContent>
                  <TabsContent value="numeric">
                    <NumericContributionForm
                      contributionAmount={contributionAmount}
                      setContributionAmount={setContributionAmount}
                      contributionNote={contributionNote}
                      setContributionNote={setContributionNote}
                      goalUnit={event.goal_unit}
                      submitting={submitting}
                      onSubmit={handleNumericContribution}
                    />
                  </TabsContent>
                </Tabs>
              ) : showPhotoForm ? (
                <PhotoSubmissionForm
                  isMultiplePhotos={isMultiplePhotos}
                  photoUrls={photoUrls}
                  setPhotoUrls={setPhotoUrls}
                  singlePhotoUrl={singlePhotoUrl}
                  setSinglePhotoUrl={setSinglePhotoUrl}
                  submissionDescription={submissionDescription}
                  setSubmissionDescription={setSubmissionDescription}
                  contributionValue={contributionValue}
                  setContributionValue={setContributionValue}
                  goalUnit={event.goal_unit}
                  submitting={submitting}
                  onSubmit={handlePhotoSubmission}
                />
              ) : (
                <NumericContributionForm
                  contributionAmount={contributionAmount}
                  setContributionAmount={setContributionAmount}
                  contributionNote={contributionNote}
                  setContributionNote={setContributionNote}
                  goalUnit={event.goal_unit}
                  submitting={submitting}
                  onSubmit={handleNumericContribution}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Thank You! 🎉</h3>
              <p className="text-muted-foreground">
                Your contribution has been submitted for review. Once approved, it will count toward our goal!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

// Photo Submission Form Component
interface PhotoSubmissionFormProps {
  isMultiplePhotos: boolean;
  photoUrls: string[];
  setPhotoUrls: (urls: string[]) => void;
  singlePhotoUrl: string;
  setSinglePhotoUrl: (url: string) => void;
  submissionDescription: string;
  setSubmissionDescription: (desc: string) => void;
  contributionValue: number;
  setContributionValue: (val: number) => void;
  goalUnit: string;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const PhotoSubmissionForm = ({
  isMultiplePhotos,
  photoUrls,
  setPhotoUrls,
  singlePhotoUrl,
  setSinglePhotoUrl,
  submissionDescription,
  setSubmissionDescription,
  contributionValue,
  setContributionValue,
  goalUnit,
  submitting,
  onSubmit,
}: PhotoSubmissionFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label>{isMultiplePhotos ? "Upload Photos (before & after) *" : "Upload Photo *"}</Label>
      {isMultiplePhotos ? (
        <MultiImageUpload
          bucket="submissions"
          values={photoUrls}
          onChange={setPhotoUrls}
          maxImages={6}
        />
      ) : (
        <ImageUpload
          bucket="submissions"
          value={singlePhotoUrl}
          onChange={setSinglePhotoUrl}
        />
      )}
      {isMultiplePhotos && (
        <p className="text-xs text-muted-foreground">
          Upload before and after photos to show your contribution
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor="contribution-value">Contribution Amount ({goalUnit}) *</Label>
      <Input
        id="contribution-value"
        type="number"
        min={1}
        value={contributionValue}
        onChange={(e) => setContributionValue(parseInt(e.target.value) || 1)}
        placeholder="e.g., 5 trees planted"
      />
      <p className="text-xs text-muted-foreground">
        How many {goalUnit} does your contribution represent? Admin will verify this.
      </p>
    </div>
    <div className="space-y-2">
      <Label htmlFor="description">Description (optional)</Label>
      <Textarea
        id="description"
        value={submissionDescription}
        onChange={(e) => setSubmissionDescription(e.target.value)}
        placeholder="Tell us about your contribution..."
        rows={2}
      />
    </div>
    <Button type="submit" className="w-full gap-2" disabled={submitting}>
      {submitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Camera className="h-4 w-4" />
      )}
      Submit for Review
    </Button>
  </form>
);

// Numeric Contribution Form Component
interface NumericContributionFormProps {
  contributionAmount: number;
  setContributionAmount: (amount: number) => void;
  contributionNote: string;
  setContributionNote: (note: string) => void;
  goalUnit: string;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const NumericContributionForm = ({
  contributionAmount,
  setContributionAmount,
  contributionNote,
  setContributionNote,
  goalUnit,
  submitting,
  onSubmit,
}: NumericContributionFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="amount">Amount ({goalUnit}) *</Label>
      <Input
        id="amount"
        type="number"
        min={1}
        value={contributionAmount}
        onChange={(e) => setContributionAmount(parseInt(e.target.value) || 1)}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="note">Note (optional)</Label>
      <Textarea
        id="note"
        value={contributionNote}
        onChange={(e) => setContributionNote(e.target.value)}
        placeholder="Any additional information..."
        rows={2}
      />
    </div>
    <Button type="submit" className="w-full gap-2" disabled={submitting}>
      {submitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className="h-4 w-4" />
      )}
      Submit for Review
    </Button>
  </form>
);

export default EventDetail;
