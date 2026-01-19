import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check, X, RefreshCw, MapPin, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [multipliers, setMultipliers] = useState<Record<string, string>>({});

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

    // Fetch details for applications
    const applicationsWithDetails = await Promise.all(
      (applicationsData || []).map(async (app) => {
        const [listingRes, profileRes] = await Promise.all([
          supabase.from("listings").select("title").eq("id", app.listing_id).single(),
          supabase.from("profiles").select("display_name").eq("user_id", app.applicant_user_id).single(),
        ]);
        return {
          ...app,
          listing_title: listingRes.data?.title || "Unknown Listing",
          user_display_name: profileRes.data?.display_name || "Unknown User",
        };
      })
    );

    setSubmissions(submissionsWithDetails);
    setListings(listingsWithDetails);
    setApplications(applicationsWithDetails);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const approveSubmission = async (id: string) => {
    setProcessing(id);
    const mult = parseFloat(multipliers[id] || "1");
    const { error } = await supabase.rpc("award_submission_points", { submission_id: id, multiplier: mult });
    setProcessing(null);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Approved! Points and XP awarded." }); fetchData(); }
  };

  const rejectSubmission = async (id: string) => {
    setProcessing(id);
    await supabase.from("submissions").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
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

  const acceptApplication = async (id: string) => {
    setProcessing(id);
    await supabase.from("listing_applications").update({ status: "accepted", reviewed_at: new Date().toISOString() }).eq("id", id);
    setProcessing(null);
    toast({ title: "Application accepted!" }); fetchData();
  };

  const rejectApplication = async (id: string) => {
    setProcessing(id);
    await supabase.from("listing_applications").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
    setProcessing(null);
    toast({ title: "Application rejected" }); fetchData();
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
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="submissions">
              Submissions ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="listings">
              Listings ({listings.length})
            </TabsTrigger>
            <TabsTrigger value="applications">
              Applications ({applications.length})
            </TabsTrigger>
          </TabsList>

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
                          Submitted by {s.user_display_name} • {new Date(s.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-primary/10 text-primary">
                        +{s.quest_base_points} pts base
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Location */}
                    {s.location_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{s.location_name}</span>
                      </div>
                    )}
                    
                    {/* Before/After Images */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">BEFORE</p>
                        {s.before_image_url && (
                          <img
                            src={s.before_image_url}
                            className="rounded-lg aspect-video object-cover w-full border border-border"
                            alt="Before"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">AFTER</p>
                        {s.after_image_url && (
                          <img
                            src={s.after_image_url}
                            className="rounded-lg aspect-video object-cover w-full border border-border"
                            alt="After"
                          />
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Multiplier:</span>
                        <Select
                          value={multipliers[s.id] || "1"}
                          onValueChange={(v) => setMultipliers({ ...multipliers, [s.id]: v })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.5">0.5x</SelectItem>
                            <SelectItem value="1">1.0x</SelectItem>
                            <SelectItem value="1.5">1.5x</SelectItem>
                            <SelectItem value="2">2.0x</SelectItem>
                            <SelectItem value="3">3.0x</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1" />
                      <Button
                        onClick={() => approveSubmission(s.id)}
                        disabled={processing === s.id}
                        className="gap-1"
                      >
                        {processing === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => rejectSubmission(s.id)}
                        disabled={processing === s.id}
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

          {/* Listings Tab */}
          <TabsContent value="listings" className="mt-6 space-y-4">
            {listings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No pending listings</p>
                  <p className="text-sm">New community listings will appear here for review</p>
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
                          by {l.user_display_name} • {new Date(l.created_at).toLocaleDateString()}
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
                          <img
                            key={i}
                            src={url}
                            className="h-24 w-24 rounded-lg object-cover border border-border flex-shrink-0"
                            alt={`Photo ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => approveListing(l.id)}
                        disabled={processing === l.id}
                        className="gap-1"
                      >
                        {processing === l.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => rejectListing(l.id)}
                        disabled={processing === l.id}
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

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-6 space-y-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No pending applications</p>
                  <p className="text-sm">Listing applications will appear here for review</p>
                </CardContent>
              </Card>
            ) : (
              applications.map((a) => (
                <Card key={a.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{a.user_display_name} wants to help</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      For: {a.listing_title} • {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {a.message && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm italic">"{a.message}"</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => acceptApplication(a.id)}
                        disabled={processing === a.id}
                        className="gap-1"
                      >
                        {processing === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => rejectApplication(a.id)}
                        disabled={processing === a.id}
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
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Admin;
