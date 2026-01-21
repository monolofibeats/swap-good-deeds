import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Check, X, RefreshCw, MapPin, Image, Sparkles, ExternalLink, MessageSquare, UserCog, Building2, HelpCircle, Heart, Camera, Target, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDateEU } from "@/lib/dateUtils";
import { CreateCommunityEventDialog } from "@/components/events/CreateCommunityEventDialog";
import { EditCommunityEventDialog } from "@/components/events/EditCommunityEventDialog";
import { Progress } from "@/components/ui/progress";
const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [supporterApps, setSupporterApps] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [eventSubmissions, setEventSubmissions] = useState<any[]>([]);
  const [eventContributions, setEventContributions] = useState<any[]>([]);
  const [communityEvents, setCommunityEvents] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Custom points/XP values per submission
  const [pointsValues, setPointsValues] = useState<Record<string, number>>({});
  const [xpValues, setXpValues] = useState<Record<string, number>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  
  // Listing reward values
  const [listingPoints, setListingPoints] = useState<Record<string, number>>({});
  const [listingXp, setListingXp] = useState<Record<string, number>>({});
  
  // Event contribution values (admin sets how much each contribution counts)
  const [eventContributionValues, setEventContributionValues] = useState<Record<string, number>>({});
  
  // Social post reward values
  const [postPoints, setPostPoints] = useState<Record<string, number>>({});
  const [postXp, setPostXp] = useState<Record<string, number>>({});

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch submissions with quest info
    const { data: submissionsData } = await supabase
      .from("submissions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    // Fetch quest titles and user names for submissions
    const submissionsWithDetails = await Promise.all(
      (submissionsData || []).map(async (sub) => {
        const [questRes, profileRes] = await Promise.all([
          supabase.from("quests").select("title, base_points").eq("id", sub.quest_id).single(),
          supabase.from("profiles").select("display_name").eq("user_id", sub.user_id).single(),
        ]);
        return {
          ...sub,
          quest_title: questRes.data?.title || "Unknown Quest",
          quest_base_points: questRes.data?.base_points || 0,
          user_display_name: profileRes.data?.display_name || "Unknown User",
        };
      })
    );

    // Initialize default values for points/XP
    const initialPoints: Record<string, number> = {};
    const initialXp: Record<string, number> = {};
    submissionsWithDetails.forEach(sub => {
      initialPoints[sub.id] = sub.quest_base_points;
      initialXp[sub.id] = Math.round(sub.quest_base_points * 0.5);
    });
    setPointsValues(prev => ({ ...initialPoints, ...prev }));
    setXpValues(prev => ({ ...initialXp, ...prev }));

    // Fetch listings
    const { data: listingsData } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    // Fetch user names for listings
    const listingsWithDetails = await Promise.all(
      (listingsData || []).map(async (listing) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", listing.creator_user_id)
          .single();
        return {
          ...listing,
          user_display_name: profileData?.display_name || "Unknown User",
        };
      })
    );

    // Fetch applications
    const { data: applicationsData } = await supabase
      .from("listing_applications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    // Fetch details for applications - include listing info
    const applicationsWithDetails = await Promise.all(
      (applicationsData || []).map(async (app) => {
        const [listingRes, profileRes] = await Promise.all([
          supabase.from("listings").select("id, title, listing_type, description").eq("id", app.listing_id).single(),
          supabase.from("profiles").select("display_name, username").eq("user_id", app.applicant_user_id).single(),
        ]);
        return {
          ...app,
          listing_id: listingRes.data?.id || app.listing_id,
          listing_title: listingRes.data?.title || "Unknown Listing",
          listing_type: listingRes.data?.listing_type || "help_request",
          listing_description: listingRes.data?.description || "",
          user_display_name: profileRes.data?.display_name || "Unknown User",
          user_username: profileRes.data?.username || null,
        };
      })
    );

    // Fetch supporter applications
    const { data: supporterAppsData } = await supabase
      .from("supporter_applications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const supporterAppsWithDetails = await Promise.all(
      (supporterAppsData || []).map(async (app) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, username, avatar_url")
          .eq("user_id", app.user_id)
          .single();
        return {
          ...app,
          user_display_name: profileData?.display_name || "Unknown User",
          user_username: profileData?.username || null,
          user_avatar: profileData?.avatar_url || null,
        };
      })
    );

    // Fetch support tickets
    const { data: ticketsData } = await supabase
      .from("support_tickets")
      .select("*")
      .in("status", ["open", "in_progress"])
      .order("created_at", { ascending: false });

    const ticketsWithDetails = await Promise.all(
      (ticketsData || []).map(async (ticket) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("user_id", ticket.user_id)
          .single();
        return {
          ...ticket,
          user_display_name: profileData?.display_name || "Unknown User",
          user_username: profileData?.username || null,
        };
      })
    );

    // Fetch all users
    const { data: usersData } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, avatar_url, level, swap_points, user_type")
      .order("display_name");

    // Fetch pending event submissions
    const { data: eventSubsData } = await supabase
      .from("event_submissions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const eventSubsWithDetails = await Promise.all(
      (eventSubsData || []).map(async (sub) => {
        const [eventRes, profileRes] = await Promise.all([
          supabase.from("community_events").select("title, goal_unit").eq("id", sub.event_id).single(),
          supabase.from("profiles").select("display_name").eq("user_id", sub.user_id).single(),
        ]);
        return {
          ...sub,
          event_title: eventRes.data?.title || "Unknown Event",
          goal_unit: eventRes.data?.goal_unit || "units",
          user_display_name: profileRes.data?.display_name || "Unknown User",
        };
      })
    );

    // Fetch pending event contributions
    const { data: eventContribData } = await supabase
      .from("event_contributions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const eventContribWithDetails = await Promise.all(
      (eventContribData || []).map(async (contrib) => {
        const [eventRes, profileRes] = await Promise.all([
          supabase.from("community_events").select("title, goal_unit").eq("id", contrib.event_id).single(),
          supabase.from("profiles").select("display_name").eq("user_id", contrib.user_id).single(),
        ]);
        return {
          ...contrib,
          event_title: eventRes.data?.title || "Unknown Event",
          goal_unit: eventRes.data?.goal_unit || "units",
          user_display_name: profileRes.data?.display_name || "Unknown User",
        };
      })
    );

    // Initialize default contribution values
    const initialContribValues: Record<string, number> = {};
    eventSubsWithDetails.forEach(sub => {
      initialContribValues[sub.id] = sub.contribution_value || 1;
    });
    eventContribWithDetails.forEach(contrib => {
      initialContribValues[contrib.id] = contrib.amount || 1;
    });
    setEventContributionValues(prev => ({ ...initialContribValues, ...prev }));

    // Fetch all community events (not just pending)
    const { data: eventsData } = await supabase
      .from("community_events")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch social posts pending review
    const { data: socialPostsData } = await supabase
      .from("social_posts")
      .select("*")
      .eq("status", "pending_review")
      .order("created_at", { ascending: false });

    const socialPostsWithDetails = await Promise.all(
      (socialPostsData || []).map(async (post) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", post.user_id)
          .single();
        return {
          ...post,
          user_display_name: profileData?.display_name || "Unknown User",
        };
      })
    );

    setSubmissions(submissionsWithDetails);
    setListings(listingsWithDetails);
    setApplications(applicationsWithDetails);
    setSupporterApps(supporterAppsWithDetails);
    setSupportTickets(ticketsWithDetails);
    setUsers(usersData || []);
    setEventSubmissions(eventSubsWithDetails);
    setEventContributions(eventContribWithDetails);
    setCommunityEvents(eventsData || []);
    setSocialPosts(socialPostsWithDetails);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const approveSubmission = async (id: string) => {
    setProcessing(id);
    const points = pointsValues[id] || 100;
    const xp = xpValues[id] || 50;
    const note = adminNotes[id] || null;
    
    const { error } = await supabase.rpc("award_submission_points_v2", { 
      p_submission_id: id, 
      p_points_amount: points,
      p_xp_amount: xp,
      p_admin_note: note
    });
    
    setProcessing(null);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Approved! Awarded ${points} points and ${xp} XP.` }); fetchData(); }
  };

  const rejectSubmission = async (id: string) => {
    setProcessing(id);
    const note = adminNotes[id] || null;
    await supabase.from("submissions").update({ 
      status: "rejected", 
      reviewed_at: new Date().toISOString(),
      admin_note: note
    }).eq("id", id);
    setProcessing(null);
    toast({ title: "Submission rejected" }); fetchData();
  };

  const approveListing = async (id: string) => {
    setProcessing(id);
    await supabase.from("listings").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", id);
    setProcessing(null);
    toast({ title: "Listing approved!" }); fetchData();
  };

  const rejectListing = async (id: string) => {
    setProcessing(id);
    await supabase.from("listings").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
    setProcessing(null);
    toast({ title: "Listing rejected" }); fetchData();
  };

  const acceptApplication = async (id: string, listingId: string, userId: string) => {
    setProcessing(id);
    await supabase.from("listing_applications").update({ status: "accepted", reviewed_at: new Date().toISOString() }).eq("id", id);
    
    const points = listingPoints[id] || 0;
    const xp = listingXp[id] || 0;
    if (points > 0 || xp > 0) {
      await supabase.rpc("award_listing_points", {
        p_listing_id: listingId,
        p_user_id: userId,
        p_points_amount: points,
        p_xp_amount: xp
      });
    }
    
    setProcessing(null);
    toast({ title: points > 0 ? `Application accepted! Awarded ${points} points.` : "Application accepted!" }); 
    fetchData();
  };

  const rejectApplication = async (id: string) => {
    setProcessing(id);
    await supabase.from("listing_applications").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
    setProcessing(null);
    toast({ title: "Application rejected" }); fetchData();
  };

  const approveSupporterApp = async (app: any) => {
    setProcessing(app.id);
    
    // Update application status
    await supabase
      .from("supporter_applications")
      .update({ 
        status: "approved", 
        reviewed_at: new Date().toISOString(),
        admin_note: adminNotes[app.id] || null
      })
      .eq("id", app.id);
    
    // Update user profile to supporter
    await supabase
      .from("profiles")
      .update({ user_type: "supporter" })
      .eq("user_id", app.user_id);
    
    setProcessing(null);
    toast({ title: "Supporter application approved!" }); 
    fetchData();
  };

  const rejectSupporterApp = async (app: any) => {
    setProcessing(app.id);
    
    await supabase
      .from("supporter_applications")
      .update({ 
        status: "rejected", 
        reviewed_at: new Date().toISOString(),
        admin_note: adminNotes[app.id] || null
      })
      .eq("id", app.id);
    
    setProcessing(null);
    toast({ title: "Supporter application rejected" }); 
    fetchData();
  };

  const askForMoreInfo = async (app: any) => {
    if (!adminNotes[app.id]?.trim()) {
      toast({ title: "Please add a note explaining what information is needed", variant: "destructive" });
      return;
    }
    
    setProcessing(app.id);
    
    await supabase
      .from("supporter_applications")
      .update({ 
        status: "needs_more_info", 
        admin_note: adminNotes[app.id]
      })
      .eq("id", app.id);
    
    setProcessing(null);
    toast({ title: "Requested more information from applicant" }); 
    fetchData();
  };

  const joinSupportChat = async (ticket: any) => {
    // Add admin as participant to the conversation if not already
    const { data: existingPart } = await supabase
      .from("conversation_participants")
      .select("id")
      .eq("conversation_id", ticket.conversation_id)
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .maybeSingle();
    
    if (!existingPart) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("conversation_participants").insert({
          conversation_id: ticket.conversation_id,
          user_id: user.id,
          is_admin: true,
        });
      }
    }
    
    // Update ticket status to in_progress
    await supabase
      .from("support_tickets")
      .update({ status: "in_progress" })
      .eq("id", ticket.id);
    
    navigate("/messages");
  };

  const approveEventSubmission = async (sub: any) => {
    setProcessing(sub.id);
    const approvedValue = eventContributionValues[sub.id] || sub.contribution_value || 1;
    
    await supabase
      .from("event_submissions")
      .update({ 
        status: "approved", 
        contribution_value: approvedValue,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq("id", sub.id);
    
    setProcessing(null);
    toast({ title: `Approved! Added ${approvedValue} ${sub.goal_unit} to event goal.` });
    fetchData();
  };

  const rejectEventSubmission = async (id: string) => {
    setProcessing(id);
    
    await supabase
      .from("event_submissions")
      .update({ 
        status: "rejected", 
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq("id", id);
    
    setProcessing(null);
    toast({ title: "Submission rejected" });
    fetchData();
  };

  const approveEventContribution = async (contrib: any) => {
    setProcessing(contrib.id);
    const approvedAmount = eventContributionValues[contrib.id] || contrib.amount;
    
    await supabase
      .from("event_contributions")
      .update({ 
        status: "approved", 
        approved_amount: approvedAmount,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq("id", contrib.id);
    
    setProcessing(null);
    toast({ title: `Approved! Added ${approvedAmount} ${contrib.goal_unit} to event goal.` });
    fetchData();
  };

  const rejectEventContribution = async (id: string) => {
    setProcessing(id);
    
    await supabase
      .from("event_contributions")
      .update({ 
        status: "rejected", 
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq("id", id);
    
    setProcessing(null);
    toast({ title: "Contribution rejected" });
    fetchData();
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Review pending submissions, listings, and applications</p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="submissions">
          <TabsList className="grid w-full max-w-7xl grid-cols-8">
            <TabsTrigger value="submissions">
              Submissions ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="listings">
              Listings ({listings.length})
            </TabsTrigger>
            <TabsTrigger value="applications">
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="posts">
              Posts ({socialPosts.length})
            </TabsTrigger>
            <TabsTrigger value="supporters">
              Supporters ({supporterApps.length})
            </TabsTrigger>
            <TabsTrigger value="events">
              <Heart className="h-3 w-3 mr-1" />
              Events ({eventSubmissions.length + eventContributions.length})
            </TabsTrigger>
            <TabsTrigger value="support">
              Support ({supportTickets.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              Users ({users.length})
            </TabsTrigger>
          </TabsList>

          {/* Social Posts Tab */}
          <TabsContent value="posts" className="mt-6 space-y-4">
            {socialPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No posts pending review</p>
                </CardContent>
              </Card>
            ) : (
              socialPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Post by {post.user_display_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{formatDateEU(post.created_at)}</p>
                      </div>
                      <Badge className="bg-swap-gold/20 text-swap-gold">Wants Rewards</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {post.caption && (
                      <p className="text-sm">{post.caption}</p>
                    )}
                    
                    {post.media_urls?.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {post.media_urls.map((url: string, i: number) => (
                          <img key={i} src={url} className="h-32 w-32 rounded-lg object-cover border border-border flex-shrink-0" alt={`Photo ${i + 1}`} />
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                          Points to Award
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={postPoints[post.id] || 0}
                          onChange={(e) => setPostPoints({ ...postPoints, [post.id]: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">XP to Award</Label>
                        <Input
                          type="number"
                          min={0}
                          value={postXp[post.id] || 0}
                          onChange={(e) => setPostXp({ ...postXp, [post.id]: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={async () => {
                          setProcessing(post.id);
                          await supabase.rpc("award_social_post_points", {
                            p_post_id: post.id,
                            p_points_amount: postPoints[post.id] || 0,
                            p_xp_amount: postXp[post.id] || 0,
                          });
                          setProcessing(null);
                          toast({ title: `Rewarded ${postPoints[post.id] || 0} points!` });
                          fetchData();
                        }} 
                        disabled={processing === post.id} 
                        className="gap-1"
                      >
                        {processing === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve & Reward
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={async () => {
                          setProcessing(post.id);
                          await supabase.from("social_posts").update({ status: "published" }).eq("id", post.id);
                          setProcessing(null);
                          toast({ title: "Post published without rewards" });
                          fetchData();
                        }}
                        disabled={processing === post.id}
                      >
                        Publish (No Reward)
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={async () => {
                          setProcessing(post.id);
                          await supabase.from("social_posts").update({ status: "rejected" }).eq("id", post.id);
                          setProcessing(null);
                          toast({ title: "Post rejected" });
                          fetchData();
                        }} 
                        disabled={processing === post.id} 
                        className="gap-1"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Community Events Tab */}
          <TabsContent value="events" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Review contributions and manage community events</p>
              <CreateCommunityEventDialog onEventCreated={fetchData} />
            </div>

            {/* Pending Event Submissions (Photos) */}
            {eventSubmissions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Photo Submissions ({eventSubmissions.length})
                </h3>
                {eventSubmissions.map((sub) => (
                  <Card key={sub.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{sub.event_title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {sub.user_display_name} • {formatDateEU(sub.created_at)}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          Claims: {sub.contribution_value || 1} {sub.goal_unit}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Photos */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">PHOTOS</p>
                        <div className="flex gap-2 overflow-x-auto">
                          {(sub.photo_urls && sub.photo_urls.length > 0 ? sub.photo_urls : [sub.photo_url]).map((url: string, i: number) => (
                            url && (
                              <img 
                                key={i} 
                                src={url} 
                                className="h-32 w-32 rounded-lg object-cover border border-border flex-shrink-0" 
                                alt={`Photo ${i + 1}`} 
                              />
                            )
                          ))}
                        </div>
                      </div>

                      {sub.description && (
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <p className="text-xs text-muted-foreground mb-1">Description:</p>
                          <p className="text-sm">{sub.description}</p>
                        </div>
                      )}

                      {/* Admin sets contribution value */}
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="space-y-2">
                          <Label htmlFor={`event-contrib-${sub.id}`} className="text-sm font-medium">
                            Contribution Value ({sub.goal_unit}) *
                          </Label>
                          <Input
                            id={`event-contrib-${sub.id}`}
                            type="number"
                            min={0}
                            value={eventContributionValues[sub.id] || sub.contribution_value || 1}
                            onChange={(e) => setEventContributionValues({ 
                              ...eventContributionValues, 
                              [sub.id]: parseInt(e.target.value) || 0 
                            })}
                          />
                          <p className="text-xs text-muted-foreground">
                            How many {sub.goal_unit} should this count for?
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex-1" />
                        <Button onClick={() => approveEventSubmission(sub)} disabled={processing === sub.id} className="gap-1">
                          {processing === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Approve
                        </Button>
                        <Button variant="destructive" onClick={() => rejectEventSubmission(sub.id)} disabled={processing === sub.id} className="gap-1">
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pending Event Contributions (Numeric) */}
            {eventContributions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Numeric Contributions ({eventContributions.length})
                </h3>
                {eventContributions.map((contrib) => (
                  <Card key={contrib.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{contrib.event_title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {contrib.user_display_name} • {formatDateEU(contrib.created_at)}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          Claims: {contrib.amount} {contrib.goal_unit}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {contrib.note && (
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <p className="text-xs text-muted-foreground mb-1">Note:</p>
                          <p className="text-sm">{contrib.note}</p>
                        </div>
                      )}

                      {/* Admin sets approved amount */}
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="space-y-2">
                          <Label htmlFor={`event-contrib-val-${contrib.id}`} className="text-sm font-medium">
                            Approved Amount ({contrib.goal_unit}) *
                          </Label>
                          <Input
                            id={`event-contrib-val-${contrib.id}`}
                            type="number"
                            min={0}
                            value={eventContributionValues[contrib.id] || contrib.amount}
                            onChange={(e) => setEventContributionValues({ 
                              ...eventContributionValues, 
                              [contrib.id]: parseInt(e.target.value) || 0 
                            })}
                          />
                          <p className="text-xs text-muted-foreground">
                            How many {contrib.goal_unit} should this count for?
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex-1" />
                        <Button onClick={() => approveEventContribution(contrib)} disabled={processing === contrib.id} className="gap-1">
                          {processing === contrib.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Approve
                        </Button>
                        <Button variant="destructive" onClick={() => rejectEventContribution(contrib.id)} disabled={processing === contrib.id} className="gap-1">
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {eventSubmissions.length === 0 && eventContributions.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Heart className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p>No pending contributions to review</p>
                </CardContent>
              </Card>
            )}

            {/* All Community Events */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                All Community Events ({communityEvents.length})
              </h3>
              
              {communityEvents.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Heart className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p>No community events yet</p>
                    <p className="text-sm">Create one to rally the community around a cause!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {communityEvents.map((evt) => {
                    const progressPercent = Math.min((evt.goal_current / evt.goal_target) * 100, 100);
                    return (
                      <Card key={evt.id} className={evt.status === "cancelled" ? "opacity-60" : ""}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base truncate">{evt.title}</CardTitle>
                              <p className="text-sm text-muted-foreground truncate">{evt.cause}</p>
                            </div>
                            <Badge 
                              variant={
                                evt.status === "active" ? "default" :
                                evt.status === "completed" ? "secondary" :
                                evt.status === "cancelled" ? "destructive" : "outline"
                              }
                              className="shrink-0"
                            >
                              {evt.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{evt.goal_current.toLocaleString()} / {evt.goal_target.toLocaleString()} {evt.goal_unit}</span>
                              <span className="font-medium">{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Created {formatDateEU(evt.created_at)}</span>
                            {evt.ends_at && (
                              <>
                                <span>•</span>
                                <span>Ends {formatDateEU(evt.ends_at)}</span>
                              </>
                            )}
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setEditingEvent(evt)}
                          >
                            Edit Event
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Edit Dialog */}
            {editingEvent && (
              <EditCommunityEventDialog
                event={editingEvent}
                open={!!editingEvent}
                onOpenChange={(open) => !open && setEditingEvent(null)}
                onEventUpdated={fetchData}
              />
            )}
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="mt-6 space-y-4">
            {submissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No pending submissions</p>
                  <p className="text-sm">Quest contributions will appear here for review</p>
                </CardContent>
              </Card>
            ) : (
              submissions.map((s) => (
                <Card key={s.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{s.quest_title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Submitted by {s.user_display_name} • {formatDateEU(s.created_at)}
                        </p>
                      </div>
                      <Badge className="bg-primary/10 text-primary">
                        +{s.quest_base_points} pts base
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {s.location_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{s.location_name}</span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">BEFORE</p>
                        {s.before_image_url && (
                          <img src={s.before_image_url} className="rounded-lg aspect-video object-cover w-full border border-border" alt="Before" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">AFTER</p>
                        {s.after_image_url && (
                          <img src={s.after_image_url} className="rounded-lg aspect-video object-cover w-full border border-border" alt="After" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="space-y-2">
                        <Label htmlFor={`points-${s.id}`} className="text-sm font-medium flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                          Points to Award
                        </Label>
                        <Input
                          id={`points-${s.id}`}
                          type="number"
                          min={0}
                          value={pointsValues[s.id] || s.quest_base_points}
                          onChange={(e) => setPointsValues({ ...pointsValues, [s.id]: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`xp-${s.id}`} className="text-sm font-medium">XP to Award</Label>
                        <Input
                          id={`xp-${s.id}`}
                          type="number"
                          min={0}
                          value={xpValues[s.id] || Math.round(s.quest_base_points * 0.5)}
                          onChange={(e) => setXpValues({ ...xpValues, [s.id]: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`note-${s.id}`} className="text-sm font-medium">Note to User (optional)</Label>
                      <Textarea
                        id={`note-${s.id}`}
                        placeholder="Write feedback for the user..."
                        value={adminNotes[s.id] || ""}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [s.id]: e.target.value })}
                        className="h-20"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex-1" />
                      <Button onClick={() => approveSubmission(s.id)} disabled={processing === s.id} className="gap-1">
                        {processing === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve
                      </Button>
                      <Button variant="destructive" onClick={() => rejectSubmission(s.id)} disabled={processing === s.id} className="gap-1">
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="mt-6 space-y-4">
            {listings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No pending listings</p>
                </CardContent>
              </Card>
            ) : (
              listings.map((l) => (
                <Card key={l.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{l.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by {l.user_display_name} • {formatDateEU(l.created_at)}
                        </p>
                      </div>
                      <Badge variant="secondary">{l.listing_type.replace("_", " ")}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{l.description}</p>
                    
                    {l.location_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{l.location_name}</span>
                      </div>
                    )}

                    {l.photo_urls?.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {l.photo_urls.map((url: string, i: number) => (
                          <img key={i} src={url} className="h-24 w-24 rounded-lg object-cover border border-border flex-shrink-0" alt={`Photo ${i + 1}`} />
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => approveListing(l.id)} disabled={processing === l.id} className="gap-1">
                        {processing === l.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve
                      </Button>
                      <Button variant="destructive" onClick={() => rejectListing(l.id)} disabled={processing === l.id} className="gap-1">
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-6 space-y-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No pending applications</p>
                </CardContent>
              </Card>
            ) : (
              applications.map((a) => (
                <Card key={a.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{a.user_display_name} wants to help</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {a.user_username && <span>@{a.user_username} • </span>}
                          {formatDateEU(a.created_at)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/listing/${a.listing_id}`)}>
                        <ExternalLink className="h-3 w-3" />
                        View Listing
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">{a.listing_type.replace("_", " ")}</Badge>
                        <span className="font-medium">{a.listing_title}</span>
                      </div>
                      {a.listing_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{a.listing_description}</p>
                      )}
                    </div>

                    {a.message && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Application message:</p>
                        <p className="text-sm italic">"{a.message}"</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="space-y-2">
                        <Label htmlFor={`listing-points-${a.id}`} className="text-sm font-medium">Points to Award (optional)</Label>
                        <Input
                          id={`listing-points-${a.id}`}
                          type="number"
                          min={0}
                          value={listingPoints[a.id] || 0}
                          onChange={(e) => setListingPoints({ ...listingPoints, [a.id]: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`listing-xp-${a.id}`} className="text-sm font-medium">XP to Award (optional)</Label>
                        <Input
                          id={`listing-xp-${a.id}`}
                          type="number"
                          min={0}
                          value={listingXp[a.id] || 0}
                          onChange={(e) => setListingXp({ ...listingXp, [a.id]: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => acceptApplication(a.id, a.listing_id, a.applicant_user_id)} disabled={processing === a.id} className="gap-1">
                        {processing === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Accept
                      </Button>
                      <Button variant="destructive" onClick={() => rejectApplication(a.id)} disabled={processing === a.id} className="gap-1">
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Supporter Applications Tab */}
          <TabsContent value="supporters" className="mt-6 space-y-4">
            {supporterApps.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No pending supporter applications</p>
                  <p className="text-sm">Business applications will appear here for review</p>
                </CardContent>
              </Card>
            ) : (
              supporterApps.map((app) => (
                <Card key={app.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {app.user_avatar ? (
                            <img src={app.user_avatar} className="h-12 w-12 rounded-full object-cover" />
                          ) : (
                            <Building2 className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{app.company_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            by {app.user_display_name}
                            {app.user_username && <span> (@{app.user_username})</span>}
                            {" • "}{formatDateEU(app.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{app.industry}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Company Details */}
                    <div className="grid gap-3 sm:grid-cols-2 p-4 rounded-lg bg-muted/20 border border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Team Size</p>
                        <p className="font-medium">{app.company_size}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-medium">{app.location}</p>
                      </div>
                      {app.yearly_revenue && (
                        <div>
                          <p className="text-xs text-muted-foreground">Yearly Revenue</p>
                          <p className="font-medium">{app.yearly_revenue}</p>
                        </div>
                      )}
                    </div>

                    {/* What They Offer */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">What they will offer:</p>
                      <div className="p-3 rounded-lg bg-swap-green/10 border border-swap-green/20">
                        <p className="text-sm">{app.what_they_offer}</p>
                      </div>
                    </div>

                    {/* About Them */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">About them:</p>
                      <p className="text-sm text-muted-foreground">{app.about_them}</p>
                    </div>

                    {/* Why Supporter */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Why they want to be a supporter:</p>
                      <p className="text-sm text-muted-foreground">{app.why_supporter}</p>
                    </div>

                    {/* Admin Note */}
                    <div className="space-y-2">
                      <Label htmlFor={`supporter-note-${app.id}`} className="text-sm font-medium">Admin Note (optional)</Label>
                      <Textarea
                        id={`supporter-note-${app.id}`}
                        placeholder="Add notes about this application..."
                        value={adminNotes[app.id] || ""}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [app.id]: e.target.value })}
                        className="h-20"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => approveSupporterApp(app)} disabled={processing === app.id} className="gap-1">
                        {processing === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve as Supporter
                      </Button>
                      <Button variant="outline" onClick={() => askForMoreInfo(app)} disabled={processing === app.id} className="gap-1">
                        <HelpCircle className="h-4 w-4" />
                        Ask for More Info
                      </Button>
                      <Button variant="destructive" onClick={() => rejectSupporterApp(app)} disabled={processing === app.id} className="gap-1">
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="support" className="mt-6 space-y-4">
            {supportTickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No open support tickets</p>
                </CardContent>
              </Card>
            ) : (
              supportTickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{ticket.user_display_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {ticket.user_username && <span>@{ticket.user_username} • </span>}
                          {formatDateEU(ticket.created_at)}
                        </p>
                      </div>
                      <Badge variant={ticket.status === "open" ? "default" : "secondary"}>{ticket.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button variant="outline" className="gap-1" onClick={() => joinSupportChat(ticket)}>
                        <MessageSquare className="h-4 w-4" />
                        Join Chat
                      </Button>
                      <Button
                        onClick={async () => {
                          await supabase.from("support_tickets").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", ticket.id);
                          toast({ title: "Ticket resolved" });
                          fetchData();
                        }}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Mark Resolved
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  All Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {users.map((u) => (
                    <div key={u.user_id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium">{u.display_name?.[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{u.display_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {u.username && <span>@{u.username} • </span>}
                            Level {u.level} • {u.swap_points} pts
                            {u.user_type && (
                              <Badge variant="outline" className="ml-2 text-xs">{u.user_type}</Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">ID: {u.user_id.slice(0, 8)}...</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Admin;