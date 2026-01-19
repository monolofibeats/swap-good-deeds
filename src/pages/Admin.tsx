import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check, X, RefreshCw } from "lucide-react";
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
    const [subRes, listRes, appRes] = await Promise.all([
      supabase.from("submissions").select("*, quests(title, base_points), profiles!submissions_user_id_fkey(display_name)").eq("status", "pending"),
      supabase.from("listings").select("*, profiles!listings_creator_user_id_fkey(display_name)").eq("status", "pending"),
      supabase.from("listing_applications").select("*, listings(title), profiles!listing_applications_applicant_user_id_fkey(display_name)").eq("status", "pending"),
    ]);
    setSubmissions(subRes.data || []);
    setListings(listRes.data || []);
    setApplications(appRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const approveSubmission = async (id: string) => {
    setProcessing(id);
    const mult = parseFloat(multipliers[id] || "1");
    const { error } = await supabase.rpc("award_submission_points", { submission_id: id, multiplier: mult });
    setProcessing(null);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Approved!" }); fetchData(); }
  };

  const rejectSubmission = async (id: string) => {
    setProcessing(id);
    await supabase.from("submissions").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
    setProcessing(null);
    toast({ title: "Rejected" }); fetchData();
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
          <div><h1 className="text-3xl font-bold">Admin Dashboard</h1><p className="text-muted-foreground">Review pending submissions, listings, and applications</p></div>
          <Button variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
        </div>

        <Tabs defaultValue="submissions">
          <TabsList><TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger><TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger><TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger></TabsList>

          <TabsContent value="submissions" className="mt-6 space-y-4">
            {submissions.length === 0 ? <p className="text-muted-foreground py-8 text-center">No pending submissions</p> : submissions.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between"><div><p className="font-semibold">{s.quests?.title}</p><p className="text-sm text-muted-foreground">by {s.profiles?.display_name}</p></div><Badge>+{s.quests?.base_points} pts</Badge></div>
                  <div className="grid grid-cols-2 gap-4">{s.before_image_url && <img src={s.before_image_url} className="rounded-lg aspect-video object-cover" alt="Before" />}{s.after_image_url && <img src={s.after_image_url} className="rounded-lg aspect-video object-cover" alt="After" />}</div>
                  <div className="flex items-center gap-3">
                    <Select value={multipliers[s.id] || "1"} onValueChange={(v) => setMultipliers({ ...multipliers, [s.id]: v })}><SelectTrigger className="w-24"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1.0x</SelectItem><SelectItem value="1.5">1.5x</SelectItem><SelectItem value="2">2.0x</SelectItem><SelectItem value="3">3.0x</SelectItem></SelectContent></Select>
                    <Button onClick={() => approveSubmission(s.id)} disabled={processing === s.id} className="gap-1"><Check className="h-4 w-4" />Approve</Button>
                    <Button variant="destructive" onClick={() => rejectSubmission(s.id)} disabled={processing === s.id} className="gap-1"><X className="h-4 w-4" />Reject</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="listings" className="mt-6 space-y-4">
            {listings.length === 0 ? <p className="text-muted-foreground py-8 text-center">No pending listings</p> : listings.map((l) => (
              <Card key={l.id}>
                <CardContent className="p-4 space-y-3">
                  <div><p className="font-semibold">{l.title}</p><p className="text-sm text-muted-foreground">by {l.profiles?.display_name} • {l.location_name}</p></div>
                  <p className="text-sm">{l.description}</p>
                  {l.photo_urls?.length > 0 && <div className="flex gap-2">{l.photo_urls.slice(0, 3).map((url: string, i: number) => <img key={i} src={url} className="h-20 w-20 rounded object-cover" />)}</div>}
                  <div className="flex gap-2"><Button onClick={() => approveListing(l.id)} disabled={processing === l.id} className="gap-1"><Check className="h-4 w-4" />Approve</Button><Button variant="destructive" onClick={() => rejectListing(l.id)} disabled={processing === l.id} className="gap-1"><X className="h-4 w-4" />Reject</Button></div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="applications" className="mt-6 space-y-4">
            {applications.length === 0 ? <p className="text-muted-foreground py-8 text-center">No pending applications</p> : applications.map((a) => (
              <Card key={a.id}>
                <CardContent className="p-4 space-y-3">
                  <div><p className="font-semibold">{a.profiles?.display_name} wants to help</p><p className="text-sm text-muted-foreground">For: {a.listings?.title}</p></div>
                  {a.message && <p className="text-sm bg-muted p-3 rounded">"{a.message}"</p>}
                  <div className="flex gap-2"><Button onClick={() => acceptApplication(a.id)} disabled={processing === a.id} className="gap-1"><Check className="h-4 w-4" />Accept</Button><Button variant="destructive" onClick={() => rejectApplication(a.id)} disabled={processing === a.id} className="gap-1"><X className="h-4 w-4" />Reject</Button></div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Admin;
