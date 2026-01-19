import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const MyActivity = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const [{ data: myListings, error: listingsError }, { data: mySubmissions, error: submissionsError }] =
          await Promise.all([
            supabase
              .from("listings")
              .select("*")
              .eq("creator_user_id", user.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("submissions")
              .select("*, quests(*)")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false }),
          ]);

        if (listingsError) throw listingsError;
        if (submissionsError) throw submissionsError;

        setListings(myListings || []);
        setSubmissions(mySubmissions || []);
      } catch (e: any) {
        toast({ title: "Couldn't load your activity", description: e?.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, toast]);

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto space-y-4">
        <header>
          <h1 className="text-3xl font-bold">My Listings & Quests</h1>
          <p className="text-muted-foreground">Everything you created and submitted.</p>
        </header>

        <Tabs defaultValue="listings">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings">My listings</TabsTrigger>
            <TabsTrigger value="quests">My quest submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Listings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </div>
                ) : listings.length === 0 ? (
                  <p className="text-muted-foreground">You haven't created any listings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {listings.map((l) => (
                      <Link key={l.id} to={`/listing/${l.id}`} className="block">
                        <div className="rounded-lg border border-border p-4 hover:bg-muted/40 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{l.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>
                              <p className="mt-2 text-xs text-muted-foreground">{l.location_name}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {l.is_promoted && <Badge>Promoted</Badge>}
                              {l.status && (
                                <Badge variant="outline" className="capitalize">
                                  {String(l.status).replace(/_/g, " ")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quests" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Quest submissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </div>
                ) : submissions.length === 0 ? (
                  <p className="text-muted-foreground">You haven't submitted anything yet.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((s) => {
                      const q = (s as any).quests;
                      return (
                        <div key={s.id} className="rounded-lg border border-border p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              {q?.id ? (
                                <Link to={`/quests/${q.id}`} className="font-semibold hover:underline">
                                  {q.title || "Quest"}
                                </Link>
                              ) : (
                                <p className="font-semibold">Quest</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {q?.location_name || s.location_name || ""}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {(s as any).status && (
                                <Badge variant="outline" className="capitalize">
                                  {String((s as any).status).replace(/_/g, " ")}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {(s as any).created_at && <span>Submitted: {new Date((s as any).created_at).toLocaleString()}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default MyActivity;
