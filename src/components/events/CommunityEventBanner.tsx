import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, Target, Users, Clock, ChevronRight, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

export const CommunityEventBanner = () => {
  const navigate = useNavigate();
  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveEvent();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('community-events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_events' },
        () => fetchActiveEvent()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveEvent = async () => {
    const { data } = await supabase
      .from("community_events")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    setEvent(data as CommunityEvent | null);
    setLoading(false);
  };

  if (loading || !event || dismissed) return null;

  const progressPercent = Math.min((event.goal_current / event.goal_target) * 100, 100);
  const isComplete = event.goal_current >= event.goal_target;

  return (
    <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-background to-primary/5">
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors z-10"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Left: Event info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                <Heart className="h-3 w-3 mr-1" />
                Community Event
              </Badge>
              {event.ends_at && (
                <Badge variant="outline" className="text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Ends {formatDistanceToNow(new Date(event.ends_at), { addSuffix: true })}
                </Badge>
              )}
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-bold">{event.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{event.cause}</p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={progressPercent} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-primary">
                  {event.goal_current.toLocaleString()} {event.goal_unit}
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Goal: {event.goal_target.toLocaleString()} {event.goal_unit}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Action button */}
          <div className="flex items-center gap-3">
            <div className="text-center px-4">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {Math.round(progressPercent)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {isComplete ? "Goal reached! 🎉" : "Complete"}
              </div>
            </div>
            <Button 
              onClick={() => navigate(`/events/${event.id}`)}
              className="gap-2"
            >
              {event.goal_type === "submissions" ? (
                <>
                  <Users className="h-4 w-4" />
                  Contribute
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  Participate
                </>
              )}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
