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
import { ImageUpload } from "@/components/shared/ImageUpload";
import { 
  Loader2, 
  Heart, 
  Target, 
  Users, 
  ArrowLeft, 
  Clock, 
  Camera, 
  DollarSign,
  Check,
  Calendar
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
  
  // Contribution form
  const [contributionAmount, setContributionAmount] = useState<number>(1);
  const [contributionNote, setContributionNote] = useState("");
  
  // Submission form
  const [photoUrl, setPhotoUrl] = useState("");
  const [submissionDescription, setSubmissionDescription] = useState("");

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

  const handleContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) return;
    
    setSubmitting(true);
    
    const { error } = await supabase.from("event_contributions").insert({
      event_id: event.id,
      user_id: user.id,
      amount: contributionAmount,
      note: contributionNote || null,
    });
    
    setSubmitting(false);
    
    if (error) {
      toast({ title: "Failed to record contribution", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Thank you for your contribution! 🎉" });
      fetchEvent(); // Refresh to show updated progress
    }
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event || !photoUrl) {
      toast({ title: "Please upload a photo", variant: "destructive" });
      return;
    }
    
    setSubmitting(true);
    
    const { error } = await supabase.from("event_submissions").insert({
      event_id: event.id,
      user_id: user.id,
      photo_url: photoUrl,
      description: submissionDescription || null,
    });
    
    setSubmitting(false);
    
    if (error) {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Submission received! It will count toward the goal once approved." });
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
  const isComplete = event.goal_current >= event.goal_target;

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
                {event.goal_type === "submissions" 
                  ? "Submit a photo to show your participation"
                  : "Record your contribution to the cause"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {event.goal_type === "submissions" ? (
                <form onSubmit={handleSubmission} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload Your Photo *</Label>
                    <ImageUpload
                      bucket="submissions"
                      value={photoUrl}
                      onChange={setPhotoUrl}
                    />
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
                    Submit Contribution
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleContribution} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ({event.goal_unit}) *</Label>
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
                    Record Contribution
                  </Button>
                </form>
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
                Your contribution has been recorded. Together we can reach our goal!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default EventDetail;
